import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getCreditsByPlan } from '@/lib/stripe/config'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * Sync subscription status from Stripe to database
 * Called when user returns to the platform to ensure data is fresh
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
    const rateLimit = await checkRateLimit(rateLimiters.general, user.id)
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

    // Get user profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('subscription_id, subscription_status, subscription_plan, stripe_customer_id, credits')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // If no subscription_id but has stripe_customer_id, check for active subscriptions
    if (!profile.subscription_id && profile.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
          limit: 1,
        })

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]
          const plan = subscription.metadata?.plan || profile.subscription_plan || 'starter'
          const credits = getCreditsByPlan(plan)

          // Found active subscription - update database
          await adminClient
            .from('profiles')
            .update({
              subscription_id: subscription.id,
              subscription_status: 'active',
              subscription_plan: plan,
              credits: credits,
              subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', user.id)


          return NextResponse.json({
            success: true,
            changed: true,
            status: 'active',
            plan,
            credits,
          })
        }
      } catch (err) {
      }
    }

    // If has subscription_id, verify it's still valid in Stripe
    if (profile.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(profile.subscription_id)

        // Determine effective status
        let effectiveStatus = subscription.status
        if (subscription.cancel_at_period_end && subscription.status === 'active') {
          effectiveStatus = 'canceled' // Will cancel at period end
        }

        // Check if status changed
        const statusChanged = profile.subscription_status !== effectiveStatus
        const plan = subscription.metadata?.plan || profile.subscription_plan

        if (statusChanged) {
          const updateData: Record<string, unknown> = {
            subscription_status: effectiveStatus,
            subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }

          // If reactivated (was canceled, now active), give credits
          if (profile.subscription_status === 'canceled' && effectiveStatus === 'active') {
            updateData.credits = getCreditsByPlan(plan || 'starter')
          }

          await adminClient
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)


          return NextResponse.json({
            success: true,
            changed: true,
            previousStatus: profile.subscription_status,
            status: effectiveStatus,
            plan,
            credits: updateData.credits || profile.credits,
          })
        }

        // No changes needed
        return NextResponse.json({
          success: true,
          changed: false,
          status: effectiveStatus,
          plan,
        })

      } catch (err) {
        // Subscription not found in Stripe - might be deleted

        // Clear the invalid subscription
        await adminClient
          .from('profiles')
          .update({
            subscription_id: null,
            subscription_status: 'canceled',
          })
          .eq('id', user.id)

        return NextResponse.json({
          success: true,
          changed: true,
          status: 'canceled',
        })
      }
    }

    // No subscription to sync
    return NextResponse.json({
      success: true,
      changed: false,
      status: profile.subscription_status,
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}
