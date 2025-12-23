'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PLANS, PLAN_ORDER } from '@/lib/stripe/config'
import type { PlanKey } from '@/types/stripe'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Rewardful type declaration for TypeScript
declare global {
  interface Window {
    Rewardful?: {
      referral?: string
    }
  }
}

// Get Rewardful referral ID if available
function getRewardfulReferral(): string | undefined {
  if (typeof window !== 'undefined' && window.Rewardful?.referral) {
    return window.Rewardful.referral
  }
  return undefined
}

// Clear profile cache to force immediate refresh
function clearProfileCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('blacktools_profile_cache')
  }
}

// Update profile cache with new plan and credits (optimistic update)
function updateProfileCache(newPlan: string, newCredits: number) {
  if (typeof window === 'undefined') return
  try {
    const cached = localStorage.getItem('blacktools_profile_cache')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed.profile) {
        parsed.profile.subscription_plan = newPlan
        parsed.profile.subscription_status = 'active'
        parsed.profile.credits = newCredits
        parsed.timestamp = Date.now()
        localStorage.setItem('blacktools_profile_cache', JSON.stringify(parsed))
      }
    }
  } catch {
    // Ignore errors
  }
}

interface PricingCardsProps {
  userId?: string
  userEmail?: string
  currentPlan?: string | null
  currentCredits?: number
  creditsExtras?: number
  isTrialing?: boolean
  hasUsedTrial?: boolean
}

