import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { TOOLS } from '@/lib/constants'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'

/**
 * Sora 2 Cleanup API - Mark orphan generations as failed and refund credits
 *
 * Orphan generations are those with status 'pending' or 'processing'
 * but WITHOUT a task_id in metadata (meaning they were never properly created in Laozhang API)
 */

interface GenerationMetadata {
  prompt?: string
  task_id?: string
  error?: string
  failed_at?: string
  [key: string]: string | undefined
}

export async function POST() {
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

    // Find orphan generations (pending/processing without task_id)
    const { data: orphanGenerations, error: fetchError } = await adminClient
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .eq('tool', TOOLS.SORA2)
      .in('status', ['pending', 'processing'])

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch generations' },
        { status: 500 }
      )
    }

    // Filter to only those WITHOUT task_id
    const orphans = (orphanGenerations || []).filter(gen => {
      const metadata = gen.metadata as unknown as GenerationMetadata
      return !metadata?.task_id
    })

    if (orphans.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphan generations found',
        cleaned: 0,
        refunded: 0
      })
    }


    let totalRefunded = 0

    // Mark each as failed and refund credits
    for (const orphan of orphans) {
      const metadata = orphan.metadata as unknown as GenerationMetadata

      // Update to failed
      await adminClient
        .from('generations')
        .update({
          status: 'failed',
          metadata: {
            ...metadata,
            error: 'Generation was not properly created. Credits refunded.',
            failed_at: new Date().toISOString()
          }
        })
        .eq('id', orphan.id)

      // Refund credits
      const { data: profile } = await adminClient
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (profile) {
        await adminClient
          .from('profiles')
          .update({ credits: profile.credits + orphan.credits_used })
          .eq('id', user.id)

        totalRefunded += orphan.credits_used
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned ${orphans.length} orphan generations`,
      cleaned: orphans.length,
      refunded: totalRefunded
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
