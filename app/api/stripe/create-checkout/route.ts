import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getPlanByKey } from '@/lib/stripe/config'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { stripeCreateCheckoutSchema } from '@/lib/schemas/api'
import { logAuditAction, getRequestMetadata, AuditActions } from '@/lib/utils/audit-log'

export const dynamic = 'force-dynamic'

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
    const validationResult = stripeCreateCheckoutSchema.safeParse(body)
    
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

    const plan = getPlanByKey(planKey)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }


    const adminClient = createAdminClient()

    // Check if user already has a Stripe customer ID and subscription
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('stripe_customer_id, subscription_id, subscription_status, subscription_plan, has_used_trial')
      .eq('id', userId)
      .single()


    // If user already has an active subscription (active or trialing), they should use the change-plan endpoint
    const hasActiveSubscription = (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') && profile?.subscription_id
    if (hasActiveSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Use upgrade/downgrade instead.' },
        { status: 400 }
      )
    }

    // If user has an old subscription_id (from canceled subscription), cancel it in Stripe to avoid duplicates
    if (profile?.subscription_id && profile?.subscription_status === 'canceled') {
      try {
        const oldSubscription = await stripe.subscriptions.retrieve(profile.subscription_id)
        // If subscription still exists and is not fully canceled, cancel it
        if (oldSubscription && oldSubscription.status !== 'canceled') {
          await stripe.subscriptions.cancel(profile.subscription_id)
        }
      } catch (error) {
        // Subscription might not exist anymore, that's fine
      }

      // Clear the old subscription data in the database
      // Also zero credits_extras since this is a fresh start after cancellation
      await adminClient
        .from('profiles')
        .update({
          subscription_id: null,
          subscription_plan: null,
          credits_extras: 0, // Zero extras on fresh subscription after cancel
        })
        .eq('id', userId)

    }

    // Check if user already used their trial (one trial per account)
    const hasUsedTrial = profile?.has_used_trial === true

    let customerId = profile?.stripe_customer_id

    // Verify the customer still exists in Stripe (may have been deleted)
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId)
      } catch {
        // Customer doesn't exist in Stripe anymore, create a new one
        customerId = null
      }
    }

    // Create a new customer if one doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      })
      customerId = customer.id

      // Save customer ID to profile
      await adminClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create checkout session with dynamic price
    // Only give trial to users who haven't used it before (one trial per account)
    const subscriptionData: {
      trial_period_days?: number
      metadata: Record<string, string>
    } = {
      metadata: {
        userId,
        plan: planKey,
        credits: plan.credits.toString(),
        userEmail: email || '', // For webhook fallback lookup
      },
    }

    // No trial - charge immediately to ensure card is validated
    // This prevents payment failures when trying to skip trial
    subscriptionData.metadata.isTrial = 'false'

    // Use environment variable for currency (default: usd)
    const currency = process.env.STRIPE_CURRENCY || 'usd'

    const session = await stripe.checkout.sessions.create({
      // Stripe não permite customer + customer_email juntos
      // Como sempre criamos o customer antes, usar apenas customer
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `BlackTools ${plan.name}`,
              description: `${plan.credits} credits per month`,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: subscriptionData,
      // Payment method options para 3D Secure no checkout session
      payment_method_options: {
        card: {
          request_three_d_secure: 'any', // Sempre pedir autenticação 3D Secure
        },
      },
      // No modo subscription, o Stripe automaticamente salva o payment method
      // Mas podemos garantir com payment_method_collection
      payment_method_collection: 'always',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        plan: planKey,
        credits: plan.credits.toString(),
        isTrial: hasUsedTrial ? 'false' : 'true',
        userEmail: email || '', // For webhook fallback lookup
      },
      // Rewardful: Pass referral ID as client_reference_id for affiliate tracking
      // Note: Stripe raises error if client_reference_id is blank, so only set if present
      ...(referral ? { client_reference_id: referral } : {}),
    })

    // Log audit action
    await logAuditAction({
      action: AuditActions.SUBSCRIPTION_CREATED,
      userId: user.id,
      details: {
        checkoutSessionId: session.id,
        plan: planKey,
        isTrial: !hasUsedTrial,
      },
      ...getRequestMetadata(request),
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    )
  }
}
