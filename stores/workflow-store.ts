import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WorkflowStore, WorkflowNode, Connection, Position } from '@/types/workflow'
import { ToolType } from '@/lib/constants'

interface SavedWorkflow {
  nodes: WorkflowNode[]
  connections: Connection[]
  zoom: number
  pan: Position
}

interface ExtendedWorkflowStore extends WorkflowStore {
  savedWorkflows: Record<string, SavedWorkflow>
  switchTool: (tool: ToolType) => void
}

const initialState = {
  nodes: [] as WorkflowNode[],
  connections: [] as Connection[],
  selectedTool: null as ToolType | null,
  selectedNodeId: null as string | null,
  zoom: 1,
  pan: { x: 0, y: 0 } as Position,
  isRunning: false,
  savedWorkflows: {} as Record<string, SavedWorkflow>,
}

export const useWorkflowStore = create<ExtendedWorkflowStore>()(
  persist(
    (set, get) => ({
  ...initialState,

  setSelectedTool: (tool) => set({ selectedTool: tool }),

  switchTool: (tool) => {
    const state = get()
    const currentTool = state.selectedTool

    // Save current workflow if there's a tool selected
    if (currentTool) {
      const currentWorkflow: SavedWorkflow = {
        nodes: state.nodes,
        connections: state.connections,
        zoom: state.zoom,
        pan: state.pan,
      }
      set((s) => ({
        savedWorkflows: {
          ...s.savedWorkflows,
          [currentTool]: currentWorkflow,
        },
      }))
    }

    // Load saved workflow for new tool or start fresh
    const savedWorkflow = state.savedWorkflows[tool]
    if (savedWorkflow) {
      set({
        selectedTool: tool,
        nodes: savedWorkflow.nodes,
        connections: savedWorkflow.connections,
        zoom: savedWorkflow.zoom,
        pan: savedWorkflow.pan,
        selectedNodeId: null,
      })
    } else {
      set({
        selectedTool: tool,
        nodes: [],
        connections: [],
        zoom: 1,
        pan: { x: 0, y: 0 },
        selectedNodeId: null,
      })
    }
  },

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      connections: state.connections.filter(
        (conn) => conn.sourceNodeId !== id && conn.targetNodeId !== id
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  selectNode: (id) => set({ selectedNodeId: id }),

  addConnection: (connection) =>
    set((state) => {
      // Check if connection already exists
      const exists = state.connections.some(
        (conn) =>
          conn.sourceNodeId === connection.sourceNodeId &&
          conn.targetNodeId === connection.targetNodeId
      )
      if (exists) return state

      return {
        connections: [...state.connections, connection],
      }
    }),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== id),
    })),

  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.25), 2) }),

  setPan: (pan) => set({ pan }),

  setIsRunning: (isRunning) => set({ isRunning }),

  clearWorkflow: () =>
    set({
      nodes: [],
      connections: [],
      selectedNodeId: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
    }),

  loadWorkflow: (nodes, connections) =>
    set({
      nodes,
      connections,
      selectedNodeId: null,
    }),
    }),
    {
      name: 'blacktools-workflow',
      partialize: (state) => {
        // Helper to clean base64 data from node data (too large for localStorage)
        const cleanNodeData = (node: WorkflowNode): WorkflowNode => {
          const cleanedData = { ...node.data }

          // Remove base64 data URLs (they start with "data:")
          if (typeof cleanedData.videoUrl === 'string' && cleanedData.videoUrl.startsWith('data:')) {
            delete cleanedData.videoUrl
            delete cleanedData.fileName
            cleanedData.filled = false
          }
          if (typeof cleanedData.audioUrl === 'string' && cleanedData.audioUrl.startsWith('data:')) {
            delete cleanedData.audioUrl
            delete cleanedData.fileName
            delete cleanedData.audioDuration
            cleanedData.filled = false
          }
          // Only remove base64 images, keep Supabase Storage URLs
          if (typeof cleanedData.imageUrl === 'string') {
            if (cleanedData.imageUrl.startsWith('data:')) {
              delete cleanedData.imageUrl
              delete cleanedData.fileName
              cleanedData.filled = false
            }
            // Keep URLs that are from Supabase Storage (they contain supabase.co)
          }

          return { ...node, data: cleanedData }
        }

        // Clean nodes in current state
        const cleanedNodes = state.nodes.map(cleanNodeData)

        // Clean nodes in saved workflows
        const cleanedSavedWorkflows: Record<string, SavedWorkflow> = {}
        for (const [tool, workflow] of Object.entries(state.savedWorkflows)) {
          cleanedSavedWorkflows[tool] = {
            ...workflow,
            nodes: workflow.nodes.map(cleanNodeData),
          }
        }

        return {
          nodes: cleanedNodes,
          connections: state.connections,
          selectedTool: state.selectedTool,
          zoom: state.zoom,
          pan: state.pan,
          savedWorkflows: cleanedSavedWorkflows,
        }
      },
      skipHydration: true,
    }
  )
)
