import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { CREDIT_PACKS, type PlanType } from '@/lib/constants'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { logAuditAction, getRequestMetadata, AuditActions } from '@/lib/utils/audit-log'
import { creditsPurchaseSchema } from '@/lib/schemas/api'

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

    // Get and validate request body with Zod
    const body = await request.json()
    const validationResult = creditsPurchaseSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { packId, email, customCredits, pricePerCredit } = validationResult.data
    const userId = user.id // Always use authenticated user ID, never from request body

    if (!packId) {
      return NextResponse.json(
        { error: 'packId is required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Get user's subscription plan and payment info
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('stripe_customer_id, subscription_id, subscription_plan, subscription_status, credits_extras')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user has an active subscription
    if (profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing') {
      return NextResponse.json(
        { error: 'Active subscription required to purchase credits' },
        { status: 403 }
      )
    }

    // Block credit purchases during trial period
    if (profile.subscription_status === 'trialing') {
      return NextResponse.json(
        { error: 'Credit purchases are not available during your trial period. Please wait for your trial to end.' },
        { status: 403 }
      )
    }

    // Check if user has a Stripe customer ID
    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No payment method found. Please contact support.' },
        { status: 400 }
      )
    }

    // Get the user's plan
    const userPlan = (profile.subscription_plan || 'starter') as PlanType
    const availablePacks = CREDIT_PACKS[userPlan]

    if (!availablePacks) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      )
    }

    // Handle custom credits pack
    let finalCredits: number
    let finalPrice: number
    let packIdForMetadata: string

    const MIN_CUSTOM_CREDITS = 600
    const MAX_CUSTOM_CREDITS = 10000
    const MAX_PRICE = 10000

    if (packId === 'custom') {
      // Custom amount purchase
      if (!customCredits || !pricePerCredit) {
        return NextResponse.json(
          { error: 'Custom credits require customCredits and pricePerCredit' },
          { status: 400 }
        )
      }

      // Validate credit amount
      if (customCredits < MIN_CUSTOM_CREDITS || customCredits > MAX_CUSTOM_CREDITS || !Number.isInteger(customCredits)) {
        return NextResponse.json(
          { error: `Credits must be an integer between ${MIN_CUSTOM_CREDITS} and ${MAX_CUSTOM_CREDITS}` },
          { status: 400 }
        )
      }

      // Get best price per credit from the last (largest) pack - with full discount
      const basePricePerCredit = availablePacks[availablePacks.length - 1].pricePerCredit as number

      // Validate that client-provided price matches server calculation (prevent manipulation)
      const expectedPrice = Math.round(customCredits * basePricePerCredit * 100) / 100
      const clientPrice = Math.round(customCredits * pricePerCredit * 100) / 100

      if (Math.abs(expectedPrice - clientPrice) > 0.01) {
        return NextResponse.json(
          { error: 'Price calculation mismatch. Please try again.' },
          { status: 400 }
        )
      }

      finalCredits = customCredits
      finalPrice = expectedPrice
      packIdForMetadata = 'custom'

      // Validate total price
      if (finalPrice <= 0 || finalPrice > MAX_PRICE) {
        return NextResponse.json(
          { error: `Total price must be between 0.01 and ${MAX_PRICE}` },
          { status: 400 }
        )
      }
    } else {
      // Standard pack purchase
      const basePack = availablePacks.find(pack => pack.id === packId)

      if (!basePack) {
        return NextResponse.json(
          { error: 'Credit pack not found' },
          { status: 404 }
        )
      }

      finalCredits = basePack.credits as number
      finalPrice = basePack.price as number
      packIdForMetadata = basePack.id
    }


    const currency = process.env.STRIPE_CURRENCY || 'usd'
    const amountInCents = Math.round(finalPrice * 100)

    // Get customer's payment method
    const customer = await stripe.customers.retrieve(profile.stripe_customer_id)

    if (customer.deleted) {
      return NextResponse.json(
        { error: 'Customer not found. Please contact support.' },
        { status: 400 }
      )
    }

    // Get the default payment method from customer
    let paymentMethodId = customer.invoice_settings?.default_payment_method as string | null

    // If no default on customer, try to get from subscription
    if (!paymentMethodId && profile.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(profile.subscription_id)
        const defaultPaymentMethod = subscription.default_payment_method
        if (typeof defaultPaymentMethod === 'string') {
          paymentMethodId = defaultPaymentMethod
        } else if (defaultPaymentMethod && 'id' in defaultPaymentMethod) {
          paymentMethodId = defaultPaymentMethod.id
        }
      } catch {
        // Subscription might not exist, continue to list payment methods
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
        { error: 'No payment method found. Please add a card in your subscription settings first.' },
        { status: 400 }
      )
    }


    // Try 1-click payment first with off_session
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        customer: profile.stripe_customer_id,
        payment_method: paymentMethodId,
        payment_method_types: ['card'],
        description: `${finalCredits} Extra Credits - BlackTools`,
        confirm: true,
        off_session: true, // Customer not present for 1-click
        metadata: {
          userId,
          type: 'credits_purchase',
          packId: packIdForMetadata,
          credits: finalCredits.toString(),
          plan: userPlan,
        },
      })

      // Check if 1-click payment succeeded
      if (paymentIntent.status === 'succeeded') {
        // Payment successful - add credits immediately
        const currentExtras = profile.credits_extras || 0
        const newExtras = currentExtras + finalCredits

        const { error: updateError } = await adminClient
          .from('profiles')
          .update({ credits_extras: newExtras })
          .eq('id', userId)

        if (updateError) {
          return NextResponse.json(
            { error: 'Payment successful but credits could not be added. Please contact support with your payment ID: ' + paymentIntent.id },
            { status: 500 }
          )
        }

        // Log audit action
        const metadata = getRequestMetadata(request)
        await logAuditAction({
          action: AuditActions.CREDITS_PURCHASED,
          userId,
          details: {
            credits: finalCredits,
            packId: packIdForMetadata,
            price: finalPrice,
            paymentIntentId: paymentIntent.id,
          },
          ...metadata,
        })

        return NextResponse.json({
          success: true,
          message: `Successfully purchased ${finalCredits} credits!`,
          credits: finalCredits,
          newTotal: newExtras,
          paymentIntentId: paymentIntent.id,
        })
      }

      // Payment needs action - fallback to checkout
      throw new Error('Payment requires confirmation')
      
    } catch (paymentError: any) {
      // 1-click failed - fallback to Checkout Session for 3D Secure
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: profile.stripe_customer_id,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd', // Force USD to prevent auto-conversion
              product_data: {
                name: `${finalCredits} Extra Credits`,
                description: 'BlackTools - Additional Credits',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        payment_method_options: {
          card: {
            request_three_d_secure: 'any', // Always request 3DS
          },
        },
        // Prevent currency conversion
        locale: 'en',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/buy-credits?success=true&credits=${finalCredits}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/buy-credits?canceled=true`,
        metadata: {
          userId,
          type: 'credits_purchase',
          packId: packIdForMetadata,
          credits: finalCredits.toString(),
          plan: userPlan,
        },
      })

      return NextResponse.json({
        requiresCheckout: true,
        checkoutUrl: checkoutSession.url,
        message: 'Payment requires verification. Redirecting to secure checkout...',
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Payment failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
