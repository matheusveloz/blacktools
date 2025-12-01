import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/server'
import { getCreditsByPlan } from '@/lib/stripe/config'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan
        const credits = session.metadata?.credits

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const creditsAmount = credits
            ? parseInt(credits, 10)
            : getCreditsByPlan(plan || '')

          await supabase
            .from('profiles')
            .update({
              subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscription_plan: plan,
              subscription_current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              credits: creditsAmount,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          const plan = subscription.metadata?.plan

          await supabase
            .from('profiles')
            .update({
              subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscription_plan: plan,
              subscription_current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_id: null,
              subscription_status: 'canceled',
              subscription_plan: null,
              subscription_current_period_end: null,
              credits: 0,
            })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.userId
          const plan = subscription.metadata?.plan
          const credits = subscription.metadata?.credits

          if (userId) {
            const creditsAmount = credits
              ? parseInt(credits, 10)
              : getCreditsByPlan(plan || '')

            await supabase
              .from('profiles')
              .update({
                credits: creditsAmount,
                subscription_current_period_end: new Date(
                  subscription.current_period_end * 1000
                ).toISOString(),
              })
              .eq('id', userId)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.userId

          if (userId) {
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'past_due',
              })
              .eq('id', userId)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
