'use client'

import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkflow } from '@/hooks/use-workflow'

export function CanvasControls() {
  const { zoom, setZoom, setPan, clearWorkflow } = useWorkflow()

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.25))
  }

  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm border rounded-lg p-1 z-10">
      <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[50px] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-border" />
      <Button variant="ghost" size="icon" onClick={handleResetView} title="Reset View">
        <Maximize className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={clearWorkflow} title="Clear Workflow">
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}
