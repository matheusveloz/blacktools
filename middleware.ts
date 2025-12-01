import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/pricing']
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/auth')
  )

  // API routes and static files should pass through
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return response
  }

  // Auth pages - redirect to dashboard if already logged in with active subscription
  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/pricing', request.url))
      }
    }
  }

  // Dashboard routes - require authentication and active subscription
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_status !== 'active' && profile?.subscription_status !== 'trialing') {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  // Pricing page - redirect to dashboard if user has active subscription
  if (pathname === '/pricing' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
