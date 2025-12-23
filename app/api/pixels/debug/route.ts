import { NextResponse } from 'next/server'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
    }
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !serviceRoleKey) {
      debug.error = 'Missing env vars'
      return NextResponse.json(debug)
    }

    const client = createSupabaseJsClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Test 1: Simple query without filter
    const { data: allData, error: allError } = await client
      .from('pixels')
      .select('*')

    debug.test1_all = {
      data: allData,
      error: allError?.message || null,
      code: allError?.code || null,
      count: allData?.length || 0
    }

    // Test 2: Query with is_active filter
    const { data: activeData, error: activeError } = await client
      .from('pixels')
      .select('*')
      .eq('is_active', true)

    debug.test2_active = {
      data: activeData,
      error: activeError?.message || null,
      code: activeError?.code || null,
      count: activeData?.length || 0
    }

    // Test 3: Check table exists by querying with limit 0
    const { count, error: countError } = await client
      .from('pixels')
      .select('*', { count: 'exact', head: true })

    debug.test3_count = {
      count: count,
      error: countError?.message || null
    }

  } catch (e) {
    debug.exception = String(e)
  }

  return NextResponse.json(debug, {
    headers: { 'Cache-Control': 'no-store' }
  })
}
