import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { uploadSchema } from '@/lib/schemas/api'

export const maxDuration = 60

export async function POST(request: NextRequest) {
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
    const rateLimit = await checkRateLimit(rateLimiters.upload, user.id)
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

    // Validate Content-Length header before processing (prevent oversized uploads)
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const maxContentLength = 150 * 1024 * 1024 // 150MB max (larger than any file type max)
      const parsedLength = parseInt(contentLength, 10)
      
      if (!isNaN(parsedLength) && parsedLength > maxContentLength) {
        return NextResponse.json(
          { error: 'Request body too large. Maximum size: 150MB' },
          { status: 413 }
        )
      }
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate type with Zod schema
    const typeValidation = uploadSchema.safeParse({ type })
    if (!typeValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: typeValidation.error.errors 
        },
        { status: 400 }
      )
    }

    const validatedType = typeValidation.data.type

    // Define allowed MIME types for each file type
    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'], // mp4, webm, mov, avi
      audio: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/m4a', 'audio/x-m4a', 'audio/x-wav'], // mp3, wav, m4a, webm
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] // jpg, png, webp, gif
    }

    // Define allowed file extensions for each file type
    const allowedExtensions = {
      video: ['mp4', 'webm', 'mov', 'avi'],
      audio: ['mp3', 'wav', 'm4a', 'webm'],
      image: ['jpg', 'jpeg', 'png', 'webp', 'gif']
    }

    // Validate MIME type
    const allowedMimeTypes = allowedTypes[validatedType as keyof typeof allowedTypes]
    if (!allowedMimeTypes || !allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Expected ${validatedType} with MIME types: ${allowedMimeTypes.join(', ')}, got ${file.type}` },
        { status: 400 }
      )
    }

    // Validate file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    const allowedExts = allowedExtensions[validatedType as keyof typeof allowedExtensions]
    if (!extension || !allowedExts || !allowedExts.includes(extension)) {
      return NextResponse.json(
        { error: `Invalid file extension: ${extension}. Allowed extensions for ${validatedType}: ${allowedExts.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size (video: 100MB, audio: 50MB, image: 10MB)
    const maxSize = validatedType === 'video' ? 100 * 1024 * 1024 : validatedType === 'audio' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Determine bucket and file path
    // Use validated extension from above (already validated)
    const bucketName = validatedType === 'video' ? 'videos' : validatedType === 'audio' ? 'audios' : 'images'
    const fileName = `${user.id}/${validatedType}-${Date.now()}.${extension}`


    // Try to create bucket (will fail silently if exists)
    try {
      await adminClient.storage.createBucket(bucketName, { public: true })
    } catch {
      // Bucket likely already exists
    }

    // Convert File to ArrayBuffer then to Uint8Array for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload file
    const { data, error: uploadError } = await adminClient.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }


    // Get public URL
    const { data: publicUrlData } = adminClient.storage
      .from(bucketName)
      .getPublicUrl(fileName)


    return NextResponse.json({
      success: true,
      publicUrl: publicUrlData.publicUrl,
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
