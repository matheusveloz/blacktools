import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { TOOLS } from '@/lib/constants'
import { getTaskStatus, getVideoUrl, downloadAndUploadVideo } from '@/lib/veo3/client'
import { refundCredits } from '@/lib/credits/utils'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/utils/logger'
import type { Veo3AspectRatio, Veo3Speed, Veo3Model } from '@/types/veo3'

/**
 * Veo 3 Process API - Polls task status and updates generations
 *
 * Flow (Async API):
 * 1. Find generations with status 'processing' that have a task_id
 * 2. Call getTaskStatus(task_id) for each
 * 3. Update progress in database
 * 4. If completed: set status='completed', save video URL
 * 5. If failed: set status='failed', refund credits
 */

// Max generations to check per call
const MAX_GENERATIONS_PER_CALL = 10

interface GenerationMetadata {
  prompt: string
  model?: Veo3Model
  aspectRatio?: Veo3AspectRatio
  speed?: Veo3Speed
  imageUrl?: string
  task_id?: string
  progress?: number
  created_at?: string
  completed_at?: string
  failed_at?: string
  error?: string
  duration?: number
  resolution?: string
  [key: string]: string | number | undefined
}

interface ProcessResult {
  id: string
  task_id: string
  status: string
  progress: number
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
      .eq('tool', TOOLS.VEO3)
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
      const metadata = gen.metadata as unknown as GenerationMetadata
      return metadata?.task_id
    })

    // Log generations WITHOUT task_id for debugging
    const generationsWithoutTaskId = (processingGenerations || []).filter(gen => {
      const metadata = gen.metadata as unknown as GenerationMetadata
      return !metadata?.task_id
    })

    if (generationsWithoutTaskId.length > 0) {
      logger.debug('[Veo3 Process] Generations without task_id:', 
        generationsWithoutTaskId.map(g => ({ id: g.id, status: g.status })))
    }

    if (generationsWithTaskId.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No processing generations to check',
        checked: 0,
        total_found: processingGenerations?.length || 0,
        without_task_id: generationsWithoutTaskId.length,
        results: []
      })
    }


    const results: ProcessResult[] = []

    for (const generation of generationsWithTaskId) {
      const metadata = generation.metadata as unknown as GenerationMetadata
      const taskId = metadata.task_id!


      try {
        // Get task status from Laozhang API
        const statusResult = await getTaskStatus(taskId)

        if (!statusResult.success || !statusResult.task) {
          results.push({
            id: generation.id,
            task_id: taskId,
            status: 'processing',
            progress: metadata.progress || 0,
            error: statusResult.error
          })
          continue
        }

        const task = statusResult.task

        // Update based on task status
        if (task.status === 'completed') {
          // Get the actual video URL from external API
          let externalVideoUrl = task.videoUrl
          if (!externalVideoUrl) {
            externalVideoUrl = await getVideoUrl(taskId)
          }

          if (externalVideoUrl) {
            // Download video and upload to our Supabase Storage
            const uploadResult = await downloadAndUploadVideo(
              externalVideoUrl,
              generation.user_id,
              generation.id,
              adminClient
            )

            if (uploadResult.success && uploadResult.storageUrl) {
              // Success - update with Storage URL (not external URL)
              const { error: completeError } = await adminClient
                .from('generations')
                .update({
                  status: 'completed',
                  result_url: uploadResult.storageUrl,
                  metadata: {
                    ...metadata,
                    progress: 100,
                    completed_at: new Date().toISOString(),
                    original_url: externalVideoUrl,
                    duration: task.duration,
                    resolution: task.resolution
                  }
                })
                .eq('id', generation.id)

              if (completeError) {
                results.push({
                  id: generation.id,
                  task_id: taskId,
                  status: 'processing',
                  progress: 100,
                  error: `DB update failed: ${completeError.message}`
                })
              } else {
                results.push({
                  id: generation.id,
                  task_id: taskId,
                  status: 'completed',
                  progress: 100,
                  videoUrl: uploadResult.storageUrl
                })
              }
            } else {
              // Upload to Storage failed - still save with external URL as fallback

              const { error: completeError } = await adminClient
                .from('generations')
                .update({
                  status: 'completed',
                  result_url: externalVideoUrl,
                  metadata: {
                    ...metadata,
                    progress: 100,
                    completed_at: new Date().toISOString(),
                    storage_error: uploadResult.error,
                    duration: task.duration,
                    resolution: task.resolution
                  }
                })
                .eq('id', generation.id)

              if (completeError) {
                results.push({
                  id: generation.id,
                  task_id: taskId,
                  status: 'processing',
                  progress: 100,
                  error: `DB update failed: ${completeError.message}`
                })
              } else {
                results.push({
                  id: generation.id,
                  task_id: taskId,
                  status: 'completed',
                  progress: 100,
                  videoUrl: externalVideoUrl
                })
              }
            }
          } else {
            // Completed but no video URL - mark as failed
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
            // Note: We don't have the original split info, so refund all to subscription credits (default behavior)
            await refundCredits(
              adminClient,
              generation.user_id,
              generation.credits_used,
              generation.credits_used, // Refund all to subscription credits
              0,
              'Veo3 generation failed - video URL not available'
            )

            results.push({
              id: generation.id,
              task_id: taskId,
              status: 'failed',
              progress: 100,
              error: 'Video completed but URL not available'
            })
          }

        } else if (task.status === 'failed') {
          // Failed - update status and refund
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
          // Note: We don't have the original split info, so refund all to subscription credits (default behavior)
          await refundCredits(
            adminClient,
            generation.user_id,
            generation.credits_used,
            generation.credits_used, // Refund all to subscription credits
            0,
            'Veo3 generation failed'
          )

          results.push({
            id: generation.id,
            task_id: taskId,
            status: 'failed',
            progress: task.progress || 0,
            error: task.error
          })

        } else {
          // Still in progress (queued or processing) - update progress
          await adminClient
            .from('generations')
            .update({
              status: 'processing',
              metadata: {
                ...metadata,
                progress: task.progress || 0
              }
            })
            .eq('id', generation.id)

          results.push({
            id: generation.id,
            task_id: taskId,
            status: 'processing',
            progress: task.progress || 0
          })
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        results.push({
          id: generation.id,
          task_id: taskId,
          status: 'processing',
          progress: metadata.progress || 0,
          error: errorMessage
        })
      }
    }

    // Count completed/failed/processing
    const completed = results.filter(r => r.status === 'completed').length
    const failed = results.filter(r => r.status === 'failed').length
    const processing = results.filter(r => r.status === 'processing').length

    return NextResponse.json({
      success: true,
      checked: results.length,
      completed,
      failed,
      processing,
      results
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

