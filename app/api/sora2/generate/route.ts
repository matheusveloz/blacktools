import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { TOOL_CONFIG, TOOLS } from '@/lib/constants'
import { createTask, urlToBase64 } from '@/lib/sora2/client'
import { deductCredits, refundCredits, getCreditBalance } from '@/lib/credits/utils'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { validatePrompt, sanitizePrompt } from '@/lib/utils/prompt-sanitizer'
import { validateImageUrl } from '@/lib/utils/url-validator'
import { logAuditAction, getRequestMetadata, AuditActions } from '@/lib/utils/audit-log'
import { sora2GenerateSchema, sora2MetadataSchema } from '@/lib/schemas/api'
import type { Sora2Size, Sora2Seconds } from '@/types/sora2'
import type { Json } from '@/types/database'

const CREDITS_REQUIRED = TOOL_CONFIG[TOOLS.SORA2].credits // 20 credits

interface GenerationMetadata {
  prompt: string
  size: Sora2Size
  seconds: Sora2Seconds
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
    const validationResult = sora2GenerateSchema.safeParse(body)
    
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

      deductResult = await deductCredits(adminClient, user.id, CREDITS_REQUIRED, 'Sora2 generation')

      if (!deductResult.success) {
        return NextResponse.json(
          { error: 'Failed to deduct credits', details: deductResult.error },
          { status: 500 }
        )
      }
    }

    // Default to landscape 15s
    const selectedSize: Sora2Size = size || '1280x720'
    const selectedSeconds: Sora2Seconds = seconds || '15'

    // Create generation record with status 'pending'
    const metadataObj: GenerationMetadata = {
      prompt: sanitizedPrompt,
      size: selectedSize,
      seconds: selectedSeconds,
      imageUrl: imageUrl || undefined,
      progress: 0,
      created_at: new Date().toISOString()
    }

    // Validate metadata with Zod before saving
    const metadataValidation = sora2MetadataSchema.safeParse(metadataObj)
    if (!metadataValidation.success) {
      if (deductResult && deductResult.success) {
        await refundCredits(
          adminClient,
          user.id,
          deductResult.deducted,
          deductResult.fromSubscription,
          deductResult.fromExtras,
          'Sora2 generation failed - metadata validation'
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
        tool: TOOLS.SORA2,
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
          tool: TOOLS.SORA2,
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
          'Sora2 generation failed - record creation'
        )
      }

      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      )
    }

    // Call Laozhang API to create task (ONLY sends 'sora-2' model)
    // Pass imageUrl for image-to-video mode

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
            'Sora2 generation failed - image conversion'
          )
        }

        return NextResponse.json(
          { error: 'Failed to process image. Please try uploading again.' },
          { status: 500 }
        )
      }
      imageBase64 = converted
    }

    const taskResult = await createTask(sanitizedPrompt, selectedSize, selectedSeconds, imageBase64)


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
          'Sora2 generation failed - task creation'
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


    // First verify the record exists
    const { data: checkData } = await adminClient
      .from('generations')
      .select('id, status')
      .eq('id', generation.id)
      .single()


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

    // Verify the update worked
    const { data: verifyData } = await adminClient
      .from('generations')
      .select('id, status, metadata')
      .eq('id', generation.id)
      .single()



    return NextResponse.json({
      success: true,
      generation_id: generation.id,
      task_id: taskResult.taskId,
      status: 'processing',
      credits_used: CREDITS_REQUIRED,
      // Debug info
      _debug: {
        insertedId: generation.id,
        checkBeforeUpdate: checkData,
        updateError: updateError?.message || null,
        verifyAfterUpdate: verifyData,
        task_id_saved: (verifyData?.metadata as Record<string, unknown>)?.task_id || null
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
