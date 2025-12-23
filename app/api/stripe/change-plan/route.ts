import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getPlanByKey, isDowngrade, getCreditsByPlan, PLANS } from '@/lib/stripe/config'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/utils/logger'
import { stripeChangePlanSchema } from '@/lib/schemas/api'
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
    const validationResult = stripeChangePlanSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    // Accept both newPlanKey and planKey for backward compatibility
    const planKey = validationResult.data.newPlanKey || validationResult.data.planKey
    const userId = user.id // Always use authenticated user ID, never from request body
    
    if (!planKey) {
      return NextResponse.json(
        { error: 'Plan key is required' },
        { status: 400 }
      )
    }

    const newPlan = getPlanByKey(planKey)
    if (!newPlan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Get user's current subscription info
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('subscription_id, subscription_plan, subscription_status, stripe_customer_id, credits_extras, credits, email')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if user has an active subscription
    if (!profile.subscription_id || profile.subscription_status !== 'active') {
      // If trialing, show specific message
      if (profile.subscription_status === 'trialing') {
        return NextResponse.json(
          { error: 'You cannot change plans during your trial period. Please wait for your trial to end or contact support.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'No active subscription found. Please subscribe first.' },
        { status: 400 }
      )
    }

    // Check if trying to change to the same plan
    if (profile.subscription_plan === planKey) {
      return NextResponse.json(
        { error: 'You are already on this plan' },
        { status: 400 }
      )
    }

    // Ensure we have a Stripe customer ID
    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please contact support.' },
        { status: 400 }
      )
    }

    const currentPlan = profile.subscription_plan || 'starter'
    const isDowngrading = isDowngrade(currentPlan, planKey)

    // Get current credits for upgrade calculation
    const currentCredits = profile.credits || 0

    // Get the current subscription from Stripe
    const currentSubscription = await stripe.subscriptions.retrieve(profile.subscription_id)

    if (!currentSubscription || currentSubscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Could not retrieve active subscription from Stripe.' },
        { status: 400 }
      )
    }

    // Get the current subscription item (price)
    const subscriptionItemId = currentSubscription.items.data[0]?.id
    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: 'Could not find subscription item.' },
        { status: 400 }
      )
    }

    const currency = process.env.STRIPE_CURRENCY || 'usd'

    // Always charge full price of new plan (no proration)
    const amountToCharge = Math.round(newPlan.price * 100)
    const chargeDescription = `${isDowngrading ? 'Downgrade' : 'Upgrade'} to BlackTools ${newPlan.name}`


    // STEP 1: Charge the customer FIRST before making any changes
    if (amountToCharge > 0) {
      try {
        // Get customer's default payment method
        const customer = await stripe.customers.retrieve(profile.stripe_customer_id)

        if (customer.deleted) {
          return NextResponse.json(
            { error: 'Customer not found. Please contact support.' },
            { status: 400 }
          )
        }

        // Get the default payment method from customer or subscription
        let paymentMethodId = customer.invoice_settings?.default_payment_method as string | null

        // If no default on customer, try to get from subscription
        if (!paymentMethodId) {
          const defaultPaymentMethod = currentSubscription.default_payment_method
          if (typeof defaultPaymentMethod === 'string') {
            paymentMethodId = defaultPaymentMethod
          } else if (defaultPaymentMethod && 'id' in defaultPaymentMethod) {
            paymentMethodId = defaultPaymentMethod.id
          }
        }

        // If still no payment method, list customer's payment methods
        if (!paymentMethodId) {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: profile.stripe_customer_id,
            type: 'card',
            limit: 1,
          })

          if (paymentMethods.data.length > 0) {
            paymentMethodId = paymentMethods.data[0].id
          }
        }

        if (!paymentMethodId) {
          return NextResponse.json(
            { error: 'No payment method found. Please add a payment method first.' },
            { status: 400 }
          )
        }


        // Try 1-click payment first with off_session
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amountToCharge,
            currency,
            customer: profile.stripe_customer_id,
            payment_method: paymentMethodId,
            payment_method_types: ['card'],
            description: chargeDescription,
            confirm: true,
            off_session: true, // Customer not present for 1-click
            metadata: {
              userId,
              type: 'plan_change',
              fromPlan: currentPlan,
              toPlan: planKey,
            },
          })

          // 1-click payment succeeded!
          if (paymentIntent.status === 'succeeded') {
            logger.debug('1-click payment succeeded for plan change')
            // Continue to update subscription below
          } else {
            // Payment needs action or failed - fallback to checkout
            throw new Error('Payment requires confirmation')
          }
        } catch (paymentError: any) {
          // 1-click failed - fallback to Checkout Session for 3D Secure
          logger.debug('1-click failed, falling back to checkout session')
          
          const checkoutSession = await stripe.checkout.sessions.create({
            customer: profile.stripe_customer_id,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'usd', // Force USD to prevent auto-conversion
                  product_data: {
                    name: chargeDescription,
                    description: `Upgrade from ${currentPlan} to ${newPlan.name}`,
                  },
                  unit_amount: amountToCharge,
                },
                quantity: 1,
              },
            ],
            payment_method_options: {
              card: {
                request_three_d_secure: 'any', // Always request 3DS
              },
            },
            // Force English locale to prevent currency conversion display
            locale: 'en',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?upgraded=true&plan=${planKey}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
            metadata: {
              userId,
              type: 'plan_change',
              fromPlan: currentPlan,
              toPlan: planKey,
              subscriptionId: profile.subscription_id,
            },
          })

          return NextResponse.json({
            requiresCheckout: true,
            checkoutUrl: checkoutSession.url,
            message: 'Payment requires verification. Redirecting to secure checkout...',
          })
        }
      } catch (paymentError: unknown) {
        const errorMessage = paymentError instanceof Error ? paymentError.message : 'Payment failed'
        return NextResponse.json(
          { error: `Payment failed: ${errorMessage}` },
          { status: 402 }
        )
      }
    }

    // STEP 2: Payment successful - now update the subscription
    // Create a new price for the new plan
    const newPrice = await stripe.prices.create({
      currency,
      product_data: {
        name: `BlackTools ${newPlan.name}`,
      },
      unit_amount: Math.round(newPlan.price * 100),
      recurring: {
        interval: 'month',
      },
    })


    // Update the subscription with the new price
    // Do NOT use billing_cycle_anchor: 'now' - it causes duplicate charges
    // We already charged via PaymentIntent, subscription continues with same billing cycle
    const updatedSubscription = await stripe.subscriptions.update(profile.subscription_id, {
      items: [
        {
          id: subscriptionItemId,
          price: newPrice.id,
        },
      ],
      // No proration - we already charged separately via PaymentIntent
      proration_behavior: 'none',
      // Update metadata
      metadata: {
        userId,
        plan: planKey,
        credits: newPlan.credits.toString(),
        previousPlan: currentPlan,
        changeType: isDowngrading ? 'downgrade' : 'upgrade',
        userEmail: profile.email || '',
      },
    })

    // STEP 3: Update the database
    // Billing period stays the same - we charged separately via PaymentIntent

    // Calculate final credits:
    // - For UPGRADE: current credits + new plan credits (user keeps what they have + gets new plan credits)
    // - For DOWNGRADE: just new plan credits
    let finalCredits = newPlan.credits

    if (!isDowngrading) {
      // UPGRADE: Add new plan credits to current credits
      finalCredits = currentCredits + newPlan.credits
      logger.debug(`Upgrade: ${currentCredits} existing + ${newPlan.credits} new = ${finalCredits} total credits`)
    }

    const updateData: Record<string, unknown> = {
      subscription_plan: planKey,
      credits: finalCredits,
    }

    // Zero credits_extras on downgrade only
    if (isDowngrading) {
      updateData.credits_extras = 0
    }

    await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    // Log audit action
    await logAuditAction({
      action: AuditActions.PLAN_CHANGED,
      userId: user.id,
      details: {
        subscriptionId: updatedSubscription.id,
        fromPlan: currentPlan,
        toPlan: planKey,
        changeType: isDowngrading ? 'downgrade' : 'upgrade',
        credits: newPlan.credits,
        amountCharged: amountToCharge / 100,
      },
      ...getRequestMetadata(request),
    })

    return NextResponse.json({
      success: true,
      message: isDowngrading
        ? `Downgrade to ${newPlan.name} completed. You now have ${finalCredits.toLocaleString()} credits.`
        : `Upgrade to ${newPlan.name} completed! Your ${currentCredits.toLocaleString()} credits + ${newPlan.credits.toLocaleString()} new = ${finalCredits.toLocaleString()} total credits.`,
      plan: planKey,
      credits: finalCredits,
      amountCharged: amountToCharge / 100,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to change plan: ${errorMessage}` },
      { status: 500 }
    )
  }
}
