import { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'

export interface CreditBalance {
  credits: number        // Subscription credits (renew monthly)
  credits_extras: number // Extra purchased credits (only available with active subscription)
  credits_extras_stored: number // Total extras in DB (for reference)
  total: number          // Total available
  subscriptionActive: boolean // Whether subscription is active
}

export interface DeductResult {
  success: boolean
  error?: string
  previousBalance: CreditBalance
  newBalance: CreditBalance
  deducted: number
  fromSubscription: number  // How much was taken from subscription credits
  fromExtras: number        // How much was taken from extra credits
}

/**
 * Get user's credit balance
 * Extra credits are ONLY available if subscription is active
 */
export async function getCreditBalance(
  supabase: SupabaseClient,
  userId: string
): Promise<{ success: boolean; balance?: CreditBalance; error?: string }> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('credits, credits_extras, subscription_status')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return { success: false, error: error?.message || 'Profile not found' }
  }

  const credits = profile.credits || 0
  const credits_extras_stored = profile.credits_extras || 0
  const subscriptionStatus = profile.subscription_status as string

  // Extra credits are ONLY available with an active subscription
  const subscriptionActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
  const credits_extras = subscriptionActive ? credits_extras_stored : 0

  return {
    success: true,
    balance: {
      credits,
      credits_extras,
      credits_extras_stored,
      total: credits + credits_extras,
      subscriptionActive,
    },
  }
}

/**
 * Check if user has enough credits (subscription + extras)
 */
export async function hasEnoughCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number
): Promise<{ enough: boolean; available: number; required: number }> {
  const result = await getCreditBalance(supabase, userId)

  if (!result.success || !result.balance) {
    return { enough: false, available: 0, required: amount }
  }

  return {
    enough: result.balance.total >= amount,
    available: result.balance.total,
    required: amount,
  }
}

/**
 * Deduct credits from user's balance
 * Strategy: First use subscription credits, then use extras
 * This preserves extras (which never expire) for when subscription credits run out
 * 
 * Uses atomic SQL function if available to prevent race conditions,
 * falls back to non-atomic implementation if RPC is not available
 */
