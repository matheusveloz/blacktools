'use client'

import { useState, memo, useCallback, useEffect, useRef, useMemo } from 'react'
import { Play, Download, Loader2, Clock, CheckCircle2, XCircle, Video, Mic, Sparkles, Trash2, X, Check, Square, CheckSquare, MessageCircle, Pencil } from 'lucide-react'

// Custom Banana icon (same as sidebar)
const BananaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5" />
    <path d="M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11 3 11 3c1 0 4 0 6 2s3.5 4.5 3 8c-.5 3.5-3 6.5-6.5 8-3.5 1.5-7 1-9.85.11" />
  </svg>
)
import { useSora2Context } from '@/contexts/sora2-context'
import { useVeo3Context } from '@/contexts/veo3-context'
import { useLipSyncContext } from '@/contexts/lipsync-context'
import { useInfiniteTalkContext } from '@/contexts/infinitetalk-context'
import { useNanoBananaContext } from '@/contexts/nanobanana-context'
import { useWorkflowStore } from '@/stores/workflow-store'
import { TOOLS, TOOL_CONFIG, ToolType } from '@/lib/constants'
import { cn } from '@/lib/utils'

// Video Modal Component
interface VideoModalProps {
  videoUrl: string
  title: string
  onClose: () => void
  onDownload: () => void
  isDownloading: boolean
}

function VideoModal({ videoUrl, title, onClose, onDownload, isDownloading }: VideoModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
          <h3 className="text-xs sm:text-sm font-semibold truncate pr-2 sm:pr-4">{title}</h3>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-primary text-primary-foreground rounded-md sm:rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isDownloading ? (
                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
              ) : (
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Video */}
        <div className="aspect-video bg-black">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}

// Image Modal Component with Zoom
interface ImageModalProps {
  imageUrl: string
  title: string
  onClose: () => void
  onDownload: () => void
  onAddToCanvas?: () => void
  isDownloading: boolean
}

function ImageModal({ imageUrl, title, onClose, onDownload, onAddToCanvas, isDownloading }: ImageModalProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 5))
  }, [])

  // Handle drag to pan when zoomed
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [zoom, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart, zoom])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Double click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setZoom(2.5)
    }
  }, [zoom])

  // Reset zoom when modal opens
  useEffect(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [imageUrl])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
          <h3 className="text-xs sm:text-sm font-semibold truncate pr-2 sm:pr-4 max-w-[100px] sm:max-w-none">{title}</h3>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom controls - hide on very small screens */}
            <div className="hidden xs:flex items-center gap-0.5 sm:gap-1 mr-1 sm:mr-2 bg-secondary rounded-md sm:rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1">
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.5, 0.5))}
                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded hover:bg-muted transition-colors text-[10px] sm:text-xs font-bold"
                title="Zoom out"
              >
                −
              </button>
              <span className="text-[8px] sm:text-[10px] font-medium w-8 sm:w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.5, 5))}
                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded hover:bg-muted transition-colors text-[10px] sm:text-xs font-bold"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }) }}
                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded hover:bg-muted transition-colors text-[8px] sm:text-[10px]"
                title="Reset zoom"
              >
                1:1
              </button>
            </div>
            {/* Add to Canvas button */}
            {onAddToCanvas && (
              <button
                onClick={() => { onAddToCanvas(); onClose(); }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-yellow-500 text-black rounded-md sm:rounded-lg hover:bg-yellow-400 transition-colors"
                title="Add to canvas"
              >
                <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Add to Canvas</span>
              </button>
            )}
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-primary text-primary-foreground rounded-md sm:rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isDownloading ? (
                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
              ) : (
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Image with zoom */}
        <div
          ref={containerRef}
          className="bg-black flex items-center justify-center overflow-hidden"
          style={{ height: '60vh', cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
            draggable={false}
          />
        </div>

        {/* Zoom hint - hide on mobile */}
        <div className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white/70 text-[10px] px-3 py-1 rounded-full pointer-events-none">
          Scroll to zoom • Double-click to toggle • Drag to pan
        </div>
      </div>
    </div>
  )
}

// Download file directly instead of opening in new tab
async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Download failed')

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Cleanup blob URL after download starts
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
  } catch (error) {
    // Fallback: open in new tab if download fails
    window.open(url, '_blank')
  }
}

// Legacy alias for video downloads
const downloadVideo = downloadFile

