/**
 * NewportAI LipSync API Client
 *
 * Endpoints:
 * - POST https://api.newportai.com/api/async/lipsync - Create task
 * - POST https://api.newportai.com/api/getAsyncResult - Poll status
 *
 * Flow: Create Task → Poll Status → Get Video
 */

import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout'
import { retryWithBackoff, shouldRetryOnNetworkError } from '@/lib/utils/retry-with-backoff'
import { logger } from '@/lib/utils/logger'
import type {
  LipSyncVideoParams,
  NewportAICreateResponse,
  NewportAIPollingResponse,
  NewportAITaskStatus,
  LipSyncStatus,
} from '@/types/lipsync'

const NEWPORTAI_API_BASE = 'https://api.newportai.com/api'
const LIPSYNC_ENDPOINT = `${NEWPORTAI_API_BASE}/async/lipsync`
const POLLING_ENDPOINT = `${NEWPORTAI_API_BASE}/getAsyncResult`

// Response types
export interface CreateLipSyncTaskResponse {
  success: boolean
  taskId?: string
  error?: string
}

export interface LipSyncTaskStatus {
  taskId: string
  status: LipSyncStatus
  videoUrl?: string
  error?: string
  executionTime?: number
}

export interface LipSyncTaskStatusResponse {
  success: boolean
  task?: LipSyncTaskStatus
  error?: string
}

/**
 * Map NewportAI status code to our status
 */
function mapNewportAIStatus(status: NewportAITaskStatus): LipSyncStatus {
  switch (status) {
    case 1: return 'pending'     // task submission
    case 2: return 'processing'  // in progress
    case 3: return 'completed'   // success
    case 4: return 'failed'      // failure
    default: return 'pending'
  }
}

/**
 * Create LipSync task
 *
 * POST /api/async/lipsync
 */
export async function createLipSyncTask(
  srcVideoUrl: string,
  audioUrl: string,
  videoParams?: LipSyncVideoParams
): Promise<CreateLipSyncTaskResponse> {
  const apiKey = process.env.NEWPORTAI_API_KEY

  if (!apiKey) {
    return { success: false, error: 'NEWPORTAI_API_KEY not configured' }
  }

  try {
    const requestBody = {
      srcVideoUrl,
      audioUrl,
      videoParams: videoParams || {
        video_width: 0,
        video_height: 0,
        video_enhance: 1,
      },
    }

    logger.debug(`[LipSync] Creating task`)

    const response = await retryWithBackoff(
      () => fetchWithTimeout(LIPSYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        timeout: 30000
      }),
      {
        maxRetries: 3,
        initialDelay: 1000,
        shouldRetry: shouldRetryOnNetworkError
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`[LipSync] API error: ${response.status} - ${errorText.substring(0, 200)}`)
      return { success: false, error: `API error: ${response.status}` }
    }

    const data: NewportAICreateResponse = await response.json()

    logger.debug(`[LipSync] API response received`)

    if (data.code !== 0) {
      logger.error(`[LipSync] Task creation failed: ${data.message}`)
      return { success: false, error: data.message || 'Task creation failed' }
    }

    const taskId = data.data?.taskId

    if (!taskId) {
      logger.error(`[LipSync] No task ID in response`)
      return { success: false, error: 'No task ID in response' }
    }

    logger.debug(`[LipSync] Task created: ${taskId}`)
    return { success: true, taskId }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[LipSync] Create task error: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}

/**
 * Poll task status
 *
 * POST /api/getAsyncResult
 */
