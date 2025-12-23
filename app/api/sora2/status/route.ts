import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { TOOLS } from '@/lib/constants'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
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

    // Get generation ID from query params
    const searchParams = request.nextUrl.searchParams
    const generationId = searchParams.get('id')

    if (!generationId) {
      // Return all user's Sora 2 generations if no ID provided
      const { data: generations, error: fetchError } = await adminClient
        .from('generations')
        .select('id, status, result_url, credits_used, created_at, metadata')
        .eq('user_id', user.id)
        .eq('tool', TOOLS.SORA2)
        .order('created_at', { ascending: false })
        .limit(20)

      if (fetchError) {
        return NextResponse.json(
          { error: 'Failed to fetch generations' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        generations: generations?.map(g => {
          const meta = g.metadata as {
            prompt?: string
            progress?: number
            error?: string
          }
          return {
            id: g.id,
            status: g.status,
            result_url: g.result_url,
            credits_used: g.credits_used,
            created_at: g.created_at,
            prompt: meta?.prompt,
            progress: meta?.progress ?? 0,
            error: meta?.error
          }
        }) || []
      })
    }

    // Get specific generation
    const { data: generation, error: fetchError } = await adminClient
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id) // Ensure user owns this generation
      .single()

    if (fetchError || !generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    const metadata = generation.metadata as {
      prompt?: string
      model?: string
      imageUrl?: string
      task_id?: string
      progress?: number
      error?: string
      created_at?: string
      completed_at?: string
      failed_at?: string
    }

    return NextResponse.json({
      success: true,
      generation: {
        id: generation.id,
        status: generation.status,
        result_url: generation.result_url,
        credits_used: generation.credits_used,
        created_at: generation.created_at,
        prompt: metadata?.prompt,
        model: metadata?.model,
        imageUrl: metadata?.imageUrl,
        task_id: metadata?.task_id,
        progress: metadata?.progress ?? 0,
        error: metadata?.error,
        completed_at: metadata?.completed_at,
        failed_at: metadata?.failed_at
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