export async function deductCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  reason?: string
): Promise<DeductResult> {
  const emptyBalance: CreditBalance = { credits: 0, credits_extras: 0, credits_extras_stored: 0, total: 0, subscriptionActive: false }

  // Try to use atomic SQL function first (prevents race conditions)
  try {
    const { data, error } = await supabase.rpc('deduct_credits_atomic', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason || null
    })

    if (!error && data) {
      // Function returned a result
      if (data.success) {
        // Success - return formatted result
        const previousBalance: CreditBalance = {
          credits: data.previous_balance.credits,
          credits_extras: data.previous_balance.credits_extras,
          credits_extras_stored: data.previous_balance.credits_extras,
          total: data.previous_balance.total,
          subscriptionActive: true // Assume active if function succeeded
        }

        // Calculate subscription status from new balance extras
        // If extras are available in new_balance, subscription is active
        const subscriptionActive = data.new_balance.credits_extras > 0 || 
          (data.previous_balance.credits_extras > 0 && data.from_extras === 0)

        const newBalance: CreditBalance = {
          credits: data.new_balance.credits,
          credits_extras: data.new_balance.credits_extras,
          credits_extras_stored: data.new_balance.credits_extras,
          total: data.new_balance.total,
          subscriptionActive
        }

        logger.debug(`[Credits] Atomic deduction successful: ${amount} (reason: ${reason || 'N/A'})`)
        logger.debug(`[Credits] From subscription: ${data.from_subscription}, From extras: ${data.from_extras}`)

        return {
          success: true,
          previousBalance,
          newBalance,
          deducted: data.deducted,
          fromSubscription: data.from_subscription,
          fromExtras: data.from_extras,
        }
      } else {
        // Function returned error (e.g., insufficient credits)
        logger.debug(`[Credits] Atomic deduction failed: ${data.error || 'Unknown error'}`)
        return {
          success: false,
          error: data.error || 'Failed to deduct credits',
          previousBalance: emptyBalance,
          newBalance: emptyBalance,
          deducted: 0,
          fromSubscription: 0,
          fromExtras: 0,
        }
      }
    }

    // If RPC error but not a function error, log and fall through to fallback
    if (error) {
      logger.warn('[Credits] RPC function error, using fallback:', error.message)
    }
  } catch (error) {
    // RPC not available or other error - fall back to non-atomic implementation
    logger.warn('[Credits] RPC function not available, using fallback')
  }

  // Fallback: Non-atomic implementation (original code)
  // This is used if RPC function is not available or fails
  const balanceResult = await getCreditBalance(supabase, userId)

  if (!balanceResult.success || !balanceResult.balance) {
    return {
      success: false,
      error: balanceResult.error || 'Failed to get credit balance',
      previousBalance: emptyBalance,
      newBalance: emptyBalance,
      deducted: 0,
      fromSubscription: 0,
      fromExtras: 0,
    }
  }

  const { credits, credits_extras, total } = balanceResult.balance

  // Check if enough credits
  if (total < amount) {
    return {
      success: false,
      error: 'Insufficient credits',
      previousBalance: balanceResult.balance,
      newBalance: balanceResult.balance,
      deducted: 0,
      fromSubscription: 0,
      fromExtras: 0,
    }
  }

  // Calculate how much to take from each pool
  // Strategy: Use subscription credits first, then extras
  let fromSubscription = 0
  let fromExtras = 0

  if (credits >= amount) {
    // Subscription credits cover the full amount
    fromSubscription = amount
    fromExtras = 0
  } else {
    // Use all subscription credits, then take from extras
    fromSubscription = credits
    fromExtras = amount - credits
  }

  const newCredits = credits - fromSubscription
  const newCreditsExtras = credits_extras - fromExtras

  logger.debug(`[Credits] Fallback deduction: ${amount} (reason: ${reason || 'N/A'})`)
  logger.debug(`[Credits] From subscription: ${fromSubscription}, From extras: ${fromExtras}`)
  logger.debug(`[Credits] Before: ${credits} + ${credits_extras} = ${total}`)
  logger.debug(`[Credits] After: ${newCredits} + ${newCreditsExtras} = ${newCredits + newCreditsExtras}`)

  // Update database
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      credits: newCredits,
      credits_extras: newCreditsExtras,
    })
    .eq('id', userId)

  if (updateError) {
    logger.error('[Credits] Update failed:', updateError)
    return {
      success: false,
      error: updateError.message,
      previousBalance: balanceResult.balance,
      newBalance: balanceResult.balance,
      deducted: 0,
      fromSubscription: 0,
      fromExtras: 0,
    }
  }

  const newBalance: CreditBalance = {
    credits: newCredits,
    credits_extras: newCreditsExtras,
    credits_extras_stored: newCreditsExtras,
    total: newCredits + newCreditsExtras,
    subscriptionActive: balanceResult.balance.subscriptionActive,
  }

  return {
    success: true,
    previousBalance: balanceResult.balance,
    newBalance,
    deducted: amount,
    fromSubscription,
    fromExtras,
  }
}

/**
 * Refund credits to user's balance
 * Strategy: Refund to the same pools they were taken from
 * If we don't know the split, refund to subscription credits first
 */
export async function refundCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  toSubscription?: number,
  toExtras?: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  // Get current balance
  const balanceResult = await getCreditBalance(supabase, userId)

  if (!balanceResult.success || !balanceResult.balance) {
    return { success: false, error: 'Failed to get credit balance' }
  }

  const { credits, credits_extras } = balanceResult.balance

  // If split is specified, use it; otherwise refund all to subscription
  const refundToSubscription = toSubscription ?? amount
  const refundToExtras = toExtras ?? 0

  const newCredits = credits + refundToSubscription
  const newCreditsExtras = credits_extras + refundToExtras

  logger.debug(`[Credits] Refunding ${amount} (reason: ${reason || 'N/A'})`)
  logger.debug(`[Credits] To subscription: ${refundToSubscription}, To extras: ${refundToExtras}`)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      credits: newCredits,
      credits_extras: newCreditsExtras,
    })
    .eq('id', userId)

  if (updateError) {
    logger.error('[Credits] Refund failed:', updateError)
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
