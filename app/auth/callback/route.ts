import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Default to dashboard - middleware will redirect to pricing if no credits
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const adminClient = createAdminClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('account_status, account_suspended_reason')
          .eq('id', user.id)
          .single()

        // Check if account is suspended
        if (profile?.account_status === 'suspended') {
          await supabase.auth.signOut()
          const reason = profile.account_suspended_reason || 'unknown'
          return NextResponse.redirect(`${origin}/login?suspended=true&reason=${reason}`)
        }
      }

      // Always go to dashboard after auth - middleware handles credit/subscription checks
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
