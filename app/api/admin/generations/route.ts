import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { API_COSTS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

// Calculate cost for a generation
function calculateGenerationCost(
  type: string,
  status: string,
  metadata?: Record<string, unknown>
): number {
  // Only count completed generations
  if (status !== 'completed') return 0

  const normalizedType = type?.toLowerCase() || ''
  const duration = (metadata?.duration as number) ||
                   (metadata?.audio_duration as number) ||
                   (metadata?.video_duration as number) || 0
  const quality = (metadata?.quality as string)?.toLowerCase()

  if (normalizedType === 'nanobanana2' || normalizedType === 'avatar') {
    return API_COSTS.nanobanana2
  }
  if (normalizedType === 'sora2') {
    return API_COSTS.sora2
  }
  if (normalizedType === 'veo3') {
    return quality === 'high' ? API_COSTS.veo3_high : API_COSTS.veo3_fast
  }
  if (normalizedType === 'lipsync') {
    return API_COSTS.lipsync * (duration > 0 ? duration : 10)
  }
  if (normalizedType === 'infinitetalk') {
    return API_COSTS.infinitetalk * (duration > 0 ? duration : 10)
  }
  return 0
}

export async function GET(request: Request) {
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
    const userId = searchParams.get('userId')
    const latest = searchParams.get('latest') === 'true'
    const period = searchParams.get('period') || 'all'
    const customStart = searchParams.get('start')
    const customEnd = searchParams.get('end')

    // Calculate date range for cost filtering
    const now = new Date()
    let startDate: Date | null = null
    let endDate: Date | null = null

    if (period !== 'all') {
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
          break
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0)
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999)
          break
        case 'last7days':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0)
          break
        case 'last30days':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0)
          break
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
          break
        case 'custom':
          if (customStart && customEnd) {
            startDate = new Date(customStart)
            startDate.setHours(0, 0, 0, 0)
            endDate = new Date(customEnd)
            endDate.setHours(23, 59, 59, 999)
          }
          break
      }
    }

    const adminClient = createAdminClient()
    const allGenerations: any[] = []

    // Buscar mapeamento de user_id -> email para mostrar nas generations
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, email')

    const userEmailMap: Record<string, string> = {}
    if (profiles) {
      profiles.forEach((p: any) => {
        userEmailMap[p.id] = p.email
      })
    }

    // Fetch from each generation table individually
    const tables = [
      { name: 'sora2_generations', type: 'sora2' },
      { name: 'veo3_generations', type: 'veo3' },
      { name: 'lipsync_generations', type: 'lipsync' },
      { name: 'infinitetalk_generations', type: 'infinitetalk' },
      { name: 'generations', type: 'generic' },
    ]

    for (const table of tables) {
      try {
        // Build query dynamically based on parameters
        const limit = userId && !latest ? 50 : (latest ? 30 : 20)

        // Selecionar campos - tabela 'generations' tem 'tool' em vez de 'type'
        // Incluir result_url/video_url para mostrar link da criação
        const selectFields = table.name === 'generations'
          ? 'id, user_id, tool, status, created_at, metadata, result_url'
          : 'id, user_id, status, created_at, metadata, result_url, video_url'

        // Use raw query to bypass type checking
        let query: any = adminClient
          .from(table.name as any)
          .select(selectFields)
          .order('created_at', { ascending: false })

        if (userId && !latest) {
          query = query.eq('user_id', userId)
        }

        // Apply date filter if specified
        if (startDate && endDate) {
          query = query.gte('created_at', startDate.toISOString())
          query = query.lte('created_at', endDate.toISOString())
        }

        // Limit unless fetching for cost calculation
        if (!userId || latest) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) {
          console.log(`Error fetching ${table.name}:`, error.message)
          continue
        }

        if (data && Array.isArray(data)) {
          data.forEach((g: any) => {
            const genType = table.name === 'generations' ? g.tool : table.type
            const cost = calculateGenerationCost(genType, g.status, g.metadata)
            allGenerations.push({
              id: g.id,
              user_id: g.user_id,
              user_email: userEmailMap[g.user_id] || null,
              type: genType,
              status: g.status,
              created_at: g.created_at,
              metadata: g.metadata || {},
              result_url: g.result_url || g.video_url || null,
              cost: Math.round(cost * 10000) / 10000, // Round to 4 decimal places
            })
          })
        }
      } catch (error) {
        // Table might not exist, skip it
        console.log(`Skipping ${table.name}:`, error)
      }
    }

    // Sort by date
    const sorted = allGenerations.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const result = latest ? sorted.slice(0, 20) : sorted

    // Calculate total cost
    const totalCost = result.reduce((sum, gen) => sum + (gen.cost || 0), 0)
    const completedCount = result.filter(g => g.status === 'completed').length

    return NextResponse.json({
      generations: result,
      totalCost: Math.round(totalCost * 100) / 100,
      completedCount,
      period: period !== 'all' ? {
        start: startDate?.toISOString(),
        end: endDate?.toISOString(),
      } : null,
    })
  } catch (error) {
    console.error('Admin generations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

