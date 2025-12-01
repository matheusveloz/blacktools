'use client'

import { useWorkflow } from '@/hooks/use-workflow'

interface NodeConnectionsProps {
  containerRef: React.RefObject<HTMLDivElement>
}

export function NodeConnections({ containerRef }: NodeConnectionsProps) {
  const { nodes, connections, removeConnection } = useWorkflow()

  const getNodeCenter = (nodeId: string, port: 'input' | 'output') => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return null

    // Node width is 200px, ports are at -8px (input) or 208px (output) from left
    const portOffset = port === 'input' ? 0 : 200
    const x = node.position.x + portOffset
    const y = node.position.y + 60 // Approximate center height

    return { x, y }
  }

  const createBezierPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const midX = (x1 + x2) / 2
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
  }

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      {connections.map((connection) => {
        const sourcePos = getNodeCenter(connection.sourceNodeId, 'output')
        const targetPos = getNodeCenter(connection.targetNodeId, 'input')

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
    </svg>
  )
}
