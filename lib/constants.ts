export const APP_NAME = 'BlackTools'
export const APP_DESCRIPTION = 'AI Video Generator Platform'

export const TOOLS = {
  LIPSYNC: 'lipsync',
  INFINITETALK: 'infinitetalk',
  SORA2: 'sora2',
  VEO3: 'veo3',
  AVATAR: 'avatar',
} as const

export type ToolType = (typeof TOOLS)[keyof typeof TOOLS]

export const TOOL_CONFIG = {
  [TOOLS.LIPSYNC]: {
    name: 'LipSync',
    description: 'Sync audio to video with AI lip movement',
    color: '#3b82f6',
    credits: 1, // 1 credit per second of audio
    nodes: ['video', 'audio'],
  },
  [TOOLS.INFINITETALK]: {
    name: 'Infinite Talk',
    description: 'Transform image + speech into talking video',
    color: '#06b6d4', // cyan
    credits: 8, // 8 credits per second of audio
    nodes: ['image', 'audio'],
  },
  [TOOLS.SORA2]: {
    name: 'Sora 2',
    description: 'Generate videos from text prompts',
    color: '#8b5cf6',
    credits: 20,
    nodes: ['reference', 'sora2'],
  },
  [TOOLS.VEO3]: {
    name: 'Veo 3',
    description: 'Create high-quality AI videos',
    color: '#f97316',
    credits: 20, // Fast mode default (High = 35)
    nodes: ['reference', 'veo3'],
  },
  [TOOLS.AVATAR]: {
    name: 'Nano Banana 2',
    description: 'AI image generation with multi-reference support',
    color: '#22c55e',
    credits: 7, // 7 credits per image
    nodes: ['multiref', 'avatar'],
  },
} as const

export const NODE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  SCRIPT: 'script',
  VOICE: 'voice',
  LIPSYNC: 'lipsync',
  REFERENCE: 'reference',
  MULTIREF: 'multiref', // Multi-reference node for up to 14 images
  PROMPT: 'prompt',
  SORA2: 'sora2',
  VEO3: 'veo3',
  DESCRIPTION: 'description',
  AVATAR: 'avatar',
  EXPORT: 'export',
} as const

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES]

// Credit costs per generation for each generator node type
// Note: LIPSYNC uses dynamic pricing (1 credit per second of audio)
// Note: INFINITETALK uses dynamic pricing (8 credits per second of audio)
// Note: VEO3 uses dynamic pricing (Fast=20, High=35)
export const GENERATOR_CREDITS: Record<string, number> = {
  [NODE_TYPES.SORA2]: 20,
  [NODE_TYPES.VEO3]: 20, // Default fast mode (High = 35)
  [NODE_TYPES.LIPSYNC]: 1, // Base rate: 1 credit per second of audio
  [NODE_TYPES.AVATAR]: 7, // 7 credits per image (Nano Banana 2)
  infinitetalk: 8, // Base rate: 8 credits per second of audio
}

// Node types that generate content (videos/images)
export const GENERATOR_NODE_TYPES = ['sora2', 'veo3', 'audio', 'avatar'] as const // 'audio' for LipSync tool, 'avatar' for Nano Banana 2

export const NODE_CONFIG = {
  [NODE_TYPES.IMAGE]: {
    name: 'Image',
    description: 'Upload or select an image',
    color: '#3b82f6',
    hasInput: false,
    hasOutput: true,
  },
  [NODE_TYPES.VIDEO]: {
    name: 'Video',
    description: 'Upload source video for lip sync',
    color: '#3b82f6',
    hasInput: false,
    hasOutput: true,
  },
  [NODE_TYPES.AUDIO]: {
    name: 'Audio',
    description: 'Upload audio for lip sync',
    color: '#3b82f6',
    hasInput: true,  // Receives connection from VIDEO node
    hasOutput: false, // Terminal node for LipSync
  },
  [NODE_TYPES.SCRIPT]: {
    name: 'Script',
    description: 'Enter text script',
    color: '#3b82f6',
    hasInput: false,
    hasOutput: true,
  },
  [NODE_TYPES.VOICE]: {
    name: 'Voice',
    description: 'Select AI voice',
    color: '#3b82f6',
    hasInput: true,
    hasOutput: true,
  },
  [NODE_TYPES.LIPSYNC]: {
    name: 'LipSync',
    description: 'Generate video with synced lips',
    color: '#3b82f6',
    hasInput: true,
    hasOutput: false, // Terminal node - generates final video
  },
  [NODE_TYPES.REFERENCE]: {
    name: 'Reference',
    description: 'Upload reference image/video',
    color: '#8b5cf6',
    hasInput: false,
    hasOutput: true,
  },
  [NODE_TYPES.MULTIREF]: {
    name: 'References',
    description: 'Upload up to 14 reference images',
    color: '#22c55e',
    hasInput: false,
    hasOutput: true,
  },
  [NODE_TYPES.PROMPT]: {
    name: 'Prompt',
    description: 'Enter generation prompt',
    color: '#8b5cf6',
    hasInput: false,
    hasOutput: true,
  },
  [NODE_TYPES.SORA2]: {
    name: 'Sora 2',
    description: 'Prompt, duration & aspect ratio',
    color: '#8b5cf6',
    hasInput: true,
    hasOutput: false,
  },
  [NODE_TYPES.VEO3]: {
    name: 'Veo 3',
    description: 'Generate with Veo 3',
    color: '#f97316',
    hasInput: true,
    hasOutput: true,
  },
  [NODE_TYPES.DESCRIPTION]: {
    name: 'Description',
    description: 'Describe your image',
    color: '#22c55e',
    hasInput: false,
    hasOutput: true,
  },
  [NODE_TYPES.AVATAR]: {
    name: 'Nano Banana 2',
    description: 'Prompt, aspect ratio & resolution',
    color: '#22c55e',
    hasInput: true,
    hasOutput: false, // Terminal node for image generation
  },
  [NODE_TYPES.EXPORT]: {
    name: 'Export',
    description: 'Export final result',
    color: '#ef4444',
    hasInput: true,
    hasOutput: false,
  },
} as const

