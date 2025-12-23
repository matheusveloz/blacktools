/**
 * Sora 2 Async API Client
 *
 * Endpoint: https://api.laozhang.ai/v1/videos
 * Model: ALWAYS 'sora-2' (NEVER use sora_video2-* names - those are Sync API!)
 *
 * Flow: Create Task → Poll Status → Get Video
 */

import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout'
import { retryWithBackoff, shouldRetryOnNetworkError } from '@/lib/utils/retry-with-backoff'
import { logger } from '@/lib/utils/logger'
import type { Sora2Size, Sora2Seconds } from '@/types/sora2'

const SORA2_API_BASE = 'https://api.laozhang.ai/v1/videos'

// The ONLY model name for Async API - NEVER change this!
const ASYNC_API_MODEL = 'sora-2'

// Response types
export interface CreateTaskResponse {
  success: boolean
  taskId?: string
  error?: string
}

export interface TaskStatus {
  id: string
  status: 'submitted' | 'in_progress' | 'completed' | 'failed'
  progress: number
  videoUrl?: string
  error?: string
}

export interface TaskStatusResponse {
  success: boolean
  task?: TaskStatus
  error?: string
}

/**
 * Convert base64 data URL to Blob for file upload
 */
function base64ToBlob(base64DataUrl: string): { blob: Blob; mimeType: string } | null {
  try {
    // Parse data URL: data:image/jpeg;base64,/9j/...
    const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) return null

    const mimeType = matches[1]
    const base64Data = matches[2]

    // Decode base64 to binary
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return { blob: new Blob([bytes], { type: mimeType }), mimeType }
  } catch {
    return null
  }
}

/**
 * Convert a URL to base64 data URL by fetching the image
 */
