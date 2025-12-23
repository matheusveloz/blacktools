/**
 * Audit logging utility
 * Logs important actions for security and compliance
 */

import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import type { Json } from '@/types/database'

export interface AuditLogEntry {
  action: string
  userId: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an audit event to the database
 * Creates audit_logs table if it doesn't exist (via migration)
 */
export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    const adminClient = createAdminClient()

    // Try to insert into audit_logs table
    // If table doesn't exist, this will fail gracefully
    const { error: insertError } = await adminClient
      .from('audit_logs')
      .insert({
        user_id: entry.userId,
        action: entry.action,
        details: (entry.details || {}) as unknown as Json,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        created_at: new Date().toISOString(),
      })
    
    if (insertError) {
      // Table might not exist yet - log warning but don't throw
      logger.warn('[Audit Log] Could not log to database:', insertError.message)
      // In production, you might want to send to external logging service
    }
  } catch (error) {
    // Fail silently - audit logging should not break the application
    logger.warn('[Audit Log] Failed to log action:', error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Helper to get request metadata for audit logging
 */
export function getRequestMetadata(request?: Request): {
  ipAddress?: string
  userAgent?: string
} {
  if (!request) {
    return {}
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIP || undefined
  const userAgent = request.headers.get('user-agent') || undefined

  return { ipAddress, userAgent }
}

/**
 * Predefined audit actions
 */
export const AuditActions = {
  // Credit actions
  CREDITS_DEDUCTED: 'credits_deducted',
  CREDITS_REFUNDED: 'credits_refunded',
  CREDITS_PURCHASED: 'credits_purchased',
  
  // Generation actions
  GENERATION_CREATED: 'generation_created',
  GENERATION_COMPLETED: 'generation_completed',
  GENERATION_FAILED: 'generation_failed',
  
  // Subscription actions
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  PLAN_CHANGED: 'plan_changed',
  
  // Account actions
  ACCOUNT_SUSPENDED: 'account_suspended',
  ACCOUNT_REACTIVATED: 'account_reactivated',
  
  // Authentication actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  
  // File actions
  FILE_UPLOADED: 'file_uploaded',
  
  // Admin actions
  ADMIN_ACTION: 'admin_action',
} as const
