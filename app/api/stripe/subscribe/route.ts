import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getPlanByKey, getCreditsByPlan } from '@/lib/stripe/config'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/utils/logger'
import { stripeSubscribeSchema } from '@/lib/schemas/api'
import { logAuditAction, getRequestMetadata, AuditActions } from '@/lib/utils/audit-log'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export const dynamic = 'force-dynamic'

/**
 * Subscribe to a plan using saved payment method (if available)
 * Falls back to checkout URL if no payment method is saved
 */
export async function POST(request: Request) {
  try {
    // Verify authentication first - CRITICAL SECURITY FIX
    const supabase = createClient()
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

    const body = await request.json()
    const validationResult = stripeSubscribeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { planKey, email, referral } = validationResult.data
    const userId = user.id // Always use authenticated user ID, never from request body

    // Note: referral is available for future use if needed for direct subscriptions
    // Currently Rewardful tracks via checkout session's client_reference_id

    const plan = getPlanByKey(planKey)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Get user profile - try with has_used_trial first, fallback if column doesn't exist
    let profile: {
      stripe_customer_id: string | null
      subscription_id: string | null
      subscription_status: string
      has_used_trial?: boolean
    } | null = null
    let profileError: any = null

    // Try to get profile with has_used_trial
    const { data: profileWithTrial, error: errorWithTrial } = await adminClient
      .from('profiles')
      .select('stripe_customer_id, subscription_id, subscription_status, has_used_trial')
      .eq('id', userId)
      .single()

    // If error is about column not existing, try without has_used_trial
    if (errorWithTrial && errorWithTrial.message?.includes("does not exist")) {
      const { data: profileWithoutTrial, error: errorWithoutTrial } = await adminClient
        .from('profiles')
        .select('stripe_customer_id, subscription_id, subscription_status')
        .eq('id', userId)
        .single()
      
      if (errorWithoutTrial || !profileWithoutTrial) {
        profileError = errorWithoutTrial
      } else {
        profile = { ...profileWithoutTrial, has_used_trial: false }
      }
    } else {
      profile = profileWithTrial as typeof profile
      profileError = errorWithTrial
    }

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const typedProfile = profile

    // Check if user already has an active subscription
    if ((typedProfile.subscription_status === 'active' || typedProfile.subscription_status === 'trialing') && typedProfile.subscription_id) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Use upgrade/downgrade instead.' },
        { status: 400 }
      )
    }

    // Check if user has a Stripe customer with saved payment method
    if (!typedProfile.stripe_customer_id) {
      // No customer - redirect to checkout
      return NextResponse.json({
        success: false,
        requiresCheckout: true,
        message: 'No payment method on file. Redirecting to checkout.',
      })
    }

    // Verify customer exists in Stripe
    let customer
    try {
      customer = await stripe.customers.retrieve(typedProfile.stripe_customer_id)
      if (customer.deleted) {
        return NextResponse.json({
          success: false,
          requiresCheckout: true,
          message: 'Customer not found. Redirecting to checkout.',
        })
      }
    } catch {
      return NextResponse.json({
        success: false,
        requiresCheckout: true,
        message: 'Customer not found. Redirecting to checkout.',
      })
    }

    // Try to find a saved payment method
    let paymentMethodId: string | null = null

    // Check customer's default payment method
    if (customer.invoice_settings?.default_payment_method) {
      paymentMethodId = customer.invoice_settings.default_payment_method as string
    }

    // If no default, list customer's payment methods
    if (!paymentMethodId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: typedProfile.stripe_customer_id,
        type: 'card',
        limit: 1,
      })

      if (paymentMethods.data.length > 0) {
        paymentMethodId = paymentMethods.data[0].id
      }
    }

    // No saved payment method - redirect to checkout
    if (!paymentMethodId) {
      return NextResponse.json({
        success: false,
        requiresCheckout: true,
        message: 'No payment method on file. Redirecting to checkout.',
      })
    }


    // Cancel any old subscription that might still exist
    if (typedProfile.subscription_id) {
      try {
        const oldSub = await stripe.subscriptions.retrieve(typedProfile.subscription_id)
        if (oldSub.status !== 'canceled') {
          await stripe.subscriptions.cancel(typedProfile.subscription_id)
        }
      } catch {
        // Old subscription doesn't exist, that's fine
      }
    }

    const currency = process.env.STRIPE_CURRENCY || 'usd'
    // Default to false if has_used_trial is not available (column might not exist yet)
    const hasUsedTrial = typedProfile.has_used_trial === true

    // Create price for the subscription
    const price = await stripe.prices.create({
      currency,
      product_data: {
        name: `BlackTools ${plan.name}`,
      },
      unit_amount: Math.round(plan.price * 100),
      recurring: {
        interval: 'month',
      },
    })

    // Create subscription with saved payment method
    try {
      const subscriptionParams: Parameters<typeof stripe.subscriptions.create>[0] = {
        customer: typedProfile.stripe_customer_id,
        items: [{ price: price.id }],
        default_payment_method: paymentMethodId || undefined,
        payment_settings: {
          payment_method_options: {
            card: {
              request_three_d_secure: 'any', // Sempre pedir autenticação 3D Secure
            },
          },
          save_default_payment_method: 'on_subscription', // Salvar cartão para uso futuro
        },
        metadata: {
          userId,
          plan: planKey,
          credits: plan.credits.toString(),
          userEmail: email || '',
        },
        // Expand latest_invoice to get payment status
        expand: ['latest_invoice.payment_intent'],
      }

      // No trial - always charge immediately
      if (subscriptionParams.metadata && typeof subscriptionParams.metadata === 'object') {
        subscriptionParams.metadata.isTrial = 'false'
      }

      const subscription = await stripe.subscriptions.create(subscriptionParams)

      logger.debug({
        id: subscription.id,
        status: subscription.status,
      })

      // Check if subscription was created successfully
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        // Determine credits based on trial status
        const creditsAmount = hasUsedTrial
          ? getCreditsByPlan(planKey)
          : Math.min(10, getCreditsByPlan(planKey)) // Trial credits

        // Update database
        await adminClient
          .from('profiles')
          .update({
            subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_plan: planKey,
            credits: creditsAmount,
            credits_extras: 0, // Reset extras on new subscription
            has_used_trial: true,
            subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', userId)

        // Log audit action
        await logAuditAction({
          action: AuditActions.SUBSCRIPTION_CREATED,
          userId: user.id,
          details: {
            subscriptionId: subscription.id,
            plan: planKey,
            status: subscription.status,
            credits: creditsAmount,
            isTrial: subscription.status === 'trialing',
          },
          ...getRequestMetadata(request),
        })

        return NextResponse.json({
          success: true,
          message: subscription.status === 'trialing'
            ? `Trial started! You have ${creditsAmount} credits to try.`
            : `Subscribed to ${plan.name}! You now have ${creditsAmount} credits.`,
          subscriptionId: subscription.id,
          status: subscription.status,
          credits: creditsAmount,
        })
      }

      // Check if payment failed
      if (subscription.status === 'incomplete') {
        const invoice = subscription.latest_invoice as { payment_intent?: { status?: string; last_payment_error?: { message?: string } } } | null
        const paymentIntent = invoice?.payment_intent

        if (paymentIntent?.status === 'requires_payment_method' || paymentIntent?.last_payment_error) {
          const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed'

          // Cancel the incomplete subscription
          await stripe.subscriptions.cancel(subscription.id)

          return NextResponse.json({
            success: false,
            error: `Payment failed: ${errorMessage}. Please update your payment method.`,
            requiresCheckout: true,
          })
        }
      }

      // Unexpected status
      return NextResponse.json({
        success: false,
        error: `Subscription created with unexpected status: ${subscription.status}`,
        requiresCheckout: true,
      })

    } catch (error: unknown) {

      // Check if it's a card error
      if (error && typeof error === 'object' && 'type' in error) {
        const stripeError = error as { type: string; message?: string }
        if (stripeError.type === 'StripeCardError') {
          return NextResponse.json({
            success: false,
            error: `Payment failed: ${stripeError.message || 'Card declined'}. Please update your payment method.`,
            requiresCheckout: true,
          })
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return NextResponse.json(
        { error: `Failed to create subscription: ${errorMessage}` },
        { status: 500 }
      )
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to subscribe: ${errorMessage}` },
      { status: 500 }
    )
  }
}
