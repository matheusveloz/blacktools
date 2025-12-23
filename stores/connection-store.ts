import { create } from 'zustand'

interface DragConnection {
  sourceNodeId: string
  sourcePort: 'input' | 'output'
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface ConnectionStore {
  dragConnection: DragConnection | null
  startDrag: (nodeId: string, port: 'input' | 'output', x: number, y: number) => void
  updateDrag: (x: number, y: number) => void
  endDrag: () => void
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  dragConnection: null,
  
  startDrag: (nodeId, port, x, y) => set({
    dragConnection: {
      sourceNodeId: nodeId,
      sourcePort: port,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    }
  }),
  
  updateDrag: (x, y) => set((state) => {
    if (!state.dragConnection) return state
    return {
      dragConnection: {
        ...state.dragConnection,
        currentX: x,
        currentY: y,
      }
    }
  }),
  
  endDrag: () => set({ dragConnection: null }),
}))

