import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'

const TOOL_NAME = 'infinitetalk'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = await createAdminClient()

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

    // Verify generation exists and belongs to user
    const { data: generation, error: fetchError } = await adminClient
      .from('generations')
      .select('id, user_id, tool')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .eq('tool', TOOL_NAME)
      .single()

    if (fetchError || !generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    // Delete the generation
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


    return NextResponse.json({
      success: true,
      message: 'Generation deleted successfully',
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
