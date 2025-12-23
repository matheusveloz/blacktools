'use client'

import { memo, RefObject } from 'react'
import { ZoomIn, ZoomOut, Focus, Trash2 } from 'lucide-react'
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { useWorkflow } from '@/hooks/use-workflow'
import { useWorkflowStore } from '@/stores/workflow-store'
import { cn } from '@/lib/utils'

interface CanvasControlsProps {
  transformRef: RefObject<ReactZoomPanPinchRef | null>
}

// Approximate node dimensions for centering calculations
const NODE_WIDTH = 200
const NODE_HEIGHT = 120

export const CanvasControls = memo(function CanvasControls({
  transformRef,
}: CanvasControlsProps) {
  // Use workflow hook for zoom, clearWorkflow, and isWorkflowLocked (tool-specific)
  const { zoom, clearWorkflow, isWorkflowLocked } = useWorkflow()
  const nodes = useWorkflowStore((state) => state.nodes)

  const handleZoomIn = () => {
    transformRef.current?.zoomIn(0.2)
  }

  const handleZoomOut = () => {
    transformRef.current?.zoomOut(0.2)
  }

  const handleCenterOnNodes = () => {
    if (!transformRef.current) return

    // If no nodes, just reset to center
    if (nodes.length === 0) {
      transformRef.current.resetTransform()
      return
    }

    // Calculate bounding box of all nodes
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + NODE_WIDTH)
      maxY = Math.max(maxY, node.position.y + NODE_HEIGHT)
    })

    // Calculate center of all nodes
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // Get the wrapper dimensions
    const wrapper = transformRef.current.instance.wrapperComponent
    if (!wrapper) {
      transformRef.current.resetTransform()
      return
    }

    const wrapperWidth = wrapper.offsetWidth
    const wrapperHeight = wrapper.offsetHeight

    // Calculate the scale to fit all nodes with some padding
    const nodesWidth = maxX - minX + 100 // Add padding
    const nodesHeight = maxY - minY + 100
    const scaleX = wrapperWidth / nodesWidth
    const scaleY = wrapperHeight / nodesHeight
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.5), 1) // Clamp between 0.5 and 1

    // Calculate position to center the nodes
    const newX = wrapperWidth / 2 - centerX * newScale
    const newY = wrapperHeight / 2 - centerY * newScale

    // Apply the transform with animation
    transformRef.current.setTransform(newX, newY, newScale, 300, 'easeOut')
  }

  const handleClearWorkflow = () => {
    clearWorkflow()
    // Reset the transform view after clearing
    transformRef.current?.resetTransform()
  }

  return (
    <div className="fixed lg:absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-popover/95 backdrop-blur-sm border border-border rounded-lg sm:rounded-xl z-[70] shadow-lg">
      <button
        onClick={handleZoomOut}
        title="Zoom Out"
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-secondary rounded-md sm:rounded-lg text-white hover:bg-muted transition-colors"
      >
        <ZoomOut className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
      </button>

      <div className="flex items-center px-2 sm:px-3 text-[10px] sm:text-xs text-muted-foreground min-w-[40px] sm:min-w-[50px] justify-center">
        {Math.round(zoom * 100)}%
      </div>

      <button
        onClick={handleZoomIn}
        title="Zoom In"
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-secondary rounded-md sm:rounded-lg text-white hover:bg-muted transition-colors"
      >
        <ZoomIn className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
      </button>

      <button
        onClick={handleCenterOnNodes}
        title="Center on Nodes"
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-secondary rounded-md sm:rounded-lg text-white hover:bg-muted transition-colors"
      >
        <Focus className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
      </button>

      <div className="w-px h-4 sm:h-5 bg-border mx-0.5 sm:mx-1" />

      <button
        onClick={handleClearWorkflow}
        disabled={isWorkflowLocked}
        title={isWorkflowLocked ? "Cannot clear while generating" : "Clear Workflow"}
        className={cn(
          "h-8 sm:h-9 px-2.5 sm:px-3 flex items-center justify-center gap-1.5 bg-secondary rounded-md sm:rounded-lg text-white text-[11px] sm:text-xs font-medium transition-colors",
          isWorkflowLocked
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-destructive"
        )}
      >
        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Clear</span>
      </button>
    </div>
  )
})
