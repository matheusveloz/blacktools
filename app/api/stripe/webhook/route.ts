import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/server'
import { getCreditsByPlan, getTrialCreditsByPlan, isUpgrade as checkIsUpgrade } from '@/lib/stripe/config'
import { logStripeIPWarning } from '@/lib/utils/stripe-ip-validator'
import { logger } from '@/lib/utils/logger'
import { logAuditAction, AuditActions } from '@/lib/utils/audit-log'
import { trackPurchase, trackSubscribe } from '@/lib/facebook/capi'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('Stripe-Signature') as string

  // Get IP and User Agent for Facebook CAPI
  const clientIpAddress = headers().get('x-forwarded-for')?.split(',')[0]?.trim() ||
                          headers().get('x-real-ip') ||
                          'unknown'
  const clientUserAgent = headers().get('user-agent') || 'unknown'

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Log IP warning if not from Stripe (signature verification is primary security)
  logStripeIPWarning(request, event.type)

  /**
   * Helper: Check if profile is suspended before updating (except for suspension events)
   * @param userId - User ID to check
   * @param eventType - Stripe event type
   * @returns true if profile is suspended and should not be updated, false otherwise
   */
  async function isProfileSuspended(userId: string, eventType: string): Promise<boolean> {
    // Allow events that may cause suspension (these should process even if already suspended)
    const suspensionEvents = ['charge.refunded', 'charge.dispute.created']
    if (suspensionEvents.includes(eventType)) {
      return false // Process these events
    }

    // Check account status
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_status')
      .eq('id', userId)
      .single()

    return profile?.account_status === 'suspended'
  }

  try {

    switch (event.type) {
      // New subscription created via checkout OR credits purchase
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        let userId = session.metadata?.userId
        const sessionType = session.metadata?.type
        const customerId = session.customer as string
        const customerEmail = session.customer_email || session.customer_details?.email

        // Log session details (redacted in production via logger)
        logger.debug({
          sessionType,
          plan: session.metadata?.plan,
          // Sensitive data removed from logs
        })

        // If no userId in metadata, try to find by stripe_customer_id
        if (!userId && customerId) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profileError) {
          }

          if (profile) {
            userId = profile.id
          }
        }

        // If still no userId, try to find by email (from session or metadata)
        const emailToSearch = customerEmail || session.metadata?.userEmail
        if (!userId && emailToSearch) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', emailToSearch)
            .single()

          if (profileError) {
          }

          if (profile) {
            userId = profile.id

            // Also update stripe_customer_id if missing
            if (customerId) {
              await supabase
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', userId)
            }
          }
        }

        // Handle credits purchase (one-time payment)
        if (sessionType === 'credits_purchase' && userId) {
          const creditsToAdd = parseInt(session.metadata?.credits || '0', 10)
          const packId = session.metadata?.packId
          const sessionId = session.id

          if (creditsToAdd > 0) {
            // IDEMPOTENCY CHECK: Verify if this session was already processed
            const { data: existingLog } = await supabase
              .from('audit_logs')
              .select('id')
              .eq('user_id', userId)
              .eq('action', 'credits_purchased')
              .contains('details', { sessionId })
              .limit(1)
              .maybeSingle()

            if (existingLog) {
              // Already processed this session - skip to avoid duplication
              logger.debug(`Credits purchase already processed for session ${sessionId}`)
              break
            }

            // Get current credits_extras and add new credits
            const { data: profile } = await supabase
              .from('profiles')
              .select('credits_extras')
              .eq('id', userId)
              .single()

            const currentExtras = profile?.credits_extras || 0
            const newExtras = currentExtras + creditsToAdd

            await supabase
              .from('profiles')
              .update({
                credits_extras: newExtras,
              })
              .eq('id', userId)

            // Log audit action (also serves as idempotency record)
            await logAuditAction({
              action: AuditActions.CREDITS_PURCHASED,
              userId,
              details: {
                credits: creditsToAdd,
                packId,
                sessionId,
              },
            }).catch(() => {})

            // Track purchase with Facebook CAPI
            const amountPaid = (session.amount_total || 0) / 100
            if (amountPaid > 0) {
              // Get fbc/fbp from user's profile (stored when they signed up)
              const { data: userProfile } = await supabase
                .from('profiles')
                .select('fbc, fbp')
                .eq('id', userId)
                .single()

              trackPurchase({
                userData: {
                  email: customerEmail || undefined,
                  externalId: userId,
                  clientIpAddress,
                  clientUserAgent,
                  // Use stored fbc/fbp from profile - this links purchase to original ad click
                  fbc: userProfile?.fbc || session.metadata?.fbc || undefined,
                  fbp: userProfile?.fbp || session.metadata?.fbp || undefined,
                },
                value: amountPaid,
                currency: session.currency?.toUpperCase() || 'USD',
                orderId: sessionId,
                contentIds: [packId || 'credits'],
                numItems: 1,
                eventSourceUrl: 'https://blacktools.ai/buy-credits',
              }).catch(() => {})
            }
          }
          break
        }

        // Handle plan change (one-time payment for upgrade/downgrade)
        if (sessionType === 'plan_change' && userId) {
          const fromPlan = session.metadata?.fromPlan
          const toPlan = session.metadata?.toPlan
          const subscriptionId = session.metadata?.subscriptionId
          const sessionId = session.id

          if (toPlan && subscriptionId) {
            // IDEMPOTENCY CHECK: Verify if this session was already processed
            const { data: existingLog } = await supabase
              .from('audit_logs')
              .select('id')
              .eq('user_id', userId)
              .eq('action', 'plan_changed')
              .contains('details', { sessionId })
              .limit(1)
              .maybeSingle()

            if (existingLog) {
              // Already processed this session - skip to avoid duplication
              logger.debug(`Plan change already processed for session ${sessionId}`)
              break
            }

            const newPlan = await import('@/lib/stripe/config').then(m => m.getPlanByKey(toPlan))
            
            if (newPlan) {
              // Update subscription in Stripe
              const subscription = await stripe.subscriptions.retrieve(subscriptionId)
              const subscriptionItemId = subscription.items.data[0]?.id

              if (subscriptionItemId) {
                // Create new price
                const newPrice = await stripe.prices.create({
                  currency: session.currency || 'usd',
                  product_data: {
                    name: `BlackTools ${newPlan.name}`,
                  },
                  unit_amount: Math.round(newPlan.price * 100),
                  recurring: {
                    interval: 'month',
                  },
                })

                // Update subscription
                await stripe.subscriptions.update(subscriptionId, {
                  items: [{ id: subscriptionItemId, price: newPrice.id }],
                  proration_behavior: 'none',
                  metadata: {
                    ...subscription.metadata,
                    plan: toPlan,
                  },
                })

                // Update database
                const isUpgrading = fromPlan && await import('@/lib/stripe/config')
                  .then(m => m.isUpgrade(fromPlan, toPlan))
                const isDowngrading = fromPlan && await import('@/lib/stripe/config')
                  .then(m => m.isDowngrade(fromPlan, toPlan))

                // Calculate final credits:
                // - For UPGRADE: current credits + new plan credits
                // - For DOWNGRADE: just new plan credits
                let finalCredits = newPlan.credits

                if (isUpgrading) {
                  // Get current credits to add the new plan credits
                  const { data: currentProfile } = await supabase
                    .from('profiles')
                    .select('credits')
                    .eq('id', userId)
                    .single()

                  const currentCredits = currentProfile?.credits || 0
                  finalCredits = currentCredits + newPlan.credits
                  logger.debug(`Plan change upgrade: ${currentCredits} existing + ${newPlan.credits} new = ${finalCredits} total credits`)
                }

                const updateData: Record<string, unknown> = {
                  subscription_plan: toPlan,
                  credits: finalCredits,
                }

                if (isDowngrading) {
                  updateData.credits_extras = 0
                }

                await supabase
                  .from('profiles')
                  .update(updateData)
                  .eq('id', userId)

                // Log audit action (also serves as idempotency record)
                await logAuditAction({
                  action: AuditActions.PLAN_CHANGED,
                  userId,
                  details: {
                    fromPlan,
                    toPlan,
                    sessionId,
                  },
                }).catch(() => {})
              }
            }
          }
          break
        }

        // Handle subscription checkout
        let plan = session.metadata?.plan
        const isTrial = session.metadata?.isTrial === 'true'
        let isUpgrade = session.metadata?.isUpgrade === 'true'
        const oldSubscriptionId = session.metadata?.oldSubscriptionId


        if (!userId) {
        }

        if (!session.subscription) {
        }

        if (userId && session.subscription) {
          // Check if profile is suspended before processing
          if (await isProfileSuspended(userId, event.type)) {
            // Don't update suspended profiles (except for suspension events)
            return NextResponse.json({ received: true })
          }

          // Get subscription to retrieve plan from metadata if not in session
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // If plan not in session metadata, try subscription metadata
          if (!plan && subscription.metadata?.plan) {
            plan = subscription.metadata.plan
          }

          // If isUpgrade not in session metadata, try subscription metadata (changeType)
          if (!isUpgrade && subscription.metadata?.changeType) {
            isUpgrade = subscription.metadata.changeType === 'upgrade'
          }

          // Final fallback: if we have oldSubscriptionId and previousPlan, calculate isUpgrade
          if (!isUpgrade && oldSubscriptionId && subscription.metadata?.previousPlan && plan) {
            const previousPlan = subscription.metadata.previousPlan
            isUpgrade = checkIsUpgrade(previousPlan, plan)
          }


          // Cancel old subscription if this is a plan change (upgrade/downgrade)
          if (oldSubscriptionId) {
            try {
              await stripe.subscriptions.cancel(oldSubscriptionId, {
                prorate: false,
              })
            } catch (cancelError) {
              // Old subscription might already be canceled, that's fine
            }
          }

          // Get credits for the new plan
          const newPlanCredits = getCreditsByPlan(plan || '')

          // IMPORTANT: If checkout completed, the subscription should be active
          // Sometimes the subscription status is still 'incomplete' at this point due to timing
          // We trust the checkout completion and set status to active (or trialing if trial)
          let effectiveStatus = subscription.status
          if (subscription.status === 'incomplete') {
            effectiveStatus = isTrial ? 'trialing' : 'active'
          }

          // Check if this is a plan change (has previousPlan in metadata)
          const previousPlan = session.metadata?.previousPlan || subscription.metadata?.previousPlan
          const isPlanChange = !!previousPlan

          // Calculate final credits:
          // - For UPGRADE: current credits + new plan credits (user keeps what they have + gets new plan credits)
          // - For DOWNGRADE or NEW subscription: just new plan credits
          let finalCredits = newPlanCredits

          if (isPlanChange && isUpgrade) {
            // Get current credits to add the new plan credits
            const { data: currentProfile } = await supabase
              .from('profiles')
              .select('credits')
              .eq('id', userId)
              .single()

            const currentCredits = currentProfile?.credits || 0
            finalCredits = currentCredits + newPlanCredits
            logger.debug(`Upgrade: ${currentCredits} existing + ${newPlanCredits} new = ${finalCredits} total credits`)
          }

          const updateData: Record<string, unknown> = {
            subscription_id: subscription.id,
            subscription_status: effectiveStatus,
            subscription_plan: plan,
            credits: finalCredits,
            has_used_trial: true, // Mark trial as used (whether they got trial or not)
          }

          // Only set period dates if they exist
          if (subscription.current_period_start) {
            updateData.subscription_current_period_start = new Date(
              subscription.current_period_start * 1000
            ).toISOString()
          }
          if (subscription.current_period_end) {
            updateData.subscription_current_period_end = new Date(
              subscription.current_period_end * 1000
            ).toISOString()
          }

          // Only zero extras on DOWNGRADE, keep them on upgrade
          if (isPlanChange) {
            if (!isUpgrade) {
              updateData.credits_extras = 0
            }
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)

          if (!updateError && userId) {
            // Log audit action for subscription creation via checkout
            await logAuditAction({
              action: AuditActions.SUBSCRIPTION_CREATED,
              userId,
              details: {
                subscriptionId: subscription.id,
                plan: plan || 'unknown',
                status: effectiveStatus,
                credits: finalCredits,
                isTrial,
                isUpgrade,
              },
            }).catch(() => {
              // Ignore audit logging errors
            })

            // Track subscription with Facebook CAPI
            const subscriptionAmount = (session.amount_total || 0) / 100

            // Get fbc/fbp from user's profile (stored when they signed up)
            const { data: userProfileForTracking } = await supabase
              .from('profiles')
              .select('fbc, fbp')
              .eq('id', userId)
              .single()

            trackSubscribe({
              userData: {
                email: customerEmail || undefined,
                externalId: userId,
                clientIpAddress,
                clientUserAgent,
                // Use stored fbc/fbp from profile - this links subscription to original ad click
                fbc: userProfileForTracking?.fbc || session.metadata?.fbc || undefined,
                fbp: userProfileForTracking?.fbp || session.metadata?.fbp || undefined,
              },
              value: subscriptionAmount > 0 ? subscriptionAmount : undefined,
              currency: session.currency?.toUpperCase() || 'USD',
              predictedLtv: subscriptionAmount * 12, // Estimate annual LTV
              eventSourceUrl: 'https://blacktools.ai/pricing',
            }).catch(() => {})
          }
        }
        break
      }

      // Subscription created or updated (includes reactivation and plan changes)
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        try {
          const subscription = event.data.object as Stripe.Subscription
          let userId = subscription.metadata?.userId
          const customerId = subscription.customer as string
          const changeType = subscription.metadata?.changeType // 'upgrade' or 'downgrade' from change-plan

          // If we have userId, check if profile is suspended before processing
          if (userId && await isProfileSuspended(userId, event.type)) {
            return NextResponse.json({ received: true })
          }


          // IMPORTANT: Skip incomplete subscriptions - they haven't been paid yet
          // The checkout.session.completed event will handle the actual activation
          if (subscription.status === 'incomplete' || subscription.status === 'incomplete_expired') {
            break
          }

          // If no userId in metadata, try to find by stripe_customer_id
          if (!userId && customerId) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (profileError) {
            }

            if (profile) {
              userId = profile.id
            }
          }

          // If still no userId, try userEmail from metadata first
          const userEmailFromMetadata = subscription.metadata?.userEmail
          if (!userId && userEmailFromMetadata) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', userEmailFromMetadata)
              .single()

            if (profile) {
              userId = profile.id

              // Update stripe_customer_id for future lookups
              if (customerId) {
                await supabase
                  .from('profiles')
                  .update({ stripe_customer_id: customerId })
                  .eq('id', userId)
              }
            }
          }

          // If still no userId, try to get customer email from Stripe and find by email
          if (!userId && customerId) {
            try {
              const customer = await stripe.customers.retrieve(customerId)
              if (customer && !customer.deleted && 'email' in customer && customer.email) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('email', customer.email)
                  .single()

                if (profile) {
                  userId = profile.id

                  // Update stripe_customer_id for future lookups
                  await supabase
                    .from('profiles')
                    .update({ stripe_customer_id: customerId })
                    .eq('id', userId)
                }
              }
            } catch (customerError) {
            }
          }

          if (userId) {
            const plan = subscription.metadata?.plan
            const previousAttributes = (event.data as Stripe.Event.Data & { previous_attributes?: Partial<Stripe.Subscription> }).previous_attributes
            const previousPlan = subscription.metadata?.previousPlan

            // Check if this is a plan change via change-plan endpoint
            const isPlanChange = !!changeType && !!previousPlan

            // Check if this is a reactivation (status changed from canceled to active)
            const wasReactivated = previousAttributes?.status === 'canceled' && subscription.status === 'active'

            // Check if this is uncanceling (cancel_at_period_end changed from true to false)
            const wasUncanceled = previousAttributes?.cancel_at_period_end === true && subscription.cancel_at_period_end === false

            // Check if trial just ended and subscription became active
            const trialEnded = previousAttributes?.status === 'trialing' && subscription.status === 'active'


            // If subscription is active and not set to cancel, user has full access
            const effectiveStatus = subscription.cancel_at_period_end ? 'canceled' : subscription.status

            // For plan changes via change-plan, the database is already updated
            // We just need to sync status and dates, NOT credits (already given)
            if (isPlanChange) {

              const updateData: Record<string, unknown> = {
                subscription_id: subscription.id,
                subscription_status: effectiveStatus,
              }

              // Only update period dates if they exist
              if (subscription.current_period_start) {
                updateData.subscription_current_period_start = new Date(
                  subscription.current_period_start * 1000
                ).toISOString()
              }
              if (subscription.current_period_end) {
                updateData.subscription_current_period_end = new Date(
                  subscription.current_period_end * 1000
                ).toISOString()
              }

              const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId)

              if (updateError) {
              } else {
              }
              break
            }

            // For NEW subscriptions (created), always get the current profile to check if plan was set by checkout
            // For UPDATED subscriptions, only update plan if in metadata
            let shouldUpdatePlan = false
            let planToUpdate = plan

            if (event.type === 'customer.subscription.created') {
              // For new subscription, if no plan in metadata, check what checkout set
              if (!plan) {
                const { data: currentProfile } = await supabase
                  .from('profiles')
                  .select('subscription_plan')
                  .eq('id', userId)
                  .single()

                // If profile already has a plan set (by checkout), don't overwrite
                if (currentProfile?.subscription_plan) {
                  planToUpdate = currentProfile.subscription_plan
                }
              } else {
                shouldUpdatePlan = true
              }
            } else if (plan) {
              // For updates, only update if plan is in metadata
              shouldUpdatePlan = true
            }

            // IMPORTANT: For updates, check if this subscription is the current one
            // If user has a DIFFERENT (newer) subscription, don't overwrite with old subscription data
            const { data: currentProfile } = await supabase
              .from('profiles')
              .select('subscription_id')
              .eq('id', userId)
              .single()

            // If user has a different subscription_id and this one is being canceled, skip
            if (currentProfile?.subscription_id &&
                currentProfile.subscription_id !== subscription.id &&
                (effectiveStatus === 'canceled' || subscription.status === 'canceled')) {
              break
            }

            const updateData: Record<string, unknown> = {
              subscription_id: subscription.id,
              subscription_status: effectiveStatus,
            }

            // Only update plan if we should
            if (shouldUpdatePlan && planToUpdate) {
              updateData.subscription_plan = planToUpdate
            }

            // Only update period dates if they exist
            if (subscription.current_period_start) {
              updateData.subscription_current_period_start = new Date(
                subscription.current_period_start * 1000
              ).toISOString()
            }
            if (subscription.current_period_end) {
              updateData.subscription_current_period_end = new Date(
                subscription.current_period_end * 1000
              ).toISOString()
            }

            // If reactivated, uncanceled, or trial ended - give full credits
            if (wasReactivated || wasUncanceled || trialEnded) {
              const creditsAmount = getCreditsByPlan(planToUpdate || plan || '')
              updateData.credits = creditsAmount
            }

            const { error: updateError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', userId)

            if (!updateError && userId) {
              // Log audit action for subscription updates
              const action = wasReactivated 
                ? AuditActions.SUBSCRIPTION_UPDATED 
                : event.type === 'customer.subscription.created'
                ? AuditActions.SUBSCRIPTION_CREATED
                : AuditActions.SUBSCRIPTION_UPDATED
              
              await logAuditAction({
                action,
                userId,
                details: {
                  subscriptionId: subscription.id,
                  plan: planToUpdate || plan || 'unknown',
                  status: effectiveStatus,
                  wasReactivated,
                  wasUncanceled,
                  trialEnded,
                },
              }).catch(() => {
                // Ignore audit logging errors
              })
            }
          } else {
          }
        } catch (subError) {
          // Don't throw - just log and continue
        }
        break
      }

      // Subscription deleted (fully canceled after period end or immediate)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        let userId = subscription.metadata?.userId
        const customerId = subscription.customer as string


        // Fallback: find user by stripe_customer_id
        if (!userId && customerId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            userId = profile.id
          }
        }

        // Fallback: find user by subscription_id
        if (!userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('subscription_id', subscription.id)
            .single()

          if (profile) {
            userId = profile.id
          }
        }

        if (userId) {
          // IMPORTANT: Check if this deleted subscription is the CURRENT subscription
          // If user already has a NEW subscription (from upgrade), don't overwrite!
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('subscription_id, subscription_status')
            .eq('id', userId)
            .single()

          // Only update if the deleted subscription matches the current one in the profile
          // OR if there's no current subscription
          if (!currentProfile?.subscription_id || currentProfile.subscription_id === subscription.id) {
            await supabase
              .from('profiles')
              .update({
                subscription_id: null,
                subscription_status: 'canceled',
                subscription_plan: null,
                subscription_current_period_start: null,
                subscription_current_period_end: null,
                // Keep credits - user can use remaining
              })
              .eq('id', userId)

            // Log audit action for subscription cancellation
            if (userId) {
              await logAuditAction({
                action: AuditActions.SUBSCRIPTION_CANCELED,
                userId,
                details: {
                  subscriptionId: subscription.id,
                },
              }).catch(() => {
                // Ignore audit logging errors
              })
            }
          } else {
            // User has a different (newer) subscription - don't touch it!
          }
        } else {
        }
        break
      }

      // Successful payment - renew credits or give full credits after trial
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        // Get userId from subscription if needed
        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const userId = subscription.metadata?.userId

            if (userId && await isProfileSuspended(userId, event.type)) {
              return NextResponse.json({ received: true })
            }
          } catch {
            // Continue processing if subscription retrieval fails
          }
        }

        // Process all subscription invoices (not one-time payments for credits)
        // billing_reason can be:
        // - 'subscription_create': First payment (immediate or after trial)
        // - 'subscription_cycle': Renewal payment
        // - 'subscription_update': Plan change
        // - 'subscription': Generic subscription invoice (trial end)
        // We process ALL subscription invoices to ensure credits are given
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          let userId = subscription.metadata?.userId
          const plan = subscription.metadata?.plan
          const customerId = subscription.customer as string


          // Fallback: find user by stripe_customer_id
          if (!userId && customerId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (profile) {
              userId = profile.id
            }
          }

          // Fallback: find user by subscription_id
          if (!userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('subscription_id', subscriptionId)
              .single()

            if (profile) {
              userId = profile.id
            }
          }

          // Only give credits if this is a real payment (amount > 0) or subscription is now active
          const isPaidInvoice = (invoice.amount_paid || 0) > 0
          const isSubscriptionActive = subscription.status === 'active'

          if (userId && (isPaidInvoice || isSubscriptionActive)) {
            // Always give full credits on payment
            const creditsAmount = getCreditsByPlan(plan || '')

            await supabase
              .from('profiles')
              .update({
                credits: creditsAmount,
                subscription_status: 'active', // Ensure status is active after payment
                subscription_current_period_start: new Date(
                  subscription.current_period_start * 1000
                ).toISOString(),
                subscription_current_period_end: new Date(
                  subscription.current_period_end * 1000
                ).toISOString(),
              })
              .eq('id', userId)

          } else {
          }
        }
        break
      }

      // Payment failed - deactivate subscription immediately
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        const attemptCount = invoice.attempt_count || 1

        // Get userId from subscription if needed
        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const userId = subscription.metadata?.userId

            if (userId && await isProfileSuspended(userId, event.type)) {
              return NextResponse.json({ received: true })
            }
          } catch {
            // Continue processing if subscription retrieval fails
          }
        }
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          let userId = subscription.metadata?.userId
          const customerId = subscription.customer as string

          // Fallback: find user by stripe_customer_id
          if (!userId && customerId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (profile) {
              userId = profile.id
            }
          }

          if (userId) {
            // On first failure, immediately set to past_due
            // This triggers the modal to show and blocks renewal
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

      // Handle subscription schedule (for future-dated changes)
      case 'customer.subscription.pending_update_applied': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        const plan = subscription.metadata?.plan


        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              subscription_plan: plan,
              subscription_current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              subscription_current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      // Handle refund - suspend account and cancel subscription
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const customerId = charge.customer as string


        if (customerId) {
          // Find user by stripe_customer_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, subscription_id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            // Cancel any active subscription first
            if (profile.subscription_id) {
              try {
                await stripe.subscriptions.cancel(profile.subscription_id)
              } catch (cancelError) {
              }
            }

            // Suspend the account
            await supabase
              .from('profiles')
              .update({
                account_status: 'suspended',
                account_suspended_reason: 'refund',
                account_suspended_at: new Date().toISOString(),
                credits: 0,
                credits_extras: 0,
                subscription_status: 'canceled',
                subscription_id: null,
                subscription_plan: null,
              })
              .eq('id', profile.id)

            // Log audit action for account suspension
            await logAuditAction({
              action: AuditActions.ACCOUNT_SUSPENDED,
              userId: profile.id,
              details: {
                reason: 'refund',
                chargeId: charge.id,
              },
            }).catch(() => {
              // Ignore audit logging errors
            })
          }
        }
        break
      }

      // Handle chargeback/dispute - suspend account immediately
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const chargeId = dispute.charge as string


        // Get the charge to find the customer
        const charge = await stripe.charges.retrieve(chargeId)
        const customerId = charge.customer as string

        if (customerId) {
          // Find user by stripe_customer_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, subscription_id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            // Cancel any active subscription first
            if (profile.subscription_id) {
              try {
                await stripe.subscriptions.cancel(profile.subscription_id)
              } catch (cancelError) {
              }
            }

            // Suspend the account
            await supabase
              .from('profiles')
              .update({
                account_status: 'suspended',
                account_suspended_reason: 'chargeback',
                account_suspended_at: new Date().toISOString(),
                credits: 0,
                credits_extras: 0,
                subscription_status: 'canceled',
                subscription_id: null,
                subscription_plan: null,
              })
              .eq('id', profile.id)

            // Log audit action for account suspension
            await logAuditAction({
              action: AuditActions.ACCOUNT_SUSPENDED,
              userId: profile.id,
              details: {
                reason: 'chargeback',
                disputeId: dispute.id,
                chargeId: chargeId,
              },
            }).catch(() => {
              // Ignore audit logging errors
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