export async function getLipSyncTaskStatus(taskId: string): Promise<LipSyncTaskStatusResponse> {
  const apiKey = process.env.NEWPORTAI_API_KEY

  if (!apiKey) {
    return { success: false, error: 'NEWPORTAI_API_KEY not configured' }
  }

  try {
    const response = await retryWithBackoff(
      () => fetchWithTimeout(POLLING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
        timeout: 30000
      }),
      {
        maxRetries: 3,
        initialDelay: 1000,
        shouldRetry: shouldRetryOnNetworkError
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: `API error: ${response.status} - ${errorText}` }
    }

    const data: NewportAIPollingResponse = await response.json()

    if (data.code !== 0) {
      return { success: false, error: data.message || 'Failed to get status' }
    }

    const taskData = data.data?.task
    if (!taskData) {
      return { success: false, error: 'No task data in response' }
    }

    const task: LipSyncTaskStatus = {
      taskId: taskData.taskId,
      status: mapNewportAIStatus(taskData.status),
      executionTime: taskData.executionTime,
    }

    // If completed, get video URL
    if (taskData.status === 3 && data.data?.videos?.length) {
      task.videoUrl = data.data.videos[0].videoUrl
    }

    // If failed, get error reason
    if (taskData.status === 4) {
      task.error = taskData.reason || 'Task failed'
    }

    return { success: true, task }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Download video from NewportAI and upload to Supabase Storage
 * Handles large files with proper timeout and size limits
 */
export async function downloadAndUploadLipSyncVideo(
  externalUrl: string,
  userId: string,
  generationId: string,
  adminClient: import('@supabase/supabase-js').SupabaseClient
): Promise<{ success: boolean; storageUrl?: string; error?: string }> {
  const BUCKET_NAME = 'videos'
  const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB max (Supabase Pro allows up to 5GB)

  try {
    logger.debug(`[LipSync Storage] Downloading video`)

    // Download the video with timeout using fetchWithTimeout
    // Use longer timeout for video downloads (60s)
    const response = await fetchWithTimeout(externalUrl, {
      timeout: 60000 // 60s timeout for video downloads
    })

    if (!response.ok) {
      return { success: false, error: `Failed to download video: ${response.status}` }
    }

    // Check content-length if available
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength, 10)
      logger.debug(`[LipSync Storage] Video size: ${(size / 1024 / 1024).toFixed(2)}MB`)

      if (size > MAX_FILE_SIZE) {
        logger.warn(`[LipSync Storage] Video too large: ${(size / 1024 / 1024).toFixed(2)}MB`)
        return { success: false, error: `Video too large: ${(size / 1024 / 1024).toFixed(0)}MB exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }
      }
    }

    // Get the video as ArrayBuffer
    const videoBuffer = await response.arrayBuffer()
    const videoBlob = new Uint8Array(videoBuffer)
    const fileSizeMB = videoBlob.length / 1024 / 1024

    logger.debug(`[LipSync Storage] Downloaded: ${fileSizeMB.toFixed(2)}MB`)

    // Double-check size after download (in case content-length was missing)
    if (videoBlob.length > MAX_FILE_SIZE) {
      logger.warn(`[LipSync Storage] Video too large after download`)
      return { success: false, error: `Video too large: ${fileSizeMB.toFixed(0)}MB` }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filePath = `${userId}/lipsync-${generationId}-${timestamp}.mp4`

    logger.debug(`[LipSync Storage] Uploading to ${BUCKET_NAME}`)

    // Ensure bucket exists (create if not)
    try {
      const { error: bucketError } = await adminClient.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 524288000, // 500MB
      })
      if (bucketError && !bucketError.message.includes('already exists')) {
        logger.warn(`[LipSync Storage] Bucket creation warning: ${bucketError.message}`)
      }
    } catch {
      // Bucket likely already exists, continue
    }

    // Upload to Supabase Storage
    const { data, error: uploadError } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, videoBlob, {
        contentType: 'video/mp4',
        cacheControl: '31536000', // 1 year cache
        upsert: true, // Allow overwrite if exists
      })

    if (uploadError) {
      logger.error(`[LipSync Storage] Upload failed: ${uploadError.message}`)
      // Check for common errors
      if (uploadError.message?.includes('Payload too large') || uploadError.message?.includes('413')) {
        return { success: false, error: `File too large for Supabase (Free: 50MB, Pro: 5GB). Video is ${fileSizeMB.toFixed(0)}MB` }
      }
      if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
        return { success: false, error: `Bucket 'videos' not found. Create it in Supabase Dashboard.` }
      }
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    logger.debug(`[LipSync Storage] Uploaded successfully`)

    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    const storageUrl = publicUrlData.publicUrl

    logger.debug(`[LipSync Storage] Public URL generated`)

    return { success: true, storageUrl }

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logger.error(`[LipSync Storage] Download timeout`)
      return { success: false, error: 'Download timeout - video too large' }
    }
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[LipSync Storage] Error: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}
