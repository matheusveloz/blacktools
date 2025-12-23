import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateImage, uploadImageToStorage } from '@/lib/nanobanana/client'
import { deductCredits, refundCredits, getCreditBalance } from '@/lib/credits/utils'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { validatePrompt, sanitizePrompt } from '@/lib/utils/prompt-sanitizer'
import { logAuditAction, getRequestMetadata, AuditActions } from '@/lib/utils/audit-log'
import { nanobananaGenerateSchema, nanobananaMetadataSchema } from '@/lib/schemas/api'
import { NANOBANANA_CREDITS } from '@/types/nanobanana'
import type { NanoBananaAspectRatio, NanoBananaResolution } from '@/types/nanobanana'
import type { Json } from '@/types/database'

export const maxDuration = 120 // Allow up to 120 seconds for generation (mobile connections can be slower)

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const adminClient = createAdminClient()

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

    const body = await request.json()
    const {
      prompt,
      aspectRatio = '1:1',
      resolution = '1K',
      referenceImages = [],
      skipCreditDeduction = false
    } = body as {
      prompt: string
      aspectRatio?: NanoBananaAspectRatio
      resolution?: NanoBananaResolution
      referenceImages?: string[]
      skipCreditDeduction?: boolean
    }

    // Validate and sanitize prompt
    const promptValidation = validatePrompt(prompt)
    if (!promptValidation.valid || !promptValidation.sanitized) {
      return NextResponse.json(
        { error: promptValidation.error || 'Invalid prompt' },
        { status: 400 }
      )
    }
    const sanitizedPrompt = promptValidation.sanitized

    const creditsRequired = NANOBANANA_CREDITS

    // Store deduction result for potential refunds
    let deductResult: Awaited<ReturnType<typeof deductCredits>> | null = null

    // Only check and deduct credits if skipCreditDeduction is false
    // When skipCreditDeduction=true, credits were already deducted by workflow-canvas
    // Security is ensured by /api/credits/deduct which validates before deducting
    if (!skipCreditDeduction) {
      const balanceResult = await getCreditBalance(adminClient, user.id)

      if (!balanceResult.success || !balanceResult.balance) {
        return NextResponse.json(
          { error: 'Failed to fetch user profile' },
          { status: 500 }
        )
      }

      if (balanceResult.balance.total < creditsRequired) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            required: creditsRequired,
            available: balanceResult.balance.total,
            credits: balanceResult.balance.credits,
            credits_extras: balanceResult.balance.credits_extras
          },
          { status: 402 }
        )
      }

      deductResult = await deductCredits(adminClient, user.id, creditsRequired, 'NanoBanana generation')

      if (!deductResult.success) {
        return NextResponse.json(
          { error: 'Failed to deduct credits' },
          { status: 500 }
        )
      }
    }

    // Create generation record with pending status
    const metadataObj = {
      prompt: sanitizedPrompt,
      model: 'gemini-3-pro-image-preview',
      aspectRatio,
      resolution,
      referenceImages: referenceImages.length > 0 ? referenceImages.slice(0, 14) : undefined,
      created_at: new Date().toISOString()
    }

    // Validate metadata with Zod before saving
    const metadataValidation = nanobananaMetadataSchema.safeParse(metadataObj)
    if (!metadataValidation.success) {
      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'NanoBanana generation failed - metadata validation'
        )
      }
      return NextResponse.json(
        { error: 'Invalid metadata structure', details: metadataValidation.error.errors },
        { status: 500 }
      )
    }

    const { data: generation, error: insertError } = await adminClient
      .from('generations')
      .insert({
        user_id: user.id,
        tool: 'avatar',
        status: 'processing',
        credits_used: creditsRequired,
        metadata: metadataValidation.data as unknown as Json
      })
      .select()
      .single()

    // Log audit action for generation creation
    if (generation && !insertError) {
      const requestMetadata = getRequestMetadata(request)
      await logAuditAction({
        action: AuditActions.GENERATION_CREATED,
        userId: user.id,
        details: {
          generationId: generation.id,
          tool: 'avatar',
          creditsUsed: creditsRequired,
        },
        ...requestMetadata,
      })
    }

    if (insertError || !generation) {
      // Refund credits on failure
      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'NanoBanana generation failed - record creation'
        )
      }

      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      )
    }

    // Generate image using Nano Banana API
    const result = await generateImage(
      sanitizedPrompt,
      aspectRatio,
      resolution,
      referenceImages
    )

    if (!result.success || !result.imageBase64) {
      // Update generation as failed
      await adminClient
        .from('generations')
        .update({
          status: 'failed',
          metadata: {
            ...metadataObj,
            failed_at: new Date().toISOString(),
            error: result.error || 'Generation failed'
          } as unknown as Json
        })
        .eq('id', generation.id)

      // Refund credits on failure
      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'NanoBanana generation failed'
        )
      }

      return NextResponse.json(
        { error: result.error || 'Image generation failed' },
        { status: 500 }
      )
    }

    // Upload image to Supabase Storage
    const uploadResult = await uploadImageToStorage(
      result.imageBase64,
      result.mimeType || 'image/png',
      user.id,
      generation.id,
      adminClient
    )

    if (!uploadResult.success || !uploadResult.storageUrl) {
      // Update generation as failed
      await adminClient
        .from('generations')
        .update({
          status: 'failed',
          metadata: {
            ...metadataObj,
            failed_at: new Date().toISOString(),
            error: uploadResult.error || 'Failed to upload image'
          } as unknown as Json
        })
        .eq('id', generation.id)

      // Refund credits on failure
      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'NanoBanana generation failed - upload'
        )
      }

      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Update generation with success
    await adminClient
      .from('generations')
      .update({
        status: 'completed',
        result_url: uploadResult.storageUrl,
        metadata: {
          ...metadataObj,
          completed_at: new Date().toISOString()
        } as unknown as Json
      })
      .eq('id', generation.id)

    return NextResponse.json({
      success: true,
      generation_id: generation.id,
      result_url: uploadResult.storageUrl,
      status: 'completed',
      credits_used: creditsRequired
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Generation failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
