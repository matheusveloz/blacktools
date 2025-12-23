import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'

/**
 * Reactivate a canceled subscription
 * This will resume a subscription that was set to cancel at period end
 */
export async function POST() {
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
    const rateLimit = await checkRateLimit(rateLimiters.payment, user.id)
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

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('subscription_id, subscription_status')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (!profile.subscription_id) {
      return NextResponse.json(
        { error: 'No subscription found to reactivate' },
        { status: 400 }
      )
    }

    // Get the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(profile.subscription_id)

    // Check if subscription can be reactivated
    // Can reactivate if:
    // 1. Subscription is active but set to cancel at period end
    // 2. Subscription is past_due (need to retry payment)
    if (subscription.status === 'active' && subscription.cancel_at_period_end) {
      // Remove the cancellation
      const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: false,
      })


      return NextResponse.json({
        success: true,
        message: 'Subscription reactivated successfully',
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        }
      })
    }

    // If subscription is canceled or past_due, redirect to customer portal
    // where they can update payment method or resubscribe
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      return NextResponse.json({
        success: false,
        error: 'Subscription cannot be reactivated automatically. Please use the customer portal to resubscribe.',
        requiresPortal: true
      })
    }

    // Subscription is in an unexpected state
    return NextResponse.json({
      success: false,
      error: `Subscription is in ${subscription.status} state and cannot be reactivated`,
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}
