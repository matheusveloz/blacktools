import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import type { NanoBananaStatus, NanoBananaAspectRatio, NanoBananaResolution, NanoBananaModel } from '@/types/nanobanana'

interface GenerationMetadata {
  prompt?: string
  model?: NanoBananaModel
  aspectRatio?: NanoBananaAspectRatio
  resolution?: NanoBananaResolution
  referenceImages?: string[]
  error?: string
  completed_at?: string
  failed_at?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const adminClient = createAdminClient()

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

    const searchParams = request.nextUrl.searchParams
    const generationId = searchParams.get('id')

    if (generationId) {
      // Get single generation
      const { data: generation, error: fetchError } = await adminClient
        .from('generations')
        .select('*')
        .eq('id', generationId)
        .eq('user_id', user.id)
        .eq('tool', 'avatar')
        .single()

      if (fetchError || !generation) {
        return NextResponse.json(
          { error: 'Generation not found' },
          { status: 404 }
        )
      }

      const metadata = generation.metadata as GenerationMetadata

      return NextResponse.json({
        success: true,
        generation: {
          id: generation.id,
          status: generation.status as NanoBananaStatus,
          result_url: generation.result_url,
          credits_used: generation.credits_used,
          created_at: generation.created_at,
          prompt: metadata?.prompt || '',
          model: metadata?.model,
          aspectRatio: metadata?.aspectRatio,
          resolution: metadata?.resolution,
          referenceImages: metadata?.referenceImages,
          error: metadata?.error,
          completed_at: metadata?.completed_at,
          failed_at: metadata?.failed_at
        }
      })
    }

    // Get all avatar generations for user
    const { data: generations, error: fetchError } = await adminClient
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .eq('tool', 'avatar')
      .order('created_at', { ascending: false })
      .limit(50)

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch generations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      generations: generations.map(gen => {
        const metadata = gen.metadata as GenerationMetadata
        return {
          id: gen.id,
          status: gen.status as NanoBananaStatus,
          result_url: gen.result_url,
          credits_used: gen.credits_used,
          created_at: gen.created_at,
          prompt: metadata?.prompt || '',
          model: metadata?.model,
          aspectRatio: metadata?.aspectRatio,
          resolution: metadata?.resolution,
          referenceImages: metadata?.referenceImages,
          error: metadata?.error
        }
      })
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