// Credit packs available for purchase based on subscription plan
// Base price reference: $0.025 per credit (Starter small pack)
export const CREDIT_PACKS = {
  starter: [
    { id: 'starter_small', name: 'Small', credits: 100, price: 2.50, pricePerCredit: 0.025, savings: 0 },
    { id: 'starter_medium', name: 'Medium', credits: 250, price: 5.99, pricePerCredit: 0.024, savings: 4 },
    { id: 'starter_large', name: 'Large', credits: 500, price: 10.99, pricePerCredit: 0.022, savings: 12, popular: true },
  ],
  pro: [
    { id: 'pro_small', name: 'Small', credits: 100, price: 2.20, pricePerCredit: 0.022, savings: 12 },
    { id: 'pro_medium', name: 'Medium', credits: 300, price: 5.99, pricePerCredit: 0.020, savings: 20 },
    { id: 'pro_large', name: 'Large', credits: 600, price: 10.99, pricePerCredit: 0.018, savings: 28, popular: true },
  ],
  premium: [
    { id: 'premium_small', name: 'Small', credits: 150, price: 2.99, pricePerCredit: 0.020, savings: 20 },
    { id: 'premium_medium', name: 'Medium', credits: 400, price: 6.99, pricePerCredit: 0.017, savings: 32 },
    { id: 'premium_large', name: 'Large', credits: 800, price: 12.99, pricePerCredit: 0.016, savings: 36, popular: true },
  ],
} as const

export type CreditPack = {
  id: string
  name: string
  credits: number
  price: number
  pricePerCredit: number
  savings: number
  popular?: boolean
}

export type PlanType = keyof typeof CREDIT_PACKS

// API cost per generation (in USD)
// These are the actual costs we pay to the API providers
export const API_COSTS = {
  nanobanana2: 0.05, // $0.05 per image
  sora2: 0.15, // $0.15 per video
  veo3_fast: 0.15, // $0.15 per video (fast mode)
  veo3_high: 0.25, // $0.25 per video (high quality mode)
  lipsync: 0.0075, // $0.0075 per second of video
  infinitetalk: 0.06, // $0.06 per second of video
} as const

// Helper to get the cost for a generation type
export function getApiCost(
  type: string,
  options?: { duration?: number; quality?: 'fast' | 'high' }
): number {
  const normalizedType = type.toLowerCase()

  if (normalizedType === 'nanobanana2' || normalizedType === 'avatar') {
    return API_COSTS.nanobanana2
  }

  if (normalizedType === 'sora2') {
    return API_COSTS.sora2
  }

  if (normalizedType === 'veo3') {
    return options?.quality === 'high' ? API_COSTS.veo3_high : API_COSTS.veo3_fast
  }

  if (normalizedType === 'lipsync') {
    const duration = options?.duration || 1
    return API_COSTS.lipsync * duration
  }

  if (normalizedType === 'infinitetalk') {
    const duration = options?.duration || 1
    return API_COSTS.infinitetalk * duration
  }

  return 0
}

// Generation type display configuration
export const GENERATION_TYPE_CONFIG: Record<string, { name: string; color: string }> = {
  sora2: { name: 'Sora 2', color: '#8b5cf6' },
  veo3: { name: 'Veo 3', color: '#f97316' },
  lipsync: { name: 'LipSync', color: '#3b82f6' },
  infinitetalk: { name: 'Infinite Talk', color: '#06b6d4' },
  avatar: { name: 'Nano Banana 2', color: '#22c55e' },
  nanobanana2: { name: 'Nano Banana 2', color: '#22c55e' },
  generic: { name: 'Generation', color: '#6b7280' },
}
