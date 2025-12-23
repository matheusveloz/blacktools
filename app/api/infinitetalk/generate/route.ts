import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createInfiniteTalkTask } from '@/lib/infinitetalk/client'
import { deductCredits, refundCredits, getCreditBalance } from '@/lib/credits/utils'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { logAuditAction, getRequestMetadata, AuditActions } from '@/lib/utils/audit-log'
import { infinitetalkGenerateSchema, infinitetalkMetadataSchema } from '@/lib/schemas/api'
import {
  calculateInfiniteTalkCredits,
  INFINITETALK_DEFAULT_PARAMS,
  type InfiniteTalkParams,
} from '@/types/infinitetalk'
import type { Json } from '@/types/database'

// Increase timeout for large uploads
export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const TOOL_NAME = 'infinitetalk'

interface GenerateRequestBody {
  imageUrl: string
  audioUrl: string
  audioDurationSeconds: number
  params?: InfiniteTalkParams
  skipCreditDeduction?: boolean
}

// Helper to upload base64 to Supabase Storage
async function uploadBase64ToStorage(
  adminClient: ReturnType<typeof createAdminClient>,
  base64Data: string,
  userId: string,
  type: 'image' | 'audio'
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {

    // Extract mime type and data from base64
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      return { success: false, error: 'Invalid base64 format' }
    }

    const mimeType = matches[1]
    const base64 = matches[2]
    const buffer = Buffer.from(base64, 'base64')


    // Determine file extension
    let extension = 'bin'
    if (type === 'image') {
      if (mimeType.includes('png')) extension = 'png'
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg'
      else if (mimeType.includes('webp')) extension = 'webp'
      else extension = 'png'
    } else {
      if (mimeType.includes('mp3') || mimeType.includes('mpeg')) extension = 'mp3'
      else if (mimeType.includes('wav')) extension = 'wav'
      else if (mimeType.includes('m4a') || mimeType.includes('mp4')) extension = 'm4a'
      else if (mimeType.includes('ogg')) extension = 'ogg'
      else extension = 'mp3'
    }

    const fileName = `${userId}/infinitetalk-${type}-${Date.now()}.${extension}`
    // Use existing buckets: 'videos' for images (small files work fine there), 'audios' for audio
    const bucketName = type === 'image' ? 'videos' : 'audios'


    // Try to ensure bucket exists
    try {
      // First check if bucket exists by trying to list files (will fail if not exists)
      const { error: listError } = await adminClient.storage.from(bucketName).list('', { limit: 1 })

      if (listError) {
        const { error: createBucketError } = await adminClient.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 524288000 // 500MB
        })
        if (createBucketError && !createBucketError.message.includes('already exists')) {
        }
      }
    } catch (bucketError) {
    }

    // Upload to storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }


    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from(bucketName)
      .getPublicUrl(fileName)


    return { success: true, publicUrl: publicUrlData.publicUrl }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMsg }
  }
}

