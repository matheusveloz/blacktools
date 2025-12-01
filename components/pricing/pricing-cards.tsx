'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PLANS } from '@/lib/stripe/config'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PricingCardsProps {
  userId?: string
  userEmail?: string
}

export function PricingCards({ userId, userEmail }: PricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const router = useRouter()

  const handleSelectPlan = async (planKey: string) => {
    if (!userId || !userEmail) {
      router.push('/login')
      return
    }

    setLoadingPlan(planKey)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planKey,
          userId,
          email: userEmail,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {Object.entries(PLANS).map(([key, plan]) => (
        <Card
          key={key}
          className={cn(
            'relative flex flex-col',
            key === 'pro' && 'border-primary shadow-lg scale-105'
          )}
        >
          {key === 'pro' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(plan.price)}
              </span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-center mb-4">
              <span className="text-lg font-semibold text-primary">
                {plan.credits.toLocaleString()} credits
              </span>
              <span className="text-muted-foreground text-sm"> / month</span>
            </div>
            <ul className="space-y-3">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={key === 'pro' ? 'default' : 'outline'}
              onClick={() => handleSelectPlan(key)}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === key ? 'Processing...' : 'Start 1-Day free trial'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
