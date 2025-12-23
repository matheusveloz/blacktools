/**
 * URL validation utilities for security
 */

/**
 * Validates if a URL is safe to use
 * - Must be HTTPS (except data: URLs)
 * - Must be from allowed domains (for external URLs)
 */
export function isValidUrl(url: string): boolean {
  // Allow data: URLs (base64 encoded images)
  if (url.startsWith('data:')) {
    // Validate data URL format
    const dataUrlRegex = /^data:(image|video|audio)\/[a-zA-Z0-9+]+;base64,/
    return dataUrlRegex.test(url)
  }

  try {
    const parsed = new URL(url)
    
    // Only allow HTTPS for external URLs
    if (parsed.protocol !== 'https:') {
      return false
    }

    // Whitelist of allowed domains
    const allowedDomains = [
      'supabase.co',
      'supabase.in', // Supabase India region
      'supabase.io',
      'storage.googleapis.com', // Google Cloud Storage
      'amazonaws.com', // AWS S3
      'cloudflare.com', // Cloudflare R2
    ]

    // Check if hostname ends with any allowed domain
    return allowedDomains.some(domain => {
      // Exact match or subdomain
      return parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    })
  } catch {
    // Invalid URL format
    return false
  }
}

/**
 * Validates imageUrl parameter from requests
 */
export function validateImageUrl(imageUrl: unknown): { valid: boolean; error?: string } {
  if (!imageUrl) {
    return { valid: true } // Optional field, empty is OK
  }

  if (typeof imageUrl !== 'string') {
    return { valid: false, error: 'imageUrl must be a string' }
  }

  if (imageUrl.trim().length === 0) {
    return { valid: false, error: 'imageUrl cannot be empty' }
  }

  // Limit URL length to prevent abuse
  if (imageUrl.length > 2048) {
    return { valid: false, error: 'imageUrl exceeds maximum length of 2048 characters' }
  }

  if (!isValidUrl(imageUrl)) {
    return { 
      valid: false, 
      error: 'Invalid imageUrl. Must be a valid HTTPS URL from allowed domains or a base64 data URL' 
    }
  }

  return { valid: true }
}