// Memoized Generation Card Component to prevent re-renders during scroll
interface GenerationCardProps {
  gen: {
    id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    result_url: string | null
    credits_used: number
    created_at: string
    label: string
    progress?: number
    error?: string
    isImage?: boolean
  }
  onImageClick: (id: string, url: string, label: string) => void
  onVideoClick: (id: string, url: string, label: string) => void
  onDownload: (e: React.MouseEvent, id: string, url: string, label: string, isImage?: boolean) => void
  onDelete: (e: React.MouseEvent, id: string) => void
  onAddToCanvas?: (e: React.MouseEvent, url: string) => void
  deletingId: string | null
  downloadingId: string | null
  showDelete: boolean
  formatDate: (dateString: string) => string
  truncatePrompt: (prompt: string | undefined, maxLength?: number) => string
  // Selection props
  isSelectionMode: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

const GenerationCard = memo(function GenerationCard({
  gen,
  onImageClick,
  onVideoClick,
  onDownload,
  onDelete,
  onAddToCanvas,
  deletingId,
  downloadingId,
  showDelete,
  formatDate,
  truncatePrompt,
  isSelectionMode,
  isSelected,
  onToggleSelect
}: GenerationCardProps) {
  const handleClick = useCallback(() => {
    if (isSelectionMode) {
      onToggleSelect(gen.id)
    } else if (gen.isImage && gen.result_url) {
      onImageClick(gen.id, gen.result_url, gen.label)
    } else if (gen.result_url) {
      onVideoClick(gen.id, gen.result_url, gen.label)
    }
  }, [isSelectionMode, gen.id, gen.isImage, gen.result_url, gen.label, onToggleSelect, onImageClick, onVideoClick])

  return (
    <div
      className={cn(
        "bg-secondary border rounded-xl overflow-hidden cursor-pointer transition-colors group relative",
        isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-white"
      )}
      onClick={handleClick}
    >
      {/* Selection Checkbox - Top Left */}
      {isSelectionMode && (
        <div
          className={cn(
            "absolute top-2 left-2 z-20 w-6 h-6 rounded-md flex items-center justify-center transition-colors",
            isSelected ? "bg-primary text-primary-foreground" : "bg-black/50 text-white border border-white/30"
          )}
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect(gen.id)
          }}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </div>
      )}

      {/* Thumbnail - Image or Video */}
      <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
        {gen.isImage ? (
          // Image thumbnail for Avatar/Nano Banana - lazy loaded
          gen.result_url && (
            <img
              src={gen.result_url}
              alt={gen.label}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        ) : (
          // Video thumbnail with poster fallback for mobile Safari
          <>
            <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/25 transition-colors z-10">
              <Play className="w-4 h-4 text-white" fill="white" />
            </div>
            {gen.result_url && (
              <video
                key={gen.result_url}
                src={gen.result_url}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                muted
                playsInline
                preload="auto"
                onLoadedData={(e) => {
                  // Seek to first frame to show thumbnail
                  const video = e.target as HTMLVideoElement
                  video.currentTime = 0.1
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[13px] font-medium line-clamp-2">
          {truncatePrompt(gen.label, 60)}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-muted-foreground">
            {formatDate(gen.created_at)}
          </p>
          <div className="flex items-center gap-2">
            {/* Add to Canvas button - only for images */}
            {gen.isImage && gen.result_url && onAddToCanvas && (
              <button
                onClick={(e) => onAddToCanvas(e, gen.result_url!)}
                className="flex items-center gap-1 text-[11px] text-yellow-500 hover:text-yellow-400 transition-colors"
                title="Add to canvas"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {gen.result_url && (
              <button
                onClick={(e) => onDownload(e, gen.id, gen.result_url!, gen.label || (gen.isImage ? 'image' : 'video'), gen.isImage)}
                disabled={downloadingId === gen.id}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50"
              >
                {downloadingId === gen.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                {downloadingId === gen.id ? 'Downloading...' : 'Download'}
              </button>
            )}
            {showDelete && (
              <button
                onClick={(e) => onDelete(e, gen.id)}
                disabled={deletingId === gen.id}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                title="Delete video"
              >
                {deletingId === gen.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

// Tool-specific empty state icons
const toolEmptyIcons: Record<ToolType, React.ReactNode> = {
  sora2: <Video className="w-12 h-12 text-muted mb-4" />,
  lipsync: <Mic className="w-12 h-12 text-muted mb-4" />,
  infinitetalk: <MessageCircle className="w-12 h-12 text-muted mb-4" />,
  veo3: <Sparkles className="w-12 h-12 text-muted mb-4" />,
  avatar: <BananaIcon className="w-12 h-12 text-muted mb-4" />,
}

export const ResultsPanel = memo(function ResultsPanel() {
  // Get selected tool from store
  const selectedTool = useWorkflowStore((state) => state.selectedTool)

  // Default to sora2 if no tool selected
  const activeTool = selectedTool ?? TOOLS.SORA2
  const toolConfig = TOOL_CONFIG[activeTool]

  // Use contexts for different tools
  const { generations: sora2Generations, deleteGeneration: deleteSora2 } = useSora2Context()
  const { generations: veo3Generations, deleteGeneration: deleteVeo3 } = useVeo3Context()
  const { generations: lipsyncGenerations, deleteGeneration: deleteLipsync } = useLipSyncContext()
  const { generations: infinitetalkGenerations, deleteGeneration: deleteInfiniteTalk } = useInfiniteTalkContext()
  const { generations: nanoBananaGenerations, deleteGeneration: deleteNanoBanana } = useNanoBananaContext()

  const [modalVideo, setModalVideo] = useState<{ id: string; url: string; label: string } | null>(null)
  const [modalImage, setModalImage] = useState<{ id: string; url: string; label: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Selection mode state - per tool (independent for each tab)
  const [selectionStateByTool, setSelectionStateByTool] = useState<Record<string, {
    isSelectionMode: boolean
    selectedIds: Set<string>
    isDeletingBulk: boolean
  }>>({})

  // Get current tool's selection state
  const currentSelectionState = selectionStateByTool[activeTool] || {
    isSelectionMode: false,
    selectedIds: new Set<string>(),
    isDeletingBulk: false
  }
  const { isSelectionMode, selectedIds, isDeletingBulk } = currentSelectionState

  // Helper to update selection state for current tool
  const updateSelectionState = useCallback((updates: Partial<{
    isSelectionMode: boolean
    selectedIds: Set<string>
    isDeletingBulk: boolean
  }>) => {
    setSelectionStateByTool(prev => ({
      ...prev,
      [activeTool]: {
        ...prev[activeTool] || { isSelectionMode: false, selectedIds: new Set(), isDeletingBulk: false },
        ...updates
      }
    }))
  }, [activeTool])

  // Fake progress for LipSync based on elapsed time (consistent after refresh)
  const [, forceUpdate] = useState(0)

  // Calculate fake progress based on elapsed time since creation
  // Uses logarithmic curve: starts fast, slows down, never reaches 85%
  const calculateFakeProgress = useCallback((createdAt: string): number => {
    const startTime = new Date(createdAt).getTime()
    const elapsed = (Date.now() - startTime) / 1000 // seconds

    // Logarithmic progress: fast start, slow finish
    // At 30s: ~35%, at 60s: ~50%, at 120s: ~65%, at 180s: ~72%, at 300s: ~80%
    // Never exceeds 83%
    const maxProgress = 83
    const timeConstant = 90 // seconds for ~63% of max progress
    const progress = maxProgress * (1 - Math.exp(-elapsed / timeConstant))

    return Math.round(progress)
  }, [])

  // Update fake progress every 2 seconds for smooth animation (LipSync, InfiniteTalk, and Avatar)
  useEffect(() => {
    if (activeTool !== TOOLS.LIPSYNC && activeTool !== TOOLS.INFINITETALK && activeTool !== TOOLS.AVATAR) return

    let hasProcessing = false
    if (activeTool === TOOLS.LIPSYNC) {
      hasProcessing = lipsyncGenerations.some(g => g.status === 'processing')
    } else if (activeTool === TOOLS.INFINITETALK) {
      hasProcessing = infinitetalkGenerations.some(g => g.status === 'processing')
    } else {
      hasProcessing = nanoBananaGenerations.some(g => g.status === 'processing')
    }
    if (!hasProcessing) return

    const interval = setInterval(() => {
      forceUpdate(n => n + 1)
    }, 2000)

    return () => clearInterval(interval)
  }, [activeTool, lipsyncGenerations, infinitetalkGenerations, nanoBananaGenerations])

  const handleDownload = useCallback(async (e: React.MouseEvent, generationId: string, url: string, label: string, isImage?: boolean) => {
    e.stopPropagation()
    if (downloadingId) return

    setDownloadingId(generationId)

    // Generate filename from label (first 30 chars) + timestamp
    const safeLabel = label.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')
    const ext = isImage ? 'png' : 'mp4'
    const filename = `${safeLabel}_${Date.now()}.${ext}`

    await downloadFile(url, filename)
    setDownloadingId(null)
  }, [downloadingId])

  const handleDelete = async (e: React.MouseEvent, generationId: string) => {
    e.stopPropagation()
    if (deletingId) return

    setDeletingId(generationId)

    let success = false
    if (activeTool === TOOLS.SORA2) {
      success = await deleteSora2(generationId)
    } else if (activeTool === TOOLS.VEO3) {
      success = await deleteVeo3(generationId)
    } else if (activeTool === TOOLS.LIPSYNC) {
      success = await deleteLipsync(generationId)
    } else if (activeTool === TOOLS.INFINITETALK) {
      success = await deleteInfiniteTalk(generationId)
    } else if (activeTool === TOOLS.AVATAR) {
      success = await deleteNanoBanana(generationId)
    }

    setDeletingId(null)
    if (success) {
      setModalVideo(null)
      // Remove from selection if deleted
      const newSelectedIds = new Set(selectedIds)
      newSelectedIds.delete(generationId)
      updateSelectionState({ selectedIds: newSelectedIds })
    }
  }

  // Toggle selection of a single item
  const handleToggleSelect = useCallback((id: string) => {
    const newSelectedIds = new Set(selectedIds)
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id)
    } else {
      newSelectedIds.add(id)
    }
    updateSelectionState({ selectedIds: newSelectedIds })
  }, [selectedIds, updateSelectionState])

  // Select all completed + failed generations
  const handleSelectAll = useCallback((allIds: string[]) => {
    updateSelectionState({ selectedIds: new Set(allIds) })
  }, [updateSelectionState])

  // Deselect all
  const handleDeselectAll = useCallback(() => {
    updateSelectionState({ selectedIds: new Set() })
  }, [updateSelectionState])

  // Delete all selected items
  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0 || isDeletingBulk) return

    updateSelectionState({ isDeletingBulk: true })

    const idsToDelete = Array.from(selectedIds)
    let successCount = 0

    for (const id of idsToDelete) {
      let success = false
      if (activeTool === TOOLS.SORA2) {
        success = await deleteSora2(id)
      } else if (activeTool === TOOLS.VEO3) {
        success = await deleteVeo3(id)
      } else if (activeTool === TOOLS.LIPSYNC) {
        success = await deleteLipsync(id)
      } else if (activeTool === TOOLS.INFINITETALK) {
        success = await deleteInfiniteTalk(id)
      } else if (activeTool === TOOLS.AVATAR) {
        success = await deleteNanoBanana(id)
      }
      if (success) successCount++
    }

    updateSelectionState({
      selectedIds: new Set(),
      isSelectionMode: false,
      isDeletingBulk: false
    })
  }, [selectedIds, isDeletingBulk, activeTool, deleteSora2, deleteVeo3, deleteLipsync, deleteInfiniteTalk, deleteNanoBanana, updateSelectionState])

  // Exit selection mode
  const handleExitSelectionMode = useCallback(() => {
    updateSelectionState({
      isSelectionMode: false,
      selectedIds: new Set()
    })
  }, [updateSelectionState])

  // Normalize generations to common format
  type NormalizedGeneration = {
    id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    result_url: string | null
    credits_used: number
    created_at: string
    label: string // prompt for sora2, filename for lipsync
    progress?: number
    error?: string
    isImage?: boolean // true for Nano Banana image generations
  }

  // Get generations based on selected tool - memoized
  const generations = useMemo((): NormalizedGeneration[] => {
    if (activeTool === TOOLS.SORA2) {
      return sora2Generations.map(g => ({
        id: g.id,
        status: g.status,
        result_url: g.result_url,
        credits_used: g.credits_used,
        created_at: g.created_at,
        label: g.prompt || 'Sora 2 Video',
        progress: g.progress,
        error: g.error,
      }))
    } else if (activeTool === TOOLS.VEO3) {
      return veo3Generations.map(g => ({
        id: g.id,
        status: g.status,
        result_url: g.result_url,
        credits_used: g.credits_used,
        created_at: g.created_at,
        label: g.prompt || 'Veo 3 Video',
        progress: g.progress,
        error: g.error,
      }))
    } else if (activeTool === TOOLS.LIPSYNC) {
      return lipsyncGenerations.map(g => ({
        id: g.id,
        status: g.status,
        result_url: g.result_url,
        credits_used: g.credits_used,
        created_at: g.created_at,
        label: `LipSync (${g.audioDurationSeconds}s)`,
        // Use fake progress based on elapsed time (consistent after page refresh)
        progress: g.status === 'processing' ? calculateFakeProgress(g.created_at) : undefined,
        error: g.error,
      }))
    } else if (activeTool === TOOLS.INFINITETALK) {
      return infinitetalkGenerations.map(g => ({
        id: g.id,
        status: g.status,
        result_url: g.result_url,
        credits_used: g.credits_used,
        created_at: g.created_at,
        label: `Infinite Talk (${g.audioDurationSeconds}s)`,
        // Use fake progress based on elapsed time (consistent after page refresh)
        progress: g.status === 'processing' ? calculateFakeProgress(g.created_at) : undefined,
        error: g.error,
      }))
    } else if (activeTool === TOOLS.AVATAR) {
      return nanoBananaGenerations.map(g => ({
        id: g.id,
        status: g.status,
        result_url: g.result_url,
        credits_used: g.credits_used,
        created_at: g.created_at,
        label: g.prompt || 'Nano Banana 2 Image',
        // Use fake progress based on elapsed time (like LipSync)
        progress: g.status === 'processing' ? calculateFakeProgress(g.created_at) : undefined,
        error: g.error,
        isImage: true, // Flag to render as image instead of video
      }))
    }
    return []
  }, [activeTool, sora2Generations, veo3Generations, lipsyncGenerations, infinitetalkGenerations, nanoBananaGenerations, calculateFakeProgress])

  // Filter generations by status - memoized
  const completedGenerations = useMemo(() =>
    generations?.filter(g => g.status === 'completed') || [],
    [generations]
  )
  const pendingGenerations = useMemo(() =>
    generations?.filter(g => g.status === 'pending' || g.status === 'processing') || [],
    [generations]
  )
  const failedGenerations = useMemo(() =>
    generations?.filter(g => g.status === 'failed') || [],
    [generations]
  )

  // Calculate totals for header
  const totalGenerating = pendingGenerations.length
  const totalCompleted = completedGenerations.length
  const totalFailed = failedGenerations.length

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const truncatePrompt = useCallback((prompt: string | undefined, maxLength: number = 40) => {
    if (!prompt) return 'No prompt'
    if (prompt.length <= maxLength) return prompt
    return prompt.substring(0, maxLength) + '...'
  }, [])

  // Memoized handlers for modal opening
  const handleImageClick = useCallback((id: string, url: string, label: string) => {
    setModalImage({ id, url, label })
  }, [])

  const handleVideoClick = useCallback((id: string, url: string, label: string) => {
    setModalVideo({ id, url, label })
  }, [])

  // Get addNode and updateNode from workflow store
  const addNode = useWorkflowStore((state) => state.addNode)
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const nodes = useWorkflowStore((state) => state.nodes)
  const zoom = useWorkflowStore((state) => state.zoom)
  const pan = useWorkflowStore((state) => state.pan)

  // Node dimensions (must match workflow-canvas.tsx)
  const NODE_WIDTH = 240
  const NODE_HEIGHT = 200

  // Calculate the center of the visible viewport in canvas coordinates
  const getViewportCenter = useCallback((): { x: number; y: number } => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
    const containerWidth = typeof window !== 'undefined'
      ? (isMobile ? window.innerWidth : window.innerWidth - 520)
      : 800
    const containerHeight = typeof window !== 'undefined'
      ? (isMobile ? window.innerHeight - 160 : window.innerHeight - 100)
      : 600

    const screenCenterX = containerWidth / 2
    const screenCenterY = containerHeight / 2

    const canvasCenterX = (screenCenterX - pan.x) / zoom
    const canvasCenterY = (screenCenterY - pan.y) / zoom

    return {
      x: canvasCenterX - NODE_WIDTH / 2,
      y: canvasCenterY - NODE_HEIGHT / 2
    }
  }, [zoom, pan])

  // Handler to add image to canvas - adds to existing multiref or creates new one
  const handleAddToCanvas = useCallback((e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation()

    // Find existing multiref node
    const multirefNode = nodes.find(n => n.type === 'multiref')

    if (multirefNode) {
      // Add image to existing multiref node
      const existingImages = (multirefNode.data.images as string[]) || []
      // Limit to 14 images max
      if (existingImages.length >= 14) {
        alert('Maximum 14 reference images allowed. Remove some images first.')
        return
      }
      updateNode(multirefNode.id, {
        data: {
          ...multirefNode.data,
          images: [...existingImages, imageUrl],
          filled: true,
        },
      })
    } else {
      // Calculate position: to the right of last node, or viewport center if no nodes
      const lastNode = nodes[nodes.length - 1]
      let position: { x: number; y: number }

      if (lastNode) {
        position = { x: lastNode.position.x + NODE_WIDTH + 40, y: lastNode.position.y }
      } else {
        position = getViewportCenter()
      }

      // Create a new multiref node with the image
      const newNode = {
        id: `multiref-${Date.now()}`,
        type: 'multiref' as const,
        tool: TOOLS.AVATAR,
        position,
        data: {
          filled: true,
          images: [imageUrl],
        },
      }
      addNode(newNode)
    }
  }, [addNode, updateNode, nodes, getViewportCenter])

  // Memoize showDelete to avoid recalculation
  const showDelete = useMemo(() =>
    activeTool === TOOLS.SORA2 || activeTool === TOOLS.VEO3 || activeTool === TOOLS.LIPSYNC || activeTool === TOOLS.INFINITETALK || activeTool === TOOLS.AVATAR,
    [activeTool]
  )

  // Get all deletable generation IDs (completed + failed)
  const allDeletableIds = useMemo(() => {
    return [...completedGenerations, ...failedGenerations].map(g => g.id)
  }, [completedGenerations, failedGenerations])

  const hasItemsToSelect = allDeletableIds.length > 0
  const allSelected = hasItemsToSelect && selectedIds.size === allDeletableIds.length

  return (
    <aside className="w-full bg-card border-l border-border flex flex-col h-full overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 sm:p-5 border-b border-border pt-14 lg:pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-semibold">{toolConfig.name} Results</h2>

          {/* Selection Controls */}
          {hasItemsToSelect && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isSelectionMode ? (
                <>
                  {/* Cancel button */}
                  <button
                    onClick={handleExitSelectionMode}
                    className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>

                  {/* Select All / Deselect All */}
                  <button
                    onClick={() => allSelected ? handleDeselectAll() : handleSelectAll(allDeletableIds)}
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {allSelected ? (
                      <>
                        <CheckSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Select All</span>
                      </>
                    )}
                  </button>

                  {/* Delete Selected */}
                  {selectedIds.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      disabled={isDeletingBulk}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                    >
                      {isDeletingBulk ? (
                        <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      )}
                      Delete ({selectedIds.size})
                    </button>
                  )}
                </>
              ) : (
                /* Enter Selection Mode Button */
                <button
                  onClick={() => updateSelectionState({ isSelectionMode: true })}
                  className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
                  title="Select items to delete"
                >
                  <CheckSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Select</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
          {totalGenerating > 0 && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-blue-500">
              <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
              {totalGenerating} generating
            </span>
          )}
          {totalCompleted > 0 && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-green-500">
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {totalCompleted} completed
            </span>
          )}
          {totalFailed > 0 && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-destructive">
              <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {totalFailed} failed
            </span>
          )}
          {totalGenerating === 0 && totalCompleted === 0 && totalFailed === 0 && (
            <span className="text-[10px] sm:text-xs text-muted-foreground">No results yet</span>
          )}
        </div>
      </div>

      {/* Scrollable Content Area - optimized for smooth scrolling */}
      <div className="flex-1 overflow-y-auto min-h-0 will-change-scroll">
        {/* Generating Progress Section */}
        {pendingGenerations.length > 0 && (
          <div className="p-3 sm:p-4 border-b border-border bg-blue-500/5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[1.2px] text-blue-500">
                Generating {pendingGenerations.length} {activeTool === TOOLS.AVATAR ? 'image' : 'video'}{pendingGenerations.length !== 1 ? 's' : ''}
              </p>
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 animate-spin" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {pendingGenerations.map((gen, index) => (
                <div
                  key={gen.id}
                  className={cn(
                    'flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg',
                    gen.status === 'pending' && 'bg-yellow-500/10 border border-yellow-500/20',
                    gen.status === 'processing' && 'bg-blue-500/10 border border-blue-500/20'
                  )}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-secondary text-[10px] sm:text-xs font-medium">
                      {index + 1}
                    </div>
                    {gen.status === 'pending' ? (
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                    ) : (
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 animate-spin flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] sm:text-xs font-medium truncate">
                        {truncatePrompt(gen.label)}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                        {gen.status === 'pending'
                          ? 'Waiting in queue...'
                          : gen.progress && gen.progress > 0
                            ? `Generating... ${gen.progress}%`
                            : 'Starting generation...'}
                      </p>
                    </div>
                  </div>
                  {gen.status === 'processing' && (
                    <div className="w-full h-1 sm:h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${gen.progress || 0}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="p-3 sm:p-4">
        {completedGenerations.length === 0 && pendingGenerations.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[300px] text-center text-muted-foreground px-4 sm:px-6">
            {toolEmptyIcons[activeTool]}
            <p className="text-xs sm:text-sm">
              Run your {toolConfig.name} workflow
              <br />
              to generate results
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {completedGenerations.map((gen) => (
              <GenerationCard
                key={gen.id}
                gen={gen}
                onImageClick={handleImageClick}
                onVideoClick={handleVideoClick}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onAddToCanvas={activeTool === TOOLS.AVATAR ? handleAddToCanvas : undefined}
                deletingId={deletingId}
                downloadingId={downloadingId}
                showDelete={showDelete}
                formatDate={formatDate}
                truncatePrompt={truncatePrompt}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(gen.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}

            {/* Failed Generations */}
            {failedGenerations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-destructive mb-3">
                  Failed ({failedGenerations.length})
                </p>
                {failedGenerations.map((gen) => (
                  <div
                    key={gen.id}
                    className={cn(
                      "rounded-xl overflow-hidden mb-2 relative cursor-pointer transition-colors",
                      selectedIds.has(gen.id)
                        ? "bg-destructive/20 border-2 border-primary ring-2 ring-primary/30"
                        : "bg-destructive/10 border border-destructive/20"
                    )}
                    onClick={() => isSelectionMode && handleToggleSelect(gen.id)}
                  >
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <div
                        className={cn(
                          "absolute top-2 left-2 z-20 w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                          selectedIds.has(gen.id) ? "bg-primary text-primary-foreground" : "bg-black/50 text-white border border-white/30"
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleSelect(gen.id)
                        }}
                      >
                        {selectedIds.has(gen.id) && <Check className="w-3 h-3" />}
                      </div>
                    )}

                    <div className={cn("p-3", isSelectionMode && "pl-9")}>
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium line-clamp-2">
                            {truncatePrompt(gen.label, 60)}
                          </p>
                          {gen.error && (
                            <p className="text-[11px] text-destructive mt-1">
                              {gen.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(gen.created_at)}
                        </p>
                        {!isSelectionMode && (
                          <button
                            onClick={(e) => handleDelete(e, gen.id)}
                            disabled={deletingId === gen.id}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                            title="Delete failed generation"
                          >
                            {deletingId === gen.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Video Modal */}
      {modalVideo && (
        <VideoModal
          videoUrl={modalVideo.url}
          title={modalVideo.label}
          onClose={() => setModalVideo(null)}
          onDownload={() => {
            const safeLabel = modalVideo.label.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')
            const filename = `${safeLabel}_${Date.now()}.mp4`
            downloadVideo(modalVideo.url, filename)
          }}
          isDownloading={downloadingId === modalVideo.id}
        />
      )}

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          imageUrl={modalImage.url}
          title={modalImage.label}
          onClose={() => setModalImage(null)}
          onDownload={() => {
            const safeLabel = modalImage.label.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')
            const filename = `${safeLabel}_${Date.now()}.png`
            downloadFile(modalImage.url, filename)
          }}
          onAddToCanvas={activeTool === TOOLS.AVATAR ? () => {
            handleAddToCanvas({ stopPropagation: () => {} } as React.MouseEvent, modalImage.url)
          } : undefined}
          isDownloading={downloadingId === modalImage.id}
        />
      )}
    </aside>
  )
})
