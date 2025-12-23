import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

const VALID_CATEGORIES = ['bug', 'improvement', 'payment', 'feature', 'other']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { category, message } = body

    // Validate category
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    // Insert feedback using admin client to bypass type checking
    const adminClient = createAdminClient()
    const { error: insertError } = await (adminClient.from('feedback' as never) as ReturnType<typeof adminClient.from>)
      .insert({
        user_id: user.id,
        user_email: user.email || '',
        category,
        message: message.trim(),
        status: 'pending',
      })

    if (insertError) {
      console.error('Error inserting feedback:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
