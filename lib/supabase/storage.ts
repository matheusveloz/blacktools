'use client'

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

export interface UploadResult {
  success: boolean
  publicUrl?: string
  error?: string
}

/**
 * Upload a file directly to Supabase Storage (bypasses Vercel's body size limit)
 * This allows uploading files up to 50MB (Supabase free tier limit)
 */
export async function uploadFileToStorage(
  file: File,
  userId: string,
  type: 'video' | 'audio' | 'image'
): Promise<UploadResult> {
  try {
    logger.debug(`[Storage] Uploading ${type}: ${file.name.substring(0, 50)}... (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Validate file size (video: 100MB, audio: 50MB, image: 10MB)
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : type === 'audio' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` }
    }

    // Define allowed MIME types
    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/m4a', 'audio/x-m4a', 'audio/x-wav'],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    }

    // Validate MIME type
    const allowedMimeTypes = allowedTypes[type]
    if (!allowedMimeTypes.includes(file.type)) {
      return { success: false, error: `Invalid file type. Expected ${type}, got ${file.type}` }
    }

    // Get file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'

    // Determine bucket name
    const bucketName = type === 'video' ? 'videos' : type === 'audio' ? 'audios' : 'images'
    const fileName = `${userId}/${type}-${Date.now()}.${extension}`

    // Get Supabase client and upload directly
    const supabase = createClient()

    // Upload file directly to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      logger.error(`[Storage] Upload error:`, uploadError.message)
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    logger.debug(`[Storage] Upload successful`)
    return { success: true, publicUrl: publicUrlData.publicUrl }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`[Storage] Exception:`, errorMsg)
    return { success: false, error: errorMsg }
  }
}

/**
 * Convert file to base64 (for small files or fallback)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
