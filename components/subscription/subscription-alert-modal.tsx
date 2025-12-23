'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, CreditCard, XCircle, CheckCircle2, Loader2, Coins } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/use-subscription'

type AlertType = 'canceled' | 'past_due' | 'payment_failed' | 'plan_changed' | null

export function SubscriptionAlertModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    isCanceled,
    isPastDue,
    credits,
    creditsExtras,
    totalCredits,
    plan,
    currentPeriodEnd,
    openPortal,
    loading,
    refreshProfile
  } = useSubscription()

  const [isOpen, setIsOpen] = useState(false)
  const [alertType, setAlertType] = useState<AlertType>(null)
  const [hasShownThisSession, setHasShownThisSession] = useState(false)
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [showCreditsSuccessModal, setShowCreditsSuccessModal] = useState(false)
  const [purchasedCreditsAmount, setPurchasedCreditsAmount] = useState<number>(0)
  const pollingStarted = useRef(false)
  const creditsPollingStarted = useRef(false)
  const initialCreditsExtrasRef = useRef<number | null>(null)
  const successShownRef = useRef(false)
  const creditsSuccessShownRef = useRef(false)

  // Check if just completed a plan change or credits purchase - wait for webhook to process
  const justUpgraded = searchParams.get('upgraded') === 'true'
  const justChangedPlan = searchParams.get('plan_changed') === 'true'
  const justPurchasedCredits = searchParams.get('credits_purchased') === 'true'
  const justCompletedCheckout = justUpgraded || justChangedPlan
  const justCompletedCreditsPurchase = justPurchasedCredits

  // Handle plan change completion - show success when subscription is active
  useEffect(() => {
    if (!justCompletedCheckout) return
    if (pollingStarted.current) return

    // Start polling immediately
    pollingStarted.current = true
    setIsWaitingForWebhook(true)
    setShowLoadingModal(true)

    let attempts = 0
    const maxAttempts = 30
    const interval = 500 // Poll every 500ms for faster response

    const checkStatus = async () => {
      attempts++

      if (refreshProfile) {
        await refreshProfile()
      }

      if (attempts < maxAttempts) {
        setTimeout(checkStatus, interval)
      } else {
        // Max attempts reached, show success anyway
        if (!successShownRef.current) {
          successShownRef.current = true
          setShowLoadingModal(false)
          setIsWaitingForWebhook(false)
          setShowSuccessModal(true)
          const url = new URL(window.location.href)
          url.searchParams.delete('upgraded')
          url.searchParams.delete('plan_changed')
          router.replace(url.pathname + url.search)
        }
      }
    }

    checkStatus()
  }, [justCompletedCheckout, refreshProfile, router])

  // Watch for subscription becoming active after plan change
  useEffect(() => {
    if (!isWaitingForWebhook) return
    if (showSuccessModal) return
    if (successShownRef.current) return
    if (loading) return

    // Show success as soon as we have an active subscription with plan and credits
    // No need to compare with initial values - just check current state
    const hasActivePlan = !isCanceled && plan && credits && credits > 0

    if (hasActivePlan) {
      successShownRef.current = true
      setShowLoadingModal(false)
      setIsWaitingForWebhook(false)
      setShowSuccessModal(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('upgraded')
      url.searchParams.delete('plan_changed')
      router.replace(url.pathname + url.search)
    }
  }, [isCanceled, plan, credits, loading, isWaitingForWebhook, showSuccessModal, router])

  // Handle credits purchase completion
  useEffect(() => {
    if (!justCompletedCreditsPurchase) return
    if (creditsPollingStarted.current) return

    // Capture initial credits_extras to detect change
    initialCreditsExtrasRef.current = creditsExtras || 0

    // Start polling immediately
    creditsPollingStarted.current = true
    setShowLoadingModal(true)

    let attempts = 0
    const maxAttempts = 20
    const interval = 1000

    const checkCredits = async () => {
      attempts++

      if (refreshProfile) {
        await refreshProfile()
      }

      if (attempts < maxAttempts) {
        setTimeout(checkCredits, interval)
      } else {
        // Max attempts reached, show success anyway
        if (!creditsSuccessShownRef.current) {
          creditsSuccessShownRef.current = true
          setShowLoadingModal(false)
          setShowCreditsSuccessModal(true)
          const url = new URL(window.location.href)
          url.searchParams.delete('credits_purchased')
          router.replace(url.pathname + url.search)
        }
      }
    }

    checkCredits()
  }, [justCompletedCreditsPurchase, refreshProfile, router, creditsExtras])

  // Watch for credits_extras increase after purchase
  useEffect(() => {
    if (!justCompletedCreditsPurchase) return
    if (!creditsPollingStarted.current) return
    if (showCreditsSuccessModal) return
    if (creditsSuccessShownRef.current) return

    const initialExtras = initialCreditsExtrasRef.current || 0
    const currentExtras = creditsExtras || 0
    const creditsIncreased = currentExtras > initialExtras

    if (creditsIncreased && !loading) {
      const purchased = currentExtras - initialExtras
      setPurchasedCreditsAmount(purchased)
      creditsSuccessShownRef.current = true
      setShowLoadingModal(false)
      setShowCreditsSuccessModal(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('credits_purchased')
      router.replace(url.pathname + url.search)
    }
  }, [creditsExtras, loading, justCompletedCreditsPurchase, showCreditsSuccessModal, router])

  // Determine what alert to show
  useEffect(() => {
    if (loading) return

    // Don't show alerts while waiting for webhook after plan change or credits purchase
    if (justCompletedCheckout || justCompletedCreditsPurchase || isWaitingForWebhook || showSuccessModal || showCreditsSuccessModal) return

    // Check session storage to avoid showing modal multiple times per session
    const sessionKey = 'subscription_alert_shown'
    const alreadyShown = sessionStorage.getItem(sessionKey)

    if (alreadyShown && hasShownThisSession) return

    if (isPastDue) {
      setAlertType('payment_failed')
      setIsOpen(true)
      sessionStorage.setItem(sessionKey, 'true')
      setHasShownThisSession(true)
    } else if (isCanceled) {
      setAlertType('canceled')
      setIsOpen(true)
      sessionStorage.setItem(sessionKey, 'true')
      setHasShownThisSession(true)
    }
  }, [loading, isPastDue, isCanceled, hasShownThisSession, justCompletedCheckout, isWaitingForWebhook, showSuccessModal])

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Handle reactivate subscription
  const handleReactivate = async () => {
    // Open Stripe portal for reactivation
    await openPortal()
    setIsOpen(false)
  }

  // Handle choose new plan
  const handleChoosePlan = () => {
    router.push('/pricing')
    setIsOpen(false)
  }

  // Render based on alert type
  const renderContent = () => {
    switch (alertType) {
      case 'canceled':
        return (
          <>
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <DialogTitle className="text-center text-xl">
                Subscription Canceled
              </DialogTitle>
              <DialogDescription className="text-center space-y-2">
                <p>
                  Your subscription has been canceled. You can still use your remaining
                  <span className="font-semibold text-foreground"> {totalCredits.toLocaleString()} credits</span>
                  {creditsExtras > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {' '}({credits} plan + {creditsExtras} extras)
                    </span>
                  )}, but they won&apos;t renew.
                </p>
                {currentPeriodEnd && (
                  <p className="text-sm">
                    Your access continues until <span className="font-medium">{formatDate(currentPeriodEnd)}</span>
                  </p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto"
              >
                Continue with Credits
              </Button>
              <Button
                onClick={handleReactivate}
                className="w-full sm:w-auto"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Reactivate Subscription
              </Button>
            </DialogFooter>
          </>
        )

      case 'payment_failed':
        return (
          <>
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <DialogTitle className="text-center text-xl">
                Payment Failed
              </DialogTitle>
              <DialogDescription className="text-center space-y-2">
                <p>
                  Your last payment attempt failed. Your subscription is now inactive
                  and your credits won&apos;t renew.
                </p>
                <p className="text-sm">
                  Update your payment method or choose a new plan to continue using BlackTools.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleChoosePlan}
                className="w-full sm:w-auto"
              >
                Choose New Plan
              </Button>
              <Button
                onClick={handleReactivate}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment
              </Button>
            </DialogFooter>
          </>
        )

      default:
        return null
    }
  }

  // Loading modal while waiting for webhook
  if (showLoadingModal) {
    const isCreditsLoading = justCompletedCreditsPurchase
    return (
      <Dialog open={showLoadingModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <DialogTitle className="text-center text-xl">
              {isCreditsLoading ? 'Adding your credits...' : 'Activating your subscription...'}
            </DialogTitle>
            <DialogDescription className="text-center">
              <p>
                {isCreditsLoading
                  ? 'Please wait while we add the credits to your account.'
                  : 'Please wait while we process your payment and activate your plan.'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">This usually takes just a few seconds.</p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  // Success modal for credits purchase
  if (showCreditsSuccessModal) {
    return (
      <Dialog open={showCreditsSuccessModal} onOpenChange={setShowCreditsSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              Credits Added!
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              {purchasedCreditsAmount > 0 ? (
                <p>
                  <span className="font-semibold text-foreground">{purchasedCreditsAmount.toLocaleString()}</span> credits
                  have been added to your account.
                </p>
              ) : (
                <p>Your credits have been added to your account.</p>
              )}
              <p>
                You now have <span className="font-semibold text-foreground">{totalCredits?.toLocaleString()}</span> total credits.
              </p>
              {creditsExtras > 0 && (
                <p className="text-xs text-muted-foreground">
                  ({credits?.toLocaleString()} plan credits + {creditsExtras?.toLocaleString()} extra credits)
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowCreditsSuccessModal(false)}
              className="w-full"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Success modal for plan changes
  if (showSuccessModal) {
    return (
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              Subscription Activated!
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p>
                Your subscription has been activated on the
                <span className="font-semibold text-foreground capitalize"> {plan} </span>
                plan.
              </p>
              <p>
                You now have <span className="font-semibold text-foreground">{totalCredits?.toLocaleString()}</span> credits.
              </p>
              {creditsExtras > 0 && (
                <p className="text-xs text-muted-foreground">
                  ({credits?.toLocaleString()} plan credits + {creditsExtras?.toLocaleString()} extra credits)
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (!alertType) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
