import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { getCreditsByPlan } from '@/lib/stripe/config'

export const dynamic = 'force-dynamic'

/**
 * Sync credits and plan with Stripe subscription
 * Fixes issue where users have wrong credit amount or plan
 */
export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Get current profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('subscription_plan, subscription_status, subscription_id, credits, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Only sync if has active subscription
    if (profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing') {
      return NextResponse.json(
        { error: 'No active subscription to sync' },
        { status: 400 }
      )
    }

    // Get subscription from Stripe to check real plan
    if (!profile.subscription_id) {
      return NextResponse.json(
        { error: 'No subscription ID found' },
        { status: 400 }
      )
    }

    const subscription = await stripe.subscriptions.retrieve(profile.subscription_id)
    const stripePlan = subscription.metadata?.plan
    
    // Determine correct plan
    const correctPlan = stripePlan || profile.subscription_plan || 'starter'
    const correctCredits = getCreditsByPlan(correctPlan)

    // Update to correct plan and credits
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ 
        subscription_plan: correctPlan,
        credits: correctCredits 
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to sync' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Synced! You are now on ${correctPlan.toUpperCase()} with ${correctCredits} credits.`,
      oldPlan: profile.subscription_plan,
      newPlan: correctPlan,
      oldCredits: profile.credits,
      newCredits: correctCredits,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to sync: ${errorMessage}` },
      { status: 500 }
    )
  }
}

