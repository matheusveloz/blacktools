'use client'

import { useCallback, useRef, useEffect, useMemo } from 'react'
import { useWorkflowStore } from '@/stores/workflow-store'
import { WorkflowNode, Connection } from '@/types/workflow'
import { NodeType, ToolType, TOOL_CONFIG, TOOLS, GENERATOR_NODE_TYPES, GENERATOR_CREDITS } from '@/lib/constants'
import { useSora2Context } from '@/contexts/sora2-context'
import { useVeo3Context } from '@/contexts/veo3-context'
import { useLipSyncContext } from '@/contexts/lipsync-context'
import { useInfiniteTalkContext } from '@/contexts/infinitetalk-context'
import { useNanoBananaContext } from '@/contexts/nanobanana-context'
import type { Sora2Size, Sora2Seconds } from '@/types/sora2'
import type { Veo3AspectRatio, Veo3Speed } from '@/types/veo3'
import type { NanoBananaAspectRatio, NanoBananaResolution } from '@/types/nanobanana'
import { getVeo3Credits } from '@/types/veo3'
import { calculateLipSyncCredits } from '@/types/lipsync'
import { calculateInfiniteTalkCredits } from '@/types/infinitetalk'
import { NANOBANANA_CREDITS } from '@/types/nanobanana'

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

// Minimum prompt length required to generate
export const MIN_PROMPT_LENGTH = 10

// Delay between generation requests to avoid race conditions and rate limits
// Note: No concurrency limit needed - Laozhang async API handles internal scheduling
const GENERATION_REQUEST_DELAY = 500 // 500ms between each request

// Validation result for workflow
export interface WorkflowValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Calculate total videos and credits for the workflow
// Each Reference → Generator connection produces 1 video
// Text-to-video (no references) produces 1 video per generator
// LipSync: VIDEO → AUDIO connection produces 1 video (credits = audio duration in seconds)
export function calculateWorkflowOutputs(
  nodes: WorkflowNode[],
  connections: Connection[],
  selectedTool?: ToolType | null
): { totalVideos: number; totalCredits: number } {
  let totalVideos = 0
  let totalCredits = 0

  // Special handling for LipSync tool
  if (selectedTool === TOOLS.LIPSYNC) {
    // Count EACH valid VIDEO → AUDIO connection (not just audio nodes)
    // This allows multiple videos to connect to the same audio
    connections.forEach(connection => {
      const sourceNode = nodes.find(n => n.id === connection.sourceNodeId)
      const targetNode = nodes.find(n => n.id === connection.targetNodeId)

      // Only count VIDEO → AUDIO connections
      if (sourceNode?.type !== 'video' || targetNode?.type !== 'audio') return

      // Check if video has a file
      const hasVideo = !!(sourceNode.data.videoUrl as string)
      if (!hasVideo) return

      // Check if audio has a file and duration
      const hasAudio = !!(targetNode.data.audioUrl as string)
      const audioDuration = (targetNode.data.audioDuration as number) || 0
      if (!hasAudio || audioDuration <= 0) return

      // Valid pair - count it
      const credits = calculateLipSyncCredits(audioDuration)
      totalVideos += 1
      totalCredits += credits
    })

    return { totalVideos, totalCredits }
  }

  // Special handling for InfiniteTalk tool
  if (selectedTool === TOOLS.INFINITETALK) {
    // Count EACH valid IMAGE → AUDIO connection
    // This allows multiple images to connect to the same audio
    connections.forEach(connection => {
      const sourceNode = nodes.find(n => n.id === connection.sourceNodeId)
      const targetNode = nodes.find(n => n.id === connection.targetNodeId)

      // Only count IMAGE → AUDIO connections
      if (sourceNode?.type !== 'image' || targetNode?.type !== 'audio') return

      // Check if image has a file
      const hasImage = !!(sourceNode.data.imageUrl as string)
      if (!hasImage) return

      // Check if audio has a file and duration
      const hasAudio = !!(targetNode.data.audioUrl as string)
      const audioDuration = (targetNode.data.audioDuration as number) || 0
      if (!hasAudio || audioDuration <= 0) return

      // Valid pair - count it
      const credits = calculateInfiniteTalkCredits(audioDuration)
      totalVideos += 1
      totalCredits += credits
    })

    return { totalVideos, totalCredits }
  }

  // Special handling for Avatar (Nano Banana 2) tool
  if (selectedTool === TOOLS.AVATAR) {
    // Count each avatar node with a valid prompt
    const avatarNodes = nodes.filter(n => n.type === 'avatar')
    const multirefNodes = nodes.filter(n => n.type === 'multiref')

    // Check for orphan multiref nodes (would block workflow) - check once, not per avatar
    const hasOrphanMultiref = multirefNodes.some(m =>
      !connections.some(c => c.sourceNodeId === m.id)
    )
    if (hasOrphanMultiref) {
      return { totalVideos: 0, totalCredits: 0 } // Orphan multiref blocks everything
    }

    avatarNodes.forEach(avatarNode => {
      const prompt = (avatarNode.data.text as string) || ''
      if (prompt.trim().length < MIN_PROMPT_LENGTH) return

      // Find ALL multiref nodes connected to this avatar (can be multiple)
      const connectedMultiRefs = connections
        .filter(c => c.targetNodeId === avatarNode.id)
        .map(c => nodes.find(n => n.id === c.sourceNodeId))
        .filter(n => n?.type === 'multiref') as WorkflowNode[]

      if (connectedMultiRefs.length > 0) {
        // Count valid multirefs (those with images)
        const validMultiRefs = connectedMultiRefs.filter(m => {
          const images = (m.data.images as string[]) || []
          return images.length > 0
        })

        if (validMultiRefs.length === 0) return // Skip - all connected multirefs are empty

        // Each connected multiref with images = 1 generation
        totalVideos += validMultiRefs.length
        totalCredits += NANOBANANA_CREDITS * validMultiRefs.length
      } else {
        // No multiref connected = text-to-image mode = 1 generation
        totalVideos += 1
        totalCredits += NANOBANANA_CREDITS
      }
    })

    return { totalVideos, totalCredits }
  }

  // Get only generator nodes (sora2, veo3)
  const generatorNodes = nodes.filter(n =>
    GENERATOR_NODE_TYPES.includes(n.type as typeof GENERATOR_NODE_TYPES[number]) && n.type !== 'audio' && n.type !== 'avatar'
  )

  // Helper to find reference nodes following the chain (Reference → Generator → Generator)
  const findChainedReferenceNodes = (generatorId: string, visited: Set<string> = new Set()): WorkflowNode[] => {
    if (visited.has(generatorId)) return []
    visited.add(generatorId)

    const incomingConnections = connections.filter(c => c.targetNodeId === generatorId)
    const referenceNodes: WorkflowNode[] = []

    for (const conn of incomingConnections) {
      const sourceNode = nodes.find(n => n.id === conn.sourceNodeId)
      if (!sourceNode) continue

      if (sourceNode.type === 'reference') {
        referenceNodes.push(sourceNode)
      } else if (sourceNode.type === 'sora2' || sourceNode.type === 'veo3') {
        const chainedRefs = findChainedReferenceNodes(sourceNode.id, visited)
        referenceNodes.push(...chainedRefs)
      }
    }

    return referenceNodes
  }

  generatorNodes.forEach(generator => {
    // Check if generator has a valid prompt
    const prompt = (generator.data.text as string) || ''
    if (prompt.trim().length < MIN_PROMPT_LENGTH) {
      return // Skip if no valid prompt
    }

    // Get credits per video - Veo3 has dynamic pricing based on speed
    let creditsPerVideo = GENERATOR_CREDITS[generator.type] || 0
    if (generator.type === 'veo3') {
      const speed = (generator.data.speed as Veo3Speed) || 'fast'
      creditsPerVideo = getVeo3Credits(speed)
    }

    // Find ALL connected references with valid images (following the chain)
    const connectedRefs = findChainedReferenceNodes(generator.id)
    const connectedValidRefs = connectedRefs.filter(ref => !!(ref.data.imageUrl as string))

    if (connectedValidRefs.length > 0) {
      // Image-to-video: 1 video PER connected reference
      totalVideos += connectedValidRefs.length
      totalCredits += creditsPerVideo * connectedValidRefs.length
    } else {
      // Text-to-video: 1 video per generator (no references needed)
      // But only if there are no unconnected reference nodes in the workflow
      const hasUnconnectedRefs = nodes.some(n =>
        n.type === 'reference' && !connections.some(c => c.sourceNodeId === n.id)
      )
      if (!hasUnconnectedRefs) {
        totalVideos += 1
        totalCredits += creditsPerVideo
      }
    }
  })

  return { totalVideos, totalCredits }
}

