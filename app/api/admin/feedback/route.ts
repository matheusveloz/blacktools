import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Helper to get feedback data using admin client
async function getFeedbackData(category: string | null) {
  const adminClient = createAdminClient()

  // Use type assertion to bypass TypeScript strict checking
  const feedbackTable = adminClient.from('feedback' as never)

  let query = feedbackTable
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  return query
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single<{ is_admin: number }>()

    if (profile?.is_admin !== 1) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Get feedback data
    const { data: feedbacks, error } = await getFeedbackData(category)

    if (error) {
      console.error('Error fetching feedback:', error)
    }

    // Get counts per category
    const adminClient = createAdminClient()
    const { data: allFeedback } = await (adminClient.from('feedback' as never) as ReturnType<typeof adminClient.from>)
      .select('category')

    const counts: Record<string, number> = {
      all: 0,
      bug: 0,
      improvement: 0,
      payment: 0,
      feature: 0,
      other: 0,
    }

    if (allFeedback) {
      counts.all = allFeedback.length
      allFeedback.forEach((item: { category?: string }) => {
        const cat = item.category
        if (cat && counts[cat] !== undefined) {
          counts[cat]++
        }
      })
    }

    return NextResponse.json({ feedbacks: feedbacks || [], counts })
  } catch (error) {
    console.error('Admin feedback API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete feedback
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single<{ is_admin: number }>()

    if (profile?.is_admin !== 1) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')

    if (!ids) {
      return NextResponse.json({ error: 'Missing feedback ids' }, { status: 400 })
    }

    const idArray = ids.split(',')

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    const { error } = await (adminClient.from('feedback' as never) as ReturnType<typeof adminClient.from>)
      .delete()
      .in('id', idArray)

    if (error) {
      console.error('Error deleting feedback:', error)
      return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: idArray.length })
  } catch (error) {
    console.error('Admin feedback DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update feedback status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single<{ is_admin: number }>()

    if (profile?.is_admin !== 1) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, admin_notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing feedback id' }, { status: 400 })
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    const updateData: Record<string, string> = {}
    if (status) updateData.status = status
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes

    const { error } = await (adminClient.from('feedback' as never) as ReturnType<typeof adminClient.from>)
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating feedback:', error)
      return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin feedback PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
