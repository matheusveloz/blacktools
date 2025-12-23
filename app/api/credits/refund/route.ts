import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { refundCredits } from '@/lib/credits/utils'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

interface RefundRequestBody {
  amount: number
  reason?: string
}

export async function POST(request: NextRequest) {
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

    // Get request body
    const body: RefundRequestBody = await request.json()
    const { amount, reason } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }


    // Refund credits (all to subscription credits by default)
    const result = await refundCredits(
      adminClient,
      user.id,
      amount,
      amount, // toSubscription
      0,      // toExtras
      reason
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to refund credits' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      refunded: amount,
      reason,
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
