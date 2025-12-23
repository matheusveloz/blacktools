// Rate limiting usando Supabase (sem dependência externa)
// Usa tabela rate_limits no Supabase para tracking de requisições

import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

// Rate limit configuration
const RATE_LIMITS = {
  generation: { max: 10, window: 60 }, // 10 req/min
  status: { max: 60, window: 60 }, // 60 req/min
  payment: { max: 5, window: 60 }, // 5 req/min
  upload: { max: 20, window: 60 }, // 20 req/min
  credits: { max: 30, window: 60 }, // 30 req/min
  general: { max: 100, window: 60 }, // 100 req/min
}

type RateLimitType = keyof typeof RATE_LIMITS

// Mock limiter objects para compatibilidade com código existente
export const rateLimiters = {
  generation: { type: 'generation' as RateLimitType },
  status: { type: 'status' as RateLimitType },
  payment: { type: 'payment' as RateLimitType },
  upload: { type: 'upload' as RateLimitType },
  credits: { type: 'credits' as RateLimitType },
  general: { type: 'general' as RateLimitType },
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit using Supabase table
 * Usa tabela rate_limits para tracking de requisições
 */
export async function checkRateLimit(
  limiter: { type: RateLimitType },
  userId: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[limiter.type]
  
  const now = Date.now()
  const windowStart = now - (config.window * 1000)

  try {
    const adminClient = createAdminClient()
    
    // Contar requisições no window atual
    const { data: requests, error } = await adminClient
      .from('rate_limits')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', limiter.type)
      .gte('created_at', new Date(windowStart).toISOString())

    if (error) {
      // Se tabela não existe, permitir (fallback para desenvolvimento)
      // Não logar warning em produção para evitar spam de logs
      logger.debug('Rate limit table not found, allowing request. Run migration: add_rate_limits_table.sql')
      // Retornar sucesso para não bloquear requisições se tabela não existe
      return {
        success: true,
        limit: config.max,
        remaining: config.max,
        reset: now + (config.window * 1000)
      }
    }

    const requestCount = requests?.length || 0

    if (requestCount >= config.max) {
      // Limite excedido
      const resetTime = windowStart + (config.window * 1000) + 1000
      return {
        success: false,
        limit: config.max,
        remaining: 0,
        reset: resetTime
      }
    }

    // Registrar esta requisição (ignorar erro se tabela não existe)
    // Não usar await para não bloquear - executar em background
    const insertPromise = adminClient
      .from('rate_limits')
      .insert({
        user_id: userId,
        type: limiter.type,
        created_at: new Date().toISOString()
      })
    
    // Executar cleanup e insert em background, ignorando erros
    Promise.resolve(insertPromise)
      .then(() => {
        // Cleanup de requisições antigas em background (não espera)
        cleanupOldRequests(adminClient, windowStart).catch(() => {
          // Ignorar erros de cleanup
        })
      })
      .catch(() => {
        // Ignorar erro de insert silenciosamente - tabela pode não existir
      })

    return {
      success: true,
      limit: config.max,
      remaining: config.max - requestCount - 1,
      reset: now + (config.window * 1000)
    }

  } catch (error) {
    // Em caso de erro, permitir requisição (fail open para não bloquear usuários)
    logger.error('Rate limit error:', error instanceof Error ? error.message : 'Unknown error')
    return {
      success: true,
      limit: config.max,
      remaining: config.max,
      reset: now + (config.window * 1000)
    }
  }
}

// Cleanup de requisições antigas (background, não bloqueia)
async function cleanupOldRequests(
  adminClient: ReturnType<typeof createAdminClient>, 
  beforeTimestamp: number
) {
  try {
    // Deletar apenas se houver muitas entradas (evitar deletar constantemente)
    // Limpar entradas com mais de 2 minutos
    const cleanupThreshold = Date.now() - (2 * 60 * 1000)
    
    await adminClient
      .from('rate_limits')
      .delete()
      .lt('created_at', new Date(cleanupThreshold).toISOString())
      .limit(100) // Limitar quantidade para não sobrecarregar
  } catch (error) {
    // Ignorar erros de cleanup (não crítico)
  }
}
