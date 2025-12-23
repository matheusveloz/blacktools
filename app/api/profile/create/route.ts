import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const adminClient = createAdminClient()

    // Get fbc/fbp from request body (for Facebook attribution)
    let fbc: string | null = null
    let fbp: string | null = null
    try {
      const body = await request.json()
      fbc = body.fbc || null
      fbp = body.fbp || null
      console.log('[Profile Create] Received fbc/fbp:', { fbc, fbp })
    } catch {
      console.log('[Profile Create] No body or empty body')
    }

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

    // Check if profile already exists
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, fbc, fbp')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) {
      console.log('[Profile Create] Profile exists, checking fbc/fbp update:', {
        hasFbc: !!fbc,
        hasFbp: !!fbp,
        existingFbc: existingProfile.fbc,
        existingFbp: existingProfile.fbp
      })

      // Profile exists - update fbc/fbp if we have new values and profile doesn't have them
      if ((fbc || fbp) && (!existingProfile.fbc || !existingProfile.fbp)) {
        console.log('[Profile Create] Updating fbc/fbp...')
        const { error: updateError } = await adminClient
          .from('profiles')
          .update({
            fbc: fbc || existingProfile.fbc,
            fbp: fbp || existingProfile.fbp,
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('[Profile Create] Update error:', updateError)
        } else {
          console.log('[Profile Create] fbc/fbp updated successfully')
        }
      }

      const { data: profile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return NextResponse.json({ profile })
    }

    // Create new profile using admin client to bypass RLS
    const { data: newProfile, error: createError } = await adminClient
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        credits: 50, // 50 free credits to test the platform
        subscription_status: 'inactive',
        fbc, // Save Facebook Click ID for attribution
        fbp, // Save Facebook Browser ID for attribution
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create profile', details: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: newProfile })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

