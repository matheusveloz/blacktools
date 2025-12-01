export const APP_NAME = 'BlackTools'
export const APP_DESCRIPTION = 'AI Video Generator Platform'

export const TOOLS = {
  LIPSYNC: 'lipsync',
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
    credits: 5,
    nodes: ['image', 'audio', 'script', 'voice', 'lipsync', 'export'],
  },
  [TOOLS.SORA2]: {
    name: 'Sora 2',
    description: 'Generate videos from text prompts',
    color: '#8b5cf6',
    credits: 10,
    nodes: ['reference', 'prompt', 'sora2', 'export'],
  },
  [TOOLS.VEO3]: {
    name: 'Veo 3',
    description: 'Create high-quality AI videos',
    color: '#f97316',
    credits: 10,
    nodes: ['reference', 'prompt', 'veo3', 'export'],
  },
  [TOOLS.AVATAR]: {
    name: 'Avatar',
    description: 'Generate AI avatars from descriptions',
    color: '#22c55e',
    credits: 3,
    nodes: ['description', 'avatar', 'export'],
  },
} as const

export const NODE_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  SCRIPT: 'script',
  VOICE: 'voice',
  LIPSYNC: 'lipsync',
  REFERENCE: 'reference',
  PROMPT: 'prompt',
  SORA2: 'sora2',
  VEO3: 'veo3',
  DESCRIPTION: 'description',
  AVATAR: 'avatar',
  EXPORT: 'export',
} as const

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES]

export const NODE_CONFIG = {
  [NODE_TYPES.IMAGE]: {
    name: 'Image',
    description: 'Upload or select an image',
    color: '#3b82f6',
    hasInput: false,
    hasOutput: true,
  },
  [NODE_TYPES.AUDIO]: {
    name: 'Audio',
    description: 'Upload or record audio',
    color: '#3b82f6',
    hasInput: false,
    hasOutput: true,
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
    description: 'Process lip synchronization',
    color: '#3b82f6',
    hasInput: true,
    hasOutput: true,
  },
  [NODE_TYPES.REFERENCE]: {
    name: 'Reference',
    description: 'Upload reference image/video',
    color: '#8b5cf6',
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
    description: 'Generate with Sora 2',
    color: '#8b5cf6',
    hasInput: true,
    hasOutput: true,
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
    description: 'Describe your avatar',
    color: '#22c55e',
    hasInput: false,
    hasOutput: true,
  },
  [NODE_TYPES.AVATAR]: {
    name: 'Avatar Gen',
    description: 'Generate avatar',
    color: '#22c55e',
    hasInput: true,
    hasOutput: true,
  },
  [NODE_TYPES.EXPORT]: {
    name: 'Export',
    description: 'Export final result',
    color: '#ef4444',
    hasInput: true,
    hasOutput: false,
  },
} as const
