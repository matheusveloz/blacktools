import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { deductCredits, getCreditBalance } from '@/lib/credits/utils'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { logAuditAction, getRequestMetadata, AuditActions } from '@/lib/utils/audit-log'
import { creditsDeductSchema } from '@/lib/schemas/api'

/**
 * API to deduct credits ONCE before starting batch generations
 * This prevents race conditions when multiple generations run in parallel
 *
 * Credits are deducted in order: subscription credits first, then extras
 */
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
    const rateLimit = await checkRateLimit(rateLimiters.credits, user.id)
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

    // Get and validate request body with Zod
    const body = await request.json()
    const validationResult = creditsDeductSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { amount, reason } = validationResult.data

    // Deduct credits using the centralized utility
    const result = await deductCredits(adminClient, user.id, amount, reason)

    // Log audit action
    const metadata = getRequestMetadata(request)
    await logAuditAction({
      action: AuditActions.CREDITS_DEDUCTED,
      userId: user.id,
      details: {
        amount,
        reason: reason || 'N/A',
        previousBalance: result.previousBalance.total,
        newBalance: result.newBalance.total,
      },
      ...metadata,
    })

    if (!result.success) {
      // Check if it's an insufficient credits error
      if (result.error === 'Insufficient credits') {
        const balanceResult = await getCreditBalance(adminClient, user.id)
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            required: amount,
            available: balanceResult.balance?.total || 0,
            credits: balanceResult.balance?.credits || 0,
            credits_extras: balanceResult.balance?.credits_extras || 0,
          },
          { status: 402 }
        )
      }

      return NextResponse.json(
        { error: result.error || 'Failed to deduct credits' },
        { status: 500 }
      )
    }


    return NextResponse.json({
      success: true,
      previousBalance: result.previousBalance.total,
      deducted: amount,
      newBalance: result.newBalance.total,
      // Detailed breakdown
      fromSubscription: result.fromSubscription,
      fromExtras: result.fromExtras,
      credits: result.newBalance.credits,
      credits_extras: result.newBalance.credits_extras,
      reason
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
