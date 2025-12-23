// Sora 2 Async API - Only uses 'sora-2' model with size/seconds params
// NO sora_video2 names - those are for Sync API only!

export type Sora2Size = '1280x720' | '720x1280'  // landscape | portrait
export type Sora2Seconds = '10' | '15'

export interface Sora2Config {
  size: Sora2Size
  seconds: Sora2Seconds
}

export type Sora2Status = 'pending' | 'processing' | 'completed' | 'failed'

export interface Sora2GenerationMetadata {
  prompt: string
  size: Sora2Size
  seconds: Sora2Seconds
  imageUrl?: string | null
  task_id?: string
  progress?: number
  created_at: string
  completed_at?: string
  failed_at?: string
  error?: string
}

export interface Sora2Generation {
  id: string
  status: Sora2Status
  result_url: string | null
  credits_used: number
  created_at: string
  prompt: string
  size?: Sora2Size
  seconds?: Sora2Seconds
  progress?: number
  error?: string
}

export interface Sora2GenerateRequest {
  prompt: string
  size?: Sora2Size
  seconds?: Sora2Seconds
  imageUrl?: string
}

export interface Sora2GenerateResponse {
  success: boolean
  generation_id?: string
  task_id?: string
  status?: Sora2Status
  credits_used?: number
  message?: string
  error?: string
  required?: number
  available?: number
  _debug?: {
    insertedId: string
    checkBeforeUpdate: unknown
    updateError: string | null
    verifyAfterUpdate: unknown
    task_id_saved: unknown
  }
}

export interface Sora2StatusResponse {
  success: boolean
  generation?: {
    id: string
    status: Sora2Status
    result_url: string | null
    credits_used: number
    created_at: string
    prompt: string
    size?: Sora2Size
    seconds?: Sora2Seconds
    progress?: number
    error?: string
    completed_at?: string
    failed_at?: string
  }
  generations?: Array<{
    id: string
    status: Sora2Status
    result_url: string | null
    credits_used: number
    created_at: string
    prompt: string
    size?: Sora2Size
    seconds?: Sora2Seconds
    progress?: number
    error?: string
  }>
  error?: string
}

export const SORA2_PRESETS = {
  'landscape-10s': { size: '1280x720' as Sora2Size, seconds: '10' as Sora2Seconds },
  'landscape-15s': { size: '1280x720' as Sora2Size, seconds: '15' as Sora2Seconds },
  'portrait-10s': { size: '720x1280' as Sora2Size, seconds: '10' as Sora2Seconds },
  'portrait-15s': { size: '720x1280' as Sora2Size, seconds: '15' as Sora2Seconds },
} as const

export type Sora2Preset = keyof typeof SORA2_PRESETS

export const SORA2_CREDITS_COST = 20
