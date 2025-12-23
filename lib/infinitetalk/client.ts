/**
 * WaveSpeed InfiniteTalk API Client
 *
 * Endpoints (API v3):
 * - POST https://api.wavespeed.ai/api/v3/wavespeed-ai/wan-2.2/speech-to-video - Create prediction
 * - GET https://api.wavespeed.ai/api/v3/predictions/{request_id}/result - Poll status
 *
 * Request body:
 * - image: string (URL da imagem)
 * - audio: string (URL do áudio)
 * - resolution: '480p' | '720p'
 * - prompt: string (opcional)
 * - seed: number (-1 para random)
 *
 * Response:
 * - id: string (prediction ID)
 * - status: 'created' | 'processing' | 'completed' | 'failed'
 * - outputs: string[] (URLs dos vídeos gerados)
 *
 * Flow: Create Prediction → Poll Status → Get Video
 */

import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout'
import { retryWithBackoff, shouldRetryOnNetworkError } from '@/lib/utils/retry-with-backoff'
import { logger } from '@/lib/utils/logger'
import type {
  InfiniteTalkParams,
  WaveSpeedCreateResponse,
  WaveSpeedPollingResponse,
  WaveSpeedTaskStatus,
  InfiniteTalkStatus,
} from '@/types/infinitetalk'

// WaveSpeed API v3 endpoints (conforme documentação oficial)
const WAVESPEED_API_BASE = 'https://api.wavespeed.ai/api/v3'
const INFINITETALK_ENDPOINT = `${WAVESPEED_API_BASE}/wavespeed-ai/wan-2.2/speech-to-video`
const POLLING_ENDPOINT = 'https://api.wavespeed.ai/api/v3/predictions'

// Response types
export interface CreateInfiniteTalkTaskResponse {
  success: boolean
  predictionId?: string
  error?: string
}

export interface InfiniteTalkTaskStatus {
  predictionId: string
  status: InfiniteTalkStatus
  videoUrl?: string
  error?: string
}

export interface InfiniteTalkTaskStatusResponse {
  success: boolean
  task?: InfiniteTalkTaskStatus
  error?: string
}

/**
 * Map WaveSpeed status to our status
 */
function mapWaveSpeedStatus(status: WaveSpeedTaskStatus): InfiniteTalkStatus {
  switch (status) {
    case 'created': return 'pending'
    case 'processing': return 'processing'
    case 'completed': return 'completed'
    case 'failed': return 'failed'
    default: return 'pending'
  }
}

/**
 * Create InfiniteTalk prediction
 *
 * POST https://api.wavespeed.ai/api/v3/wavespeed-ai/wan-2.2/speech-to-video
 */
