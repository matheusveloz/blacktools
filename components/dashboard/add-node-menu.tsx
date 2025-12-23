'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useWorkflow } from '@/hooks/use-workflow'
import { NODE_CONFIG, NodeType, TOOL_CONFIG } from '@/lib/constants'

// Node dimensions (must match workflow-canvas.tsx)
const NODE_WIDTH = 240
const NODE_HEIGHT = 200

export function AddNodeMenu() {
  const { selectedTool, createNode, nodes, isWorkflowLocked, zoom, pan } = useWorkflow()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const toolConfig = selectedTool ? TOOL_CONFIG[selectedTool] : null
  const availableNodes = toolConfig?.nodes || []

  // Calculate the center of the visible viewport in canvas coordinates
  const getViewportCenter = (): { x: number; y: number } => {
    // Get the canvas container (estimate dimensions based on layout)
    // Sidebar: ~220px, Results panel: ~300px on desktop
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
    const containerWidth = typeof window !== 'undefined'
      ? (isMobile ? window.innerWidth : window.innerWidth - 520)
      : 800
    const containerHeight = typeof window !== 'undefined'
      ? (isMobile ? window.innerHeight - 160 : window.innerHeight - 100)
      : 600

    // Screen center coordinates
    const screenCenterX = containerWidth / 2
    const screenCenterY = containerHeight / 2

    // Convert screen coordinates to canvas coordinates
    // Formula: canvasCoord = (screenCoord - pan) / zoom
    const canvasCenterX = (screenCenterX - pan.x) / zoom
    const canvasCenterY = (screenCenterY - pan.y) / zoom

    // Offset by half node dimensions to truly center the node
    return {
      x: canvasCenterX - NODE_WIDTH / 2,
      y: canvasCenterY - NODE_HEIGHT / 2
    }
  }

  const handleAddNode = (nodeType: NodeType) => {
    if (!selectedTool) return

    const lastNode = nodes[nodes.length - 1]
    let newPosition: { x: number; y: number }

    if (lastNode) {
      // Place to the right of the last node (with spacing)
      newPosition = { x: lastNode.position.x + NODE_WIDTH + 40, y: lastNode.position.y }
    } else {
      // First node: place at the center of the visible viewport
      newPosition = getViewportCenter()
    }

    createNode(nodeType, selectedTool, newPosition)
    setIsOpen(false)

    // Dispatch event to trigger re-center on mobile
    window.dispatchEvent(new CustomEvent('workflow-node-added'))
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (selectedTool && !isWorkflowLocked) {
            setIsOpen(!isOpen)
          }
        }}
        disabled={!selectedTool || isWorkflowLocked}
        className="flex items-center gap-2.5 px-6 py-3 bg-secondary border border-dashed border-muted rounded-xl text-sm font-medium text-white transition-all hover:bg-muted hover:border-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary disabled:hover:border-muted"
      >
        <Plus className="w-[18px] h-[18px]" />
        {!selectedTool ? 'Select a tool first' : isWorkflowLocked ? 'Generating...' : 'Add Node'}
      </button>

      {isOpen && selectedTool && (
        <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-popover border border-border rounded-xl p-2 min-w-[220px] shadow-[0_16px_48px_rgba(0,0,0,0.5)] animate-in fade-in-0 zoom-in-95 duration-150 z-50">
          <div className="text-[10px] font-semibold uppercase tracking-[1px] text-muted-foreground px-3 py-2">
            Add Node
          </div>
          {availableNodes.map((nodeType) => {
            const config = NODE_CONFIG[nodeType as NodeType]
            return (
              <button
                key={nodeType}
                onClick={() => handleAddNode(nodeType as NodeType)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-muted group"
              >
                <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center bg-muted-foreground/20">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                </span>
                <div className="flex-1 text-left">
                  <div className="text-[13px] font-medium">{config.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {config.description || 'Add to workflow'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
