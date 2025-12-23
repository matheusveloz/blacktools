/**
 * InfiniteTalk API Types
 *
 * Uses WaveSpeed AI API v3: https://api.wavespeed.ai/api/v3/wavespeed-ai/wan-2.2/speech-to-video
 * Cost: 8 credits per second of audio
 */

export type InfiniteTalkStatus = 'pending' | 'processing' | 'completed' | 'failed'

// WaveSpeed task status values
export type WaveSpeedTaskStatus = 'created' | 'processing' | 'completed' | 'failed'

export interface InfiniteTalkParams {
  resolution: '480p' | '720p'
  prompt?: string
  seed?: number
}

export interface InfiniteTalkGenerationMetadata {
  imageUrl: string
  audioUrl: string
  audioDurationSeconds: number
  params?: InfiniteTalkParams
  prediction_id?: string
  created_at: string
  completed_at?: string
  failed_at?: string
  error?: string
  original_url?: string
  storage_error?: string
  [key: string]: string | number | InfiniteTalkParams | undefined
}

export interface InfiniteTalkGeneration {
  id: string
  status: InfiniteTalkStatus
  result_url: string | null
  credits_used: number
  created_at: string
  imageUrl: string
  audioUrl: string
  audioDurationSeconds: number
  error?: string
}

export interface InfiniteTalkGenerateRequest {
  imageUrl: string
  audioUrl: string
  audioDurationSeconds: number
  params?: InfiniteTalkParams
}

export interface InfiniteTalkGenerateResponse {
  success: boolean
  generation_id?: string
  prediction_id?: string
  status?: InfiniteTalkStatus
  credits_used?: number
  message?: string
  error?: string
  required?: number
  available?: number
}

export interface InfiniteTalkStatusResponse {
  success: boolean
  generation?: {
    id: string
    status: InfiniteTalkStatus
    result_url: string | null
    credits_used: number
    created_at: string
    imageUrl: string
    audioUrl: string
    audioDurationSeconds: number
    error?: string
    completed_at?: string
    failed_at?: string
  }
  generations?: Array<{
    id: string
    status: InfiniteTalkStatus
    result_url: string | null
    credits_used: number
    created_at: string
    imageUrl: string
    audioUrl: string
    audioDurationSeconds: number
    error?: string
  }>
  error?: string
}

// WaveSpeed API Response types
export interface WaveSpeedCreateResponse {
  id: string
  model: string
  status: WaveSpeedTaskStatus
  created_at: string
  outputs: string[]
  has_nsfw_contents?: boolean[]
  error?: string
  urls?: {
    get?: string
    cancel?: string
  }
}

export interface WaveSpeedPollingResponse {
  id: string
  model: string
  status: WaveSpeedTaskStatus
  created_at: string
  outputs: string[]
  has_nsfw_contents?: boolean[]
  error?: string
  urls?: {
    get?: string
    cancel?: string
  }
}

// Credit calculation: 8 credits per second, rounded up
export function calculateInfiniteTalkCredits(audioDurationSeconds: number): number {
  return Math.ceil(audioDurationSeconds) * 8
}

export const INFINITETALK_DEFAULT_PARAMS: InfiniteTalkParams = {
  resolution: '720p',
  seed: -1,
}