export async function createInfiniteTalkTask(
  imageUrl: string,
  audioUrl: string,
  params?: InfiniteTalkParams
): Promise<CreateInfiniteTalkTaskResponse> {
  const apiKey = process.env.WAVESPEED_API_KEY

  if (!apiKey) {
    return { success: false, error: 'WAVESPEED_API_KEY not configured' }
  }

  try {
    const requestBody = {
      image: imageUrl,
      audio: audioUrl,
      resolution: params?.resolution || '720p', // Default 720p
      prompt: params?.prompt || '',
      seed: params?.seed ?? -1,
    }

    logger.debug(`[InfiniteTalk] Creating task: endpoint=${INFINITETALK_ENDPOINT}`)

    const response = await retryWithBackoff(
      () => fetchWithTimeout(INFINITETALK_ENDPOINT, {
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
      logger.error(`[InfiniteTalk] API error: ${response.status} - ${errorText.substring(0, 200)}`)
      // Include full error details in the response
      return { success: false, error: `API error ${response.status}: ${errorText}` }
    }

    const rawResponse = await response.json()

    logger.debug(`[InfiniteTalk] API response: status=${response.status}`)

    // WaveSpeed API v3 pode retornar em diferentes formatos:
    // 1. { code: 200, message: "success", data: { id, ... } } (formato padrão v3)
    // 2. { id, ... } (direto)
    // 3. { data: { id, ... } }
    const raw = rawResponse as Record<string, unknown>
    
    // Verificar se há um código de erro na resposta
    if (raw.code && raw.code !== 200) {
      const errorMsg = (raw.message as string | undefined) || (raw.error as string | undefined) || 'API returned error code'
      logger.error(`[InfiniteTalk] API error code ${raw.code}: ${errorMsg}`)
      return {
        success: false,
        error: `API error ${raw.code}: ${errorMsg}`
      }
    }

    // Extrair dados - API v3 geralmente retorna { code, message, data: {...} }
    const data = (raw.data as unknown as Record<string, unknown>) || raw

    // Tentar extrair o ID de múltiplos campos possíveis
    const predictionId = (data?.id as string | undefined) ||
                         (raw?.id as string | undefined) ||
                         (data?.prediction_id as string | undefined) ||
                         (raw?.prediction_id as string | undefined) ||
                         (data?.request_id as string | undefined) ||
                         (raw?.request_id as string | undefined)

    if (!predictionId) {
      logger.error(`[InfiniteTalk] No prediction ID found in response`)
      return {
        success: false,
        error: `No prediction ID in response. Keys found: ${Object.keys(raw).join(', ')}. Response: ${JSON.stringify(raw).substring(0, 500)}`
      }
    }

    logger.debug(`[InfiniteTalk] Prediction created: ${predictionId}`)
    return { success: true, predictionId: predictionId }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[InfiniteTalk] Create task error: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}

/**
 * Poll prediction status
 *
 * GET https://api.wavespeed.ai/api/v3/predictions/{request_id}/result
 */
export async function getInfiniteTalkTaskStatus(predictionId: string): Promise<InfiniteTalkTaskStatusResponse> {
  const apiKey = process.env.WAVESPEED_API_KEY

  if (!apiKey) {
    return { success: false, error: 'WAVESPEED_API_KEY not configured' }
  }

  const pollUrl = `${POLLING_ENDPOINT}/${predictionId}/result`

  try {
    logger.debug(`[InfiniteTalk] Polling status: ${pollUrl}`)

    const response = await retryWithBackoff(
      () => fetchWithTimeout(pollUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
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
      const errorText = await response.text()
      logger.error(`[InfiniteTalk] Polling error ${response.status}: ${errorText.substring(0, 200)}`)
      return { success: false, error: `API error: ${response.status} - ${errorText}` }
    }

    const rawResponse = await response.json()

    logger.debug(`[InfiniteTalk] Polling response received`)

    // WaveSpeed API v3 wraps response in { code, message, data }
    const raw = rawResponse as Record<string, unknown>
    
    // Verificar se há um código de erro na resposta
    if (raw.code && raw.code !== 200) {
      const errorMsg = (raw.message as string | undefined) || (raw.error as string | undefined) || 'API returned error code'
      logger.error(`[InfiniteTalk] Polling error code ${raw.code}: ${errorMsg}`)
      return {
        success: false,
        error: `API error ${raw.code}: ${errorMsg}`
      }
    }

    // Extrair dados - API v3 geralmente retorna { code, message, data: {...} }
    const data: WaveSpeedPollingResponse = (raw.data as unknown as WaveSpeedPollingResponse) || (raw as unknown as WaveSpeedPollingResponse)

    if (!data.id) {
      logger.error(`[InfiniteTalk] No ID found in polling response`)
      return {
        success: false,
        error: `No ID in polling response. Response: ${JSON.stringify(raw).substring(0, 500)}`
      }
    }

    const task: InfiniteTalkTaskStatus = {
      predictionId: data.id,
      status: mapWaveSpeedStatus(data.status),
    }

    // If completed, get video URL from outputs
    if (data.status === 'completed' && data.outputs?.length > 0) {
      task.videoUrl = data.outputs[0]
    }

    // If failed
    if (data.status === 'failed') {
      task.error = data.error || 'Prediction failed'
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
 * Download video from WaveSpeed and upload to Supabase Storage
 * Handles large files with proper timeout and size limits
 */
export async function downloadAndUploadInfiniteTalkVideo(
  externalUrl: string,
  userId: string,
  generationId: string,
  adminClient: import('@supabase/supabase-js').SupabaseClient
): Promise<{ success: boolean; storageUrl?: string; error?: string }> {
  const BUCKET_NAME = 'videos'
  const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB max
  const DOWNLOAD_TIMEOUT = 5 * 60 * 1000 // 5 minutes timeout for download

  try {
    logger.debug(`[InfiniteTalk Storage] Downloading video`)

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
      logger.debug(`[InfiniteTalk Storage] Video size: ${(size / 1024 / 1024).toFixed(2)}MB`)

      if (size > MAX_FILE_SIZE) {
        logger.warn(`[InfiniteTalk Storage] Video too large: ${(size / 1024 / 1024).toFixed(2)}MB`)
        return { success: false, error: `Video too large: ${(size / 1024 / 1024).toFixed(0)}MB exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }
      }
    }

    // Get the video as ArrayBuffer
    const videoBuffer = await response.arrayBuffer()
    const videoBlob = new Uint8Array(videoBuffer)
    const fileSizeMB = videoBlob.length / 1024 / 1024

    logger.debug(`[InfiniteTalk Storage] Downloaded video: ${fileSizeMB.toFixed(2)}MB`)

    // Double-check size after download
    if (videoBlob.length > MAX_FILE_SIZE) {
        logger.warn(`[InfiniteTalk Storage] Video too large after download`)
      return { success: false, error: `Video too large: ${fileSizeMB.toFixed(0)}MB` }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filePath = `${userId}/infinitetalk-${generationId}-${timestamp}.mp4`

    logger.debug(`[InfiniteTalk Storage] Uploading to bucket: ${BUCKET_NAME}, path: ${filePath.substring(0, 50)}...`)

    // Ensure bucket exists
    try {
      const { error: bucketError } = await adminClient.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 524288000, // 500MB
      })
      if (bucketError && !bucketError.message.includes('already exists')) {
        logger.warn(`[InfiniteTalk Storage] Bucket creation warning: ${bucketError.message}`)
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
        upsert: true,
      })

    if (uploadError) {
      logger.error(`[InfiniteTalk Storage] Upload failed:`, uploadError.message)
      if (uploadError.message?.includes('Payload too large') || uploadError.message?.includes('413')) {
        return { success: false, error: `File too large for Supabase. Video is ${fileSizeMB.toFixed(0)}MB` }
      }
      if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
        return { success: false, error: `Bucket 'videos' not found. Create it in Supabase Dashboard.` }
      }
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    logger.debug(`[InfiniteTalk Storage] Uploaded successfully`)

    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    const storageUrl = publicUrlData.publicUrl

    logger.debug(`[InfiniteTalk Storage] Upload successful`)

    return { success: true, storageUrl }

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logger.error(`[InfiniteTalk Storage] Download timeout`)
      return { success: false, error: 'Download timeout - video too large' }
    }
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[InfiniteTalk Storage] Error: ${errorMsg}`)
    return { success: false, error: errorMsg }
  }
}
