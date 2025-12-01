'use client'

import { useUser } from './use-user'

export function useSubscription() {
  const { profile, loading, refreshProfile } = useUser()

  const isActive = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
  const isPastDue = profile?.subscription_status === 'past_due'
  const isCanceled = profile?.subscription_status === 'canceled'

  const currentPeriodEnd = profile?.subscription_current_period_end
    ? new Date(profile.subscription_current_period_end)
    : null

  const openPortal = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening portal:', error)
    }
  }

  return {
    isActive,
    isPastDue,
    isCanceled,
    plan: profile?.subscription_plan,
    credits: profile?.credits || 0,
    currentPeriodEnd,
    loading,
    openPortal,
    refreshProfile,
  }
}
