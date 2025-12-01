'use client'

import { useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { X, Upload, FileText, Mic, Video, Sparkles, User, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WorkflowNode as WorkflowNodeType } from '@/types/workflow'
import { NODE_CONFIG, NodeType } from '@/lib/constants'
import { useWorkflow } from '@/hooks/use-workflow'
import { cn } from '@/lib/utils'

const nodeIcons: Record<NodeType, React.ReactNode> = {
  image: <Upload className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  script: <FileText className="h-4 w-4" />,
  voice: <Mic className="h-4 w-4" />,
  lipsync: <Video className="h-4 w-4" />,
  reference: <Upload className="h-4 w-4" />,
  prompt: <FileText className="h-4 w-4" />,
  sora2: <Video className="h-4 w-4" />,
  veo3: <Sparkles className="h-4 w-4" />,
  description: <FileText className="h-4 w-4" />,
  avatar: <User className="h-4 w-4" />,
  export: <Download className="h-4 w-4" />,
}

interface WorkflowNodeProps {
  node: WorkflowNodeType
}

export function WorkflowNode({ node }: WorkflowNodeProps) {
  const { removeNode, selectNode, selectedNodeId, updateNode } = useWorkflow()
  const config = NODE_CONFIG[node.type]
  const isSelected = selectedNodeId === node.id

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: node,
  })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    left: node.position.x,
    top: node.position.y,
  }

  const renderNodeContent = () => {
    switch (node.type) {
      case 'image':
      case 'reference':
        return (
          <div className="space-y-2">
            <Label>Upload File</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Click to upload</p>
            </div>
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-2">
            <Label>Audio File</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
              <Mic className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Upload or record</p>
            </div>
          </div>
        )

      case 'script':
      case 'prompt':
      case 'description':
        return (
          <div className="space-y-2">
            <Label>Text</Label>
            <textarea
              className="w-full min-h-[80px] p-2 text-sm bg-background border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your text..."
              value={(node.data.text as string) || ''}
              onChange={(e) =>
                updateNode(node.id, { data: { ...node.data, text: e.target.value } })
              }
            />
          </div>
        )

      case 'voice':
        return (
          <div className="space-y-2">
            <Label>Select Voice</Label>
            <select className="w-full p-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Natural Male</option>
              <option>Natural Female</option>
              <option>Deep Voice</option>
              <option>Soft Voice</option>
            </select>
          </div>
        )

      case 'lipsync':
      case 'sora2':
      case 'veo3':
      case 'avatar':
        return (
          <div className="text-center py-2">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
              {nodeIcons[node.type]}
            </div>
            <p className="text-xs text-muted-foreground">AI Processing</p>
          </div>
        )

      case 'export':
        return (
          <div className="space-y-2">
            <Label>Export Format</Label>
            <select className="w-full p-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <option>MP4 (HD)</option>
              <option>MP4 (4K)</option>
              <option>WebM</option>
              <option>GIF</option>
            </select>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'absolute cursor-move',
        isDragging && 'opacity-50 z-50'
      )}
      onClick={() => selectNode(node.id)}
    >
      <Card
        className={cn(
          'w-[200px] transition-all',
          isSelected && 'ring-2 ring-primary',
          isDragging && 'shadow-lg'
        )}
      >
        <CardHeader
          className="p-3 pb-2 cursor-move"
          {...attributes}
          {...listeners}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ color: config.color }}>{nodeIcons[node.type]}</span>
              <CardTitle className="text-sm">{config.name}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                removeNode(node.id)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">{renderNodeContent()}</CardContent>

        {/* Connection ports */}
        {config.hasInput && (
          <div
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background cursor-crosshair"
            data-port="input"
            data-node-id={node.id}
          />
        )}
        {config.hasOutput && (
          <div
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background cursor-crosshair"
            data-port="output"
            data-node-id={node.id}
          />
        )}
      </Card>
    </div>
  )
}
