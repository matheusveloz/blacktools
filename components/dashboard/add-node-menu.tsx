'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWorkflow } from '@/hooks/use-workflow'
import { NODE_CONFIG, NodeType, TOOL_CONFIG } from '@/lib/constants'

export function AddNodeMenu() {
  const { selectedTool, createNode, nodes } = useWorkflow()
  const [isOpen, setIsOpen] = useState(false)

  if (!selectedTool) return null

  const toolConfig = TOOL_CONFIG[selectedTool]
  const availableNodes = toolConfig.nodes

  const handleAddNode = (nodeType: NodeType) => {
    // Calculate position for new node
    const lastNode = nodes[nodes.length - 1]
    const newPosition = lastNode
      ? { x: lastNode.position.x + 250, y: lastNode.position.y }
      : { x: 100, y: 200 }

    createNode(nodeType, selectedTool, newPosition)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Node
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>
          {toolConfig.name} Nodes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableNodes.map((nodeType) => {
          const config = NODE_CONFIG[nodeType as NodeType]
          return (
            <DropdownMenuItem
              key={nodeType}
              onClick={() => handleAddNode(nodeType as NodeType)}
            >
              <span
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: config.color }}
              />
              {config.name}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