export function PricingCards({ userId, userEmail, currentPlan, currentCredits = 0, creditsExtras = 0, isTrialing = false, hasUsedTrial = false }: PricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [downgradeModal, setDowngradeModal] = useState<{ open: boolean; targetPlan: string | null }>({
    open: false,
    targetPlan: null,
  })
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; targetPlan: string | null }>({
    open: false,
    targetPlan: null,
  })
  const [successModal, setSuccessModal] = useState<{ open: boolean; message: string; plan: string | null; credits: number }>({
    open: false,
    message: '',
    plan: null,
    credits: 0,
  })
  const router = useRouter()

  // Keep success modal open even after page refresh
  useEffect(() => {
    // Restore success modal state from sessionStorage after refresh
    const savedModal = sessionStorage.getItem('plan_change_success')
    if (savedModal) {
      try {
        const data = JSON.parse(savedModal)
        setSuccessModal({
          open: true,
          message: data.message,
          plan: data.plan,
          credits: data.credits,
        })
        sessionStorage.removeItem('plan_change_success')
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const hasActiveSubscription = currentPlan && PLAN_ORDER[currentPlan]
  const canChangePlan = hasActiveSubscription && !isTrialing

  const isUpgrade = (targetPlan: string) => {
    if (!currentPlan) return false
    return (PLAN_ORDER[targetPlan] || 0) > (PLAN_ORDER[currentPlan] || 0)
  }

  const isDowngrade = (targetPlan: string) => {
    if (!currentPlan) return false
    return (PLAN_ORDER[targetPlan] || 0) < (PLAN_ORDER[currentPlan] || 0)
  }

  const handleSelectPlan = async (planKey: string) => {
    if (!userId || !userEmail) {
      router.push('/login')
      return
    }

    // If downgrading, show confirmation modal
    if (isDowngrade(planKey)) {
      setDowngradeModal({ open: true, targetPlan: planKey })
      return
    }

    // If upgrading (has active subscription), show confirmation modal
    if (isUpgrade(planKey) && hasActiveSubscription) {
      setUpgradeModal({ open: true, targetPlan: planKey })
      return
    }

    await processSubscription(planKey)
  }

  const handleConfirmUpgrade = async () => {
    if (!upgradeModal.targetPlan) return
    setUpgradeModal({ open: false, targetPlan: null })
    await processSubscription(upgradeModal.targetPlan)
  }

  const processSubscription = async (planKey: string) => {
    setLoadingPlan(planKey)

    // Get Rewardful referral ID for affiliate tracking
    const referral = getRewardfulReferral()

    try {
      // If user has active subscription, use change-plan endpoint
      if (hasActiveSubscription) {
        const response = await fetch('/api/stripe/change-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planKey, userId }),
        })

        const data = await response.json()

        // Redirect to checkout if requires payment confirmation
        if (data.requiresCheckout && data.checkoutUrl) {
          window.location.href = data.checkoutUrl
          return
        }

        if (data.error) {
          toast.error(data.error)
          return
        }

        // Plan change successful - show success modal
        if (data.success) {
          // Update cache with new data immediately (no reload needed)
          updateProfileCache(data.plan, data.credits)

          // Show success modal immediately
          setSuccessModal({
            open: true,
            message: data.message,
            plan: data.plan,
            credits: data.credits,
          })

          // Notify other components to refresh
          window.dispatchEvent(new CustomEvent('profile-cache-updated'))
          return
        }

        toast.error('Failed to change plan')
        return
      }

      // New subscription - try to use saved payment method first
      const subscribeResponse = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, userId, email: userEmail, referral }),
      })

      const subscribeData = await subscribeResponse.json()

      // If subscription succeeded with saved card
      if (subscribeData.success) {
        // Update cache with new data immediately (no reload needed)
        updateProfileCache(planKey, subscribeData.credits)

        // Show success modal immediately
        setSuccessModal({
          open: true,
          message: subscribeData.message,
          plan: planKey,
          credits: subscribeData.credits,
        })

        // Notify other components to refresh
        window.dispatchEvent(new CustomEvent('profile-cache-updated'))
        return
      }

      // If no saved payment method or payment failed, redirect to checkout
      if (subscribeData.requiresCheckout) {
        // Show toast if there was an error message
        if (subscribeData.error) {
          toast.error(subscribeData.error)
        }

        const checkoutResponse = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planKey, userId, email: userEmail, referral }),
        })

        const checkoutData = await checkoutResponse.json()

        if (checkoutData.error) {
          toast.error(checkoutData.error)
          return
        }

        if (checkoutData.url) {
          window.location.href = checkoutData.url
        } else {
          toast.error('Failed to create checkout session')
        }
        return
      }

      // Generic error
      if (subscribeData.error) {
        toast.error(subscribeData.error)
        return
      }

      toast.error('Failed to subscribe')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleConfirmDowngrade = async () => {
    if (!downgradeModal.targetPlan) return
    setDowngradeModal({ open: false, targetPlan: null })
    await processSubscription(downgradeModal.targetPlan)
  }

  const getButtonText = (planKey: string) => {
    if (loadingPlan === planKey) return 'Processing...'
    if (currentPlan === planKey) {
      return isTrialing ? 'Current Plan (Trial)' : 'Current Plan'
    }
    if (hasActiveSubscription) {
      if (isTrialing) return 'Upgrade' // Will show disabled
      if (isUpgrade(planKey)) return 'Upgrade'
      if (isDowngrade(planKey)) return 'Downgrade'
    }
    // User without active subscription (testing with 50 free credits)
    return 'Subscribe'
  }

  const isButtonDisabled = (planKey: string) => {
    if (loadingPlan !== null) return true
    if (currentPlan === planKey) return true
    // During trial, can't change to other plans
    if (isTrialing && hasActiveSubscription && currentPlan !== planKey) return true
    return false
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto px-4 md:px-0">
      {Object.entries(PLANS).map(([key, plan]) => (
        <Card
          key={key}
          className={cn(
            'relative flex flex-col',
            key === 'pro' && 'neon-card border-0 md:scale-105'
          )}
        >
          {currentPlan === key ? (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                Current Plan
              </span>
            </div>
          ) : key === 'pro' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                Most Popular
              </span>
            </div>
          )}
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg md:text-xl">{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-2xl md:text-3xl font-bold text-foreground">
                {formatPrice(plan.price)}
              </span>
              <span className="text-muted-foreground text-sm">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-center mb-4">
              <span className="text-base md:text-lg font-semibold text-primary">
                {plan.credits.toLocaleString()} credits
              </span>
              <span className="text-muted-foreground text-xs md:text-sm"> / month</span>
            </div>
            <ul className="space-y-2 md:space-y-3">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
              {plan.excludedFeatures?.map((feature: string, index: number) => (
                <li key={`excluded-${index}`} className="flex items-start gap-2">
                  <X className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm text-muted-foreground/50 line-through">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full text-sm md:text-base"
              variant={key === 'pro' ? 'default' : 'outline'}
              onClick={() => handleSelectPlan(key)}
              disabled={isButtonDisabled(key)}
            >
              {getButtonText(key)}
            </Button>
            {isTrialing && hasActiveSubscription && currentPlan !== key && (
              <p className="text-[10px] md:text-xs text-muted-foreground text-center">
                Plan changes available after trial ends
              </p>
            )}
          </CardFooter>
        </Card>
      ))}

      {/* Downgrade Confirmation Modal */}
      <Dialog open={downgradeModal.open} onOpenChange={(open) => setDowngradeModal({ open, targetPlan: open ? downgradeModal.targetPlan : null })}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
              Confirm Downgrade
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4 py-2">
            {/* Plan comparison */}
            {currentPlan && downgradeModal.targetPlan && (() => {
              const newPlanCredits = PLANS[downgradeModal.targetPlan as PlanKey]?.credits || 0
              const newPrice = PLANS[downgradeModal.targetPlan as PlanKey]?.price || 0

              return (
                <>
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm">
                    <div className="text-center p-2 md:p-3 bg-secondary rounded-lg flex-1">
                      <p className="text-muted-foreground text-[10px] md:text-xs mb-1">Current</p>
                      <p className="font-semibold capitalize text-sm md:text-base">{currentPlan}</p>
                      <p className="text-muted-foreground text-[10px] md:text-xs">{currentCredits.toLocaleString()} credits</p>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="text-center p-2 md:p-3 bg-secondary rounded-lg flex-1">
                      <p className="text-muted-foreground text-[10px] md:text-xs mb-1">New</p>
                      <p className="font-semibold capitalize text-sm md:text-base">{downgradeModal.targetPlan}</p>
                      <p className="text-primary text-[10px] md:text-xs">{newPlanCredits.toLocaleString()} credits</p>
                    </div>
                  </div>

                  {/* Credits summary */}
                  <div className="rounded-lg p-2.5 md:p-3 border bg-yellow-500/10 border-yellow-500/20">
                    <p className="text-yellow-600 dark:text-yellow-500 text-xs md:text-sm font-medium">
                      New balance: {newPlanCredits.toLocaleString()} credits
                    </p>
                    <p className="text-yellow-600/80 dark:text-yellow-500/80 text-[10px] md:text-xs mt-0.5">
                      Current credits will be replaced
                    </p>
                  </div>

                  {/* Price */}
                  <div className="rounded-lg p-2.5 md:p-3 border bg-blue-500/10 border-blue-500/20">
                    <p className="text-blue-600 dark:text-blue-500 text-xs md:text-sm font-medium">
                      Charge now: {formatPrice(newPrice)}
                    </p>
                  </div>
                </>
              )
            })()}

            {/* Warning */}
            {creditsExtras > 0 && (
              <p className="text-xs text-destructive">
                Your {creditsExtras.toLocaleString()} extra credits will be lost.
              </p>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDowngradeModal({ open: false, targetPlan: null })}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDowngrade}
              disabled={loadingPlan !== null}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loadingPlan ? 'Processing...' : 'Confirm Downgrade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Confirmation Modal */}
      <Dialog open={upgradeModal.open} onOpenChange={(open) => setUpgradeModal({ open, targetPlan: open ? upgradeModal.targetPlan : null })}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              Confirm Upgrade
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4 py-2">
            {/* Plan comparison */}
            {currentPlan && upgradeModal.targetPlan && (() => {
              const newPlanCredits = PLANS[upgradeModal.targetPlan as PlanKey]?.credits || 0
              const totalCredits = currentCredits + newPlanCredits
              const newPrice = PLANS[upgradeModal.targetPlan as PlanKey]?.price || 0

              return (
                <>
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm">
                    <div className="text-center p-2 md:p-3 bg-secondary rounded-lg flex-1">
                      <p className="text-muted-foreground text-[10px] md:text-xs mb-1">Current</p>
                      <p className="font-semibold capitalize text-sm md:text-base">{currentPlan}</p>
                      <p className="text-muted-foreground text-[10px] md:text-xs">{currentCredits.toLocaleString()} credits</p>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="text-center p-2 md:p-3 bg-secondary rounded-lg flex-1">
                      <p className="text-muted-foreground text-[10px] md:text-xs mb-1">New</p>
                      <p className="font-semibold capitalize text-sm md:text-base">{upgradeModal.targetPlan}</p>
                      <p className="text-primary text-[10px] md:text-xs">+{newPlanCredits.toLocaleString()} credits</p>
                    </div>
                  </div>

                  {/* Credits summary */}
                  <div className="rounded-lg p-2.5 md:p-3 border bg-green-500/10 border-green-500/20">
                    <p className="text-green-600 dark:text-green-500 text-xs md:text-sm font-medium">
                      New balance: {totalCredits.toLocaleString()} credits
                    </p>
                    <p className="text-green-600/80 dark:text-green-500/80 text-[10px] md:text-xs mt-0.5">
                      {currentCredits.toLocaleString()} + {newPlanCredits.toLocaleString()} new
                    </p>
                  </div>

                  {/* Price */}
                  <div className="rounded-lg p-2.5 md:p-3 border bg-blue-500/10 border-blue-500/20">
                    <p className="text-blue-600 dark:text-blue-500 text-xs md:text-sm font-medium">
                      Charge now: {formatPrice(newPrice)}
                    </p>
                  </div>
                </>
              )
            })()}

            {/* Info */}
            {creditsExtras > 0 && (
              <p className="text-xs text-green-600 dark:text-green-500">
                Your {creditsExtras.toLocaleString()} extra credits will be preserved.
              </p>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setUpgradeModal({ open: false, targetPlan: null })}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              disabled={loadingPlan !== null}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loadingPlan ? 'Processing...' : 'Confirm Upgrade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successModal.open} onOpenChange={(open) => setSuccessModal({ ...successModal, open })}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm mx-auto">
          <DialogHeader>
            <div className="mx-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2 md:mb-4">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
            </div>
            <DialogTitle className="text-center text-lg md:text-xl">
              Plan Changed!
            </DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-3 py-2">
            {successModal.plan && (
              <div className="bg-secondary rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-muted-foreground">Your new plan</p>
                <p className="text-lg md:text-xl font-bold capitalize">{successModal.plan}</p>
                <p className="text-primary font-semibold text-sm md:text-base">
                  {successModal.credits.toLocaleString()} credits
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setSuccessModal({ open: false, message: '', plan: null, credits: 0 })
                router.push('/dashboard')
              }}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
