import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Verifica se o usuário é admin
async function isAdmin(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single<{ is_admin: number }>()

  return data?.is_admin === 1
}

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    if (!(await isAdmin(supabase, user.id))) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const adminClient = createAdminClient()

    // Buscar estatísticas de usuários (usar adminClient para bypass RLS)
    const [usersResult, activeSubsResult] = await Promise.all([
      adminClient.from('profiles').select('id', { count: 'exact', head: true }),
      adminClient.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active')
    ])

    // Contar generations de todas as tabelas específicas
    const generationTables = [
      'sora2_generations',
      'veo3_generations',
      'lipsync_generations',
      'infinitetalk_generations',
      'generations' // tabela genérica também
    ]

    let totalGenerations = 0

    for (const tableName of generationTables) {
      try {
        const { count } = await adminClient
          .from(tableName as any)
          .select('id', { count: 'exact', head: true })

        if (count !== null) {
          totalGenerations += count
        }
      } catch {
        // Tabela pode não existir, continuar
      }
    }

    return NextResponse.json({
      totalUsers: usersResult.count || 0,
      activeSubscriptions: activeSubsResult.count || 0,
      totalGenerations
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
