export interface Plan {
  name: string
  price: number
  credits: number
  features: string[]
  excludedFeatures?: string[]
}

export interface Plans {
  starter: Plan
  pro: Plan
  premium: Plan
}

export type PlanKey = keyof Plans

export interface CheckoutSessionRequest {
  planKey: string
  userId: string
  email: string
}

export interface PortalSessionRequest {
  customerId: string
}

export interface SubscriptionData {
  subscriptionId: string
  customerId: string
  status: string
  plan: string
  currentPeriodEnd: Date
  credits: number
}
