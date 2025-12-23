import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { TOOLS } from '@/lib/constants'
import { createTask, urlToBase64 } from '@/lib/veo3/client'
import { deductCredits, refundCredits, getCreditBalance } from '@/lib/credits/utils'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { validatePrompt, sanitizePrompt } from '@/lib/utils/prompt-sanitizer'
import { validateImageUrl } from '@/lib/utils/url-validator'
import { logAuditAction, getRequestMetadata, AuditActions } from '@/lib/utils/audit-log'
import { veo3GenerateSchema, veo3MetadataSchema } from '@/lib/schemas/api'
import { buildVeo3ModelName, getVeo3Credits } from '@/types/veo3'
import type { Veo3AspectRatio, Veo3Speed, Veo3Model } from '@/types/veo3'
import type { Json } from '@/types/database'

interface GenerationMetadata {
  prompt: string
  model: Veo3Model
  aspectRatio: Veo3AspectRatio
  speed: Veo3Speed
  imageUrl?: string
  task_id?: string
  progress: number
  created_at: string
  [key: string]: string | number | undefined
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const adminClient = createAdminClient()

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
    const validationResult = veo3GenerateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { prompt, size, seconds, imageUrl, skipCreditDeduction } = validationResult.data
    // Map size/seconds to aspectRatio/speed for Veo3
    // Veo3 only supports 1280x720 (landscape) and 720x1280 (portrait)
    const aspectRatio: Veo3AspectRatio = size === '1280x720' ? 'landscape' : 'portrait'
    const speed: Veo3Speed = seconds === '10' ? 'fast' : 'standard'

    // Validate and sanitize prompt
    const promptValidation = validatePrompt(prompt)
    if (!promptValidation.valid || !promptValidation.sanitized) {
      return NextResponse.json(
        { error: promptValidation.error || 'Invalid prompt' },
        { status: 400 }
      )
    }
    const sanitizedPrompt = promptValidation.sanitized

    // Validate imageUrl if provided
    if (imageUrl) {
      const imageUrlValidation = validateImageUrl(imageUrl)
      if (!imageUrlValidation.valid) {
        return NextResponse.json(
          { error: imageUrlValidation.error || 'Invalid imageUrl' },
          { status: 400 }
        )
      }
    }

    // Default to portrait, fast (cheaper)
    const selectedAspectRatio: Veo3AspectRatio = aspectRatio || 'portrait'
    const selectedSpeed: Veo3Speed = speed || 'fast'

    // Calculate credits based on speed
    const CREDITS_REQUIRED = getVeo3Credits(selectedSpeed)

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

      if (balanceResult.balance.total < CREDITS_REQUIRED) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            required: CREDITS_REQUIRED,
            available: balanceResult.balance.total,
            credits: balanceResult.balance.credits,
            credits_extras: balanceResult.balance.credits_extras
          },
          { status: 402 }
        )
      }

      deductResult = await deductCredits(adminClient, user.id, CREDITS_REQUIRED, 'Veo3 generation')

      if (!deductResult.success) {
        return NextResponse.json(
          { error: 'Failed to deduct credits' },
          { status: 500 }
        )
      }
    }

    // Build model name (will include -fl suffix if image is provided)
    const hasImage = !!imageUrl
    const model = buildVeo3ModelName({
      aspectRatio: selectedAspectRatio,
      speed: selectedSpeed,
      hasImage
    })

    // Create generation record with status 'pending'
    const metadataObj: GenerationMetadata = {
      prompt: sanitizedPrompt,
      model,
      aspectRatio: selectedAspectRatio,
      speed: selectedSpeed,
      imageUrl: imageUrl || undefined,
      progress: 0,
      created_at: new Date().toISOString()
    }

    // Validate metadata with Zod before saving
    const metadataValidation = veo3MetadataSchema.safeParse(metadataObj)
    if (!metadataValidation.success) {
      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'Veo3 generation failed - metadata validation'
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
        tool: TOOLS.VEO3,
        status: 'pending',
        credits_used: CREDITS_REQUIRED,
        metadata: metadataValidation.data as unknown as Json
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
          tool: TOOLS.VEO3,
          creditsUsed: CREDITS_REQUIRED,
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
          'Veo3 generation failed - record creation'
        )
      }

      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      )
    }

    // Convert image URL to base64 if it's a URL (not already base64)
    let imageBase64: string | undefined = imageUrl
    if (imageUrl && !imageUrl.startsWith('data:')) {
      const converted = await urlToBase64(imageUrl)
      if (!converted) {
        // Failed to convert - refund credits and return error
        await adminClient
          .from('generations')
          .update({
            status: 'failed',
            metadata: {
              ...metadataObj,
              error: 'Failed to convert image URL to base64'
            } as unknown as Json
          })
          .eq('id', generation.id)

        if (deductResult && deductResult.success) {
          await refundCredits(
            adminClient,
            user.id,
            deductResult.deducted,
            deductResult.fromSubscription,
            deductResult.fromExtras,
            'Veo3 generation failed - image conversion'
          )
        }

        return NextResponse.json(
          { error: 'Failed to process image. Please try uploading again.' },
          { status: 500 }
        )
      }
      imageBase64 = converted
    }


    // Call Laozhang API to create task
    const taskResult = await createTask(sanitizedPrompt, selectedAspectRatio, selectedSpeed, imageBase64)


    if (!taskResult.success || !taskResult.taskId) {
      // Mark as failed and refund
      await adminClient
        .from('generations')
        .update({
          status: 'failed',
          metadata: {
            ...metadataObj,
            error: taskResult.error || 'Failed to create task'
          } as unknown as Json
        })
        .eq('id', generation.id)

      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'Veo3 generation failed - task creation'
        )
      }

      return NextResponse.json(
        { error: taskResult.error || 'Failed to create video task' },
        { status: 500 }
      )
    }

    // Update generation with task_id and set status to 'processing'
    const updatedMetadata = {
      ...metadataObj,
      task_id: taskResult.taskId
    }


    const { error: updateError } = await adminClient
      .from('generations')
      .update({
        status: 'processing',
        metadata: updatedMetadata
      })
      .eq('id', generation.id)

    if (updateError) {
    } else {
    }


    return NextResponse.json({
      success: true,
      generation_id: generation.id,
      task_id: taskResult.taskId,
      status: 'processing',
      credits_used: CREDITS_REQUIRED
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
