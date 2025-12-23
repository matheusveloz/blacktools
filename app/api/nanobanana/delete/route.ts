import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'

export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const generationId = searchParams.get('id')

    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      )
    }

    // Verify the generation belongs to this user
    const { data: generation, error: fetchError } = await adminClient
      .from('generations')
      .select('id, status')
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

    // Don't allow deleting generations that are still processing
    if (generation.status === 'pending' || generation.status === 'processing') {
      return NextResponse.json(
        { error: 'Cannot delete a generation that is still processing' },
        { status: 400 }
      )
    }

    // Delete the generation
    const { error: deleteError } = await adminClient
      .from('generations')
      .delete()
      .eq('id', generationId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete generation' },
        { status: 500 }
      )
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
