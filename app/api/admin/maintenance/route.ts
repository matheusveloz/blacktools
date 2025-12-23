import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single<{ is_admin: number }>()

    if (profile?.is_admin !== 1) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    // Get maintenance settings
    const { data, error } = await adminClient
      .from('site_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching maintenance settings:', error)
    }

    const settings = data?.value || { enabled: false, message: 'We are under maintenance. We will be back soon!' }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Maintenance GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single<{ is_admin: number }>()

    if (profile?.is_admin !== 1) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { enabled, message } = body

    const adminClient = createAdminClient()

    // Upsert maintenance settings
    const { error } = await adminClient
      .from('site_settings')
      .upsert({
        key: 'maintenance_mode',
        value: { enabled: Boolean(enabled), message: message || 'We are under maintenance. We will be back soon!' },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })

    if (error) {
      console.error('Error saving maintenance settings:', error)
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Maintenance POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
