import { NextResponse } from 'next/server'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Get active pixels for client-side injection (public)
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ pixels: [] })
    }

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
      console.error('Error fetching pixels:', error)
      return NextResponse.json({ pixels: [] })
    }

    return NextResponse.json({ pixels: pixels || [] })
  } catch (error) {
    console.error('Pixels GET error:', error)
    return NextResponse.json({ pixels: [] })
  }
}
