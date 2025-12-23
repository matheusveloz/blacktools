// Veo 3.1 Async API Types
// Uses same endpoint as Sora 2: https://api.laozhang.ai/v1/videos
// Different model names with aspect ratio, speed, and image-to-video variants

// Veo 3 Models - naming convention:
// - base: veo-3.1 (portrait, standard)
// - landscape: adds -landscape
// - fast: adds -fast (cheaper: $0.15 vs $0.25)
// - fl: adds -fl (supports image-to-video / frame-to-video)
export type Veo3Model =
  | 'veo-3.1'              // Portrait, Standard, Text-only
  | 'veo-3.1-fl'           // Portrait, Standard, Image-to-Video
  | 'veo-3.1-fast'         // Portrait, Fast, Text-only
  | 'veo-3.1-fast-fl'      // Portrait, Fast, Image-to-Video
  | 'veo-3.1-landscape'         // Landscape, Standard, Text-only
  | 'veo-3.1-landscape-fl'      // Landscape, Standard, Image-to-Video
  | 'veo-3.1-landscape-fast'    // Landscape, Fast, Text-only
  | 'veo-3.1-landscape-fast-fl' // Landscape, Fast, Image-to-Video

export type Veo3AspectRatio = 'portrait' | 'landscape'
export type Veo3Speed = 'standard' | 'fast'

export interface Veo3Config {
  aspectRatio: Veo3AspectRatio
  speed: Veo3Speed
  hasImage: boolean
}

export type Veo3Status = 'pending' | 'processing' | 'completed' | 'failed'

export interface Veo3GenerationMetadata {
  prompt: string
  model: Veo3Model
  aspectRatio: Veo3AspectRatio
  speed: Veo3Speed
  imageUrl?: string | null
  task_id?: string
  progress?: number
  created_at: string
  completed_at?: string
  failed_at?: string
  error?: string
  duration?: number
  resolution?: string
}

export interface Veo3Generation {
  id: string
  status: Veo3Status
  result_url: string | null
  credits_used: number
  created_at: string
  prompt: string
  model?: Veo3Model
  aspectRatio?: Veo3AspectRatio
  speed?: Veo3Speed
  progress?: number
  error?: string
  duration?: number
  resolution?: string
}

export interface Veo3GenerateRequest {
  prompt: string
  aspectRatio?: Veo3AspectRatio
  speed?: Veo3Speed
  imageUrl?: string
}

export interface Veo3GenerateResponse {
  success: boolean
  generation_id?: string
  task_id?: string
  status?: Veo3Status
  credits_used?: number
  message?: string
  error?: string
  required?: number
  available?: number
}

export interface Veo3StatusResponse {
  success: boolean
  generation?: {
    id: string
    status: Veo3Status
    result_url: string | null
    credits_used: number
    created_at: string
    prompt: string
    model?: Veo3Model
    aspectRatio?: Veo3AspectRatio
    speed?: Veo3Speed
    progress?: number
    error?: string
    completed_at?: string
    failed_at?: string
    duration?: number
    resolution?: string
  }
  generations?: Array<{
    id: string
    status: Veo3Status
    result_url: string | null
    credits_used: number
    created_at: string
    prompt: string
    model?: Veo3Model
    aspectRatio?: Veo3AspectRatio
    speed?: Veo3Speed
    progress?: number
    error?: string
    duration?: number
    resolution?: string
  }>
  error?: string
}

// Helper to build model name from config
export function buildVeo3ModelName(config: Veo3Config): Veo3Model {
  let model = 'veo-3.1'

  if (config.aspectRatio === 'landscape') {
    model += '-landscape'
  }

  if (config.speed === 'fast') {
    model += '-fast'
  }

  if (config.hasImage) {
    model += '-fl'
  }

  return model as Veo3Model
}

// Parse model name to config
export function parseVeo3Model(model: Veo3Model): Veo3Config {
  return {
    aspectRatio: model.includes('landscape') ? 'landscape' : 'portrait',
    speed: model.includes('fast') ? 'fast' : 'standard',
    hasImage: model.includes('-fl')
  }
}

// Presets for UI selection
export const VEO3_PRESETS = {
  'portrait-standard': { aspectRatio: 'portrait' as Veo3AspectRatio, speed: 'standard' as Veo3Speed },
  'portrait-fast': { aspectRatio: 'portrait' as Veo3AspectRatio, speed: 'fast' as Veo3Speed },
  'landscape-standard': { aspectRatio: 'landscape' as Veo3AspectRatio, speed: 'standard' as Veo3Speed },
  'landscape-fast': { aspectRatio: 'landscape' as Veo3AspectRatio, speed: 'fast' as Veo3Speed },
} as const

export type Veo3Preset = keyof typeof VEO3_PRESETS

// Credit costs
// High (Standard): 35 credits per video
// Fast: 20 credits per video
export const VEO3_CREDITS_STANDARD = 35
export const VEO3_CREDITS_FAST = 20

export function getVeo3Credits(speed: Veo3Speed): number {
  return speed === 'fast' ? VEO3_CREDITS_FAST : VEO3_CREDITS_STANDARD
}
