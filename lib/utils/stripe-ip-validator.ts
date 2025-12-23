/**
 * Stripe IP validation utilities
 * Validates if webhook requests come from Stripe's IP ranges
 * 
 * Note: Stripe IPs can change. Consider using:
 * 1. Webhook signature verification (already implemented)
 * 2. IP whitelist at infrastructure level (Vercel, Cloudflare, etc.)
 * 3. This function as additional layer (logs warnings, doesn't block in production)
 */

import { logger } from '@/lib/utils/logger'

/**
 * Known Stripe IP ranges (may need periodic updates)
 * Source: https://stripe.com/docs/ips
 * Note: These are examples - check Stripe docs for current IPs
 */
const STRIPE_IP_RANGES = [
  // These are example IPs - you should verify current IPs from Stripe documentation
  // Stripe uses dynamic IPs that can change
  '54.187.174.169',
  '54.187.205.235',
  '54.231.114.85',
  '52.84.167.235',
  // Add more IPs from Stripe documentation
]

/**
 * Validates if request IP is from Stripe
 * @param request - Next.js request object
 * @returns true if IP appears to be from Stripe, false otherwise
 */
export function isValidStripeIP(request: Request): boolean {
  // Get client IP from headers (considering proxies)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP

  if (!clientIP) {
    // Can't determine IP - in production, this is suspicious
    // But we don't block because signature verification is the primary security
    return false
  }

  // Check if IP is in Stripe ranges
  // For exact IPs (current implementation)
  if (STRIPE_IP_RANGES.includes(clientIP)) {
    return true
  }

  // TODO: If you have Stripe IP CIDR ranges, validate here
  // For now, we rely on signature verification as primary security

  return false
}

/**
 * Logs warning if IP doesn't match Stripe (but doesn't block)
 * Primary security is signature verification
 */
export function logStripeIPWarning(request: Request, eventType: string): void {
  if (process.env.NODE_ENV === 'production') {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP

    if (clientIP && !isValidStripeIP(request)) {
      logger.warn(`[Stripe Webhook] Unexpected IP for ${eventType}: ${clientIP}`)
    }
  }
}
