'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { X, Upload, Mic, Video, Sparkles, User, Download, FileText, ChevronDown, Loader2, CheckCircle, XCircle, Clock, Copy, Image, Plus } from 'lucide-react'

// Custom Banana icon (same as sidebar)
const BananaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5" />
    <path d="M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11 3 11 3c1 0 4 0 6 2s3.5 4.5 3 8c-.5 3.5-3 6.5-6.5 8-3.5 1.5-7 1-9.85.11" />
  </svg>
)
import { WorkflowNode as WorkflowNodeType } from '@/types/workflow'
import { NODE_CONFIG, NodeType, TOOLS } from '@/lib/constants'
import { useWorkflow, MIN_PROMPT_LENGTH } from '@/hooks/use-workflow'
import { useWorkflowStore } from '@/stores/workflow-store'
import { useConnectionStore } from '@/stores/connection-store'
import { useUserContext } from '@/contexts/user-context'
import { uploadFileToStorage } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'

type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed' | undefined

const nodeIcons: Record<NodeType, React.ReactNode> = {
  image: <Upload className="w-[18px] h-[18px]" />,
  video: <Video className="w-[18px] h-[18px]" />,
  audio: <Mic className="w-[18px] h-[18px]" />,
  script: <FileText className="w-[18px] h-[18px]" />,
  voice: <Mic className="w-[18px] h-[18px]" />,
  lipsync: <Video className="w-[18px] h-[18px]" />,
  reference: <Upload className="w-[18px] h-[18px]" />,
  multiref: <Image className="w-[18px] h-[18px]" />,
  prompt: <FileText className="w-[18px] h-[18px]" />,
  sora2: <Video className="w-[18px] h-[18px]" />,
  veo3: <Sparkles className="w-[18px] h-[18px]" />,
  description: <FileText className="w-[18px] h-[18px]" />,
  avatar: <BananaIcon className="w-[18px] h-[18px]" />,
  export: <Download className="w-[18px] h-[18px]" />,
}

const durationOptions = [
  { value: '10s', label: '10s' },
  { value: '15s', label: '15s' },
]

const modelOptions = [
  { value: 'fast', label: 'Fast' },
  { value: 'standard', label: 'High' },
]

function DurationDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = durationOptions.find(o => o.value === value) || durationOptions[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="w-full py-2.5 px-2 text-xs bg-secondary border border-muted rounded-lg focus:outline-none focus:border-white cursor-pointer flex items-center justify-between gap-1"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {selected.label}
        </span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-muted rounded-lg overflow-hidden z-50">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                'w-full py-2 px-2 text-xs flex items-center gap-1.5 hover:bg-muted transition-colors',
                option.value === value && 'bg-muted'
              )}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const aspectOptions = [
  { value: '9:16', icon: <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor"><rect width="8" height="14" rx="1" /></svg> },
  { value: '16:9', icon: <svg width="14" height="8" viewBox="0 0 14 8" fill="currentColor"><rect width="14" height="8" rx="1" /></svg> },
]

function AspectDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = aspectOptions.find(o => o.value === value) || aspectOptions[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="w-full py-2.5 px-2 text-xs bg-secondary border border-muted rounded-lg focus:outline-none focus:border-white cursor-pointer flex items-center justify-between gap-1"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5">
          {selected.icon}
          {selected.value}
        </span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-muted rounded-lg overflow-hidden z-50">
          {aspectOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                'w-full py-2 px-2 text-xs flex items-center gap-1.5 hover:bg-muted transition-colors',
                option.value === value && 'bg-muted'
              )}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.icon}
              {option.value}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Sora2 Node Content - separated to use useEffect for status timer
interface Sora2NodeContentProps {
  node: WorkflowNodeType
  updateNode: (id: string, updates: Partial<WorkflowNodeType>) => void
  isWorkflowLocked: boolean
}

