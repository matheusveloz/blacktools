import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface PixelRow {
  id: string
  type: 'facebook' | 'gtm'
  pixel_id: string
  access_token: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// GET - List all pixels
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
    const { data: pixels, error } = await adminClient
      .from('pixels')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pixels:', error)
      return NextResponse.json({ error: 'Failed to fetch pixels' }, { status: 500 })
    }

    // Mask access tokens for security
    const maskedPixels = (pixels as PixelRow[] || []).map(p => ({
      ...p,
      access_token: p.access_token ? '••••••••' + p.access_token.slice(-4) : null,
    }))

    return NextResponse.json({ pixels: maskedPixels })
  } catch (error) {
    console.error('Admin pixels GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new pixel
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
    const { type, pixel_id, access_token, is_active = true } = body

    if (!type || !pixel_id) {
      return NextResponse.json({ error: 'Type and pixel_id are required' }, { status: 400 })
    }

    if (!['facebook', 'gtm'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "facebook" or "gtm"' }, { status: 400 })
    }

    if (type === 'facebook' && !access_token) {
      return NextResponse.json({ error: 'Access token is required for Facebook pixels' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: pixel, error } = await adminClient
      .from('pixels')
      .insert({
        type,
        pixel_id,
        access_token: type === 'facebook' ? access_token : null,
        is_active,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pixel:', error)
      return NextResponse.json({ error: 'Failed to create pixel' }, { status: 500 })
    }

    return NextResponse.json({ pixel })
  } catch (error) {
    console.error('Admin pixels POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a pixel
export async function PATCH(request: Request) {
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
    const { id, pixel_id, access_token, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (pixel_id !== undefined) updates.pixel_id = pixel_id
    if (access_token !== undefined) updates.access_token = access_token
    if (is_active !== undefined) updates.is_active = is_active

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: pixel, error } = await adminClient
      .from('pixels')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating pixel:', error)
      return NextResponse.json({ error: 'Failed to update pixel' }, { status: 500 })
    }

    return NextResponse.json({ pixel })
  } catch (error) {
    console.error('Admin pixels PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a pixel
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('pixels')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting pixel:', error)
      return NextResponse.json({ error: 'Failed to delete pixel' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin pixels DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
