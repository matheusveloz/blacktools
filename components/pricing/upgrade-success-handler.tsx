'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export function UpgradeSuccessHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [planName, setPlanName] = useState('')

  useEffect(() => {
    const upgraded = searchParams.get('upgraded')
    const plan = searchParams.get('plan')

    if (upgraded === 'true' && plan) {
      setIsProcessing(true)
      setPlanName(plan.toUpperCase())

      // Poll for subscription update (webhook may take a few seconds)
      let attempts = 0
      const maxAttempts = 10
      
      const pollInterval = setInterval(async () => {
        attempts++

        try {
          // Call sync endpoint to force update from Stripe
          const response = await fetch('/api/stripe/sync-credits', {
            method: 'POST',
          })

          const data = await response.json()

          if (data.success && data.newPlan === plan) {
            // Upgrade completed!
            clearInterval(pollInterval)
            setIsProcessing(false)
            setShowSuccess(true)

            // Clear URL params
            router.replace('/pricing', { scroll: false })

            // Auto-close success modal after 3 seconds
            setTimeout(() => {
              setShowSuccess(false)
            }, 3000)
          } else if (attempts >= maxAttempts) {
            // Max attempts reached - stop polling but show success anyway
            clearInterval(pollInterval)
            setIsProcessing(false)
            setShowSuccess(true)

            // Clear URL params
            router.replace('/pricing', { scroll: false })

            setTimeout(() => {
              setShowSuccess(false)
              window.location.reload() // Force reload to get latest data
            }, 2000)
          }
        } catch (error) {
          console.error('Polling error:', error)
          
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            setIsProcessing(false)
            router.replace('/pricing', { scroll: false })
          }
        }
      }, 1000) // Poll every 1 second

      // Cleanup on unmount
      return () => clearInterval(pollInterval)
    }
  }, [searchParams, router])

  return (
    <>
      {/* Processing Modal */}
      <Dialog open={isProcessing} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Upgrade...</h3>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we update your subscription.
              <br />
              This usually takes just a few seconds.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upgrade Successful!</h3>
            <p className="text-sm text-muted-foreground text-center">
              You are now on the <strong className="text-foreground">{planName}</strong> plan.
              <br />
              Your credits have been updated.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

