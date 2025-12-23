/**
 * Veo 3.1 Async API Client
 *
 * Endpoint: https://api.laozhang.ai/v1/videos
 * Models: veo-3.1, veo-3.1-fl, veo-3.1-fast, veo-3.1-fast-fl,
 *         veo-3.1-landscape, veo-3.1-landscape-fl, etc.
 *
 * Flow: Create Task → Poll Status → Get Video
 *
 * Key differences from Sora 2:
 * - Model name determines aspect ratio, speed, and image-to-video support
 * - No separate size/seconds parameters
 * - Different pricing: Standard $0.25, Fast $0.15
 */

import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout'
import { retryWithBackoff, shouldRetryOnNetworkError } from '@/lib/utils/retry-with-backoff'
import { logger } from '@/lib/utils/logger'
import type { Veo3Model, Veo3AspectRatio, Veo3Speed } from '@/types/veo3'
import { buildVeo3ModelName } from '@/types/veo3'

const VEO3_API_BASE = 'https://api.laozhang.ai/v1/videos'

// Response types
export interface CreateTaskResponse {
  success: boolean
  taskId?: string
  error?: string
}

export interface TaskStatus {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  videoUrl?: string
  error?: string
  duration?: number
  resolution?: string
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

    logger.debug(`[Veo3] Converting URL to base64: ${url.substring(0, 50)}...`)

    const response = await fetchWithTimeout(url, { timeout: 30000 })
    if (!response.ok) {
      logger.error(`[Veo3] Failed to fetch image: ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${contentType};base64,${base64}`

    logger.debug(`[Veo3] Converted to base64: ${Math.round(base64.length / 1024)}KB`)

    return dataUrl
  } catch (error) {
    logger.error(`[Veo3] Error converting URL to base64:`, error)
    return null
  }
}

/**
 * Create video generation task
 *
 * POST /v1/videos
 * - Text-to-video: JSON body with model, prompt
 * - Image-to-video: multipart/form-data with input_reference file
 *
 * Model name encodes all configuration (aspect, speed, image support)
 */
export async function createTask(
  prompt: string,
  aspectRatio: Veo3AspectRatio = 'portrait',
  speed: Veo3Speed = 'fast',
  imageUrl?: string
): Promise<CreateTaskResponse> {
  const apiKey = process.env.LAOZHANG_API_KEY

  if (!apiKey) {
    return { success: false, error: 'LAOZHANG_API_KEY not configured' }
  }

  try {
    // Determine if we have an image (base64)
    const hasImage = imageUrl && imageUrl.startsWith('data:')

    // Build the model name based on config
    const model: Veo3Model = buildVeo3ModelName({
      aspectRatio,
      speed,
      hasImage: !!hasImage
    })

    let response: Response

    if (hasImage) {
      // Image-to-video: Use multipart/form-data with base64 image
      const imageData = base64ToBlob(imageUrl)
      if (!imageData) {
        return { success: false, error: 'Invalid image data' }
      }

      const formData = new FormData()
      formData.append('model', model)
      formData.append('prompt', prompt)

      // Get file extension from mime type
      const ext = imageData.mimeType.split('/')[1] || 'png'
      const filename = `image.${ext}`

      // Create a File object from Blob for proper multipart handling
      const file = new File([imageData.blob], filename, { type: imageData.mimeType })
      formData.append('input_reference', file)

      logger.debug(`[Veo3 Async] Creating image-to-video task: model=${model}`)

      response = await retryWithBackoff(
        () => fetchWithTimeout(VEO3_API_BASE, {
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
        model,
        prompt
      }

      logger.debug(`[Veo3 Async] Creating text-to-video task`)

      response = await retryWithBackoff(
        () => fetchWithTimeout(VEO3_API_BASE, {
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
      logger.error(`[Veo3 Async] Create task failed: ${errorMsg}`)
      return { success: false, error: errorMsg }
    }

    const data = await response.json()

    logger.debug(`[Veo3 Async] API response received`)

    // API can return id in different fields: id, task_id, or data.id
    const taskId = data.id || data.task_id || data.data?.id

    if (!taskId) {
      logger.error(`[Veo3 Async] No task ID found in response`)
      return { success: false, error: 'No task ID in response' }
    }

    logger.debug(`[Veo3 Async] Task created: ${taskId}`)
    return { success: true, taskId }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[Veo3 Async] Create task error: ${errorMsg}`)
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
      () => fetchWithTimeout(`${VEO3_API_BASE}/${taskId}`, {
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

    // Map API status to internal status
    const apiStatus = data.status
    let status: TaskStatus['status'] = 'queued'
    if (apiStatus === 'queued' || apiStatus === 'submitted') {
      status = 'queued'
    } else if (apiStatus === 'processing' || apiStatus === 'in_progress') {
      status = 'processing'
    } else if (apiStatus === 'completed') {
      status = 'completed'
    } else if (apiStatus === 'failed') {
      status = 'failed'
    }

    const task: TaskStatus = {
      id: data.id,
      status,
      progress: data.progress || 0
    }

    // If completed, add video URL
    if (status === 'completed') {
      const videoUrl = data.video_url || data.url
      if (videoUrl) {
        task.videoUrl = videoUrl.startsWith('http')
          ? videoUrl
          : `https://api.laozhang.ai${videoUrl}`
      }
      task.duration = data.duration
      task.resolution = data.resolution
    }

    // If failed, add error
    if (status === 'failed' && data.error) {
      task.error = data.error.message || data.error || 'Generation failed'
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
 * Get video content/download URL
 *
 * GET /v1/videos/{task_id}/content
 */
export async function getVideoUrl(taskId: string): Promise<string | undefined> {
  const apiKey = process.env.LAOZHANG_API_KEY

  if (!apiKey) {
    return undefined
  }

  try {
    const response = await fetchWithTimeout(`${VEO3_API_BASE}/${taskId}/content`, {
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

    // Response might have url field or be a redirect
    const data = await response.json().catch(() => null)
    if (data?.url) {
      return data.url
    }

    return response.url || `${VEO3_API_BASE}/${taskId}/content`

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
    logger.debug(`[Veo3 Storage] Downloading video`)

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

    logger.debug(`[Veo3 Storage] Downloaded video: ${(videoBlob.length / 1024 / 1024).toFixed(2)}MB`)

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
      logger.error(`[Veo3 Storage] Upload failed: ${uploadError.message}`)
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    logger.debug(`[Veo3 Storage] Uploaded successfully`)

    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    const storageUrl = publicUrlData.publicUrl

    logger.debug(`[Veo3 Storage] Upload successful`)

    return { success: true, storageUrl }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[Veo3 Storage] Error: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}
