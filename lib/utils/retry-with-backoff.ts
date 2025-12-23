/**
 * Retry utility with exponential backoff
 * Useful for handling transient failures in external API calls
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  shouldRetry?: (error: unknown) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  shouldRetry: () => true, // Retry on any error by default
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param options - Retry configuration options
 * @returns Result of the function
 * @throws Last error if all retries fail
 * 
 * @example
 * const result = await retryWithBackoff(
 *   () => fetchWithTimeout(url, options),
 *   { maxRetries: 3, initialDelay: 1000 }
 * )
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Check if we should retry this error
      if (!config.shouldRetry(error)) {
        throw error
      }

      // Don't delay after the last attempt
      if (attempt < config.maxRetries) {
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        )

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * delay * 0.1
        const finalDelay = delay + jitter

        await new Promise(resolve => setTimeout(resolve, finalDelay))
      }
    }
  }

  // All retries exhausted
  throw lastError
}

/**
 * Default shouldRetry function that retries on network errors and 5xx status codes
 */
export function shouldRetryOnNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    // Retry on network errors (fetch failures, timeouts, etc.)
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return true
    }
  }

  // For Response objects, retry on 5xx errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status
    return status >= 500 && status < 600
  }

  return false
}
