import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { TOOLS } from '@/lib/constants'
import { getLipSyncTaskStatus, downloadAndUploadLipSyncVideo } from '@/lib/lipsync/client'
import { refundCredits } from '@/lib/credits/utils'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import type { Json } from '@/types/database'

// Allow up to 5 minutes for processing large video downloads
export const maxDuration = 300

interface LipSyncMetadata {
  srcVideoUrl?: string
  audioUrl?: string
  audioDurationSeconds?: number
  task_id?: string
  error?: string
  reason?: string
  completed_at?: string
  failed_at?: string
  original_url?: string
  storage_error?: string
  [key: string]: string | number | undefined | Record<string, unknown>
}

/**
 * LipSync Process API - Polls task status and updates generations
 *
 * Flow:
 * 1. Find generations with status 'processing' that have a task_id
 * 2. Call getLipSyncTaskStatus(task_id) for each
 * 3. Update status in database
 * 4. If completed: set status='completed', save video URL
 * 5. If failed: set status='failed', refund credits
 */

const MAX_GENERATIONS_PER_CALL = 10

interface ProcessResult {
  id: string
  task_id: string
  status: string
  videoUrl?: string
  error?: string
}

export async function POST() {
  try {
    const supabase = createClient()
    const adminClient = createAdminClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(rateLimiters.status, user.id)
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait before trying again.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Get processing OR pending generations for this user that have a task_id
    const { data: processingGenerations, error: fetchError } = await adminClient
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .eq('tool', TOOLS.LIPSYNC)
      .in('status', ['processing', 'pending'])
      .order('created_at', { ascending: true })
      .limit(MAX_GENERATIONS_PER_CALL)

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch processing generations' },
        { status: 500 }
      )
    }


    // Filter to only those with task_id
    const generationsWithTaskId = (processingGenerations || []).filter(gen => {
      const metadata = gen.metadata as LipSyncMetadata | null
      return metadata?.task_id
    })

    if (generationsWithTaskId.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No processing generations to check',
        checked: 0,
        results: [],
      })
    }


    const results: ProcessResult[] = []

    for (const generation of generationsWithTaskId) {
      const metadata = generation.metadata as LipSyncMetadata
      const taskId = metadata.task_id!


      try {
        // Get task status from NewportAI API
        const statusResult = await getLipSyncTaskStatus(taskId)

        if (!statusResult.success || !statusResult.task) {
          results.push({
            id: generation.id,
            task_id: taskId,
            status: 'processing',
            error: statusResult.error,
          })
          continue
        }

        const task = statusResult.task

        if (task.status === 'completed' && task.videoUrl) {
          // Download video and upload to our Supabase Storage
          const uploadResult = await downloadAndUploadLipSyncVideo(
            task.videoUrl,
            generation.user_id,
            generation.id,
            adminClient
          )

          let finalVideoUrl = task.videoUrl
          if (uploadResult.success && uploadResult.storageUrl) {
            finalVideoUrl = uploadResult.storageUrl
          } else {
          }

          const { error: completeError } = await adminClient
            .from('generations')
            .update({
              status: 'completed',
              result_url: finalVideoUrl,
              metadata: {
                ...metadata,
                completed_at: new Date().toISOString(),
                original_url: task.videoUrl,
                storage_error: uploadResult.error || undefined,
              } as unknown as Json,
            })
            .eq('id', generation.id)

          if (completeError) {
            results.push({
              id: generation.id,
              task_id: taskId,
              status: 'processing',
              error: `DB update failed: ${completeError.message}`,
            })
          } else {
            results.push({
              id: generation.id,
              task_id: taskId,
              status: 'completed',
              videoUrl: finalVideoUrl,
            })
          }

        } else if (task.status === 'failed') {
          // Failed - update status and refund credits
          await adminClient
            .from('generations')
            .update({
              status: 'failed',
              metadata: {
                ...metadata,
                failed_at: new Date().toISOString(),
                error: task.error || 'LipSync generation failed',
                reason: task.error,
              } as unknown as Json,
            })
            .eq('id', generation.id)

          // Refund credits
          // Refund credits using centralized function
          // Note: We don't have the original split info, so refund all to subscription credits (default behavior)
          await refundCredits(
            adminClient,
            generation.user_id,
            generation.credits_used,
            generation.credits_used, // Refund all to subscription credits
            0,
            'LipSync generation failed'
          )

          results.push({
            id: generation.id,
            task_id: taskId,
            status: 'failed',
            error: task.error,
          })

        } else {
          // Still in progress (pending or processing)
          await adminClient
            .from('generations')
            .update({
              status: 'processing',
              metadata: metadata as unknown as Json,
            })
            .eq('id', generation.id)

          results.push({
            id: generation.id,
            task_id: taskId,
            status: 'processing',
          })
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        results.push({
          id: generation.id,
          task_id: taskId,
          status: 'processing',
          error: errorMessage,
        })
      }
    }

    const completed = results.filter(r => r.status === 'completed').length
    const failed = results.filter(r => r.status === 'failed').length
    const processing = results.filter(r => r.status === 'processing').length

    return NextResponse.json({
      success: true,
      checked: results.length,
      completed,
      failed,
      processing,
      results,
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

