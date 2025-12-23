import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { API_COSTS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface GenerationRow {
  id: string
  type?: string
  tool?: string
  status: string
  created_at: string
  metadata?: Record<string, unknown>
}

// Calculate cost for a single generation
function calculateCost(gen: GenerationRow, tableType: string): number {
  // Only count completed generations
  if (gen.status !== 'completed') return 0

  const type = tableType === 'generic' ? (gen.tool || gen.type || 'unknown') : tableType
  const normalizedType = type.toLowerCase()

  // Get duration from metadata if available
  const duration = (gen.metadata?.duration as number) ||
                   (gen.metadata?.audio_duration as number) ||
                   (gen.metadata?.video_duration as number) || 0

  // Get quality from metadata for veo3
  const quality = (gen.metadata?.quality as string)?.toLowerCase() === 'high' ? 'high' : 'fast'

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
    return API_COSTS.lipsync * (duration > 0 ? duration : 10) // Default to 10 seconds if no duration
  }

  if (normalizedType === 'infinitetalk') {
    return API_COSTS.infinitetalk * (duration > 0 ? duration : 10) // Default to 10 seconds if no duration
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
    const period = searchParams.get('period') || 'today'
    const customStart = searchParams.get('start')
    const customEnd = searchParams.get('end')

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

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
        if (!customStart || !customEnd) {
          return NextResponse.json({ error: 'Custom period requires start and end dates' }, { status: 400 })
        }
        startDate = new Date(customStart)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(customEnd)
        endDate.setHours(23, 59, 59, 999)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    }

    const adminClient = createAdminClient()

    // Fetch from each generation table
    const tables = [
      { name: 'sora2_generations', type: 'sora2' },
      { name: 'veo3_generations', type: 'veo3' },
      { name: 'lipsync_generations', type: 'lipsync' },
      { name: 'infinitetalk_generations', type: 'infinitetalk' },
      { name: 'generations', type: 'generic' },
    ]

    const costsByType: Record<string, { count: number; cost: number }> = {
      sora2: { count: 0, cost: 0 },
      veo3_fast: { count: 0, cost: 0 },
      veo3_high: { count: 0, cost: 0 },
      lipsync: { count: 0, cost: 0 },
      infinitetalk: { count: 0, cost: 0 },
      nanobanana2: { count: 0, cost: 0 },
    }

    let totalCost = 0
    let totalGenerations = 0

    for (const table of tables) {
      try {
        const selectFields = table.name === 'generations'
          ? 'id, tool, status, created_at, metadata'
          : 'id, status, created_at, metadata'

        // Use raw query to bypass TypeScript type checking for dynamic table names
        const query = adminClient
          .from(table.name as 'generations')
          .select(selectFields)
          .eq('status', 'completed')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())

        const { data, error } = await query

        if (error) {
          console.log(`Error fetching ${table.name}:`, error.message)
          continue
        }

        if (data && Array.isArray(data)) {
          (data as unknown as GenerationRow[]).forEach((gen) => {
            const cost = calculateCost(gen, table.type)

            if (cost > 0) {
              totalCost += cost
              totalGenerations += 1

              // Categorize the cost
              const type = table.type === 'generic' ? (gen.tool || 'unknown') : table.type
              const normalizedType = type.toLowerCase()

              if (normalizedType === 'sora2') {
                costsByType.sora2.count += 1
                costsByType.sora2.cost += cost
              } else if (normalizedType === 'veo3') {
                const quality = (gen.metadata?.quality as string)?.toLowerCase() === 'high' ? 'high' : 'fast'
                if (quality === 'high') {
                  costsByType.veo3_high.count += 1
                  costsByType.veo3_high.cost += cost
                } else {
                  costsByType.veo3_fast.count += 1
                  costsByType.veo3_fast.cost += cost
                }
              } else if (normalizedType === 'lipsync') {
                costsByType.lipsync.count += 1
                costsByType.lipsync.cost += cost
              } else if (normalizedType === 'infinitetalk') {
                costsByType.infinitetalk.count += 1
                costsByType.infinitetalk.cost += cost
              } else if (normalizedType === 'nanobanana2' || normalizedType === 'avatar') {
                costsByType.nanobanana2.count += 1
                costsByType.nanobanana2.cost += cost
              }
            }
          })
        }
      } catch (error) {
        console.log(`Skipping ${table.name}:`, error)
      }
    }

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalCost: Math.round(totalCost * 100) / 100,
      totalGenerations,
      costsByType: Object.fromEntries(
        Object.entries(costsByType).map(([key, value]) => [
          key,
          {
            count: value.count,
            cost: Math.round(value.cost * 100) / 100,
          },
        ])
      ),
      rates: {
        nanobanana2: API_COSTS.nanobanana2,
        sora2: API_COSTS.sora2,
        veo3_fast: API_COSTS.veo3_fast,
        veo3_high: API_COSTS.veo3_high,
        lipsync: API_COSTS.lipsync,
        infinitetalk: API_COSTS.infinitetalk,
      },
    })
  } catch (error) {
    console.error('Admin costs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
