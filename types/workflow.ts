import { NodeType, ToolType } from '@/lib/constants'

export interface Position {
  x: number
  y: number
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: Position
  data: Record<string, unknown>
  tool: ToolType
}

export interface Connection {
  id: string
  sourceNodeId: string
  targetNodeId: string
}

export interface WorkflowState {
  nodes: WorkflowNode[]
  connections: Connection[]
  selectedTool: ToolType | null
  selectedNodeId: string | null
  zoom: number
  pan: Position
  isRunning: boolean
}

export interface WorkflowActions {
  setSelectedTool: (tool: ToolType | null) => void
  addNode: (node: WorkflowNode) => void
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void
  removeNode: (id: string) => void
  selectNode: (id: string | null) => void
  addConnection: (connection: Connection) => void
  removeConnection: (id: string) => void
  setZoom: (zoom: number) => void
  setPan: (pan: Position) => void
  setIsRunning: (isRunning: boolean) => void
  clearWorkflow: () => void
  loadWorkflow: (nodes: WorkflowNode[], connections: Connection[]) => void
}

export type WorkflowStore = WorkflowState & WorkflowActions
