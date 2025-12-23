'use client'

import { useRef, useCallback, useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { Play, Loader2, X, Zap } from 'lucide-react'
import { WorkflowNode } from './workflow-node'
import { NodeConnections } from './node-connections'
import { CanvasControls } from './canvas-controls'
import { AddNodeMenu } from './add-node-menu'
import { useWorkflow } from '@/hooks/use-workflow'
import { useConnectionStore } from '@/stores/connection-store'
import { useUserContext } from '@/contexts/user-context'
import { TOOL_CONFIG, TOOLS } from '@/lib/constants'
import { toast } from 'sonner'

// Constants for node dimensions
const NODE_WIDTH = 240
const NODE_HEIGHT = 200

export function WorkflowCanvas() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const transformRef = useRef<ReactZoomPanPinchRef>(null)
  const [isDraggingNode, setIsDraggingNode] = useState(false)
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [creditsNeeded, setCreditsNeeded] = useState(0)
  const [creditsAvailable, setCreditsAvailable] = useState(0)
  const { nodes, selectedTool, updateNode, setZoom, setPan, zoom, pan, isRunning, runWorkflow, isSora2Polling, hasActiveGeneration, workflowStats, workflowValidation, isWorkflowLocked, isInitialLoading } = useWorkflow()
  const dragConnection = useConnectionStore((s) => s.dragConnection)
  const { deductCredits, profile } = useUserContext()

  const toolConfig = selectedTool ? TOOL_CONFIG[selectedTool] : null

  // Track the last tool and initial centering state
  const lastToolRef = useRef<string | null>(null)
  const hasInitializedRef = useRef(false)
  // Track nodes count to only re-center when nodes are added/removed, not when content changes
  const lastNodesCountRef = useRef(nodes.length)

  // Calculate initial transform to center nodes on screen
  const initialTransform = useMemo(() => {
    // No nodes = default position
    if (nodes.length === 0) {
      return { x: 0, y: 0, scale: 1 }
    }

    // Calculate bounding box of all nodes
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + NODE_WIDTH)
      maxY = Math.max(maxY, node.position.y + NODE_HEIGHT)
    })

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // Estimate container size (subtract sidebar 220px + results panel 300px)
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 520 : 800
    const containerHeight = typeof window !== 'undefined' ? window.innerHeight - 100 : 600

    const padding = 100
    const nodesWidth = maxX - minX + padding * 2
    const nodesHeight = maxY - minY + padding * 2

    let scale = Math.min(
      containerWidth / nodesWidth,
      containerHeight / nodesHeight,
      1 // Don't zoom in more than 100%
    )
    scale = Math.max(scale, 0.5) // Don't zoom out less than 50%

    return {
      x: containerWidth / 2 - centerX * scale,
      y: containerHeight / 2 - centerY * scale,
      scale
    }
  }, [nodes])

  // Mark canvas as ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCanvasReady(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Center nodes ONLY when:
  // 1. Initial load (first time canvas is ready)
  // 2. Tool/tab changes
  // NOT when node content changes (like results becoming ready)
  useEffect(() => {
    if (!selectedTool || !isCanvasReady) return

    // Detect if tool changed
    const toolChanged = lastToolRef.current !== null && lastToolRef.current !== selectedTool

    // Detect if this is initial load
    const isInitialLoad = !hasInitializedRef.current

    // Update refs
    lastToolRef.current = selectedTool

    // No nodes = nothing to center
    if (nodes.length === 0) {
      hasInitializedRef.current = true
      lastNodesCountRef.current = 0
      return
    }

    // Only center on:
    // 1. Initial load
    // 2. Tool change
    // NOT on node content changes
    const shouldCenter = isInitialLoad || toolChanged

    if (!shouldCenter) {
      // Update count ref but don't center
      lastNodesCountRef.current = nodes.length
      return
    }

    // Mark as initialized
    hasInitializedRef.current = true
    lastNodesCountRef.current = nodes.length

    // Center on nodes (without animation)
    const centerNodes = () => {
      if (!transformRef.current) return

      const wrapper = transformRef.current.instance.wrapperComponent
      if (!wrapper) return

      let minX = Infinity, minY = Infinity
      let maxX = -Infinity, maxY = -Infinity

      nodes.forEach(node => {
        minX = Math.min(minX, node.position.x)
        minY = Math.min(minY, node.position.y)
        maxX = Math.max(maxX, node.position.x + NODE_WIDTH)
        maxY = Math.max(maxY, node.position.y + NODE_HEIGHT)
      })

      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2

      const containerWidth = wrapper.offsetWidth
      const containerHeight = wrapper.offsetHeight

      const padding = 100
      const nodesWidth = maxX - minX + padding * 2
      const nodesHeight = maxY - minY + padding * 2

      let scale = Math.min(
        containerWidth / nodesWidth,
        containerHeight / nodesHeight,
        1
      )
      scale = Math.max(scale, 0.5)

      // Apply transform WITHOUT animation (duration = 0)
      transformRef.current.setTransform(
        containerWidth / 2 - centerX * scale,
        containerHeight / 2 - centerY * scale,
        scale,
        0
      )
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(centerNodes, toolChanged ? 10 : 50)

    return () => clearTimeout(timer)
  }, [selectedTool, nodes.length, isCanvasReady])

  // Listen for node-added events to re-center on mobile
  useEffect(() => {
    const handleNodeAdded = () => {
      // Only auto-center on mobile (small screens)
      if (window.innerWidth >= 1024) return
      if (!transformRef.current) return

      // Small delay to let the node be added to the DOM
      setTimeout(() => {
        if (!transformRef.current) return

        const wrapper = transformRef.current.instance.wrapperComponent
        if (!wrapper) return

        // Get current nodes from store
        const currentNodes = nodes

        if (currentNodes.length === 0) return

        let minX = Infinity, minY = Infinity
        let maxX = -Infinity, maxY = -Infinity

        currentNodes.forEach(node => {
          minX = Math.min(minX, node.position.x)
          minY = Math.min(minY, node.position.y)
          maxX = Math.max(maxX, node.position.x + NODE_WIDTH)
          maxY = Math.max(maxY, node.position.y + NODE_HEIGHT)
        })

        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2

        const containerWidth = wrapper.offsetWidth
        const containerHeight = wrapper.offsetHeight

        const padding = 50
        const nodesWidth = maxX - minX + padding * 2
        const nodesHeight = maxY - minY + padding * 2

        let scale = Math.min(
          containerWidth / nodesWidth,
          containerHeight / nodesHeight,
          1
        )
        scale = Math.max(scale, 0.4)

        // Apply transform with small animation
        transformRef.current.setTransform(
          containerWidth / 2 - centerX * scale,
          containerHeight / 2 - centerY * scale,
          scale,
          200
        )
      }, 100)
    }

    window.addEventListener('workflow-node-added', handleNodeAdded)
    return () => window.removeEventListener('workflow-node-added', handleNodeAdded)
  }, [nodes])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = useCallback(() => {
    setIsDraggingNode(true)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDraggingNode(false)
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

  const handleDragCancel = useCallback(() => {
    setIsDraggingNode(false)
  }, [])

  // Track if we're currently starting a workflow (prevents double clicks)
  const [isStarting, setIsStarting] = useState(false)

  const handleRunWorkflow = async () => {
    // Prevent multiple clicks
    if (isStarting || isWorkflowLocked) {
      return
    }

    if (!selectedTool) {
      toast.error('Please select a tool first')
      return
    }

    if (nodes.length === 0) {
      toast.error('Add some nodes to your workflow')
      return
    }

    // SECURITY: Check credits on frontend FIRST (better UX - shows error immediately)
    const userCredits = (profile?.credits || 0) + (profile?.credits_extras || 0)

    if (workflowStats.totalCredits > 0 && userCredits < workflowStats.totalCredits) {
      // Not enough credits - show modal to subscribe/buy more
      setCreditsNeeded(workflowStats.totalCredits)
      setCreditsAvailable(userCredits)
      setShowCreditsModal(true)
      return
    }

    // Immediately set starting state to block further clicks
    setIsStarting(true)

    try {
      // Deduct ALL credits ONCE before starting any generations
      // This prevents race conditions when multiple generations run in parallel
      if (workflowStats.totalCredits > 0) {
        const response = await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: workflowStats.totalCredits,
            reason: `${selectedTool} workflow (${workflowStats.totalVideos} generations)`
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to deduct credits')
        }

        // Update UI with new balance
        deductCredits(workflowStats.totalCredits)
      }

      await runWorkflow()
      toast.success('Generation started! Check the results panel for progress.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start generation'
      toast.error(message)

      // Refund credits if the workflow failed to start
      if (workflowStats.totalCredits > 0) {
        try {
          const refundResponse = await fetch('/api/credits/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: workflowStats.totalCredits,
              reason: `${selectedTool} workflow failed - refund`
            })
          })

          if (refundResponse.ok) {
            // Update local state to reflect refund
            window.dispatchEvent(new CustomEvent('profile-cache-updated'))
            toast.info(`${workflowStats.totalCredits} credits refunded`)
          }
        } catch (refundError) {
          // Silent fail
        }
      }
    } finally {
      setIsStarting(false)
    }
  }

  // Can only run if workflow is valid, not locked, not starting, and not loading initial data
  const canRun = selectedTool && nodes.length > 0 && !isWorkflowLocked && !isStarting && !isInitialLoading && workflowValidation.isValid

  // Disable panning when dragging a node or connection
  const isPanningDisabled = isDraggingNode || !!dragConnection

  return (
    <div className="h-full relative overflow-hidden bg-background workflow-canvas-container">
      {/* Canvas Grid Background */}
      <div className="absolute inset-0 workflow-canvas pointer-events-none" />

      {/* Top Controls Bar - fixed on mobile to prevent keyboard issues */}
      <div className="fixed lg:absolute top-[70px] lg:top-5 left-3 sm:left-5 right-3 sm:right-5 z-[70] flex items-center justify-between">
        {/* Left spacer for balance */}
        <div className="flex-1" />

        {/* Add Node Button - Center */}
        <div className="flex-shrink-0">
          <AddNodeMenu />
        </div>

        {/* Right side - Stats and Run Button */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {/* Workflow Stats - only show when valid */}
          {workflowValidation.isValid && workflowStats.totalVideos > 0 && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/80 backdrop-blur-sm rounded-[10px] border border-border text-sm">
              <span className="text-muted-foreground">
                {workflowStats.totalVideos} {selectedTool === TOOLS.AVATAR ? 'image' : 'video'}{workflowStats.totalVideos !== 1 ? 's' : ''}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">{workflowStats.totalCredits} credits</span>
            </div>
          )}

          {/* Run Button */}
          <button
            onClick={handleRunWorkflow}
            disabled={!canRun}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-[10px] text-xs sm:text-sm font-semibold transition-all hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
          >
            {isInitialLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
              </>
            ) : isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Starting...</span>
              </>
            ) : isWorkflowLocked ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Run Workflow</span>
                <span className="sm:hidden">Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={initialTransform.scale}
          initialPositionX={initialTransform.x}
          initialPositionY={initialTransform.y}
          minScale={0.25}
          maxScale={2}
          limitToBounds={false}
          panning={{
            disabled: isPanningDisabled,
            excluded: ['textarea', 'input', 'select', 'button']
          }}
          pinch={{ excluded: ['textarea', 'input', 'select'] }}
          doubleClick={{ disabled: true }}
          wheel={{ excluded: ['textarea', 'input', 'select'] }}
          onTransformed={(ref) => {
            setZoom(ref.state.scale)
            setPan({ x: ref.state.positionX, y: ref.state.positionY })
          }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            <div
              ref={containerRef}
              className="w-full h-full relative"
              style={{ minWidth: '2000px', minHeight: '2000px' }}
            >
              {/* Connections */}
              <NodeConnections containerRef={containerRef} />

              {/* Nodes */}
              {nodes.map((node) => (
                <WorkflowNode key={node.id} node={node} />
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </DndContext>

      {/* Canvas Controls - Outside TransformWrapper to stay fixed in viewport */}
      <CanvasControls transformRef={transformRef} />

      {/* Empty state - centered in viewport */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            <p className="text-muted-foreground">
              {selectedTool
                ? 'Click "Add Node" to start building'
                : 'Select a tool to get started'}
            </p>
          </div>
        </div>
      )}

      {/* Insufficient Credits Modal */}
      {showCreditsModal && (() => {
        const hasActivePlan = profile?.subscription_status === 'active'

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0a0a0a] border border-border rounded-xl p-6 max-w-md w-full mx-4 relative">
              {/* Close button */}
              <button
                onClick={() => setShowCreditsModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-yellow-500" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-center mb-2">
                Insufficient Credits
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                You need <span className="text-white font-medium">{creditsNeeded} credits</span> to run this workflow,
                but you only have <span className="text-white font-medium">{creditsAvailable} credits</span>.
              </p>

              {/* Actions - different based on plan status */}
              <div className="flex flex-col gap-3">
                {hasActivePlan ? (
                  // User has a plan - show Buy Credits
                  <button
                    onClick={() => {
                      setShowCreditsModal(false)
                      router.push('/buy-credits')
                    }}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Buy Credits
                  </button>
                ) : (
                  // User has no plan - show View Plans
                  <button
                    onClick={() => {
                      setShowCreditsModal(false)
                      router.push('/pricing')
                    }}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    View Plans
                  </button>
                )}
                <button
                  onClick={() => setShowCreditsModal(false)}
                  className="w-full py-3 border border-border rounded-lg text-muted-foreground hover:text-white hover:border-white/30 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