export async function urlToBase64(url: string): Promise<string | null> {
  try {
    // If already base64, return as-is
    if (url.startsWith('data:')) {
      return url
    }

    logger.debug(`[Sora2] Converting URL to base64: ${url.substring(0, 50)}...`)

    const response = await fetchWithTimeout(url, { timeout: 30000 })
    if (!response.ok) {
      logger.error(`[Sora2] Failed to fetch image: ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${contentType};base64,${base64}`

    logger.debug(`[Sora2] Converted to base64 (${Math.round(base64.length / 1024)}KB)`)

    return dataUrl
  } catch (error) {
    logger.error(`[Sora2] Error converting URL to base64:`, error)
    return null
  }
}


/**
 * Create video generation task
 *
 * POST /v1/videos
 * - Text-to-video: JSON body with model, prompt, size, seconds
 * - Image-to-video: multipart/form-data with input_reference file
 *
 * ALWAYS sends model: 'sora-2' with size and seconds as separate params
 */
export async function createTask(
  prompt: string,
  size: Sora2Size = '1280x720',
  seconds: Sora2Seconds = '15',
  imageUrl?: string
): Promise<CreateTaskResponse> {
  const apiKey = process.env.LAOZHANG_API_KEY

  if (!apiKey) {
    return { success: false, error: 'LAOZHANG_API_KEY not configured' }
  }

  try {
    let response: Response

    // Check if we have an image for image-to-video (must be base64)
    if (imageUrl && imageUrl.startsWith('data:')) {
      // Image-to-video: Use multipart/form-data with base64 image
      const imageData = base64ToBlob(imageUrl)
      if (!imageData) {
        return { success: false, error: 'Invalid image data' }
      }

      const formData = new FormData()
      formData.append('model', ASYNC_API_MODEL)
      formData.append('prompt', prompt)
      formData.append('size', size)
      formData.append('seconds', seconds)

      // Get file extension from mime type
      const ext = imageData.mimeType.split('/')[1] || 'png'
      const filename = `image.${ext}`

      // Create a File object from Blob for proper multipart handling
      // This ensures filename and content-type are sent correctly
      const file = new File([imageData.blob], filename, { type: imageData.mimeType })
      formData.append('input_reference', file)

      // Log removed - use logger if needed

      response = await retryWithBackoff(
        () => fetchWithTimeout(SORA2_API_BASE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
            // Don't set Content-Type - fetch will set it with boundary for FormData
          },
          body: formData,
          timeout: 30000
        }),
        {
          maxRetries: 3,
          initialDelay: 1000,
          shouldRetry: shouldRetryOnNetworkError
        }
      )
    } else {
      // Text-to-video: Use JSON
      const requestBody = {
        model: ASYNC_API_MODEL,
        prompt,
        size,
        seconds
      }

      // Log removed - use logger if needed

      response = await retryWithBackoff(
        () => fetchWithTimeout(SORA2_API_BASE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
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
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData?.error?.message || `API error: ${response.status}`
      // Error logged in retry logic
      return { success: false, error: errorMsg }
    }

    const data = await response.json()

    // Log removed - use logger if needed

    // API can return id in different fields: id, task_id, or data.id
    const taskId = data.id || data.task_id || data.data?.id

    if (!taskId) {
      logger.error(`[Sora2 Async] No task ID found in response`)
      return { success: false, error: 'No task ID in response' }
    }

    logger.debug(`[Sora2 Async] Task created successfully`)
    return { success: true, taskId }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[Sora2 Async] Create task error: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}

/**
 * Query task status
 *
 * GET /v1/videos/{task_id}
 */
export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const apiKey = process.env.LAOZHANG_API_KEY

  if (!apiKey) {
    return { success: false, error: 'LAOZHANG_API_KEY not configured' }
  }

  try {
    const response = await retryWithBackoff(
      () => fetchWithTimeout(`${SORA2_API_BASE}/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000
      }),
      {
        maxRetries: 3,
        initialDelay: 1000,
        shouldRetry: shouldRetryOnNetworkError
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData?.error?.message || `API error: ${response.status}`
      }
    }

    const data = await response.json()

    const task: TaskStatus = {
      id: data.id,
      status: data.status,
      progress: data.progress || 0
    }

    // If completed, add video URL
    // API can return full URL in video_url or url field
    if (data.status === 'completed') {
      const videoUrl = data.video_url || data.url
      if (videoUrl) {
        // Check if already a full URL or relative path
        task.videoUrl = videoUrl.startsWith('http')
          ? videoUrl
          : `https://api.laozhang.ai${videoUrl}`
      }
    }

    // If failed, add error
    if (data.status === 'failed' && data.error) {
      task.error = data.error.message || 'Generation failed'
    }

    return { success: true, task }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get video download URL
 *
 * GET /v1/videos/{task_id}/content
 */
export async function getVideoUrl(taskId: string): Promise<string | undefined> {
  const apiKey = process.env.LAOZHANG_API_KEY

  if (!apiKey) {
    return undefined
  }

  try {
    const response = await fetchWithTimeout(`${SORA2_API_BASE}/${taskId}/content`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      redirect: 'follow',
      timeout: 30000
    })

    if (!response.ok) {
      return undefined
    }

    return response.url || `${SORA2_API_BASE}/${taskId}/content`

  } catch {
    return undefined
  }
}

/**
 * Download video from external URL and upload to Supabase Storage
 * Returns the public URL from Storage
 */
export async function downloadAndUploadVideo(
  externalUrl: string,
  userId: string,
  generationId: string,
  adminClient: import('@supabase/supabase-js').SupabaseClient
): Promise<{ success: boolean; storageUrl?: string; error?: string }> {
  const BUCKET_NAME = 'videos'
  
  try {
    logger.debug(`[Sora2 Storage] Downloading video`)
    
    // Download the video from external URL
    const response = await fetchWithTimeout(externalUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.LAOZHANG_API_KEY}`
      },
      timeout: 60000 // 60s for video downloads
    })
    
    if (!response.ok) {
      return { success: false, error: `Failed to download video: ${response.status}` }
    }
    
    // Get the video as ArrayBuffer
    const videoBuffer = await response.arrayBuffer()
    const videoBlob = new Uint8Array(videoBuffer)
    
    logger.debug(`[Sora2 Storage] Downloaded: ${(videoBlob.length / 1024 / 1024).toFixed(2)}MB`)
    
    // Generate unique filename: userId/generationId-timestamp.mp4
    const timestamp = Date.now()
    const filePath = `${userId}/${generationId}-${timestamp}.mp4`
    
    // Upload to Supabase Storage
    const { data, error: uploadError } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, videoBlob, {
        contentType: 'video/mp4',
        cacheControl: '31536000', // 1 year cache
        upsert: false
      })
    
    if (uploadError) {
      logger.error(`[Sora2 Storage] Upload failed: ${uploadError.message}`)
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }
    
    logger.debug(`[Sora2 Storage] Uploaded successfully`)
    
    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)
    
    const storageUrl = publicUrlData.publicUrl
    
    logger.debug(`[Sora2 Storage] Public URL generated`)
    
    return { success: true, storageUrl }
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[Sora2 Storage] Error: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}
