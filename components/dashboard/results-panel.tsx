'use client'

import { useState } from 'react'
import { Play, Download, Loader2, Video, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkflow } from '@/hooks/use-workflow'
import { useSubscription } from '@/hooks/use-subscription'
import { TOOL_CONFIG } from '@/lib/constants'
import { toast } from 'sonner'

interface GenerationResult {
  id: string
  timestamp: Date
  thumbnail: string
  status: 'completed' | 'processing' | 'failed'
}

export function ResultsPanel() {
  const { selectedTool, nodes, isRunning, runWorkflow } = useWorkflow()
  const { credits } = useSubscription()
  const [results, setResults] = useState<GenerationResult[]>([])

  const toolConfig = selectedTool ? TOOL_CONFIG[selectedTool] : null
  const creditsRequired = toolConfig?.credits || 0

  const handleRunWorkflow = async () => {
    if (!selectedTool) {
      toast.error('Please select a tool first')
      return
    }

    if (nodes.length === 0) {
      toast.error('Add some nodes to your workflow')
      return
    }

    if (credits < creditsRequired) {
      toast.error('Not enough credits')
      return
    }

    // Add processing result
    const newResult: GenerationResult = {
      id: Math.random().toString(36).substring(2),
      timestamp: new Date(),
      thumbnail: '',
      status: 'processing',
    }
    setResults((prev) => [newResult, ...prev])

    await runWorkflow()

    // Update result to completed (simulation)
    setResults((prev) =>
      prev.map((r) =>
        r.id === newResult.id
          ? { ...r, status: 'completed' as const, thumbnail: '/placeholder-video.jpg' }
          : r
      )
    )

    toast.success('Video generated successfully!')
  }

  return (
    <div className="w-80 h-full bg-card border-l flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Results</h2>

        <Button
          className="w-full gap-2"
          onClick={handleRunWorkflow}
          disabled={isRunning || !selectedTool}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Workflow
            </>
          )}
        </Button>

        {selectedTool && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This will use {creditsRequired} credits
          </p>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {results.length === 0 ? (
          <div className="text-center py-8">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Your generated videos will appear here
            </p>
          </div>
        ) : (
          results.map((result) => (
            <Card key={result.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {result.status === 'processing' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : result.status === 'completed' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <X className="h-8 w-8 text-destructive" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-sm font-medium capitalize">
                      {result.status}
                    </p>
                  </div>
                  {result.status === 'completed' && (
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
