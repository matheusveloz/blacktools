'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  Sparkles
} from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/use-user'
import { useSubscription } from '@/hooks/use-subscription'
import { CREDIT_PACKS, type PlanType } from '@/lib/constants'
import { cn } from '@/lib/utils'

// Clear profile cache to force immediate refresh
function clearProfileCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('blacktools_profile_cache')
  }
}

type CreditPack = {
  id: string
  name: string
  credits: number
  price: number
  pricePerCredit: number
  savings: number
  popular?: boolean
  customizable?: boolean
}

export default function BuyCreditsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: userLoading } = useUser()
  const { plan, isActive, isTrialing, totalCredits, loading: subLoading, syncSubscription } = useSubscription()

  const [processingPackId, setProcessingPackId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const [customCredits, setCustomCredits] = useState<number>(600)
  const [isCustom, setIsCustom] = useState(false)
  const [successModal, setSuccessModal] = useState<{
    open: boolean
    credits: number
    newTotal: number
  }>({
    open: false,
    credits: 0,
    newTotal: 0,
  })

  const canceled = searchParams.get('canceled') === 'true'

  // Restore success modal from sessionStorage after refresh
  useEffect(() => {
    const savedModal = sessionStorage.getItem('credits_purchase_success')
    if (savedModal) {
      try {
        const data = JSON.parse(savedModal)
        setSuccessModal({
          open: true,
          credits: data.credits,
          newTotal: data.newTotal,
        })
        sessionStorage.removeItem('credits_purchase_success')
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Sync subscription on mount to ensure fresh data
  useEffect(() => {
    if (profile?.id) {
      syncSubscription(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  // Get packs based on user's plan
  const userPlan = (plan?.toLowerCase() || 'starter') as PlanType
  const availablePacks = CREDIT_PACKS[userPlan] || CREDIT_PACKS.starter

  // Auto-select popular pack
  useEffect(() => {
    if (!selectedPack && availablePacks.length > 0) {
      const popular = availablePacks.find((p: CreditPack) => p.popular)
      setSelectedPack(popular?.id || availablePacks[0].id)
    }
  }, [availablePacks, selectedPack])

  // Get best price per credit for custom amounts (use large pack price - with discount)
  const basePricePerCredit = availablePacks[availablePacks.length - 1]?.pricePerCredit || 0.022
  const bestSavings = availablePacks[availablePacks.length - 1]?.savings || 0

  // Calculate custom pack details
  const customPrice = Math.round(customCredits * basePricePerCredit * 100) / 100
  const minCustomCredits = 600
  const maxCustomCredits = 10000

  const handlePurchase = async (packId: string) => {
    if (!user || !profile) return

    setProcessingPackId(packId)
    setError(null)

    try {
      const body: Record<string, unknown> = {
        packId,
        userId: user.id,
        email: user.email,
      }

      // If custom, add custom credits info
      if (isCustom && packId === 'custom') {
        body.customCredits = customCredits
        body.pricePerCredit = basePricePerCredit
      }

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      // Handle checkout redirect (for 3D Secure support)
      if (data.requiresCheckout && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      // Handle 3D Secure authentication required
      if (data.requiresAction && data.clientSecret) {
        const stripe = await stripePromise
        if (!stripe) {
          setError('Failed to load payment system')
          return
        }

        // Show 3D Secure modal
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret
        )

        if (confirmError) {
          setError(confirmError.message || 'Authentication failed')
          return
        }

        if (paymentIntent?.status === 'succeeded') {
          // Payment confirmed - refresh to update credits
          clearProfileCache()
          sessionStorage.setItem('credits_purchase_success', JSON.stringify({
            credits: data.credits || 0,
            newTotal: data.newTotal || 0,
          }))
          window.location.reload()
          return
        } else {
          setError('Payment verification failed')
          return
        }
      }

      if (data.success) {
        // Payment successful - save modal state and refresh
        clearProfileCache()
        sessionStorage.setItem('credits_purchase_success', JSON.stringify({
          credits: data.credits,
          newTotal: data.newTotal,
        }))
        window.location.reload()
        return
      } else {
        setError(data.error || 'Failed to process payment')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setProcessingPackId(null)
    }
  }

  // Show loading while we don't have profile data yet
  const isDataLoaded = !userLoading && !subLoading && profile !== null
  const showLoading = !isDataLoaded

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Only show subscription required AFTER data is loaded
  if (!isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Subscription Required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You need an active subscription to purchase extra credits.
          </p>
          <Button onClick={() => router.push('/pricing')} className="w-full">
            View Plans
          </Button>
        </div>
      </div>
    )
  }

  // Block credit purchases during trial
  if (isTrialing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Trial Period Active</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Credit purchases are available after your trial ends.
          </p>
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const currentPack = availablePacks.find((p: CreditPack) => p.id === selectedPack)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.back()}
            className="p-1.5 sm:p-2 -ml-1.5 sm:-ml-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold">Buy Credits</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Balance: {totalCredits.toLocaleString()} credits
            </p>
          </div>
          <div className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary font-medium capitalize flex-shrink-0">
            {userPlan}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Canceled notice */}
        {canceled && (
          <div className="mb-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-200">Purchase canceled. Try again when ready.</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Credit Packs */}
        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          {availablePacks.map((pack: CreditPack) => {
            const isSelected = selectedPack === pack.id && !isCustom

            return (
              <button
                key={pack.id}
                onClick={() => {
                  setSelectedPack(pack.id)
                  setIsCustom(false)
                }}
                className={cn(
                  'w-full p-3 sm:p-4 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    {/* Selection indicator */}
                    <div className={cn(
                      'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />}
                    </div>

                    {/* Pack info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base">{pack.credits.toLocaleString()} credits</span>
                        {pack.popular && (
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                            Popular
                          </span>
                        )}
                        {pack.savings > 0 && (
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                            -{pack.savings}%
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        ${pack.pricePerCredit.toFixed(3)} per credit
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-base sm:text-lg font-bold">${pack.price.toFixed(2)}</p>
                  </div>
                </div>
              </button>
            )
          })}

          {/* Custom Amount Option */}
          <button
            onClick={() => {
              setIsCustom(true)
              setSelectedPack('custom')
            }}
            className={cn(
              'w-full p-3 sm:p-4 rounded-xl border text-left transition-all',
              isCustom
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {/* Selection indicator */}
                <div className={cn(
                  'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                  isCustom ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                )}>
                  {isCustom && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />}
                </div>

                {/* Pack info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base">Custom Amount</span>
                    {bestSavings > 0 && (
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                        -{bestSavings}%
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    Choose your own quantity ({minCustomCredits.toLocaleString()}-{maxCustomCredits.toLocaleString()})
                  </p>
                </div>
              </div>

              {/* Price indicator */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs sm:text-sm text-muted-foreground">${basePricePerCredit.toFixed(3)}/credit</p>
              </div>
            </div>
          </button>

          {/* Custom Amount Input - shows when custom is selected */}
          {isCustom && (
            <div className="p-3 sm:p-4 rounded-xl border border-primary/30 bg-primary/5">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Enter credit amount
                  </label>
                  <input
                    type="number"
                    value={customCredits}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || minCustomCredits
                      setCustomCredits(Math.min(Math.max(val, minCustomCredits), maxCustomCredits))
                    }}
                    min={minCustomCredits}
                    max={maxCustomCredits}
                    step={50}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-base font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="text-right sm:min-w-[100px]">
                  <p className="text-xs text-muted-foreground mb-0.5">Total price</p>
                  <p className="text-xl sm:text-2xl font-bold">${customPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Purchase button */}
        <Button
          onClick={() => selectedPack && handlePurchase(selectedPack)}
          disabled={!selectedPack || processingPackId !== null || (isCustom && customCredits < minCustomCredits)}
          className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium"
        >
          {processingPackId ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : isCustom ? (
            <>
              Buy {customCredits.toLocaleString()} credits for ${customPrice.toFixed(2)}
            </>
          ) : (
            <>
              Buy {currentPack?.credits.toLocaleString()} credits for ${currentPack?.price.toFixed(2)}
            </>
          )}
        </Button>

        {/* Upgrade hint for non-premium */}
        {userPlan !== 'premium' && (
          <div className="mt-6 p-3 sm:p-4 rounded-xl bg-muted/50 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {userPlan === 'starter'
                  ? 'Upgrade to Pro or Premium for better credit prices.'
                  : 'Upgrade to Premium for the best credit prices.'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/pricing')}
              className="text-primary hover:text-primary w-full sm:w-auto"
            >
              Upgrade
            </Button>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-6 sm:mt-8">
          Secure payment via Stripe. Credits never expire.
        </p>
      </main>

      {/* Success Modal */}
      <Dialog open={successModal.open} onOpenChange={(open) => setSuccessModal({ ...successModal, open })}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <DialogTitle className="text-center">
              Purchase Successful
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-4">
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">
              +{successModal.credits.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              credits added to your account
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setSuccessModal({ open: false, credits: 0, newTotal: 0 })}
              className="flex-1 order-2 sm:order-1"
            >
              Buy More
            </Button>
            <Button
              onClick={() => {
                setSuccessModal({ open: false, credits: 0, newTotal: 0 })
                router.push('/dashboard')
              }}
              className="flex-1 order-1 sm:order-2"
            >
              Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
