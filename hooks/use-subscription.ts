'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useUser } from './use-user'

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused' | null

// Clear profile cache
function clearProfileCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('blacktools_profile_cache')
  }
}

export function useSubscription() {
  const { profile, loading, refreshProfile } = useUser()
  const lastSyncRef = useRef<number>(0)
  const syncingRef = useRef<boolean>(false)

  const status = (profile?.subscription_status as SubscriptionStatus) || null

  // Active subscription (can use platform fully)
  const isActive = status === 'active' || status === 'trialing'

  // Currently in trial period
  const isTrialing = status === 'trialing'

  // Payment failed - needs to update payment method
  const isPastDue = status === 'past_due'

  // Subscription was canceled (either by user or system)
  const isCanceled = status === 'canceled'

  // Has any subscription issue that needs attention
  const hasSubscriptionIssue = isPastDue || isCanceled

  // Can still use remaining credits (even if canceled)
  const canUseCredits = (profile?.credits || 0) > 0

  // Check if user should be blocked from using platform
  // Past due users are blocked immediately
  // Canceled users can continue until credits run out
  const isBlocked = isPastDue || (isCanceled && !canUseCredits)

  const currentPeriodStart = profile?.subscription_current_period_start
    ? new Date(profile.subscription_current_period_start)
    : null

  const currentPeriodEnd = profile?.subscription_current_period_end
    ? new Date(profile.subscription_current_period_end)
    : null

  // Calculate days until renewal/expiration
  const daysUntilRenewal = currentPeriodEnd
    ? Math.max(0, Math.ceil((currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  // Open Stripe Customer Portal
  const openPortal = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.url) {
        // Use location.href instead of window.open for better mobile compatibility
        window.location.href = data.url
      }
    } catch (error) {
      // Silent fail
    }
  }

  // Reactivate subscription (for canceled subscriptions)
  const reactivateSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/reactivate', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        await refreshProfile()
        return { success: true }
      }

      return { success: false, error: data.error }
    } catch (error) {
      return { success: false, error: 'Failed to reactivate subscription' }
    }
  }

  // Skip trial removed - no longer using trial system
  // Users get 50 free credits on signup instead

  // Sync subscription status with Stripe
  const syncSubscription = useCallback(async (force = false) => {
    // Prevent concurrent syncs
    if (syncingRef.current) return

    // Don't sync too frequently (minimum 5 seconds between syncs, unless forced)
    const now = Date.now()
    if (!force && now - lastSyncRef.current < 5000) return

    syncingRef.current = true
    lastSyncRef.current = now

    try {
      const response = await fetch('/api/stripe/sync', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success && data.changed) {
        // Clear cache and refresh profile to show new data
        clearProfileCache()
        await refreshProfile()
      }

      return data
    } catch (error) {
      // Silent fail
      return { success: false, error }
    } finally {
      syncingRef.current = false
    }
  }, [refreshProfile])

  // Auto-sync when user returns to the page (visibility change or focus)
  useEffect(() => {
    // Sync on page focus (user returns from another tab/window like Stripe portal)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && profile?.id) {
        syncSubscription()
      }
    }

    const handleFocus = () => {
      if (profile?.id) {
        syncSubscription()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [profile?.id, syncSubscription])

  // Extra credits are only available with an active subscription
  // If subscription is canceled/expired, user loses access to extras
  const availableCreditsExtras = isActive ? (profile?.credits_extras || 0) : 0

  return {
    // Status flags
    status,
    isActive,
    isTrialing,
    isPastDue,
    isCanceled,
    hasSubscriptionIssue,
    canUseCredits,
    isBlocked,

    // Plan info
    plan: profile?.subscription_plan,
    credits: profile?.credits || 0,
    creditsExtras: availableCreditsExtras,
    creditsExtrasTotal: profile?.credits_extras || 0, // Total stored in DB (for reference)
    totalCredits: (profile?.credits || 0) + availableCreditsExtras,

    // Period info
    currentPeriodStart,
    currentPeriodEnd,
    daysUntilRenewal,

    // Loading state
    loading,

    // Actions
    openPortal,
    reactivateSubscription,
    refreshProfile,
    syncSubscription,
  }
}
