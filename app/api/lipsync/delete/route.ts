import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { TOOLS } from '@/lib/constants'

export async function DELETE(request: NextRequest) {
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
    const rateLimit = await checkRateLimit(rateLimiters.general, user.id)
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
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      )
    }

    // Verify the generation belongs to this user and is a LipSync generation
    const { data: generation, error: fetchError } = await adminClient
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .eq('tool', TOOLS.LIPSYNC)
      .single()

    if (fetchError || !generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    // Delete from database
    const { error: deleteError } = await adminClient
      .from('generations')
      .delete()
      .eq('id', generationId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete generation' },
        { status: 500 }
      )
    }

    // Optionally delete the result video from storage if it exists
    if (generation.result_url) {
      try {
        // Extract path from URL if it's a Supabase storage URL
        const url = new URL(generation.result_url)
        if (url.hostname.includes('supabase')) {
          const pathMatch = generation.result_url.match(/\/videos\/(.+)$/)
          if (pathMatch) {
            await adminClient.storage.from('videos').remove([pathMatch[1]])
          }
        }
      } catch {
        // Ignore storage deletion errors
      }
    }


    return NextResponse.json({
      success: true,
      message: 'Generation deleted successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
