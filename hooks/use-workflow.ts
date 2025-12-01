'use client'

import { useCallback } from 'react'
import { useWorkflowStore } from '@/stores/workflow-store'
import { WorkflowNode, Connection } from '@/types/workflow'
import { NodeType, ToolType, TOOL_CONFIG } from '@/lib/constants'
import { v4 as uuidv4 } from 'crypto'

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

export function useWorkflow() {
  const store = useWorkflowStore()

  const createNode = useCallback(
    (type: NodeType, tool: ToolType, position: { x: number; y: number }) => {
      const node: WorkflowNode = {
        id: generateId(),
        type,
        position,
        data: {},
        tool,
      }
      store.addNode(node)
      return node
    },
    [store]
  )

  const createConnection = useCallback(
    (sourceNodeId: string, targetNodeId: string) => {
      const connection: Connection = {
        id: generateId(),
        sourceNodeId,
        targetNodeId,
      }
      store.addConnection(connection)
      return connection
    },
    [store]
  )

  const getNodesForTool = useCallback((tool: ToolType) => {
    const config = TOOL_CONFIG[tool]
    return config.nodes
  }, [])

  const initializeWorkflowForTool = useCallback(
    (tool: ToolType) => {
      store.clearWorkflow()
      store.setSelectedTool(tool)

      const nodeTypes = getNodesForTool(tool)
      const spacing = 200
      const startX = 100
      const startY = 200

      const createdNodes: WorkflowNode[] = []

      nodeTypes.forEach((nodeType, index) => {
        const node = createNode(nodeType as NodeType, tool, {
          x: startX + index * spacing,
          y: startY,
        })
        createdNodes.push(node)

        // Create connections between consecutive nodes
        if (index > 0) {
          createConnection(createdNodes[index - 1].id, node.id)
        }
      })
    },
    [store, createNode, createConnection, getNodesForTool]
  )

  const runWorkflow = useCallback(async () => {
    store.setIsRunning(true)

    // Simulate workflow execution
    await new Promise((resolve) => setTimeout(resolve, 3000))

    store.setIsRunning(false)
  }, [store])

  return {
    ...store,
    createNode,
    createConnection,
    getNodesForTool,
    initializeWorkflowForTool,
    runWorkflow,
  }
}
