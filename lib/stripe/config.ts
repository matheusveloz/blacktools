import { Plans } from '@/types/stripe'

export const PLANS: Plans = {
  starter: {
    name: 'Starter',
    price: 24.50,
    credits: 550,
    features: [
      '550 monthly credits',
      'All AI tools access',
      'Bulk creations',
      'Recharge from $0.025/credit',
    ],
    excludedFeatures: [
      'Infinite Talk',
    ],
  },
  pro: {
    name: 'Pro',
    price: 39.50,
    credits: 1200,
    features: [
      '1,200 monthly credits',
      'All AI tools access',
      'Bulk creations',
      'Recharge from $0.022/credit',
    ],
  },
  premium: {
    name: 'Premium',
    price: 59.50,
    credits: 2500,
    features: [
      '2,500 monthly credits',
      'All AI tools access',
      'Bulk creations',
      'Recharge from $0.020/credit',
    ],
  },
}

export function getPlanByKey(planKey: string) {
  const plan = PLANS[planKey as keyof Plans]
  if (!plan) return null
  return { key: planKey, ...plan }
}

export function getCreditsByPlan(planKey: string): number {
  const plan = PLANS[planKey as keyof Plans]
  return plan?.credits || 0
}

// Plan hierarchy for upgrade/downgrade detection
export const PLAN_ORDER: Record<string, number> = {
  starter: 1,
  pro: 2,
  premium: 3,
}

// Trial credits - limited credits during trial period
export const TRIAL_CREDITS: Record<string, number> = {
  starter: 50,
  pro: 100,
  premium: 150,
}

export function getTrialCreditsByPlan(planKey: string): number {
  return TRIAL_CREDITS[planKey] || 50
}

export function isUpgrade(currentPlan: string, newPlan: string): boolean {
  const currentOrder = PLAN_ORDER[currentPlan] || 0
  const newOrder = PLAN_ORDER[newPlan] || 0
  return newOrder > currentOrder
}

export function isDowngrade(currentPlan: string, newPlan: string): boolean {
  const currentOrder = PLAN_ORDER[currentPlan] || 0
  const newOrder = PLAN_ORDER[newPlan] || 0
  return newOrder < currentOrder
}
