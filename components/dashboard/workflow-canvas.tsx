'use client'

import { useRef, useCallback } from 'react'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { WorkflowNode } from './workflow-node'
import { NodeConnections } from './node-connections'
import { CanvasControls } from './canvas-controls'
import { AddNodeMenu } from './add-node-menu'
import { useWorkflow } from '@/hooks/use-workflow'
import { TOOL_CONFIG } from '@/lib/constants'
import { Sparkles } from 'lucide-react'

export function WorkflowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { nodes, selectedTool, updateNode, setZoom, setPan, zoom } = useWorkflow()

  const toolConfig = selectedTool ? TOOL_CONFIG[selectedTool] : null

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event
      const nodeId = active.id as string
      const node = nodes.find((n) => n.id === nodeId)

      if (node) {
        updateNode(nodeId, {
          position: {
            x: node.position.x + delta.x / zoom,
            y: node.position.y + delta.y / zoom,
          },
        })
      }
    },
    [nodes, updateNode, zoom]
  )

  return (
    <div className="flex-1 h-full relative overflow-hidden bg-background">
      {/* Top toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <AddNodeMenu />
        {toolConfig && (
          <div className="bg-card/90 backdrop-blur-sm border rounded-lg px-3 py-2 flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: toolConfig.color }}
            />
            <span className="text-sm font-medium">{toolConfig.name}</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <TransformWrapper
        initialScale={1}
        minScale={0.25}
        maxScale={2}
        limitToBounds={false}
        onTransformed={(ref) => {
          setZoom(ref.state.scale)
          setPan({ x: ref.state.positionX, y: ref.state.positionY })
        }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div
              ref={containerRef}
              className="w-full h-full workflow-canvas min-h-screen relative"
              style={{ minWidth: '2000px', minHeight: '2000px' }}
            >
              {/* Connections */}
              <NodeConnections containerRef={containerRef} />

              {/* Nodes */}
              {nodes.map((node) => (
                <WorkflowNode key={node.id} node={node} />
              ))}

              {/* Empty state */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Sparkles className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {selectedTool
                        ? 'Start building your workflow'
                        : 'Select a tool to get started'}
                    </h3>
                    <p className="text-sm text-muted-foreground/70">
                      {selectedTool
                        ? 'Click "Add Node" to add nodes to your workflow'
                        : 'Choose an AI tool from the sidebar'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DndContext>
        </TransformComponent>
      </TransformWrapper>

      {/* Controls */}
      <CanvasControls />
    </div>
  )
}