export async function POST(request: NextRequest) {

  // Early check for API key
  if (!process.env.WAVESPEED_API_KEY) {
    return NextResponse.json(
      { error: 'WAVESPEED_API_KEY is not configured in environment variables' },
      { status: 500 }
    )
  }

  try {
    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(rateLimiters.generation, user.id)
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait before trying again.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Verify account status before processing
    const { data: profile } = await adminClient
      .from('profiles')
      .select('account_status')
      .eq('id', user.id)
      .single()

    if (profile?.account_status === 'suspended') {
      return NextResponse.json(
        { error: 'Account suspended. Please contact support.' },
        { status: 403 }
      )
    }

    // Get and validate request body with Zod
    const body = await request.json()
    const validationResult = infinitetalkGenerateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { imageUrl, audioUrl, resolution, prompt, seed, skipCreditDeduction } = validationResult.data
    // Map to InfiniteTalkParams format
    const params: InfiniteTalkParams | undefined = resolution || prompt || seed !== undefined 
      ? { 
          resolution: resolution as '480p' | '720p',
          prompt, 
          seed 
        }
      : undefined
    // TODO: Calculate audioDurationSeconds from audio file
    // For now, use a default value (should be calculated from audio file duration)
    const audioDurationSeconds = 10 // Default, should be calculated from audio file

    // Calculate credits needed (8 credits per second, rounded up)
    const creditsRequired = calculateInfiniteTalkCredits(audioDurationSeconds)


    // Check if data is base64 and needs to be uploaded
    let finalImageUrl = imageUrl
    let finalAudioUrl = audioUrl

    if (imageUrl.startsWith('data:')) {
      const imageUpload = await uploadBase64ToStorage(adminClient, imageUrl, user.id, 'image')
      if (!imageUpload.success || !imageUpload.publicUrl) {
        return NextResponse.json(
          { error: `Failed to upload image: ${imageUpload.error}` },
          { status: 500 }
        )
      }
      finalImageUrl = imageUpload.publicUrl
    } else {
    }

    if (audioUrl.startsWith('data:')) {
      const audioUpload = await uploadBase64ToStorage(adminClient, audioUrl, user.id, 'audio')
      if (!audioUpload.success || !audioUpload.publicUrl) {
        return NextResponse.json(
          { error: `Failed to upload audio: ${audioUpload.error}` },
          { status: 500 }
        )
      }
      finalAudioUrl = audioUpload.publicUrl
    } else {
    }

    // skipCreditDeduction already extracted from validationResult.data above

    // Store deduction result for potential refunds
    let deductResult: Awaited<ReturnType<typeof deductCredits>> | null = null

    // Only check and deduct credits if skipCreditDeduction is false
    // When skipCreditDeduction=true, credits were already deducted by workflow-canvas
    // Security is ensured by /api/credits/deduct which validates before deducting
    if (!skipCreditDeduction) {
      const balanceResult = await getCreditBalance(adminClient, user.id)

      if (!balanceResult.success || !balanceResult.balance) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }

      if (balanceResult.balance.total < creditsRequired) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            required: creditsRequired,
            available: balanceResult.balance.total,
            credits: balanceResult.balance.credits,
            credits_extras: balanceResult.balance.credits_extras,
            audioDuration: audioDurationSeconds,
          },
          { status: 402 }
        )
      }

      deductResult = await deductCredits(adminClient, user.id, creditsRequired, 'InfiniteTalk generation')

      if (!deductResult.success) {
        return NextResponse.json(
          { error: 'Failed to deduct credits', details: deductResult.error },
          { status: 500 }
        )
      }
    }

    // Create generation record with status 'pending'
    const metadataObj = {
      imageUrl: finalImageUrl,
      audioUrl: finalAudioUrl,
      audioDurationSeconds,
      params: params || INFINITETALK_DEFAULT_PARAMS,
      created_at: new Date().toISOString(),
    }

    // Validate metadata with Zod before saving
    const metadataValidation = infinitetalkMetadataSchema.safeParse(metadataObj)
    if (!metadataValidation.success) {
      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'InfiniteTalk generation failed - metadata validation'
        )
      }
      return NextResponse.json(
        { error: 'Invalid metadata structure', details: metadataValidation.error.errors },
        { status: 500 }
      )
    }

    const { data: generation, error: generationError } = await adminClient
      .from('generations')
      .insert({
        user_id: user.id,
        tool: TOOL_NAME,
        status: 'pending',
        credits_used: creditsRequired,
        metadata: metadataValidation.data as unknown as Json,
      })
      .select('*')
      .single()

    // Log audit action for generation creation
    if (generation && !generationError) {
      const requestMetadata = getRequestMetadata(request)
      await logAuditAction({
        action: AuditActions.GENERATION_CREATED,
        userId: user.id,
        details: {
          generationId: generation.id,
          tool: TOOL_NAME,
          creditsUsed: creditsRequired,
        },
        ...requestMetadata,
      })
    }


    if (generationError || !generation) {
      // Refund credits on failure
      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'InfiniteTalk generation failed - record creation'
        )
      }

      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      )
    }

    // Call WaveSpeed API to create prediction

    const taskResult = await createInfiniteTalkTask(
      finalImageUrl,
      finalAudioUrl,
      params || INFINITETALK_DEFAULT_PARAMS
    )


    if (!taskResult.success || !taskResult.predictionId) {
      // Mark as failed and refund
      await adminClient
        .from('generations')
        .update({
          status: 'failed',
          metadata: {
            ...metadataObj,
            error: taskResult.error || 'Failed to create prediction',
          } as unknown as Json,
        })
        .eq('id', generation.id)

      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'InfiniteTalk generation failed - prediction creation'
        )
      }

      return NextResponse.json(
        { error: taskResult.error || 'Failed to create InfiniteTalk prediction' },
        { status: 500 }
      )
    }

    // Update generation with prediction_id and set status to 'processing'
    const updatedMetadata = {
      ...metadataObj,
      prediction_id: taskResult.predictionId,
    }


    const { error: updateError } = await adminClient
      .from('generations')
      .update({
        status: 'processing',
        metadata: updatedMetadata as unknown as Json,
      })
      .eq('id', generation.id)

    if (updateError) {
    } else {
    }


    return NextResponse.json({
      success: true,
      generation_id: generation.id,
      prediction_id: taskResult.predictionId,
      status: 'processing',
      credits_used: creditsRequired,
      audioDuration: audioDurationSeconds,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
