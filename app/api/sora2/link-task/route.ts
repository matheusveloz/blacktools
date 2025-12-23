import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'

/**
 * Link task_id to existing generation
 *
 * POST /api/sora2/link-task
 * Body: { generation_id: string, task_id: string }
 */

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

    const body = await request.json()
    const { generation_id, task_id } = body as {
      generation_id: string
      task_id: string
    }

    if (!generation_id || !task_id) {
      return NextResponse.json(
        { error: 'generation_id and task_id are required' },
        { status: 400 }
      )
    }

    // Get the generation
    const { data: generation, error: fetchError } = await adminClient
      .from('generations')
      .select('*')
      .eq('id', generation_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    // Update with task_id
    const currentMetadata = (generation.metadata as Record<string, unknown>) || {}
    const updatedMetadata = {
      ...currentMetadata,
      task_id: task_id
    }

    // Use direct update
    const { error: updateError } = await adminClient
      .from('generations')
      .update({
        status: 'processing',
        metadata: updatedMetadata
      })
      .eq('id', generation_id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update generation', details: updateError.message },
        { status: 500 }
      )
    }

    // Fetch the updated record
    const { data: updated } = await adminClient
      .from('generations')
      .select('*')
      .eq('id', generation_id)
      .single()

    return NextResponse.json({
      success: true,
      generation: updated
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
