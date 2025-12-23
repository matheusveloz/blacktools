import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'
import type { User } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse
  user: User | null
  supabase: ReturnType<typeof createServerClient<Database>> | null
}> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Verificar se as variáveis de ambiente estão definidas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Supabase environment variables are not configured')
    return { response, user: null, supabase: null }
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      logger.error('Error getting user:', authError.message)
      return { response, user: null, supabase }
    }

    return { response, user, supabase }
  } catch (error) {
    logger.error('Error getting user:', error instanceof Error ? error.message : 'Unknown error')
    // Retornar supabase mesmo em caso de erro para permitir que o middleware continue
    return { response, user: null, supabase }
  }
}
