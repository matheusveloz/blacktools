import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { TOOLS } from '@/lib/constants'
import { getTaskStatus, getVideoUrl } from '@/lib/sora2/client'
import { refundCredits } from '@/lib/credits/utils'
import { logger } from '@/lib/utils/logger'
import type { Sora2Size, Sora2Seconds } from '@/types/sora2'

/**
 * Sora 2 Cron API - Background job to poll task status
 *
 * This should be called periodically (every 30-60 seconds) by Vercel Cron
 * to check status of all processing generations and update them.
 *
 * Flow:
 * 1. Find all 'processing' generations with task_id
 * 2. Poll status from Laozhang API
 * 3. Update completed/failed/in-progress
 * 4. Mark stale generations as failed (10+ min without update)
 */

// Cron secret to protect endpoint
const CRON_SECRET = process.env.CRON_SECRET

// Timeout for marking stale generations as failed (10 minutes)
const STALE_TIMEOUT_MS = 10 * 60 * 1000

// Max generations to process per cron run
const MAX_GENERATIONS_PER_RUN = 20

interface GenerationMetadata {
  prompt: string
  size?: Sora2Size
  seconds?: Sora2Seconds
  imageUrl?: string
  task_id?: string
  progress?: number
  created_at?: string
  completed_at?: string
  failed_at?: string
  error?: string
  [key: string]: string | number | undefined
}

function verifyCronAuth(request: NextRequest): boolean {
  // Check for Vercel Cron header (trusted source)
  const vercelCronHeader = request.headers.get('x-vercel-cron')
  if (vercelCronHeader === '1') {
    return true
  }

  // In production, always require CRON_SECRET
  if (process.env.NODE_ENV === 'production') {
    if (!CRON_SECRET) {
      // Log error but don't expose secret value
      logger.error('[Cron] CRON_SECRET not configured in production!')
      return false
    }

    const authHeader = request.headers.get('authorization')
    const providedSecret = authHeader?.replace('Bearer ', '')
    return providedSecret === CRON_SECRET
  }

  // Development: allow without secret only if explicitly in dev mode
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization')
    const providedSecret = authHeader?.replace('Bearer ', '')
    return providedSecret === CRON_SECRET
  }

  // Development mode without secret (only for local development)
  return true
}

async function processGenerations() {
  const adminClient = createAdminClient()
  const staleTime = new Date(Date.now() - STALE_TIMEOUT_MS).toISOString()

  const stats = {
    checked: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    stale_reset: 0
  }

  try {
    // Get all processing OR pending generations (pending with task_id = status update failed)
    const { data: processingGenerations } = await adminClient
      .from('generations')
      .select('*')
      .eq('tool', TOOLS.SORA2)
      .in('status', ['processing', 'pending'])
      .order('created_at', { ascending: true })
      .limit(MAX_GENERATIONS_PER_RUN)

    if (!processingGenerations || processingGenerations.length === 0) {
      return NextResponse.json({ success: true, ...stats })
    }


    for (const generation of processingGenerations) {
      const metadata = generation.metadata as unknown as GenerationMetadata
      const taskId = metadata?.task_id

      // Check if stale (no update for 10+ min) - mark as failed
      // Use created_at since updated_at column doesn't exist
      if (generation.created_at < staleTime) {

        await adminClient
          .from('generations')
          .update({
            status: 'failed',
            metadata: {
              ...metadata,
              failed_at: new Date().toISOString(),
              error: 'Generation timed out after 10 minutes'
            }
          })
          .eq('id', generation.id)

        // Refund credits using centralized function
        // Note: We don't have the original split info, so refund all to subscription credits (default behavior)
        await refundCredits(
          adminClient,
          generation.user_id,
          generation.credits_used,
          generation.credits_used, // Refund all to subscription credits
          0,
          'Sora2 generation timed out after 10 minutes'
        )

        stats.stale_reset++
        stats.failed++
        continue
      }

      // If no task_id, skip (shouldn't happen, but safety check)
      if (!taskId) {
        continue
      }

      stats.checked++

      try {
        // Poll status from Laozhang API
        const statusResult = await getTaskStatus(taskId)

        if (!statusResult.success || !statusResult.task) {
          stats.processing++
          continue
        }

        const task = statusResult.task

        if (task.status === 'completed') {
          // Get video URL
          let videoUrl = task.videoUrl
          if (!videoUrl) {
            videoUrl = await getVideoUrl(taskId)
          }

          if (videoUrl) {
            await adminClient
              .from('generations')
              .update({
                status: 'completed',
                result_url: videoUrl,
                metadata: {
                  ...metadata,
                  progress: 100,
                  completed_at: new Date().toISOString()
                }
              })
              .eq('id', generation.id)

            stats.completed++
          } else {
            // No video URL available
            await adminClient
              .from('generations')
              .update({
                status: 'failed',
                metadata: {
                  ...metadata,
                  failed_at: new Date().toISOString(),
                  error: 'Video completed but URL not available'
                }
              })
              .eq('id', generation.id)

            // Refund credits using centralized function
            await refundCredits(
              adminClient,
              generation.user_id,
              generation.credits_used,
              generation.credits_used, // Refund all to subscription credits
              0,
              'Sora2 generation failed - video URL not available'
            )
            stats.failed++
          }

        } else if (task.status === 'failed') {
          await adminClient
            .from('generations')
            .update({
              status: 'failed',
              metadata: {
                ...metadata,
                failed_at: new Date().toISOString(),
                error: task.error || 'Generation failed'
              }
            })
            .eq('id', generation.id)

          // Refund credits using centralized function
          await refundCredits(
            adminClient,
            generation.user_id,
            generation.credits_used,
            generation.credits_used, // Refund all to subscription credits
            0,
            'Sora2 generation failed'
          )
          stats.failed++

        } else {
          // Still in progress - update progress
          // Also ensure status is 'processing' (fix for stuck 'pending' generations)
          await adminClient
            .from('generations')
            .update({
              status: 'processing',
              metadata: {
                ...metadata,
                progress: task.progress
              }
            })
            .eq('id', generation.id)

          stats.processing++
        }

      } catch (error) {
        stats.processing++
      }
    }

    // Also check for stale 'pending' generations (never picked up)
    // Use created_at since updated_at column doesn't exist
    const { data: stalePending } = await adminClient
      .from('generations')
      .select('*')
      .eq('tool', TOOLS.SORA2)
      .eq('status', 'pending')
      .lt('created_at', staleTime)

    if (stalePending && stalePending.length > 0) {
      for (const stale of stalePending) {
        const metadata = stale.metadata as unknown as GenerationMetadata

        await adminClient
          .from('generations')
          .update({
            status: 'failed',
            metadata: {
              ...metadata,
              failed_at: new Date().toISOString(),
              error: 'Generation was not processed. Please try again.'
            }
          })
          .eq('id', stale.id)

        // Refund credits using centralized function
        await refundCredits(
          adminClient,
          stale.user_id,
          stale.credits_used,
          stale.credits_used, // Refund all to subscription credits
          0,
          'Sora2 generation was not processed - stale'
        )
        stats.stale_reset++
      }
    }


    return NextResponse.json({
      success: true,
      ...stats
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


// GET handler for Vercel Cron (Vercel Cron uses GET)
export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return processGenerations()
}

// POST handler for manual triggers
export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return processGenerations()
}
