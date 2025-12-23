/**
 * Fetch wrapper with timeout support
 * Prevents requests from hanging indefinitely
 */

export interface FetchTimeoutOptions extends RequestInit {
  timeout?: number
}

/**
 * Fetch with timeout
 * @param url - URL to fetch
 * @param options - Fetch options including optional timeout (default: 30s)
 * @returns Promise<Response>
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms: ${url}`)
    }

    throw error
  }
}
