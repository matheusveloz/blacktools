import { Plans } from '@/types/stripe'

export const PLANS: Plans = {
  starter: {
    name: 'Starter',
    price: 24.50,
    credits: 550,
    features: [
      '550 monthly credits',
      'All AI tools access',
      'HD video export',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 39.50,
    credits: 1200,
    features: [
      '1,200 monthly credits',
      'All AI tools access',
      '4K video export',
      'Priority support',
      'Custom workflows',
    ],
  },
  premium: {
    name: 'Premium',
    price: 59.50,
    credits: 2500,
    features: [
      '2,500 monthly credits',
      'All AI tools access',
      '4K video export',
      'Priority support',
      'Custom workflows',
      'API access',
      'Team collaboration',
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
