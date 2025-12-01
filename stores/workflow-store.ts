import { create } from 'zustand'
import { WorkflowStore, WorkflowNode, Connection, Position } from '@/types/workflow'
import { ToolType } from '@/lib/constants'

const initialState = {
  nodes: [] as WorkflowNode[],
  connections: [] as Connection[],
  selectedTool: null as ToolType | null,
  selectedNodeId: null as string | null,
  zoom: 1,
  pan: { x: 0, y: 0 } as Position,
  isRunning: false,
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  ...initialState,

  setSelectedTool: (tool) => set({ selectedTool: tool }),

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
    }),

  loadWorkflow: (nodes, connections) =>
    set({
      nodes,
      connections,
      selectedNodeId: null,
    }),
}))
