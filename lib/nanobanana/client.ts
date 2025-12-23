/**
 * Nano Banana 2 (Gemini 3 Pro Image) API Client
 *
 * Endpoint: https://api.laozhang.ai/v1beta/models/gemini-3-pro-image-preview:generateContent
 *
 * Features:
 * - Text-to-image generation
 * - Image-to-image with up to 14 reference images
 * - Supports 10 aspect ratios
 * - Supports 1K, 2K, 4K resolutions
 *
 * This is a SYNCHRONOUS API - returns image directly in ~10 seconds
 */

import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout'
import { logger } from '@/lib/utils/logger'
import type { NanoBananaAspectRatio, NanoBananaResolution } from '@/types/nanobanana'

const NANOBANANA_API_BASE = 'https://api.laozhang.ai/v1beta/models/gemini-3-pro-image-preview:generateContent'

export interface GenerateImageResponse {
  success: boolean
  imageBase64?: string
  mimeType?: string
  error?: string
}

/**
 * Convert URL to base64 data
 */
export async function urlToBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    // If already base64 data URL, parse and return
    if (url.startsWith('data:')) {
      const matches = url.match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        return { data: matches[2], mimeType: matches[1] }
      }
      return null
    }

    logger.debug(`[NanoBanana] Converting URL to base64`)

    const response = await fetchWithTimeout(url, { timeout: 30000 })
    if (!response.ok) {
      logger.error(`[NanoBanana] Failed to fetch image: ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    logger.debug(`[NanoBanana] Converted to base64: ${Math.round(base64.length / 1024)}KB`)

    return { data: base64, mimeType: contentType }
  } catch (error) {
    logger.error(`[NanoBanana] Error converting URL to base64:`, error)
    return null
  }
}

/**
 * Generate image using Nano Banana 2 API
 *
 * @param prompt - Text prompt describing the image
 * @param aspectRatio - Aspect ratio (default: 1:1)
 * @param resolution - Resolution: 1K, 2K, or 4K (default: 1K)
 * @param referenceImages - Optional array of base64 image data URLs (up to 14)
 */
export async function generateImage(
  prompt: string,
  aspectRatio: NanoBananaAspectRatio = '1:1',
  resolution: NanoBananaResolution = '1K',
  referenceImages?: string[]
): Promise<GenerateImageResponse> {
  const apiKey = process.env.LAOZHANG_API_KEY

  if (!apiKey) {
    return { success: false, error: 'LAOZHANG_API_KEY not configured' }
  }

  try {
    // Build parts array - start with text prompt
    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
      { text: prompt }
    ]

    // Add reference images if provided (up to 14)
    if (referenceImages && referenceImages.length > 0) {
      const imagesToProcess = referenceImages.slice(0, 14) // Max 14 images

      for (const imageUrl of imagesToProcess) {
        const imageData = await urlToBase64(imageUrl)
        if (imageData) {
          parts.push({
            inline_data: {
              mime_type: imageData.mimeType,
              data: imageData.data
            }
          })
        }
      }

      logger.debug(`[NanoBanana] Added ${parts.length - 1} reference images`)
    }

    const requestBody = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio,
          imageSize: resolution
        }
      }
    }

    logger.debug(`[NanoBanana] Generating image:`, {
      prompt: prompt.substring(0, 50) + '...',
      aspectRatio,
      resolution,
      referenceImages: referenceImages?.length || 0
    })

    const response = await fetchWithTimeout(NANOBANANA_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      timeout: 60000 // 60s for image generation (can take time)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData?.error?.message || `API error: ${response.status}`
      logger.error(`[NanoBanana] API error: ${errorMsg}`)
      return { success: false, error: errorMsg }
    }

    const data = await response.json()

    // Extract image from response
    // Response format: { candidates: [{ content: { parts: [{ inlineData: { data, mimeType } }] } }] }
    const imageData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData

    if (!imageData?.data) {
      logger.error(`[NanoBanana] No image in response`)
      return { success: false, error: 'No image in response' }
    }

    logger.debug(`[NanoBanana] Image generated successfully (${Math.round(imageData.data.length / 1024)}KB)`)

    return {
      success: true,
      imageBase64: imageData.data,
      mimeType: imageData.mimeType || 'image/png'
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[NanoBanana] Error:`, errorMsg)
    return { success: false, error: errorMsg }
  }
}

/**
 * Upload base64 image to Supabase Storage
 * Returns the public URL
 */
export async function uploadImageToStorage(
  imageBase64: string,
  mimeType: string,
  userId: string,
  generationId: string,
  adminClient: import('@supabase/supabase-js').SupabaseClient
): Promise<{ success: boolean; storageUrl?: string; error?: string }> {
  const BUCKET_NAME = 'images'

  try {
    logger.debug(`[NanoBanana Storage] Uploading image...`)

    // Convert base64 to Uint8Array
    const binaryString = atob(imageBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Determine file extension from mime type
    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png'
    const timestamp = Date.now()
    const filePath = `${userId}/${generationId}-${timestamp}.${ext}`

    // Upload to Supabase Storage
    const { data, error: uploadError } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, bytes, {
        contentType: mimeType,
        cacheControl: '31536000', // 1 year cache
        upsert: false
      })

    if (uploadError) {
      logger.error(`[NanoBanana Storage] Upload failed:`, uploadError.message)
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    logger.debug(`[NanoBanana Storage] Uploaded to: ${data.path}`)

    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    const storageUrl = publicUrlData.publicUrl

    logger.debug(`[NanoBanana Storage] Upload successful`)

    return { success: true, storageUrl }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[NanoBanana Storage] Error:`, errorMsg)
    return { success: false, error: errorMsg }
  }
}
