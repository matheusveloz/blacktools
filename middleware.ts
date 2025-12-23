import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

interface ProfileData {
  subscription_status: string
  account_status?: 'active' | 'suspended' | null
  account_suspended_reason?: string | null
  is_admin?: number
}

interface MaintenanceSettings {
  enabled: boolean
  message: string
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams

  // IMPORTANTE: Excluir arquivos estáticos ANTES de qualquer processamento
  // Isso evita erros 500 em arquivos estáticos do Next.js
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.svg') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|map)$/i)
  ) {
    return NextResponse.next()
  }

  // OAuth callback fallback: Se o código OAuth chegar na rota raiz,
  // redirecionar para /auth/callback para processar corretamente
  if (pathname === '/' && searchParams.has('code')) {
    const code = searchParams.get('code')
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code!)
    return NextResponse.redirect(callbackUrl)
  }

  try {
    const { response, user, supabase } = await updateSession(request)

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/signup', '/pricing']
    const isPublicRoute = publicRoutes.some(route =>
      pathname === route || pathname.startsWith('/auth')
    )

    // Páginas que não devem ser bloqueadas pela manutenção
    const maintenanceExcludedRoutes = ['/maintenance', '/admin', '/api/admin']
    const isMaintenanceExcluded = maintenanceExcludedRoutes.some(route =>
      pathname === route || pathname.startsWith(route)
    )

    // Verificar modo de manutenção (apenas se não for rota excluída)
    if (supabase && !isMaintenanceExcluded) {
      try {
        const { data: maintenanceData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single<{ value: MaintenanceSettings }>()

        const maintenanceSettings = maintenanceData?.value

        if (maintenanceSettings?.enabled) {
          // Verificar se o usuário é admin
          let isAdmin = false
          if (user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', user.id)
              .single<{ is_admin: number }>()

            isAdmin = profileData?.is_admin === 1
          }

          // Se não for admin, redirecionar para página de manutenção
          if (!isAdmin) {
            return NextResponse.redirect(new URL('/maintenance', request.url))
          }
        }
      } catch {
        // Se houver erro ao verificar manutenção, continuar normalmente
      }
    }

    // Se o Supabase não estiver configurado, permitir acesso apenas a rotas públicas
    if (!supabase) {
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return response
    }

    // Auth pages - redirect to dashboard if already logged in
    if (pathname === '/login' || pathname === '/signup') {
      if (user) {
        try {
          const { data, error: queryError } = await supabase
            .from('profiles')
            .select('account_status, account_suspended_reason')
            .eq('id', user.id)
            .single()

          if (queryError) {
            console.error('Error checking profile:', queryError.message)
            // Em caso de erro, permitir acesso à página
            return response
          }

          const profile = data as ProfileData | null

          // If account is suspended, allow access to login page (will show error message)
          if (profile?.account_status === 'suspended') {
            return response
          }

          // User is logged in and not suspended - go to dashboard
          // Dashboard middleware will check for credits/subscription
          return NextResponse.redirect(new URL('/dashboard', request.url))
        } catch (error) {
          console.error('Error checking profile:', error)
          // Em caso de erro, permitir acesso à página
        }
      }
    }

    // Dashboard routes - require authentication and active subscription OR remaining credits
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      try {
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('subscription_status, account_status, account_suspended_reason, credits, credits_extras, is_admin')
          .eq('id', user.id)
          .single()

        if (queryError) {
          console.error('Error checking profile:', queryError.message)
          // Se a tabela não existir ou houver erro de conexão, permitir acesso
          // (pode ser ambiente de desenvolvimento sem Supabase configurado)
          if (queryError.code === 'PGRST116' || queryError.message.includes('relation') || queryError.message.includes('does not exist')) {
            console.warn('Profiles table may not exist, allowing access for development')
            return response
          }
          return NextResponse.redirect(new URL('/login', request.url))
        }

        const profile = data as ProfileData & { account_suspended_reason?: string; credits?: number; credits_extras?: number } | null

        // Block suspended accounts
        if (profile?.account_status === 'suspended') {
          const reason = profile.account_suspended_reason || 'unknown'
          return NextResponse.redirect(new URL(`/login?suspended=true&reason=${reason}`, request.url))
        }

        // Allow access if user has active/trialing subscription OR has remaining credits
        const hasActiveSubscription = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
        const hasRemainingCredits = ((profile?.credits || 0) + (profile?.credits_extras || 0)) > 0

        if (!hasActiveSubscription && !hasRemainingCredits) {
          return NextResponse.redirect(new URL('/pricing', request.url))
        }
      } catch (error) {
        console.error('Error checking profile:', error)
        // Em caso de erro, redirecionar para login
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Pricing page - allow access for upgrade/downgrade, but block suspended accounts
    if (pathname === '/pricing' && user) {
      try {
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('account_status, account_suspended_reason')
          .eq('id', user.id)
          .single()

        if (queryError) {
          console.error('Error checking profile:', queryError.message)
          // Em caso de erro, permitir acesso à página
          return response
        }

        const profile = data as ProfileData | null

        // Block suspended accounts
        if (profile?.account_status === 'suspended') {
          const reason = profile.account_suspended_reason || 'unknown'
          return NextResponse.redirect(new URL(`/login?suspended=true&reason=${reason}`, request.url))
        }

        // Allow access to pricing page (for upgrade/downgrade)
      } catch (error) {
        console.error('Error checking profile:', error)
        // Em caso de erro, permitir acesso à página
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Em caso de erro crítico, retornar resposta padrão
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (hot module replacement)
     * - _next/chunks (webpack chunks)
     * - favicon.ico (favicon file)
     * - icon.svg (icon file)
     * - static files (images, fonts, etc)
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|_next/chunks|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2|ttf|eot|map)$).*)',
  ],
}
