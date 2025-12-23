/**
 * Safe logging utility that redacts sensitive data in production
 */

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Redact sensitive information from logs
 */
function redactSensitive(data: unknown): unknown {
  if (typeof data === 'string') {
    // Don't log full URLs that might contain tokens
    if (data.includes('token=') || data.includes('secret=') || data.includes('key=')) {
      return '[REDACTED]'
    }
    return data
  }

  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(redactSensitive)
    }

    const redacted: Record<string, unknown> = {}
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey', 'authorization', 'userId', 'customerId', 'email', 'stripe_customer_id', 'subscription_id']

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()
      if (sensitiveKeys.some(sk => lowerKey.includes(sk.toLowerCase()))) {
        redacted[key] = '[REDACTED]'
      } else {
        redacted[key] = redactSensitive(value)
      }
    }

    return redacted
  }

  return data
}

/**
 * Safe logger that only logs in development or logs redacted data in production
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (!isProduction) {
      console.log(...args)
    } else {
      // In production, log only non-sensitive info or redact
      const redacted = args.map(redactSensitive)
      console.log(...redacted)
    }
  },
  
  info: (...args: unknown[]) => {
    if (!isProduction) {
      console.info(...args)
    } else {
      const redacted = args.map(redactSensitive)
      console.info(...redacted)
    }
  },
  
  warn: (...args: unknown[]) => {
    const redacted = args.map(redactSensitive)
    console.warn(...redacted)
  },
  
  error: (...args: unknown[]) => {
    // Errors are important even in production, but redact sensitive data
    const redacted = args.map(redactSensitive)
    console.error(...redacted)
  },
  
  debug: (...args: unknown[]) => {
    // Only in development
    if (!isProduction) {
      console.debug(...args)
    }
  }
}