// Validate workflow before running
export function validateWorkflow(
  nodes: WorkflowNode[],
  connections: Connection[],
  selectedTool?: ToolType | null
): WorkflowValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Special validation for LipSync tool
  if (selectedTool === TOOLS.LIPSYNC) {
    const videoNodes = nodes.filter(n => n.type === 'video')
    const audioNodes = nodes.filter(n => n.type === 'audio')

    if (videoNodes.length === 0) {
      errors.push('Add a Video node')
      return { isValid: false, errors, warnings }
    }

    if (audioNodes.length === 0) {
      errors.push('Add an Audio node')
      return { isValid: false, errors, warnings }
    }

    // Check each audio node for valid connections
    let hasValidPair = false

    audioNodes.forEach(audioNode => {
      // Find video nodes connected to this audio node
      const connectedVideoNodes = connections
        .filter(c => c.targetNodeId === audioNode.id)
        .map(c => nodes.find(n => n.id === c.sourceNodeId))
        .filter(n => n?.type === 'video') as WorkflowNode[]

      if (connectedVideoNodes.length === 0) {
        errors.push('Connect Video node to Audio node')
        return
      }

      // Check if video has file
      const videoWithFile = connectedVideoNodes.find(v => !!(v.data.videoUrl as string))
      if (!videoWithFile) {
        errors.push('Upload a video file')
        return
      }

      // Check if audio has file
      const hasAudio = !!(audioNode.data.audioUrl as string)
      if (!hasAudio) {
        errors.push('Upload an audio file')
        return
      }

      // Check audio duration
      const audioDuration = (audioNode.data.audioDuration as number) || 0
      if (audioDuration <= 0) {
        errors.push('Invalid audio duration')
        return
      }

      hasValidPair = true
    })

    if (!hasValidPair && errors.length === 0) {
      errors.push('Connect Video and Audio nodes with valid files')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Special validation for InfiniteTalk tool
  if (selectedTool === TOOLS.INFINITETALK) {
    const imageNodes = nodes.filter(n => n.type === 'image')
    const audioNodes = nodes.filter(n => n.type === 'audio')

    if (imageNodes.length === 0) {
      errors.push('Add an Image node')
      return { isValid: false, errors, warnings }
    }

    if (audioNodes.length === 0) {
      errors.push('Add an Audio node')
      return { isValid: false, errors, warnings }
    }

    // Check if ALL image nodes have images uploaded
    const imageNodesWithoutFile = imageNodes.filter(n => !(n.data.imageUrl as string))
    if (imageNodesWithoutFile.length > 0) {
      errors.push('Upload images to all Image nodes')
      return { isValid: false, errors, warnings }
    }

    // Check each audio node for valid connections
    let hasValidPair = false

    audioNodes.forEach(audioNode => {
      // Find image nodes connected to this audio node
      const connectedImageNodes = connections
        .filter(c => c.targetNodeId === audioNode.id)
        .map(c => nodes.find(n => n.id === c.sourceNodeId))
        .filter(n => n?.type === 'image') as WorkflowNode[]

      if (connectedImageNodes.length === 0) {
        errors.push('Connect Image node to Audio node')
        return
      }

      // Check if image has file (should already be validated above, but double-check)
      const imageWithFile = connectedImageNodes.find(v => !!(v.data.imageUrl as string))
      if (!imageWithFile) {
        errors.push('Upload an image file')
        return
      }

      // Check if audio has file
      const hasAudio = !!(audioNode.data.audioUrl as string)
      if (!hasAudio) {
        errors.push('Upload an audio file')
        return
      }

      // Check audio duration
      const audioDuration = (audioNode.data.audioDuration as number) || 0
      if (audioDuration <= 0) {
        errors.push('Invalid audio duration')
        return
      }

      hasValidPair = true
    })

    if (!hasValidPair && errors.length === 0) {
      errors.push('Connect Image and Audio nodes with valid files')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Special validation for Avatar (Nano Banana 2) tool
  if (selectedTool === TOOLS.AVATAR) {
    const avatarNodes = nodes.filter(n => n.type === 'avatar')
    const multirefNodes = nodes.filter(n => n.type === 'multiref')

    if (avatarNodes.length === 0) {
      errors.push('Add a Nano Banana 2 node')
      return { isValid: false, errors, warnings }
    }

    avatarNodes.forEach(avatarNode => {
      const prompt = (avatarNode.data.text as string) || ''
      if (prompt.trim().length < MIN_PROMPT_LENGTH) {
        errors.push(`AVATAR: Enter a prompt (min ${MIN_PROMPT_LENGTH} characters)`)
      }

      // Find ALL multiref nodes connected to this avatar node (can be multiple)
      const connectedMultiRefs = connections
        .filter(c => c.targetNodeId === avatarNode.id)
        .map(c => nodes.find(n => n.id === c.sourceNodeId))
        .filter(n => n?.type === 'multiref') as WorkflowNode[]

      // If any multiref is connected, ALL must have images
      connectedMultiRefs.forEach(multiRef => {
        const images = (multiRef.data.images as string[]) || []
        if (images.length === 0) {
          errors.push('REFERENCE: Add at least one image to the reference node')
        }
      })
    })

    // Check for orphan multiref nodes (added but not connected) - this is an ERROR
    multirefNodes.forEach(multirefNode => {
      const isConnected = connections.some(c => c.sourceNodeId === multirefNode.id)
      if (!isConnected) {
        errors.push('Reference node not connected - connect or remove it')
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Standard validation for other tools (Sora2, Veo3, etc.)
  // Get generator nodes
  const generatorNodes = nodes.filter(n =>
    GENERATOR_NODE_TYPES.includes(n.type as typeof GENERATOR_NODE_TYPES[number]) && n.type !== 'audio' && n.type !== 'avatar'
  )

  if (generatorNodes.length === 0) {
    errors.push('Add a generator node (Sora 2 or Veo 3)')
    return { isValid: false, errors, warnings }
  }

  // Check each generator node
  generatorNodes.forEach(generator => {
    const nodeName = generator.type.toUpperCase()

    // Check if generator has a valid prompt
    const prompt = (generator.data.text as string) || ''
    if (prompt.trim().length < MIN_PROMPT_LENGTH) {
      errors.push(`${nodeName}: Enter a prompt (min ${MIN_PROMPT_LENGTH} characters)`)
    }

    // Find connected Reference nodes
    const connectedRefs = connections
      .filter(c => c.targetNodeId === generator.id)
      .map(c => nodes.find(n => n.id === c.sourceNodeId))
      .filter(n => n?.type === 'reference') as WorkflowNode[]

    // If there ARE connected references, they must have images
    if (connectedRefs.length > 0) {
      const refsWithoutImage = connectedRefs.filter(ref => {
        const imageUrl = ref.data.imageUrl as string
        return !imageUrl
      })

      if (refsWithoutImage.length > 0) {
        errors.push(`${nodeName}: ${refsWithoutImage.length} connected Reference node(s) missing image`)
      }
    }
    // If no references connected = text-to-video mode, that's OK!
  })

  // Check for orphan Reference nodes (added but not connected) - this is an ERROR
  const referenceNodes = nodes.filter(n => n.type === 'reference')
  const unconnectedRefs = referenceNodes.filter(ref => {
    const isConnected = connections.some(c => c.sourceNodeId === ref.id)
    return !isConnected
  })

  if (unconnectedRefs.length > 0) {
    errors.push(`${unconnectedRefs.length} Reference node(s) not connected - connect or remove them`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function useWorkflow() {
  const nodes = useWorkflowStore((state) => state.nodes)
  const connections = useWorkflowStore((state) => state.connections)
  const selectedTool = useWorkflowStore((state) => state.selectedTool)
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)
  const zoom = useWorkflowStore((state) => state.zoom)
  const pan = useWorkflowStore((state) => state.pan)
  const isRunning = useWorkflowStore((state) => state.isRunning)

  const setSelectedTool = useWorkflowStore((state) => state.setSelectedTool)
  const switchTool = useWorkflowStore((state) => state.switchTool)
  const addNode = useWorkflowStore((state) => state.addNode)
  const updateNode = useWorkflowStore((state) => state.updateNode)
  const removeNode = useWorkflowStore((state) => state.removeNode)
  const selectNode = useWorkflowStore((state) => state.selectNode)
  const addConnection = useWorkflowStore((state) => state.addConnection)
  const removeConnection = useWorkflowStore((state) => state.removeConnection)
  const setZoom = useWorkflowStore((state) => state.setZoom)
  const setPan = useWorkflowStore((state) => state.setPan)
  const setIsRunning = useWorkflowStore((state) => state.setIsRunning)
  const clearWorkflow = useWorkflowStore((state) => state.clearWorkflow)
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow)

  const createNode = (type: NodeType, tool: ToolType, position: { x: number; y: number }) => {
    const node: WorkflowNode = {
      id: generateId(),
      type,
      position,
      data: {},
      tool,
    }
    addNode(node)
    return node
  }

  const createConnection = (sourceNodeId: string, targetNodeId: string) => {
    const connection: Connection = {
      id: generateId(),
      sourceNodeId,
      targetNodeId,
    }
    addConnection(connection)
    return connection
  }

  const getNodesForTool = (tool: ToolType) => {
    const config = TOOL_CONFIG[tool]
    return config.nodes
  }

  const initializeWorkflowForTool = (tool: ToolType) => {
    clearWorkflow()
    setSelectedTool(tool)

    const nodeTypes = getNodesForTool(tool)
    const spacing = 250
    const startX = 100
    const startY = 200

    const createdNodes: WorkflowNode[] = []

    nodeTypes.forEach((nodeType, index) => {
      const node: WorkflowNode = {
        id: generateId(),
        type: nodeType as NodeType,
        position: {
          x: startX + index * spacing,
          y: startY,
        },
        data: {},
        tool,
      }
      addNode(node)
      createdNodes.push(node)

      if (index > 0 && createdNodes[index - 1]) {
        const connection: Connection = {
          id: generateId(),
          sourceNodeId: createdNodes[index - 1].id,
          targetNodeId: node.id,
        }
        addConnection(connection)
      }
    })
  }

  // Helper to find ALL connected Reference nodes for a generator node
  // Follows the chain recursively: Reference → Veo3 → Veo3 will find Reference for both
  const findConnectedReferenceNodes = useCallback((generatorNodeId: string, visited: Set<string> = new Set()) => {
    // Prevent infinite loops
    if (visited.has(generatorNodeId)) return []
    visited.add(generatorNodeId)

    // Find all connections where generator node is the target
    const incomingConnections = connections.filter(c => c.targetNodeId === generatorNodeId)

    const referenceNodes: WorkflowNode[] = []

    for (const conn of incomingConnections) {
      const sourceNode = nodes.find(n => n.id === conn.sourceNodeId)
      if (!sourceNode) continue

      if (sourceNode.type === 'reference') {
        // Direct reference connection
        referenceNodes.push(sourceNode)
      } else if (sourceNode.type === 'multiref') {
        // Multi-reference node - treat as reference
        referenceNodes.push(sourceNode)
      } else if (sourceNode.type === 'sora2' || sourceNode.type === 'veo3') {
        // Follow the chain - get references from the connected generator
        const chainedRefs = findConnectedReferenceNodes(sourceNode.id, visited)
        referenceNodes.push(...chainedRefs)
      }
    }

    return referenceNodes
  }, [connections, nodes])

  // Calculate workflow outputs (videos and credits) - memoized to avoid infinite loops
  const workflowStats = useMemo(() => {
    return calculateWorkflowOutputs(nodes, connections, selectedTool)
  }, [nodes, connections, selectedTool])

  // Validate workflow - memoized to avoid infinite loops
  const workflowValidation = useMemo(() => {
    return validateWorkflow(nodes, connections, selectedTool)
  }, [nodes, connections, selectedTool])

  // Use the shared contexts (single instance for all components)
  const sora2 = useSora2Context()
  const veo3 = useVeo3Context()
  const lipsync = useLipSyncContext()
  const infinitetalk = useInfiniteTalkContext()
  const nanobanana = useNanoBananaContext()
  
  // Use refs for stable access in effects
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes
  
  const updateNodeRef = useRef(updateNode)
  updateNodeRef.current = updateNode
  
  const setIsRunningRef = useRef(setIsRunning)
  setIsRunningRef.current = setIsRunning
  
  // Track which generations we've already processed
  const processedGenerationsRef = useRef<Set<string>>(new Set())

  // Map generation IDs to node IDs (for finding nodes when generation completes)
  const generationToNodeMapRef = useRef<Map<string, string>>(new Map())

  // Prevent duplicate workflow runs (guards against rapid clicks)
  const isStartingWorkflowRef = useRef(false)

  // Helper to find Sora2 node by generationId
  const findSora2NodeByGenerationId = useCallback((generationId: string) => {
    // First check our map (most reliable)
    const mappedNodeId = generationToNodeMapRef.current.get(generationId)
    if (mappedNodeId) {
      return nodesRef.current.find(n => n.id === mappedNodeId)
    }

    // Fallback to searching node data
    return nodesRef.current.find(n => {
      if (n.type !== 'sora2') return false
      if (n.data.generationId === generationId) return true
      const ids = n.data.generationIds as string[] | undefined
      if (ids && ids.includes(generationId)) return true
      return false
    })
  }, [])

  // Watch for generation status changes and update nodes accordingly
  useEffect(() => {
    sora2.generations.forEach(generation => {
      const processedKey = `${generation.id}-${generation.status}`

      // Skip if already processed this exact status
      if (processedGenerationsRef.current.has(processedKey)) return

      // Find the node ID from our map
      const mappedNodeId = generationToNodeMapRef.current.get(generation.id)
      if (!mappedNodeId) {
        // Try to find by searching node data
        const nodeByData = nodesRef.current.find(n => {
          if (n.type !== 'sora2') return false
          if (n.data.generationId === generation.id) return true
          const ids = n.data.generationIds as string[] | undefined
          if (ids && ids.includes(generation.id)) return true
          return false
        })
        if (!nodeByData) return // Node not found, skip
      }

      const nodeId = mappedNodeId || nodesRef.current.find(n =>
        n.type === 'sora2' && (n.data.generationId === generation.id ||
          (n.data.generationIds as string[] | undefined)?.includes(generation.id))
      )?.id

      if (!nodeId) return

      // Get current node data from refs (most up to date)
      const currentNode = nodesRef.current.find(n => n.id === nodeId)
      if (!currentNode) return

      // Mark as processed
      processedGenerationsRef.current.add(processedKey)

      // Only update if status actually changed
      const currentStatus = currentNode.data.status as string | undefined
      if (currentStatus !== generation.status) {
        updateNodeRef.current(nodeId, {
          data: {
            ...currentNode.data,
            generationId: generation.id,
            status: generation.status,
            resultUrl: generation.result_url,
            error: generation.error
          }
        })
      }
    })

    // Check if all Sora2 generations are complete to unlock workflow
    const hasSora2Pending = sora2.generations.some(
      g => g.status === 'pending' || g.status === 'processing'
    )
    if (!hasSora2Pending && !sora2.isGenerating && !sora2.isPolling) {
      // Only unlock if Veo3 is also not running
      const hasVeo3Pending = veo3.generations.some(
        g => g.status === 'pending' || g.status === 'processing'
      )
      if (!hasVeo3Pending && !veo3.isGenerating && !veo3.isPolling) {
        setIsRunningRef.current(false)
      }
    }
  }, [sora2.generations, sora2.isGenerating, sora2.isPolling, veo3.generations, veo3.isGenerating, veo3.isPolling])

  // Watch for Veo3 generation status changes and update nodes accordingly
  useEffect(() => {
    veo3.generations.forEach(generation => {
      const processedKey = `veo3-${generation.id}-${generation.status}`

      // Skip if already processed this exact status
      if (processedGenerationsRef.current.has(processedKey)) return

      // Find the node ID from our map
      const mappedNodeId = generationToNodeMapRef.current.get(generation.id)
      if (!mappedNodeId) {
        // Try to find by searching node data
        const nodeByData = nodesRef.current.find(n => {
          if (n.type !== 'veo3') return false
          if (n.data.generationId === generation.id) return true
          const ids = n.data.generationIds as string[] | undefined
          if (ids && ids.includes(generation.id)) return true
          return false
        })
        if (!nodeByData) return // Node not found, skip
      }

      const nodeId = mappedNodeId || nodesRef.current.find(n =>
        n.type === 'veo3' && (n.data.generationId === generation.id ||
          (n.data.generationIds as string[] | undefined)?.includes(generation.id))
      )?.id

      if (!nodeId) return

      // Get current node data from refs (most up to date)
      const currentNode = nodesRef.current.find(n => n.id === nodeId)
      if (!currentNode) return

      // Mark as processed
      processedGenerationsRef.current.add(processedKey)

      // Only update if status actually changed
      const currentStatus = currentNode.data.status as string | undefined
      if (currentStatus !== generation.status) {
        updateNodeRef.current(nodeId, {
          data: {
            ...currentNode.data,
            generationId: generation.id,
            status: generation.status,
            resultUrl: generation.result_url,
            error: generation.error
          }
        })
      }
    })

    // Check if all Veo3 generations are complete to unlock workflow
    const hasVeo3Pending = veo3.generations.some(
      g => g.status === 'pending' || g.status === 'processing'
    )
    if (!hasVeo3Pending && !veo3.isGenerating && !veo3.isPolling) {
      // Only unlock if Sora2 is also not running
      const hasSora2Pending = sora2.generations.some(
        g => g.status === 'pending' || g.status === 'processing'
      )
      if (!hasSora2Pending && !sora2.isGenerating && !sora2.isPolling) {
        setIsRunningRef.current(false)
      }
    }
  }, [veo3.generations, veo3.isGenerating, veo3.isPolling, sora2.generations, sora2.isGenerating, sora2.isPolling])

  const getSora2ConfigFromNodeData = useCallback((data: Record<string, unknown>): { size: Sora2Size; seconds: Sora2Seconds } => {
    // Defaults MUST match workflow-node.tsx defaults: duration='15s', aspect='9:16'
    const duration = (data.duration as string) || '15s'
    const aspect = (data.aspect as string) || '9:16'

    const isLandscape = aspect === '16:9'
    const is15s = duration === '15s'

    return {
      size: isLandscape ? '1280x720' : '720x1280',
      seconds: is15s ? '15' : '10'
    }
  }, [])

  // Check if there's a generation in progress for a specific tool (or any tool if not specified)
  const hasActiveGeneration = useCallback((tool?: ToolType) => {
    // Sora 2
    if (tool === TOOLS.SORA2 || !tool) {
      const pendingGen = sora2.generations.find(
        g => g.status === 'pending' || g.status === 'processing'
      )
      if (pendingGen) return true
    }
    // Veo 3
    if (tool === TOOLS.VEO3 || !tool) {
      const pendingGen = veo3.generations.find(
        g => g.status === 'pending' || g.status === 'processing'
      )
      if (pendingGen) return true
    }
    // LipSync
    if (tool === TOOLS.LIPSYNC || !tool) {
      const pendingGen = lipsync.generations.find(
        g => g.status === 'pending' || g.status === 'processing'
      )
      if (pendingGen) return true
    }
    // InfiniteTalk
    if (tool === TOOLS.INFINITETALK || !tool) {
      const pendingGen = infinitetalk.generations.find(
        g => g.status === 'pending' || g.status === 'processing'
      )
      if (pendingGen) return true
    }
    // Avatar (Nano Banana 2)
    if (tool === TOOLS.AVATAR || !tool) {
      // Check if generating or has processing generations
      if (nanobanana.isGenerating) return true
      const pendingGen = nanobanana.generations.find(
        g => g.status === 'pending' || g.status === 'processing'
      )
      if (pendingGen) return true
    }
    return false
  }, [sora2.generations, veo3.generations, lipsync.generations, infinitetalk.generations, nanobanana.isGenerating, nanobanana.generations])

  // Check if the CURRENT selected tool has active generation
  const hasActiveGenerationForCurrentTool = useCallback(() => {
    return selectedTool ? hasActiveGeneration(selectedTool) : false
  }, [selectedTool, hasActiveGeneration])

  // Workflow is locked only when:
  // 1. Initial loading (fetching user's generations)
  // 2. The CURRENT TOOL has pending/processing generations
  // This allows switching to other tools while one is generating
  const isInitialLoadingForTool =
    (selectedTool === TOOLS.SORA2 && sora2.isInitialLoading) ||
    (selectedTool === TOOLS.VEO3 && veo3.isInitialLoading) ||
    (selectedTool === TOOLS.LIPSYNC && lipsync.isInitialLoading) ||
    (selectedTool === TOOLS.INFINITETALK && infinitetalk.isInitialLoading) ||
    (selectedTool === TOOLS.AVATAR && nanobanana.isGenerating)
  const isWorkflowLocked = isInitialLoadingForTool || hasActiveGenerationForCurrentTool()

  const runWorkflow = useCallback(async () => {
    if (!selectedTool) return

    // Prevent duplicate runs from rapid clicks
    if (isStartingWorkflowRef.current) {
      return
    }

    // Block if there's already a generation in progress for THIS tool
    if (hasActiveGeneration(selectedTool)) {
      throw new Error('Please wait for the current generation to complete')
    }

    // Validate workflow before running
    const validation = validateWorkflow(nodes, connections, selectedTool)
    if (!validation.isValid) {
      throw new Error(validation.errors[0]) // Show first error
    }

    // Set flag to prevent duplicate runs
    isStartingWorkflowRef.current = true
    setIsRunning(true)

    // Handle Sora 2 workflow
    if (selectedTool === TOOLS.SORA2) {
      // Find ALL Sora2 nodes
      const sora2Nodes = nodes.filter(n => n.type === 'sora2')

      // Build list of all generations to run
      // Each Reference → Sora2 connection generates 1 video
      // OR 1 video per Sora2 node if no references (text-to-video mode)
      const allGenerations: Array<{
        sora2Node: WorkflowNode
        prompt: string
        size: Sora2Size
        seconds: Sora2Seconds
        imageUrl: string | undefined
        referenceNodeId: string | undefined
      }> = []

      sora2Nodes.forEach(sora2Node => {
        const prompt = (sora2Node.data.text as string) || ''
        const { size, seconds } = getSora2ConfigFromNodeData(sora2Node.data)

        // Find ALL Reference nodes connected to this Sora2 node WITH valid images
        const referenceNodes = findConnectedReferenceNodes(sora2Node.id)
          .filter(ref => !!(ref.data.imageUrl as string))

        if (referenceNodes.length > 0) {
          // Image-to-video: 1 video PER connected reference
          referenceNodes.forEach(refNode => {
            const imageUrl = refNode.data.imageUrl as string
            allGenerations.push({
              sora2Node,
              prompt,
              size,
              seconds,
              imageUrl,
              referenceNodeId: refNode.id
            })
          })
        } else {
          // Text-to-video: one video with just prompt (no image)
          allGenerations.push({
            sora2Node,
            prompt,
            size,
            seconds,
            imageUrl: undefined,
            referenceNodeId: undefined
          })
        }
      })

      // Update all Sora2 nodes status to pending
      sora2Nodes.forEach(sora2Node => {
        updateNode(sora2Node.id, {
          data: {
            ...sora2Node.data,
            status: 'pending',
            generationIds: [],
            resultUrls: [],
            error: null
          }
        })
      })

      // Process generations sequentially with delay (API recommends 2-3 concurrent max)
      const results: Array<{ success: boolean; nodeId: string; generationId?: string; error?: string | null; referenceNodeId?: string }> = []

      // Process one at a time with delay to avoid overwhelming API
      for (let i = 0; i < allGenerations.length; i++) {
        const gen = allGenerations[i]

        // Add delay between requests (except for first one)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, GENERATION_REQUEST_DELAY))
        }

        // Credits already deducted by workflow-canvas
        const generationId = await sora2.generate(gen.prompt, gen.size, gen.seconds, gen.imageUrl, true)

        if (generationId) {
          // Store the mapping of generationId -> nodeId
          generationToNodeMapRef.current.set(generationId, gen.sora2Node.id)

          // Update the node to show it's processing
          updateNode(gen.sora2Node.id, {
            data: {
              ...gen.sora2Node.data,
              generationId: generationId,
              status: 'processing'
            }
          })
          results.push({ success: true, nodeId: gen.sora2Node.id, generationId, referenceNodeId: gen.referenceNodeId })
        } else {
          // Mark as failed
          updateNode(gen.sora2Node.id, {
            data: {
              ...gen.sora2Node.data,
              status: 'failed',
              error: sora2.error || 'Failed to start generation'
            }
          })
          results.push({ success: false, nodeId: gen.sora2Node.id, error: sora2.error, referenceNodeId: gen.referenceNodeId })
        }
      }

      // Check if any failed
      const failedCount = results.filter(r => !r.success).length
      if (failedCount === results.length) {
        isStartingWorkflowRef.current = false
        setIsRunning(false)
        throw new Error('Failed to start all generations')
      }

      // Start polling ONCE after all generations are queued
      // This triggers the polling to check status every 5 seconds
      sora2.startPolling()

      // Reset the starting flag (workflow is now running, not starting)
      isStartingWorkflowRef.current = false

      return
    }

    // Handle Veo 3 workflow
    if (selectedTool === TOOLS.VEO3) {
      // Find ALL Veo3 nodes
      const veo3Nodes = nodes.filter(n => n.type === 'veo3')

      // Build list of all generations to run
      const allGenerations: Array<{
        veo3Node: WorkflowNode
        prompt: string
        aspectRatio: Veo3AspectRatio
        speed: Veo3Speed
        imageUrl: string | undefined
        referenceNodeId: string | undefined
      }> = []

      veo3Nodes.forEach(veo3Node => {
        const prompt = (veo3Node.data.text as string) || ''
        const speed = ((veo3Node.data.speed as string) || 'fast') as Veo3Speed
        const aspect = (veo3Node.data.aspect as string) || '9:16'
        const aspectRatio: Veo3AspectRatio = aspect === '16:9' ? 'landscape' : 'portrait'

        // Find ALL Reference nodes connected to this Veo3 node WITH valid images
        const referenceNodes = findConnectedReferenceNodes(veo3Node.id)
          .filter(ref => !!(ref.data.imageUrl as string))

        if (referenceNodes.length > 0) {
          // Image-to-video: 1 video PER connected reference
          referenceNodes.forEach(refNode => {
            const imageUrl = refNode.data.imageUrl as string
            allGenerations.push({
              veo3Node,
              prompt,
              aspectRatio,
              speed,
              imageUrl,
              referenceNodeId: refNode.id
            })
          })
        } else {
          // Text-to-video: one video with just prompt (no image)
          allGenerations.push({
            veo3Node,
            prompt,
            aspectRatio,
            speed,
            imageUrl: undefined,
            referenceNodeId: undefined
          })
        }
      })

      // Update all Veo3 nodes status to pending
      veo3Nodes.forEach(veo3Node => {
        updateNode(veo3Node.id, {
          data: {
            ...veo3Node.data,
            status: 'pending',
            generationIds: [],
            resultUrls: [],
            error: null
          }
        })
      })

      // Process generations sequentially with delay
      const results: Array<{ success: boolean; nodeId: string; generationId?: string; error?: string | null; referenceNodeId?: string }> = []

      for (let i = 0; i < allGenerations.length; i++) {
        const gen = allGenerations[i]

        // Add delay between requests (except for first one)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, GENERATION_REQUEST_DELAY))
        }

        // Credits already deducted by workflow-canvas
        const generationId = await veo3.generate(gen.prompt, gen.aspectRatio, gen.speed, gen.imageUrl, true)

        if (generationId) {
          // Store the mapping of generationId -> nodeId
          generationToNodeMapRef.current.set(generationId, gen.veo3Node.id)

          // Update the node to show it's processing
          updateNode(gen.veo3Node.id, {
            data: {
              ...gen.veo3Node.data,
              generationId: generationId,
              status: 'processing'
            }
          })
          results.push({ success: true, nodeId: gen.veo3Node.id, generationId, referenceNodeId: gen.referenceNodeId })
        } else {
          // Mark as failed
          updateNode(gen.veo3Node.id, {
            data: {
              ...gen.veo3Node.data,
              status: 'failed',
              error: veo3.error || 'Failed to start generation'
            }
          })
          results.push({ success: false, nodeId: gen.veo3Node.id, error: veo3.error, referenceNodeId: gen.referenceNodeId })
        }
      }

      // Check if any failed
      const failedCount = results.filter(r => !r.success).length
      if (failedCount === results.length) {
        isStartingWorkflowRef.current = false
        setIsRunning(false)
        throw new Error('Failed to start all Veo3 generations')
      }

      // Start polling ONCE after all generations are queued
      veo3.startPolling()

      // Reset the starting flag (workflow is now running, not starting)
      isStartingWorkflowRef.current = false

      return
    }

    // Handle LipSync workflow
    if (selectedTool === TOOLS.LIPSYNC) {
      // Find ALL valid VIDEO → AUDIO connections (not just one per audio node)
      // This allows multiple videos to connect to the same audio
      const generationsToRun: Array<{
        audioNode: WorkflowNode
        videoNode: WorkflowNode
        videoUrl: string
        audioUrl: string
        audioDuration: number
        connectionId: string
      }> = []

      connections.forEach(connection => {
        const videoNode = nodes.find(n => n.id === connection.sourceNodeId && n.type === 'video')
        const audioNode = nodes.find(n => n.id === connection.targetNodeId && n.type === 'audio')

        // Only process VIDEO → AUDIO connections
        if (!videoNode || !audioNode) return

        const videoUrl = videoNode.data.videoUrl as string
        const audioUrl = audioNode.data.audioUrl as string
        const audioDuration = (audioNode.data.audioDuration as number) || 0

        if (videoUrl && audioUrl && audioDuration > 0) {
          generationsToRun.push({
            audioNode,
            videoNode,
            videoUrl,
            audioUrl,
            audioDuration,
            connectionId: connection.id
          })
        }
      })

      if (generationsToRun.length === 0) {
        isStartingWorkflowRef.current = false
        setIsRunning(false)
        throw new Error('No valid video-audio pairs found')
      }

      // Update audio nodes to show pending status
      generationsToRun.forEach(gen => {
        updateNode(gen.audioNode.id, {
          data: {
            ...gen.audioNode.data,
            status: 'pending',
            error: null
          }
        })
      })

      // Process LipSync generations
      const results: Array<{ success: boolean; nodeId: string; generationId?: string; error?: string | null }> = []

      for (let i = 0; i < generationsToRun.length; i++) {
        const gen = generationsToRun[i]

        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, GENERATION_REQUEST_DELAY))
        }

        // Call LipSync API - credits already deducted by workflow-canvas
        const generationId = await lipsync.generate(
          gen.videoUrl,
          gen.audioUrl,
          gen.audioDuration,
          undefined,  // videoParams
          true        // skipCreditDeduction - credits already deducted upfront
        )

        if (generationId) {
          updateNode(gen.audioNode.id, {
            data: {
              ...gen.audioNode.data,
              generationId,
              status: 'processing'
            }
          })
          results.push({ success: true, nodeId: gen.audioNode.id, generationId })
        } else {
          updateNode(gen.audioNode.id, {
            data: {
              ...gen.audioNode.data,
              status: 'failed',
              error: lipsync.error || 'Failed to start LipSync generation'
            }
          })
          results.push({ success: false, nodeId: gen.audioNode.id, error: lipsync.error })
        }
      }

      const failedCount = results.filter(r => !r.success).length
      if (failedCount === results.length) {
        isStartingWorkflowRef.current = false
        setIsRunning(false)
        throw new Error('Failed to start all LipSync generations')
      }

      // Start polling for LipSync results
      lipsync.startPolling()

      isStartingWorkflowRef.current = false
      return
    }

    // Handle InfiniteTalk workflow
    if (selectedTool === TOOLS.INFINITETALK) {
      // Find ALL valid IMAGE → AUDIO connections
      // This allows multiple images to connect to the same audio
      const generationsToRun: Array<{
        audioNode: WorkflowNode
        imageNode: WorkflowNode
        imageUrl: string
        audioUrl: string
        audioDuration: number
        connectionId: string
      }> = []

      connections.forEach(connection => {
        const imageNode = nodes.find(n => n.id === connection.sourceNodeId && n.type === 'image')
        const audioNode = nodes.find(n => n.id === connection.targetNodeId && n.type === 'audio')

        // Only process IMAGE → AUDIO connections
        if (!imageNode || !audioNode) return

        const imageUrl = imageNode.data.imageUrl as string
        const audioUrl = audioNode.data.audioUrl as string
        const audioDuration = (audioNode.data.audioDuration as number) || 0

        if (imageUrl && audioUrl && audioDuration > 0) {
          generationsToRun.push({
            audioNode,
            imageNode,
            imageUrl,
            audioUrl,
            audioDuration,
            connectionId: connection.id
          })
        }
      })

      if (generationsToRun.length === 0) {
        isStartingWorkflowRef.current = false
        setIsRunning(false)
        throw new Error('No valid image-audio pairs found')
      }

      // Update audio nodes to show pending status
      generationsToRun.forEach(gen => {
        updateNode(gen.audioNode.id, {
          data: {
            ...gen.audioNode.data,
            status: 'pending',
            error: null
          }
        })
      })

      // Process InfiniteTalk generations
      const results: Array<{ success: boolean; nodeId: string; generationId?: string; error?: string | null }> = []

      for (let i = 0; i < generationsToRun.length; i++) {
        const gen = generationsToRun[i]

        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, GENERATION_REQUEST_DELAY))
        }

        // Get prompt from audio node if available
        const prompt = (gen.audioNode.data.text as string) || undefined
        
        // Build params with prompt if provided
        const params = prompt ? {
          resolution: '720p' as const,
          prompt: prompt.trim(),
          seed: -1,
        } : {
          resolution: '720p' as const,
          seed: -1,
        }

        // Call InfiniteTalk API - credits already deducted by workflow-canvas
        const generationId = await infinitetalk.generate(
          gen.imageUrl,
          gen.audioUrl,
          gen.audioDuration,
          params,     // params with prompt
          true        // skipCreditDeduction - credits already deducted upfront
        )

        if (generationId) {
          updateNode(gen.audioNode.id, {
            data: {
              ...gen.audioNode.data,
              generationId,
              status: 'processing'
            }
          })
          results.push({ success: true, nodeId: gen.audioNode.id, generationId })
        } else {
          updateNode(gen.audioNode.id, {
            data: {
              ...gen.audioNode.data,
              status: 'failed',
              error: infinitetalk.error || 'Failed to start InfiniteTalk generation'
            }
          })
          results.push({ success: false, nodeId: gen.audioNode.id, error: infinitetalk.error })
        }
      }

      const failedCount = results.filter(r => !r.success).length
      if (failedCount === results.length) {
        isStartingWorkflowRef.current = false
        setIsRunning(false)
        throw new Error('Failed to start all InfiniteTalk generations')
      }

      // Start polling for InfiniteTalk results
      infinitetalk.startPolling()

      isStartingWorkflowRef.current = false
      return
    }

    // Handle Avatar (Nano Banana 2) workflow
    if (selectedTool === TOOLS.AVATAR) {
      // Find ALL Avatar nodes
      const avatarNodes = nodes.filter(n => n.type === 'avatar')

      if (avatarNodes.length === 0) {
        isStartingWorkflowRef.current = false
        setIsRunning(false)
        throw new Error('No Avatar nodes found')
      }

      // Build list of all generations to run
      const allGenerations: Array<{
        avatarNode: WorkflowNode
        prompt: string
        aspectRatio: NanoBananaAspectRatio
        resolution: NanoBananaResolution
        referenceImages: string[]
      }> = []

      avatarNodes.forEach(avatarNode => {
        const prompt = (avatarNode.data.text as string) || ''
        if (prompt.trim().length < MIN_PROMPT_LENGTH) return

        const aspectRatio = ((avatarNode.data.aspect as string) || '1:1') as NanoBananaAspectRatio
        const resolution = ((avatarNode.data.resolution as string) || '1K') as NanoBananaResolution

        // Find ALL connected multiref nodes (can be multiple)
        const connectedMultiRefs = connections
          .filter(c => c.targetNodeId === avatarNode.id)
          .map(c => nodes.find(n => n.id === c.sourceNodeId))
          .filter(n => n?.type === 'multiref') as WorkflowNode[]

        if (connectedMultiRefs.length > 0) {
          // Each multiref with images = 1 generation
          connectedMultiRefs.forEach(multiRef => {
            const referenceImages = (multiRef.data.images as string[]) || []
            if (referenceImages.length > 0) {
              allGenerations.push({
                avatarNode,
                prompt,
                aspectRatio,
                resolution,
                referenceImages
              })
            }
          })
        } else {
          // No multiref connected = text-to-image mode
          allGenerations.push({
            avatarNode,
            prompt,
            aspectRatio,
            resolution,
            referenceImages: []
          })
        }
      })

      if (allGenerations.length === 0) {
        isStartingWorkflowRef.current = false
        setIsRunning(false)
        throw new Error('No valid Avatar nodes with prompts found')
      }

      // Update all Avatar nodes to pending status
      avatarNodes.forEach(avatarNode => {
        updateNode(avatarNode.id, {
          data: {
            ...avatarNode.data,
            status: 'pending',
            resultUrl: null,
            error: null
          }
        })
      })

      // Process Avatar generations in PARALLEL
      // Fire all requests with small delays, don't wait for completion
      // The hook's polling will detect completed generations

      // Helper to process a single generation
      const processGeneration = async (gen: typeof allGenerations[0], index: number) => {
        const nodeId = gen.avatarNode.id

        // Small delay between requests to avoid overwhelming the API
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, GENERATION_REQUEST_DELAY))
        }

        // Get fresh node data from store before updating
        const currentNode = useWorkflowStore.getState().nodes.find(n => n.id === nodeId)
        if (!currentNode) return

        // Update to processing
        updateNode(nodeId, {
          data: {
            ...currentNode.data,
            status: 'processing',
            error: null
          }
        })

        // Call Nano Banana API - credits already deducted by workflow-canvas
        // The API creates a "processing" record in DB, then updates to completed/failed
        try {
          const result = await nanobanana.generate(
            gen.prompt,
            gen.aspectRatio,
            gen.resolution,
            gen.referenceImages,
            true  // skipCreditDeduction - credits already deducted upfront
          )

          // Get fresh node data again after API call
          const nodeAfterApi = useWorkflowStore.getState().nodes.find(n => n.id === nodeId)
          if (!nodeAfterApi) return

          if (result.success && result.result_url) {
            updateNode(nodeId, {
              data: {
                ...nodeAfterApi.data,
                status: 'completed',
                resultUrl: result.result_url,
                error: null
              }
            })
          } else {
            updateNode(nodeId, {
              data: {
                ...nodeAfterApi.data,
                status: 'failed',
                error: result.error || 'Failed to generate image'
              }
            })
          }
        } catch (err) {
          const nodeAfterError = useWorkflowStore.getState().nodes.find(n => n.id === nodeId)
          if (nodeAfterError) {
            updateNode(nodeId, {
              data: {
                ...nodeAfterError.data,
                status: 'failed',
                error: err instanceof Error ? err.message : 'Generation failed'
              }
            })
          }
        }
      }

      // Fire all generations in parallel (with staggered starts)
      // Don't await - let them run in background
      allGenerations.forEach((gen, index) => {
        processGeneration(gen, index)
      })

      // Reload generations after a short delay to pick up "processing" records from DB
      // This ensures the Results panel shows the progress immediately
      setTimeout(() => {
        nanobanana.loadGenerations()
      }, 1000)

      // Release workflow immediately - polling will track progress
      isStartingWorkflowRef.current = false
      // Keep isRunning true while generations are in progress
      // It will be set to false when all complete (via polling check)

      return
    }

    // Fallback for other tools (not yet implemented)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    isStartingWorkflowRef.current = false
    setIsRunning(false)
  }, [selectedTool, nodes, connections, sora2, veo3, lipsync, nanobanana, infinitetalk, updateNode, setIsRunning, getSora2ConfigFromNodeData, hasActiveGeneration, findConnectedReferenceNodes])

  return {
    nodes,
    connections,
    selectedTool,
    selectedNodeId,
    zoom,
    pan,
    isRunning,
    setSelectedTool,
    switchTool,
    addNode,
    updateNode,
    removeNode,
    selectNode,
    addConnection,
    removeConnection,
    setZoom,
    setPan,
    setIsRunning,
    clearWorkflow,
    loadWorkflow,
    createNode,
    createConnection,
    getNodesForTool,
    initializeWorkflowForTool,
    runWorkflow,
    // Workflow stats & validation
    workflowStats,
    workflowValidation,
    // Workflow lock state (blocks modifications during generation for CURRENT tool only)
    isWorkflowLocked,
    isInitialLoading: isInitialLoadingForTool,
    // Sora 2 specific
    sora2Generation: sora2.currentGeneration,
    sora2Generations: sora2.generations,
    isSora2Polling: sora2.isPolling,
    isSora2Generating: sora2.isGenerating,
    sora2Error: sora2.error,
    // Veo 3 specific
    veo3Generation: veo3.currentGeneration,
    veo3Generations: veo3.generations,
    isVeo3Polling: veo3.isPolling,
    isVeo3Generating: veo3.isGenerating,
    veo3Error: veo3.error,
    // LipSync specific
    lipsyncGeneration: lipsync.currentGeneration,
    lipsyncGenerations: lipsync.generations,
    isLipsyncPolling: lipsync.isPolling,
    isLipsyncGenerating: lipsync.isGenerating,
    lipsyncError: lipsync.error,
    // NanoBanana (Avatar) specific
    nanoBananaGenerations: nanobanana.generations,
    isNanoBananaGenerating: nanobanana.isGenerating,
    nanoBananaError: nanobanana.error,
    hasActiveGeneration,
  }
}
