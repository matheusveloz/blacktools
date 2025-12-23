import { NextResponse } from 'next/server'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET - Get active pixels for client-side injection (public)
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Debug: Check if environment variables are set
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[Pixels API] Missing env vars:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
        serviceKeyLength: serviceRoleKey?.length || 0
      })
      return NextResponse.json({
        pixels: [],
        debug: {
          error: 'Missing environment variables',
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!serviceRoleKey
        }
      })
    }

    // Create admin client directly here to ensure it works
    const adminClient = createSupabaseJsClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: pixels, error } = await adminClient
      .from('pixels')
      .select('type, pixel_id')
      .eq('is_active', true)

    if (error) {
      console.error('[Pixels API] Query error:', error)
      return NextResponse.json({
        pixels: [],
        debug: { queryError: error.message, code: error.code }
      })
    }

    // Only return type and pixel_id (not access_token for security)
    return NextResponse.json({
      pixels: pixels || [],
    })
  } catch (error) {
    console.error('[Pixels API] GET error:', error)
    return NextResponse.json({
      pixels: [],
      debug: { error: String(error) }
    })
  }
}
