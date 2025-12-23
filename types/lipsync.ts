/**
 * LipSync API Types
 *
 * Uses NewportAI API: https://api.newportai.com/api/async/lipsync
 * Cost: 1 credit per second of audio
 */

export type LipSyncStatus = 'pending' | 'processing' | 'completed' | 'failed'

// NewportAI task status codes
export type NewportAITaskStatus = 1 | 2 | 3 | 4
// 1 = task submission
// 2 = in progress
// 3 = success
// 4 = failure

export interface LipSyncVideoParams {
  video_width: number   // 0 = keep original
  video_height: number  // 0 = keep original
  video_enhance: 0 | 1  // 0 = no, 1 = yes
  fps?: 'original'      // optional, default 25fps
}

export interface LipSyncGenerationMetadata {
  srcVideoUrl: string
  audioUrl: string
  audioDurationSeconds: number  // Duration in seconds for credit calculation
  videoParams?: LipSyncVideoParams
  task_id?: string
  created_at: string
  completed_at?: string
  failed_at?: string
  error?: string
  reason?: string
  original_url?: string
  storage_error?: string
  [key: string]: string | number | LipSyncVideoParams | undefined
}

export interface LipSyncGeneration {
  id: string
  status: LipSyncStatus
  result_url: string | null
  credits_used: number
  created_at: string
  srcVideoUrl: string
  audioUrl: string
  audioDurationSeconds: number
  error?: string
}

export interface LipSyncGenerateRequest {
  srcVideoUrl: string
  audioUrl: string
  audioDurationSeconds: number  // Frontend must provide audio duration
  videoParams?: LipSyncVideoParams
}

export interface LipSyncGenerateResponse {
  success: boolean
  generation_id?: string
  task_id?: string
  status?: LipSyncStatus
  credits_used?: number
  message?: string
  error?: string
  required?: number   // credits required
  available?: number  // credits available
}

export interface LipSyncStatusResponse {
  success: boolean
  generation?: {
    id: string
    status: LipSyncStatus
    result_url: string | null
    credits_used: number
    created_at: string
    srcVideoUrl: string
    audioUrl: string
    audioDurationSeconds: number
    error?: string
    completed_at?: string
    failed_at?: string
  }
  generations?: Array<{
    id: string
    status: LipSyncStatus
    result_url: string | null
    credits_used: number
    created_at: string
    srcVideoUrl: string
    audioUrl: string
    audioDurationSeconds: number
    error?: string
  }>
  error?: string
}

// NewportAI API Response types
export interface NewportAICreateResponse {
  code: number        // 0 = success
  message: string
  data?: {
    taskId: string
  }
}

export interface NewportAIPollingResponse {
  code: number
  message: string
  data?: {
    task?: {
      taskId: string
      status: NewportAITaskStatus
      reason?: string
      taskType?: string
      executionTime?: number
      expire?: number
    }
    videos?: Array<{
      videoUrl: string
      videoType: string
    }>
  }
}

// Credit calculation: 1 credit per second, rounded up
export function calculateLipSyncCredits(audioDurationSeconds: number): number {
  return Math.ceil(audioDurationSeconds)
}

export const LIPSYNC_DEFAULT_VIDEO_PARAMS: LipSyncVideoParams = {
  video_width: 0,     // Keep original
  video_height: 0,    // Keep original
  video_enhance: 1,   // Enhance by default
}
