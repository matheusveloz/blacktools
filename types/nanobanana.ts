// Nano Banana 2 (Gemini 3 Pro Image) Types
// API Endpoint: https://api.laozhang.ai/v1beta/models/gemini-3-pro-image-preview:generateContent
// Supports text-to-image and multi-reference image-to-image (up to 14 images)

export type NanoBananaModel = 'gemini-3-pro-image-preview' | 'gemini-2.5-flash-image'

// 10 supported aspect ratios
export type NanoBananaAspectRatio =
  | '21:9'  // Ultra-wide landscape
  | '16:9'  // Widescreen landscape
  | '4:3'   // Standard landscape
  | '3:2'   // Photo landscape
  | '1:1'   // Square
  | '9:16'  // Vertical/Portrait
  | '3:4'   // Portrait
  | '2:3'   // Photo portrait
  | '5:4'   // Slight landscape
  | '4:5'   // Slight portrait

// Resolution options (Nano Banana 2 only)
export type NanoBananaResolution = '1K' | '2K' | '4K'

export type NanoBananaStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface NanoBananaConfig {
  model: NanoBananaModel
  aspectRatio: NanoBananaAspectRatio
  resolution: NanoBananaResolution
}

export interface NanoBananaGenerationMetadata {
  prompt: string
  model: NanoBananaModel
  aspectRatio: NanoBananaAspectRatio
  resolution: NanoBananaResolution
  referenceImages?: string[] // Up to 14 reference image URLs
  created_at: string
  completed_at?: string
  failed_at?: string
  error?: string
}

export interface NanoBananaGeneration {
  id: string
  status: NanoBananaStatus
  result_url: string | null
  credits_used: number
  created_at: string
  prompt: string
  model?: NanoBananaModel
  aspectRatio?: NanoBananaAspectRatio
  resolution?: NanoBananaResolution
  referenceImages?: string[]
  error?: string
}

export interface NanoBananaGenerateRequest {
  prompt: string
  aspectRatio?: NanoBananaAspectRatio
  resolution?: NanoBananaResolution
  referenceImages?: string[] // Base64 or URL, up to 14 images
}

export interface NanoBananaGenerateResponse {
  success: boolean
  generation_id?: string
  result_url?: string
  status?: NanoBananaStatus
  credits_used?: number
  message?: string
  error?: string
  required?: number
  available?: number
}

export interface NanoBananaStatusResponse {
  success: boolean
  generation?: {
    id: string
    status: NanoBananaStatus
    result_url: string | null
    credits_used: number
    created_at: string
    prompt: string
    model?: NanoBananaModel
    aspectRatio?: NanoBananaAspectRatio
    resolution?: NanoBananaResolution
    referenceImages?: string[]
    error?: string
    completed_at?: string
    failed_at?: string
  }
  generations?: Array<{
    id: string
    status: NanoBananaStatus
    result_url: string | null
    credits_used: number
    created_at: string
    prompt: string
    model?: NanoBananaModel
    aspectRatio?: NanoBananaAspectRatio
    resolution?: NanoBananaResolution
    referenceImages?: string[]
    error?: string
  }>
  error?: string
}

// Aspect ratio labels for UI
export const ASPECT_RATIO_OPTIONS: { value: NanoBananaAspectRatio; label: string }[] = [
  { value: '1:1', label: '1:1 Square' },
  { value: '16:9', label: '16:9 Landscape' },
  { value: '9:16', label: '9:16 Portrait' },
  { value: '4:3', label: '4:3 Standard' },
  { value: '3:4', label: '3:4 Portrait' },
  { value: '21:9', label: '21:9 Ultra-wide' },
  { value: '3:2', label: '3:2 Photo' },
  { value: '2:3', label: '2:3 Photo Portrait' },
  { value: '5:4', label: '5:4' },
  { value: '4:5', label: '4:5' },
]

// Resolution labels for UI
export const RESOLUTION_OPTIONS: { value: NanoBananaResolution; label: string }[] = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
]

// Credit cost per image
export const NANOBANANA_CREDITS = 7

// Maximum reference images
export const MAX_REFERENCE_IMAGES = 14
