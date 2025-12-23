import Stripe from 'stripe'

// Initialize Stripe only when the key is available (not during build time)
const getStripeClient = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(key, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
}

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!stripeInstance) {
      stripeInstance = getStripeClient()
    }
    return (stripeInstance as any)[prop]
  },
})