function Sora2NodeContent({ node, updateNode, isWorkflowLocked }: Sora2NodeContentProps) {
  // Use LOCAL state for the prompt to prevent resets during external store updates
  const [localText, setLocalText] = useState((node.data.text as string) || '')
  const localTextRef = useRef(localText)
  localTextRef.current = localText

  // Track if user is actively typing (has focus)
  const isTypingRef = useRef(false)

  // Sync from store to local ONLY when node.data.text changes externally
  // AND user is NOT actively typing
  useEffect(() => {
    const storeText = (node.data.text as string) || ''
    if (!isTypingRef.current && storeText !== localTextRef.current) {
      setLocalText(storeText)
    }
  }, [node.data.text])

  const sora2Status = node.data.status as GenerationStatus
  const sora2Error = node.data.error as string | undefined
  const isGenerating = sora2Status === 'pending' || sora2Status === 'processing'

  // Clear stale status on mount (after page refresh)
  const hasCleared = useRef(false)
  useEffect(() => {
    if (hasCleared.current) return
    hasCleared.current = true

    // Clear pending/processing status (stale from previous session)
    // Also clear failed status with "fetch" error (interrupted by refresh)
    const isStaleStatus =
      sora2Status === 'pending' ||
      sora2Status === 'processing' ||
      (sora2Status === 'failed' && sora2Error?.includes('fetch'))

    if (isStaleStatus) {
      updateNode(node.id, {
        data: {
          ...node.data,
          status: undefined,
          error: undefined
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clear completed or failed status after 30 seconds
  useEffect(() => {
    if (sora2Status === 'completed' || sora2Status === 'failed') {
      const timer = setTimeout(() => {
        updateNode(node.id, {
          data: {
            text: localTextRef.current, // Use local text ref to preserve user input
            duration: node.data.duration,
            aspect: node.data.aspect,
            filled: localTextRef.current.trim().length >= MIN_PROMPT_LENGTH,
            status: undefined,
            resultUrl: undefined,
            error: undefined
          }
        })
      }, 30000) // 30 seconds

      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sora2Status, node.id])

  // Handle text change - update local state immediately, sync to store
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setLocalText(newText)
    updateNode(node.id, {
      data: {
        ...node.data,
        text: newText,
        filled: newText.trim().length >= MIN_PROMPT_LENGTH
      }
    })
  }, [node.id, node.data, updateNode])

  return (
    <div className="space-y-3">
      {/* Status indicator */}
      {sora2Status && (
        <div className={cn(
          'flex items-center gap-2 p-2.5 rounded-lg text-xs',
          sora2Status === 'pending' && 'bg-yellow-500/10 text-yellow-500',
          sora2Status === 'processing' && 'bg-blue-500/10 text-blue-500',
          sora2Status === 'completed' && 'bg-green-500/10 text-green-500',
          sora2Status === 'failed' && 'bg-red-500/10 text-red-500'
        )}>
          {sora2Status === 'pending' && <Clock className="w-4 h-4" />}
          {sora2Status === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
          {sora2Status === 'completed' && <CheckCircle className="w-4 h-4" />}
          {sora2Status === 'failed' && <XCircle className="w-4 h-4" />}
          <span className="font-medium">
            {sora2Status === 'pending' && 'Waiting...'}
            {sora2Status === 'processing' && 'Generating video...'}
            {sora2Status === 'completed' && 'Completed! Check Results'}
            {sora2Status === 'failed' && 'Failed'}
          </span>
        </div>
      )}

      {/* Error message */}
      {sora2Error && (
        <div className="text-[10px] text-red-400 bg-red-500/10 p-2 rounded">
          {sora2Error}
        </div>
      )}

      {/* Prompt input - always visible, disabled when generating */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
          Prompt
        </label>
        <textarea
          className="w-full min-h-[60px] max-h-[200px] p-2.5 text-xs leading-relaxed bg-secondary border border-muted rounded-lg resize-y focus:outline-none focus:border-white placeholder:text-muted-foreground disabled:opacity-50"
          placeholder="Describe your video..."
          value={localText}
          maxLength={1000}
          disabled={isGenerating || isWorkflowLocked}
          onMouseDown={(e) => e.stopPropagation()}
          onFocus={() => { isTypingRef.current = true }}
          onBlur={() => { isTypingRef.current = false }}
          onChange={handleTextChange}
        />
        <div className="text-[10px] text-muted-foreground text-right mt-1">
          {localText.length}/1000
        </div>
      </div>

      {/* Duration & Aspect - disabled when generating */}
      <div className="flex gap-2">
        <div className={cn('flex-1', (isGenerating || isWorkflowLocked) && 'opacity-50 pointer-events-none')}>
          <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
            Duration
          </label>
          <DurationDropdown
            value={(node.data.duration as string) || '15s'}
            onChange={(v) => updateNode(node.id, { data: { ...node.data, duration: v } })}
          />
        </div>
        <div className={cn('flex-1', (isGenerating || isWorkflowLocked) && 'opacity-50 pointer-events-none')}>
          <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
            Aspect
          </label>
          <AspectDropdown
            value={(node.data.aspect as string) || '9:16'}
            onChange={(v) => updateNode(node.id, { data: { ...node.data, aspect: v } })}
          />
        </div>
      </div>
    </div>
  )
}

function ModelDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = modelOptions.find(o => o.value === value) || modelOptions[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="w-full py-2.5 px-2 text-xs bg-secondary border border-muted rounded-lg focus:outline-none focus:border-white cursor-pointer flex items-center justify-between gap-1"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          {selected.label}
        </span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-muted rounded-lg overflow-hidden z-50">
          {modelOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                'w-full py-2 px-2 text-xs flex items-center gap-1.5 hover:bg-muted transition-colors',
                option.value === value && 'bg-muted'
              )}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Nano Banana aspect ratio options (10 ratios)
const nanoBananaAspectOptions = [
  { value: '1:1', label: '1:1', icon: <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect width="10" height="10" rx="1" /></svg> },
  { value: '16:9', label: '16:9', icon: <svg width="14" height="8" viewBox="0 0 14 8" fill="currentColor"><rect width="14" height="8" rx="1" /></svg> },
  { value: '9:16', label: '9:16', icon: <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor"><rect width="8" height="14" rx="1" /></svg> },
  { value: '4:3', label: '4:3', icon: <svg width="12" height="9" viewBox="0 0 12 9" fill="currentColor"><rect width="12" height="9" rx="1" /></svg> },
  { value: '3:4', label: '3:4', icon: <svg width="9" height="12" viewBox="0 0 9 12" fill="currentColor"><rect width="9" height="12" rx="1" /></svg> },
  { value: '21:9', label: '21:9', icon: <svg width="16" height="7" viewBox="0 0 16 7" fill="currentColor"><rect width="16" height="7" rx="1" /></svg> },
]

function NanoBananaAspectDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = nanoBananaAspectOptions.find(o => o.value === value) || nanoBananaAspectOptions[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="w-full py-2.5 px-2 text-xs bg-secondary border border-muted rounded-lg focus:outline-none focus:border-white cursor-pointer flex items-center justify-between gap-1"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5">
          {selected.icon}
          {selected.label}
        </span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-muted rounded-lg overflow-hidden z-50 max-h-[200px] overflow-y-auto">
          {nanoBananaAspectOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                'w-full py-2 px-2 text-xs flex items-center gap-1.5 hover:bg-muted transition-colors',
                option.value === value && 'bg-muted'
              )}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Resolution dropdown for Nano Banana 2
const resolutionOptions = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
]

function ResolutionDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = resolutionOptions.find(o => o.value === value) || resolutionOptions[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="w-full py-2.5 px-2 text-xs bg-secondary border border-muted rounded-lg focus:outline-none focus:border-white cursor-pointer flex items-center justify-between gap-1"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          {selected.label}
        </span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-muted rounded-lg overflow-hidden z-50">
          {resolutionOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                'w-full py-2 px-2 text-xs flex items-center gap-1.5 hover:bg-muted transition-colors',
                option.value === value && 'bg-muted'
              )}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Veo3 Node Content - with Model, Duration (fixed), and Aspect
interface Veo3NodeContentProps {
  node: WorkflowNodeType
  updateNode: (id: string, updates: Partial<WorkflowNodeType>) => void
  isWorkflowLocked: boolean
}

function Veo3NodeContent({ node, updateNode, isWorkflowLocked }: Veo3NodeContentProps) {
  // Use LOCAL state for the prompt to prevent resets during external store updates
  const [localText, setLocalText] = useState((node.data.text as string) || '')
  const localTextRef = useRef(localText)
  localTextRef.current = localText

  // Track if user is actively typing (has focus)
  const isTypingRef = useRef(false)

  // Sync from store to local ONLY when node.data.text changes externally
  // AND user is NOT actively typing
  useEffect(() => {
    const storeText = (node.data.text as string) || ''
    if (!isTypingRef.current && storeText !== localTextRef.current) {
      setLocalText(storeText)
    }
  }, [node.data.text])

  const veo3Status = node.data.status as GenerationStatus
  const veo3Error = node.data.error as string | undefined
  const isGenerating = veo3Status === 'pending' || veo3Status === 'processing'

  // Clear stale status on mount (after page refresh)
  const hasCleared = useRef(false)
  useEffect(() => {
    if (hasCleared.current) return
    hasCleared.current = true

    // Clear pending/processing status (stale from previous session)
    // Also clear failed status with "fetch" error (interrupted by refresh)
    const isStaleStatus =
      veo3Status === 'pending' ||
      veo3Status === 'processing' ||
      (veo3Status === 'failed' && veo3Error?.includes('fetch'))

    if (isStaleStatus) {
      updateNode(node.id, {
        data: {
          ...node.data,
          status: undefined,
          error: undefined
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clear completed or failed status after 30 seconds
  useEffect(() => {
    if (veo3Status === 'completed' || veo3Status === 'failed') {
      const timer = setTimeout(() => {
        updateNode(node.id, {
          data: {
            text: localTextRef.current, // Use local text ref to preserve user input
            speed: node.data.speed,
            aspect: node.data.aspect,
            filled: localTextRef.current.trim().length >= MIN_PROMPT_LENGTH,
            status: undefined,
            resultUrl: undefined,
            error: undefined
          }
        })
      }, 30000) // 30 seconds

      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veo3Status, node.id])

  // Handle text change - update local state immediately, sync to store
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setLocalText(newText)
    updateNode(node.id, {
      data: {
        ...node.data,
        text: newText,
        filled: newText.trim().length >= MIN_PROMPT_LENGTH
      }
    })
  }, [node.id, node.data, updateNode])

  return (
    <div className="space-y-3">
      {/* Status indicator */}
      {veo3Status && (
        <div className={cn(
          'flex items-center gap-2 p-2.5 rounded-lg text-xs',
          veo3Status === 'pending' && 'bg-yellow-500/10 text-yellow-500',
          veo3Status === 'processing' && 'bg-blue-500/10 text-blue-500',
          veo3Status === 'completed' && 'bg-green-500/10 text-green-500',
          veo3Status === 'failed' && 'bg-red-500/10 text-red-500'
        )}>
          {veo3Status === 'pending' && <Clock className="w-4 h-4" />}
          {veo3Status === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
          {veo3Status === 'completed' && <CheckCircle className="w-4 h-4" />}
          {veo3Status === 'failed' && <XCircle className="w-4 h-4" />}
          <span className="font-medium">
            {veo3Status === 'pending' && 'Waiting...'}
            {veo3Status === 'processing' && 'Generating video...'}
            {veo3Status === 'completed' && 'Completed! Check Results'}
            {veo3Status === 'failed' && 'Failed'}
          </span>
        </div>
      )}

      {/* Error message */}
      {veo3Error && (
        <div className="text-[10px] text-red-400 bg-red-500/10 p-2 rounded">
          {veo3Error}
        </div>
      )}

      {/* Prompt input - always visible, disabled when generating */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
          Prompt
        </label>
        <textarea
          className="w-full min-h-[60px] max-h-[200px] p-2.5 text-xs leading-relaxed bg-secondary border border-muted rounded-lg resize-y focus:outline-none focus:border-white placeholder:text-muted-foreground disabled:opacity-50"
          placeholder="Describe your video..."
          value={localText}
          maxLength={1000}
          disabled={isGenerating || isWorkflowLocked}
          onMouseDown={(e) => e.stopPropagation()}
          onFocus={() => { isTypingRef.current = true }}
          onBlur={() => { isTypingRef.current = false }}
          onChange={handleTextChange}
        />
        <div className="text-[10px] text-muted-foreground text-right mt-1">
          {localText.length}/1000
        </div>
      </div>

      {/* Model, Duration & Aspect - disabled when generating */}
      <div className="flex gap-2">
        <div className={cn('flex-1', (isGenerating || isWorkflowLocked) && 'opacity-50 pointer-events-none')}>
          <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
            Model
          </label>
          <ModelDropdown
            value={(node.data.speed as string) || 'fast'}
            onChange={(v) => updateNode(node.id, { data: { ...node.data, speed: v } })}
          />
        </div>
        <div className="flex-1 opacity-50">
          <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
            Duration
          </label>
          <div className="w-full py-2.5 px-2 text-xs bg-secondary border border-muted rounded-lg flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            8s
          </div>
        </div>
        <div className={cn('flex-1', (isGenerating || isWorkflowLocked) && 'opacity-50 pointer-events-none')}>
          <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
            Aspect
          </label>
          <AspectDropdown
            value={(node.data.aspect as string) || '9:16'}
            onChange={(v) => updateNode(node.id, { data: { ...node.data, aspect: v } })}
          />
        </div>
      </div>
    </div>
  )
}

// Audio Node Content (Infinity Talk) - with Prompt and Audio Upload
interface AudioNodeContentProps {
  node: WorkflowNodeType
  updateNode: (id: string, updates: Partial<WorkflowNodeType>) => void
  isWorkflowLocked: boolean
  user: { id: string } | null
  selectedTool?: string | null
}

function AudioNodeContent({ node, updateNode, isWorkflowLocked, user, selectedTool }: AudioNodeContentProps) {
  // Use LOCAL state for the prompt to prevent resets during external store updates
  const [localPrompt, setLocalPrompt] = useState((node.data.text as string) || '')
  const localPromptRef = useRef(localPrompt)
  localPromptRef.current = localPrompt

  // Track if user is actively typing (has focus)
  const isTypingRef = useRef(false)

  // Sync from store to local ONLY when node.data.text changes externally
  // AND user is NOT actively typing
  useEffect(() => {
    const storeText = (node.data.text as string) || ''
    if (!isTypingRef.current && storeText !== localPromptRef.current) {
      setLocalPrompt(storeText)
    }
  }, [node.data.text])

  const audioUrl = node.data.audioUrl as string | undefined
  const audioDuration = node.data.audioDuration as number | undefined
  const isAudioUploading = node.data.isUploading as boolean | undefined
  const audioUploadError = node.data.uploadError as string | undefined

  const MAX_AUDIO_DURATION = 600 // 10 minutes max

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Helper to get fresh node data from store (avoids stale closures)
    const getFreshData = () => {
      const currentNode = useWorkflowStore.getState().nodes.find(n => n.id === node.id)
      return currentNode?.data || {}
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      updateNode(node.id, {
        data: { ...getFreshData(), uploadError: 'Invalid file type. Use MP3, WAV, etc.' }
      })
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(0)
      updateNode(node.id, {
        data: { ...getFreshData(), uploadError: `File too large (${sizeMB}MB). Max: 50MB` }
      })
      return
    }

    if (!user?.id) {
      return
    }

    // Clear any previous error
    updateNode(node.id, { data: { ...getFreshData(), uploadError: undefined, isUploading: true } })

    try {
      // Get audio duration first
      const audioElement = new Audio()
      const objectUrl = URL.createObjectURL(file)

      audioElement.src = objectUrl
      await new Promise<void>((resolve, reject) => {
        audioElement.onloadedmetadata = () => resolve()
        audioElement.onerror = () => reject()
      })

      const duration = Math.ceil(audioElement.duration)
      URL.revokeObjectURL(objectUrl)

      // Validate audio duration (max 10 minutes = 600 seconds)
      if (duration > MAX_AUDIO_DURATION) {
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        updateNode(node.id, {
          data: {
            ...getFreshData(),
            uploadError: `Audio too long (${minutes}m ${seconds}s). Max: 10 minutes`,
            isUploading: false
          }
        })
        return
      }

      // Upload directly to Supabase Storage (avoids body size limits)
      const result = await uploadFileToStorage(file, user.id, 'audio')

      if (result.success && result.publicUrl) {
        updateNode(node.id, {
          data: {
            ...getFreshData(),
            audioUrl: result.publicUrl,
            fileName: file.name,
            audioDuration: duration,
            filled: true,
            isUploading: false,
            uploadError: undefined
          }
        })
      } else {
        updateNode(node.id, {
          data: {
            ...getFreshData(),
            isUploading: false,
            uploadError: result.error || 'Upload failed'
          }
        })
      }
    } catch (error) {
      updateNode(node.id, {
        data: {
          ...getFreshData(),
          isUploading: false,
          uploadError: 'Failed to process audio file'
        }
      })
    }
  }

  const handleRemoveAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isWorkflowLocked) return
    updateNode(node.id, {
      data: {
        ...node.data,
        audioUrl: undefined,
        fileName: undefined,
        audioDuration: undefined,
        filled: false
      }
    })
  }

  // Handle prompt change
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setLocalPrompt(newText)
    updateNode(node.id, {
      data: {
        ...node.data,
        text: newText,
      }
    })
  }, [node.id, node.data, updateNode])

  // Only show prompt for Infinite Talk tool
  const showPrompt = selectedTool === TOOLS.INFINITETALK

  return (
    <div className="space-y-3">
      {/* Prompt input - only for Infinite Talk */}
      {showPrompt && (
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
            Image Behavior Prompt (Optional)
          </label>
          <textarea
            className="w-full min-h-[60px] max-h-[200px] p-2.5 text-xs leading-relaxed bg-secondary border border-muted rounded-lg resize-y focus:outline-none focus:border-white placeholder:text-muted-foreground disabled:opacity-50"
            placeholder="Describe how the image should behave in the video..."
            value={localPrompt}
            maxLength={1000}
            disabled={isWorkflowLocked}
            onMouseDown={(e) => e.stopPropagation()}
            onFocus={() => { isTypingRef.current = true }}
            onBlur={() => { isTypingRef.current = false }}
            onChange={handlePromptChange}
          />
          <div className="text-[10px] text-muted-foreground text-right mt-1">
            {localPrompt.length}/1000
          </div>
        </div>
      )}

      {/* Audio upload */}
      {audioUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-primary bg-secondary p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {(node.data.fileName as string) || 'Audio uploaded'}
              </p>
              {audioDuration && (
                <p className="text-[10px] text-muted-foreground">
                  Duration: {audioDuration}s
                </p>
              )}
            </div>
            {!isWorkflowLocked && (
              <button
                onClick={handleRemoveAudio}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-6 h-6 bg-muted hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <audio
            src={audioUrl}
            controls
            className="w-full mt-2 h-8"
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
      ) : (
        <label
          className={cn(
            'border-2 border-dashed border-muted rounded-lg p-5 text-center transition-all block',
            (isAudioUploading || isWorkflowLocked)
              ? 'opacity-50 pointer-events-none cursor-not-allowed'
              : 'cursor-pointer hover:border-white hover:bg-white/[0.02]'
          )}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleAudioSelect}
            disabled={isAudioUploading || isWorkflowLocked}
          />
          <div className="flex flex-col items-center gap-1.5">
            {isAudioUploading ? (
              <>
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                <span className="text-xs text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Click to upload audio</span>
                <span className="text-[10px] text-muted-foreground/60">MP3, WAV up to 50MB</span>
              </>
            )}
          </div>
        </label>
      )}
      {audioUploadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-2">
          <p className="text-[11px] text-red-400 text-center">{audioUploadError}</p>
        </div>
      )}
    </div>
  )
}

// Avatar Node Content (Nano Banana 2) - with Prompt, Aspect Ratio & Resolution
interface AvatarNodeContentProps {
  node: WorkflowNodeType
  updateNode: (id: string, updates: Partial<WorkflowNodeType>) => void
  isWorkflowLocked: boolean
}

function AvatarNodeContent({ node, updateNode, isWorkflowLocked }: AvatarNodeContentProps) {
  // Use LOCAL state for the prompt to prevent resets during external store updates
  const [localText, setLocalText] = useState((node.data.text as string) || '')
  const localTextRef = useRef(localText)
  localTextRef.current = localText

  // Track if user is actively typing (has focus)
  const isTypingRef = useRef(false)

  // Sync from store to local ONLY when node.data.text changes externally
  // AND user is NOT actively typing
  useEffect(() => {
    const storeText = (node.data.text as string) || ''
    // Only sync if user is not typing and text is different
    if (!isTypingRef.current && storeText !== localTextRef.current) {
      setLocalText(storeText)
    }
  }, [node.data.text])

  const avatarStatus = node.data.status as GenerationStatus
  const avatarError = node.data.error as string | undefined
  const isGenerating = avatarStatus === 'pending' || avatarStatus === 'processing'

  // Clear stale status on mount (after page refresh)
  // This handles cases where the page was refreshed during generation
  const hasCleared = useRef(false)
  useEffect(() => {
    if (hasCleared.current) return
    hasCleared.current = true

    // Clear failed status with "Failed to fetch" error (interrupted by refresh)
    // Also clear pending/processing status (stale from previous session)
    const isStaleStatus =
      avatarStatus === 'pending' ||
      avatarStatus === 'processing' ||
      (avatarStatus === 'failed' && avatarError?.includes('fetch'))

    if (isStaleStatus) {
      updateNode(node.id, {
        data: {
          ...node.data,
          status: undefined,
          error: undefined
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clear completed or failed status after 30 seconds
  useEffect(() => {
    if (avatarStatus === 'completed' || avatarStatus === 'failed') {
      const timer = setTimeout(() => {
        updateNode(node.id, {
          data: {
            text: localTextRef.current, // Use local text ref to preserve user input
            aspect: node.data.aspect,
            resolution: node.data.resolution,
            filled: localTextRef.current.trim().length >= MIN_PROMPT_LENGTH,
            status: undefined,
            resultUrl: undefined,
            error: undefined
          }
        })
      }, 30000) // 30 seconds

      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarStatus, node.id])

  // Handle text change - update local state immediately, debounce store update
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setLocalText(newText)
    // Update store immediately for validation to work
    updateNode(node.id, {
      data: {
        ...node.data,
        text: newText,
        filled: newText.trim().length >= MIN_PROMPT_LENGTH
      }
    })
  }, [node.id, node.data, updateNode])

  return (
    <div className="space-y-3">
      {/* Status indicator */}
      {avatarStatus && (
        <div className={cn(
          'flex items-center gap-2 p-2.5 rounded-lg text-xs',
          avatarStatus === 'pending' && 'bg-yellow-500/10 text-yellow-500',
          avatarStatus === 'processing' && 'bg-blue-500/10 text-blue-500',
          avatarStatus === 'completed' && 'bg-green-500/10 text-green-500',
          avatarStatus === 'failed' && 'bg-red-500/10 text-red-500'
        )}>
          {avatarStatus === 'pending' && <Clock className="w-4 h-4" />}
          {avatarStatus === 'processing' && <Loader2 className="w-4 h-4 animate-spin" />}
          {avatarStatus === 'completed' && <CheckCircle className="w-4 h-4" />}
          {avatarStatus === 'failed' && <XCircle className="w-4 h-4" />}
          <span className="font-medium">
            {avatarStatus === 'pending' && 'Waiting...'}
            {avatarStatus === 'processing' && 'Generating image...'}
            {avatarStatus === 'completed' && 'Completed! Check Results'}
            {avatarStatus === 'failed' && 'Failed'}
          </span>
        </div>
      )}

      {/* Error message */}
      {avatarError && (
        <div className="text-[10px] text-red-400 bg-red-500/10 p-2 rounded">
          {avatarError}
        </div>
      )}

      {/* Prompt input - always visible, disabled when generating */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
          Prompt
        </label>
        <textarea
          className="w-full min-h-[60px] max-h-[200px] p-2.5 text-xs leading-relaxed bg-secondary border border-muted rounded-lg resize-y focus:outline-none focus:border-white placeholder:text-muted-foreground disabled:opacity-50"
          placeholder="Describe the image you want to generate..."
          value={localText}
          maxLength={1000}
          disabled={isGenerating || isWorkflowLocked}
          onMouseDown={(e) => e.stopPropagation()}
          onFocus={() => { isTypingRef.current = true }}
          onBlur={() => { isTypingRef.current = false }}
          onChange={handleTextChange}
        />
        <div className="text-[10px] text-muted-foreground text-right mt-1">
          {localText.length}/1000
        </div>
      </div>

      {/* Aspect Ratio & Resolution - disabled when generating */}
      <div className="flex gap-2">
        <div className={cn('flex-1', (isGenerating || isWorkflowLocked) && 'opacity-50 pointer-events-none')}>
          <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
            Aspect
          </label>
          <NanoBananaAspectDropdown
            value={(node.data.aspect as string) || '1:1'}
            onChange={(v) => updateNode(node.id, { data: { ...node.data, aspect: v } })}
          />
        </div>
        <div className={cn('flex-1', (isGenerating || isWorkflowLocked) && 'opacity-50 pointer-events-none')}>
          <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
            Resolution
          </label>
          <ResolutionDropdown
            value={(node.data.resolution as string) || '1K'}
            onChange={(v) => updateNode(node.id, { data: { ...node.data, resolution: v } })}
          />
        </div>
      </div>
    </div>
  )
}

interface WorkflowNodeProps {
  node: WorkflowNodeType
}

export function WorkflowNode({ node }: WorkflowNodeProps) {
  const { removeNode, selectNode, selectedNodeId, updateNode, addConnection, connections, isWorkflowLocked, addNode } = useWorkflow()
  const selectedTool = useWorkflowStore((state) => state.selectedTool)
  const { startDrag, updateDrag, endDrag } = useConnectionStore()
  const { user } = useUserContext()
  const config = NODE_CONFIG[node.type]
  const isSelected = selectedNodeId === node.id
  const isFilled = node.data?.filled || false

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: node,
  })

  // Check if ports are connected
  const isInputConnected = connections.some(c => c.targetNodeId === node.id)
  const isOutputConnected = connections.some(c => c.sourceNodeId === node.id)

  // Duplicate node with all its data
  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (isWorkflowLocked) return

    const newNode: WorkflowNodeType = {
      id: Math.random().toString(36).substring(2, 15),
      type: node.type,
      position: {
        x: node.position.x + 30,
        y: node.position.y + 30
      },
      data: { ...node.data },
      tool: node.tool
    }
    addNode(newNode)
  }, [node, addNode, isWorkflowLocked])

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    left: node.position.x,
    top: node.position.y,
  }

  // Unified handler for both mouse and touch events
  const handlePortInteraction = useCallback((
    e: React.MouseEvent | React.TouchEvent,
    port: 'input' | 'output'
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const isTouchEvent = 'touches' in e
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY

    // Get the actual port element position
    const portElement = e.target as HTMLElement
    const container = document.querySelector('.workflow-canvas-container')

    if (!container) return

    const portRect = portElement.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const { zoom, pan } = useWorkflowStore.getState()

    // Calculate start position from actual port center, in canvas coordinates
    const startX = (portRect.left + portRect.width / 2 - containerRect.left - pan.x) / zoom
    const startY = (portRect.top + portRect.height / 2 - containerRect.top - pan.y) / zoom

    // Store the source info for this drag operation
    const sourceNodeId = node.id
    const sourcePort = port

    startDrag(sourceNodeId, sourcePort, startX, startY)

    let lastHoveredPort: HTMLElement | null = null

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault()

      const isTouchMove = 'touches' in moveEvent
      const moveX = isTouchMove ? moveEvent.touches[0].clientX : moveEvent.clientX
      const moveY = isTouchMove ? moveEvent.touches[0].clientY : moveEvent.clientY

      const container = document.querySelector('.workflow-canvas-container')
      if (!container) return

      const containerRect = container.getBoundingClientRect()

      // Get current zoom and pan from store (to avoid stale closure)
      const { zoom, pan } = useWorkflowStore.getState()

      // Convert position to canvas coordinates using current zoom and pan
      const canvasX = (moveX - containerRect.left - pan.x) / zoom
      const canvasY = (moveY - containerRect.top - pan.y) / zoom

      updateDrag(canvasX, canvasY)

      // Handle hover effect on target ports
      const targetElement = document.elementFromPoint(moveX, moveY)

      // Only consider it a port if the element itself has the 'port' class
      const isPort = targetElement?.classList.contains('port')
      const targetPort = isPort ? targetElement as HTMLElement : null

      // Remove hover from previous port
      if (lastHoveredPort && lastHoveredPort !== targetPort) {
        lastHoveredPort.classList.remove('port-hover')
      }

      // Add hover to current port if it's a valid target
      if (targetPort) {
        const targetNodeId = targetPort.dataset.nodeId
        const targetPortType = targetPort.dataset.port

        // Only highlight if it's a valid connection target
        const isValidTarget = targetNodeId !== sourceNodeId && (
          (sourcePort === 'output' && targetPortType === 'input') ||
          (sourcePort === 'input' && targetPortType === 'output')
        )

        if (isValidTarget) {
          targetPort.classList.add('port-hover')
          lastHoveredPort = targetPort
        }
      } else {
        lastHoveredPort = null
      }
    }

    const handleEnd = (endEvent: MouseEvent | TouchEvent) => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)

      // Remove any hover effect
      if (lastHoveredPort) {
        lastHoveredPort.classList.remove('port-hover')
      }

      // Get end position
      const isTouchEnd = 'changedTouches' in endEvent
      const endX = isTouchEnd ? endEvent.changedTouches[0].clientX : endEvent.clientX
      const endY = isTouchEnd ? endEvent.changedTouches[0].clientY : endEvent.clientY

      // Check if we're EXACTLY over a port (not just inside a node)
      const targetElement = document.elementFromPoint(endX, endY)

      // Only accept if the element itself has the 'port' class (not a parent)
      const isPort = targetElement?.classList.contains('port')

      if (isPort && targetElement) {
        const targetPort = targetElement as HTMLElement
        const targetNodeId = targetPort.dataset.nodeId
        const targetPortType = targetPort.dataset.port as 'input' | 'output'

        // Only connect output -> input or input -> output, and not to same node
        if (targetNodeId && targetNodeId !== sourceNodeId) {
          if (sourcePort === 'output' && targetPortType === 'input') {
            addConnection({
              id: `conn-${Date.now()}`,
              sourceNodeId: sourceNodeId,
              targetNodeId: targetNodeId,
            })
          } else if (sourcePort === 'input' && targetPortType === 'output') {
            addConnection({
              id: `conn-${Date.now()}`,
              sourceNodeId: targetNodeId,
              targetNodeId: sourceNodeId,
            })
          }
        }
      }

      endDrag()
    }

    // Add both mouse and touch listeners
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
  }, [node.id, startDrag, updateDrag, endDrag, addConnection])

  // Legacy handler for backwards compatibility
  const handlePortMouseDown = useCallback((e: React.MouseEvent, port: 'input' | 'output') => {
    handlePortInteraction(e, port)
  }, [handlePortInteraction])

  const handlePortTouchStart = useCallback((e: React.TouchEvent, port: 'input' | 'output') => {
    handlePortInteraction(e, port)
  }, [handlePortInteraction])

  const renderNodeContent = () => {
    switch (node.type) {
      case 'image':
      case 'reference':
        const imageUrl = node.data.imageUrl as string | undefined
        const isUploading = node.data.isUploading as boolean | undefined
        const imageUploadError = node.data.uploadError as string | undefined

        const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (!file) return

          // Helper to get fresh node data from store (avoids stale closures)
          const getFreshData = () => {
            const currentNode = useWorkflowStore.getState().nodes.find(n => n.id === node.id)
            return currentNode?.data || {}
          }

          // Validate file type
          if (!file.type.startsWith('image/')) {
            updateNode(node.id, {
              data: { ...getFreshData(), uploadError: 'Invalid file type. Use PNG, JPG, etc.' }
            })
            return
          }

          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(0)
            updateNode(node.id, {
              data: { ...getFreshData(), uploadError: `File too large (${sizeMB}MB). Max: 10MB` }
            })
            return
          }

          if (!user?.id) {
            return
          }

          // Clear any previous error and start uploading
          updateNode(node.id, { data: { ...getFreshData(), uploadError: undefined, isUploading: true } })

          try {
            // Upload to Supabase Storage for persistence
            // The Sora2 API will convert URL to base64 when needed
            const result = await uploadFileToStorage(file, user.id, 'image')

            if (result.success && result.publicUrl) {
              updateNode(node.id, {
                data: {
                  ...getFreshData(),
                  imageUrl: result.publicUrl,
                  fileName: file.name,
                  filled: true,
                  isUploading: false,
                  uploadError: undefined
                }
              })
            } else {
              updateNode(node.id, {
                data: { ...getFreshData(), isUploading: false, uploadError: result.error || 'Upload failed' }
              })
            }
          } catch (error) {
            updateNode(node.id, { data: { ...getFreshData(), isUploading: false, uploadError: 'Upload failed' } })
          }
        }

        const handleRemoveImage = (e: React.MouseEvent) => {
          e.stopPropagation()
          if (isWorkflowLocked) return
          updateNode(node.id, {
            data: {
              ...node.data,
              imageUrl: undefined,
              fileName: undefined,
              filled: false
            }
          })
        }

        return (
          <div className="space-y-2">
            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-primary">
                <img
                  src={imageUrl}
                  alt="Reference"
                  className="w-full aspect-video object-cover"
                />
                {!isWorkflowLocked && (
                  <button
                    onClick={handleRemoveImage}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                  <p className="text-[10px] text-white truncate">
                    {(node.data.fileName as string) || 'Image uploaded'}
                  </p>
                </div>
              </div>
            ) : (
              <label
                className={cn(
                  'border-2 border-dashed border-muted rounded-lg p-5 text-center transition-all block',
                  (isUploading || isWorkflowLocked)
                    ? 'opacity-50 pointer-events-none cursor-not-allowed'
                    : 'cursor-pointer hover:border-white hover:bg-white/[0.02]'
                )}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading || isWorkflowLocked}
                />
                <div className="flex flex-col items-center gap-1.5">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                      <span className="text-xs text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Click to upload</span>
                      <span className="text-[10px] text-muted-foreground/60">PNG, JPG up to 10MB</span>
                    </>
                  )}
                </div>
              </label>
            )}
            {imageUploadError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-2">
                <p className="text-[11px] text-red-400 text-center">{imageUploadError}</p>
              </div>
            )}
          </div>
        )

      case 'video': {
        const videoUrl = node.data.videoUrl as string | undefined
        const isVideoUploading = node.data.isUploading as boolean | undefined
        const uploadError = node.data.uploadError as string | undefined

        const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (!file) return

          // Helper to get fresh node data from store (avoids stale closures)
          const getFreshData = () => {
            const currentNode = useWorkflowStore.getState().nodes.find(n => n.id === node.id)
            return currentNode?.data || {}
          }

          // Validate file type
          if (!file.type.startsWith('video/')) {
            updateNode(node.id, {
              data: { ...getFreshData(), uploadError: 'Invalid file type. Use MP4 or WebM.' }
            })
            return
          }

          // Validate file size (max 100MB)
          if (file.size > 100 * 1024 * 1024) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(0)
            updateNode(node.id, {
              data: { ...getFreshData(), uploadError: `File too large (${sizeMB}MB). Max: 100MB` }
            })
            return
          }

          if (!user?.id) {
            return
          }

          // Clear any previous error and start uploading
          updateNode(node.id, { data: { ...getFreshData(), uploadError: undefined, isUploading: true } })

          try {
            // Upload directly to Supabase Storage (avoids body size limits)
            const result = await uploadFileToStorage(file, user.id, 'video')

            if (result.success && result.publicUrl) {
              updateNode(node.id, {
                data: {
                  ...getFreshData(),
                  videoUrl: result.publicUrl,
                  fileName: file.name,
                  filled: true,
                  isUploading: false,
                  uploadError: undefined
                }
              })
            } else {
              updateNode(node.id, { data: { ...getFreshData(), isUploading: false, uploadError: result.error || 'Upload failed' } })
            }
          } catch (error) {
            updateNode(node.id, { data: { ...getFreshData(), isUploading: false, uploadError: 'Upload failed' } })
          }
        }

        const handleRemoveVideo = (e: React.MouseEvent) => {
          e.stopPropagation()
          if (isWorkflowLocked) return
          updateNode(node.id, {
            data: {
              ...node.data,
              videoUrl: undefined,
              fileName: undefined,
              filled: false
            }
          })
        }

        return (
          <div className="space-y-2">
            {videoUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-primary">
                <video
                  src={videoUrl}
                  className="w-full aspect-video object-cover"
                  controls={false}
                  muted
                />
                {!isWorkflowLocked && (
                  <button
                    onClick={handleRemoveVideo}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                  <p className="text-[10px] text-white truncate">
                    {(node.data.fileName as string) || 'Video uploaded'}
                  </p>
                </div>
              </div>
            ) : (
              <label
                className={cn(
                  'border-2 border-dashed border-muted rounded-lg p-5 text-center transition-all block',
                  (isVideoUploading || isWorkflowLocked)
                    ? 'opacity-50 pointer-events-none cursor-not-allowed'
                    : 'cursor-pointer hover:border-white hover:bg-white/[0.02]'
                )}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoSelect}
                  disabled={isVideoUploading || isWorkflowLocked}
                />
                <div className="flex flex-col items-center gap-1.5">
                  {isVideoUploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                      <span className="text-xs text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Click to upload video</span>
                      <span className="text-[10px] text-muted-foreground/60">MP4, WebM up to 100MB</span>
                    </>
                  )}
                </div>
              </label>
            )}
            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-2">
                <p className="text-[11px] text-red-400 text-center">{uploadError}</p>
              </div>
            )}
          </div>
        )
      }

      case 'audio':
        return <AudioNodeContent node={node} updateNode={updateNode} isWorkflowLocked={isWorkflowLocked} user={user} selectedTool={selectedTool} />

      case 'script':
      case 'prompt':
      case 'description':
        const textLength = ((node.data.text as string) || '').length
        return (
          <div className="space-y-1">
            <textarea
              className="w-full min-h-[80px] max-h-[200px] p-2.5 text-xs leading-relaxed bg-secondary border border-muted rounded-lg resize-y focus:outline-none focus:border-white placeholder:text-muted-foreground"
              placeholder="Type here..."
              value={(node.data.text as string) || ''}
              maxLength={1000}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) =>
                updateNode(node.id, { data: { ...node.data, text: e.target.value, filled: e.target.value.length > 0 } })
              }
            />
            <div className="text-[10px] text-muted-foreground text-right">
              {textLength}/1000
            </div>
          </div>
        )

      case 'voice':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
                Voice
              </label>
              <select
                className="w-full py-2.5 px-3 text-xs bg-secondary border border-muted rounded-lg focus:outline-none focus:border-white cursor-pointer appearance-none"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option>Female Natural</option>
                <option>Female Pro</option>
                <option>Male Natural</option>
                <option>Male Pro</option>
              </select>
            </div>
          </div>
        )

      case 'lipsync':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
                Duration
              </label>
              <select
                className="w-full py-2.5 px-3 text-xs bg-secondary border border-muted rounded-lg focus:outline-none focus:border-white cursor-pointer appearance-none"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option>10 seconds</option>
                <option>15 seconds</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
                Aspect
              </label>
              <select
                className="w-full py-2.5 px-3 text-xs bg-secondary border border-muted rounded-lg focus:outline-none focus:border-white cursor-pointer appearance-none"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option>9:16 Vertical</option>
                <option>16:9 Landscape</option>
                <option>1:1 Square</option>
              </select>
            </div>
          </div>
        )

      case 'sora2':
        return <Sora2NodeContent node={node} updateNode={updateNode} isWorkflowLocked={isWorkflowLocked} />

      case 'veo3':
        return <Veo3NodeContent node={node} updateNode={updateNode} isWorkflowLocked={isWorkflowLocked} />

      case 'multiref': {
        // Multi-reference node - supports up to 14 images
        const multiImages = (node.data.images as string[]) || []
        const isMultiUploading = node.data.isUploading as boolean | undefined
        const multiUploadError = node.data.uploadError as string | undefined
        const MAX_IMAGES = 14

        const handleMultiFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const files = e.target.files
          if (!files || files.length === 0) return

          if (!user?.id) {
            return
          }

          // Helper to get fresh node data from store (avoids stale closures)
          const getFreshData = () => {
            const currentNode = useWorkflowStore.getState().nodes.find(n => n.id === node.id)
            return currentNode?.data || {}
          }

          // Check if we can add more images
          const currentImages = (getFreshData().images as string[]) || []
          const currentCount = currentImages.length
          const remainingSlots = MAX_IMAGES - currentCount
          if (remainingSlots <= 0) {
            updateNode(node.id, {
              data: { ...getFreshData(), uploadError: `Maximum ${MAX_IMAGES} images allowed` }
            })
            return
          }

          // Limit files to remaining slots
          const filesToUpload = Array.from(files).slice(0, remainingSlots)

          // Validate all files
          for (const file of filesToUpload) {
            if (!file.type.startsWith('image/')) {
              updateNode(node.id, {
                data: { ...getFreshData(), uploadError: 'Invalid file type. Use PNG, JPG, etc.' }
              })
              return
            }
            if (file.size > 10 * 1024 * 1024) {
              updateNode(node.id, {
                data: { ...getFreshData(), uploadError: 'File too large. Max 10MB per image' }
              })
              return
            }
          }

          updateNode(node.id, { data: { ...getFreshData(), uploadError: undefined, isUploading: true } })

          try {
            // Get fresh images array at each step
            const newImages: string[] = [...((getFreshData().images as string[]) || [])]

            for (const file of filesToUpload) {
              const result = await uploadFileToStorage(file, user.id, 'image')

              if (result.success && result.publicUrl) {
                newImages.push(result.publicUrl)
              }
            }

            updateNode(node.id, {
              data: {
                ...getFreshData(),
                images: newImages,
                filled: newImages.length > 0,
                isUploading: false,
                uploadError: undefined
              }
            })
          } catch (error) {
            // Silent fail
            updateNode(node.id, { data: { ...getFreshData(), isUploading: false, uploadError: 'Upload failed' } })
          }
        }

        const handleRemoveMultiImage = (index: number) => {
          if (isWorkflowLocked) return
          const newImages = multiImages.filter((_, i) => i !== index)
          updateNode(node.id, {
            data: {
              ...node.data,
              images: newImages,
              filled: newImages.length > 0
            }
          })
        }

        return (
          <div className="space-y-2">
            {/* Image grid */}
            {multiImages.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {multiImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-square rounded overflow-hidden border border-muted group">
                    <img src={imgUrl} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />
                    {!isWorkflowLocked && (
                      <button
                        onClick={() => handleRemoveMultiImage(idx)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            {multiImages.length < MAX_IMAGES && (
              <label
                className={cn(
                  'border-2 border-dashed border-muted rounded-lg p-3 text-center transition-all block',
                  (isMultiUploading || isWorkflowLocked)
                    ? 'opacity-50 pointer-events-none cursor-not-allowed'
                    : 'cursor-pointer hover:border-white hover:bg-white/[0.02]'
                )}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleMultiFileSelect}
                  disabled={isMultiUploading || isWorkflowLocked}
                />
                <div className="flex flex-col items-center gap-1">
                  {isMultiUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      <span className="text-[10px] text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        Add images ({multiImages.length}/{MAX_IMAGES})
                      </span>
                    </>
                  )}
                </div>
              </label>
            )}

            {multiUploadError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-1.5">
                <p className="text-[10px] text-red-400 text-center">{multiUploadError}</p>
              </div>
            )}

            {multiImages.length > 0 && (
              <p className="text-[10px] text-muted-foreground text-center">
                {multiImages.length} reference{multiImages.length !== 1 ? 's' : ''} (max {MAX_IMAGES})
              </p>
            )}
          </div>
        )
      }

      case 'avatar':
        return <AvatarNodeContent node={node} updateNode={updateNode} isWorkflowLocked={isWorkflowLocked} />

      case 'export':
        return (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground mb-1.5 block">
              Format
            </label>
            <select
              className="w-full py-2.5 px-3 text-xs bg-secondary border border-muted rounded-lg focus:outline-none focus:border-white cursor-pointer appearance-none"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <option>MP4 1080p</option>
              <option>MP4 720p</option>
              <option>WebM</option>
            </select>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'absolute cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 z-50'
      )}
      onClick={() => selectNode(node.id)}
    >
      <div
        className={cn(
          'relative bg-popover border border-border rounded-2xl transition-all',
          (node.type === 'veo3' || node.type === 'avatar' || node.type === 'multiref') ? 'w-[300px]' : 'w-[240px]',
          isSelected && 'border-white shadow-[0_0_0_1px_white,0_12px_40px_rgba(0,0,0,0.4)]',
          isFilled && 'border-primary',
          isDragging && 'shadow-lg'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-2.5 px-3.5 py-3 border-b border-border rounded-t-2xl bg-secondary',
            isFilled && 'bg-primary/10'
          )}
          {...attributes}
          {...listeners}
        >
          <span className="text-white">{nodeIcons[node.type]}</span>
          <span className="flex-1 text-[13px] font-semibold">{config.name}</span>

          {/* Duplicate button - disabled when workflow is locked */}
          {!isWorkflowLocked && (
            <button
              className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:bg-primary hover:text-white transition-all"
              onClick={handleDuplicate}
              title="Duplicate node"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete button - disabled when workflow is locked */}
          {!isWorkflowLocked && (
            <button
              className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:bg-destructive hover:text-white transition-all"
              onClick={(e) => {
                e.stopPropagation()
                removeNode(node.id)
              }}
              title="Delete node"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Status indicator */}
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isFilled ? 'bg-primary' : 'bg-muted'
            )}
          />
        </div>

        {/* Body */}
        <div className="p-3.5">{renderNodeContent()}</div>

        {/* Connection ports - larger touch targets on mobile */}
        {config.hasInput && (
          <div
            className={cn('port input', isInputConnected && 'connected')}
            data-port="input"
            data-node-id={node.id}
            onMouseDown={(e) => handlePortMouseDown(e, 'input')}
            onTouchStart={(e) => handlePortTouchStart(e, 'input')}
          />
        )}
        {config.hasOutput && (
          <div
            className={cn('port output', isOutputConnected && 'connected')}
            data-port="output"
            data-node-id={node.id}
            onMouseDown={(e) => handlePortMouseDown(e, 'output')}
            onTouchStart={(e) => handlePortTouchStart(e, 'output')}
          />
        )}
      </div>
    </div>
  )
}
