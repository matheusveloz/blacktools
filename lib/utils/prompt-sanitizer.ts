/**
 * Sanitize prompts to prevent injection attacks and invalid inputs
 */

export function sanitizePrompt(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string')
  }

  return prompt
    // Remove control characters (except newline and tab for formatting)
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .trim()
    // Limit length to prevent abuse
    .slice(0, 1000)
}

export function validatePrompt(prompt: unknown): { valid: boolean; sanitized?: string; error?: string } {
  if (typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt must be a string' }
  }

  if (prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' }
  }

  if (prompt.length > 1000) {
    return { valid: false, error: 'Prompt exceeds maximum length of 1000 characters' }
  }

  try {
    const sanitized = sanitizePrompt(prompt)
    return { valid: true, sanitized }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Invalid prompt' }
  }
}
