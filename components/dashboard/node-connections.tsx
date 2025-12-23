'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useWorkflow } from '@/hooks/use-workflow'
import { useConnectionStore } from '@/stores/connection-store'
import { useWorkflowStore } from '@/stores/workflow-store'

interface NodeConnectionsProps {
  containerRef: React.RefObject<HTMLDivElement>
}

export function NodeConnections({ containerRef }: NodeConnectionsProps) {
  const { nodes, connections, removeConnection, selectedTool } = useWorkflow()
  const dragConnection = useConnectionStore((s) => s.dragConnection)
  const [updateTick, setUpdateTick] = useState(0)
  const prevToolRef = useRef(selectedTool)

  // Force re-render when tool changes to recalculate positions
  useEffect(() => {
    if (prevToolRef.current !== selectedTool) {
      prevToolRef.current = selectedTool
      // Wait for DOM to update after tool change
      const timeout = setTimeout(() => {
        setUpdateTick(t => t + 1)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [selectedTool])

  // Force re-render continuously to keep connections in sync with node positions
  useEffect(() => {
    let animationId: number

    const updateConnections = () => {
      setUpdateTick(t => t + 1)
      animationId = requestAnimationFrame(updateConnections)
    }

    // Start the animation loop
    animationId = requestAnimationFrame(updateConnections)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [selectedTool]) // Re-start animation loop when tool changes

  const getPortPosition = useCallback((nodeId: string, portType: 'input' | 'output') => {
    // First check if the node exists in current state
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return null

    // Try to get the actual port element position
    const portElement = document.querySelector(
      `.port.${portType}[data-node-id="${nodeId}"]`
    ) as HTMLElement

    if (portElement && containerRef.current) {
      const portRect = portElement.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      const { zoom } = useWorkflowStore.getState()

      // Validate rects are valid (not 0,0 which happens during DOM updates)
      if (portRect.width > 0 && portRect.height > 0) {
        // Calculate position relative to canvas, accounting for zoom
        const x = (portRect.left + portRect.width / 2 - containerRect.left) / zoom
        const y = (portRect.top + portRect.height / 2 - containerRect.top) / zoom
        return { x, y }
      }
    }

    // Fallback: calculate based on node position
    const x = node.position.x + (portType === 'output' ? 240 : 0)
    const y = node.position.y + 60

    return { x, y }
  }, [nodes, containerRef])

  const createBezierPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const controlOffset = Math.min(Math.abs(x2 - x1) * 0.5, 150)
    return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`
  }

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      {/* Existing connections */}
      {connections.map((connection) => {
        const sourcePos = getPortPosition(connection.sourceNodeId, 'output')
        const targetPos = getPortPosition(connection.targetNodeId, 'input')

        if (!sourcePos || !targetPos) return null

        const path = createBezierPath(
          sourcePos.x,
          sourcePos.y,
          targetPos.x,
          targetPos.y
        )

        return (
          <g key={connection.id}>
            {/* Invisible wider path for easier clicking */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              className="pointer-events-auto cursor-pointer"
              onClick={() => removeConnection(connection.id)}
            />
            {/* Visible connection line */}
            <path
              d={path}
              className="connection-line"
              strokeLinecap="round"
            />
            {/* Animated flow indicator */}
            <circle r={4} fill="hsl(var(--primary))">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path={path}
              />
            </circle>
          </g>
        )
      })}

      {/* Drag preview line */}
      {dragConnection && (
        <path
          d={createBezierPath(
            dragConnection.startX,
            dragConnection.startY,
            dragConnection.currentX,
            dragConnection.currentY
          )}
          className="connection-line-preview"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
