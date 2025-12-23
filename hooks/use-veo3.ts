'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  Veo3AspectRatio,
  Veo3Speed,
  Veo3Status,
  Veo3Model,
  Veo3GenerateResponse,
  Veo3StatusResponse
} from '@/types/veo3'
import { getVeo3Credits } from '@/types/veo3'

/**
 * Veo 3 Hook - Frontend state management for Async API
 *
 * Flow:
 * 1. generate() calls /api/veo3/generate → creates task, returns immediately
 * 2. startPolling() polls /api/veo3/status every 5s to read from database
 * 3. Process route (/api/veo3/process) updates database from Laozhang API
 * 4. Updates progress in real-time as database gets updated
 * 5. Stops polling when all generations are completed/failed
 */

// Polling interval in milliseconds (5 seconds recommended for Async API)
const POLLING_INTERVAL_MS = 5000

export interface Veo3Generation {
  id: string
  status: Veo3Status
  result_url: string | null
  credits_used: number
  created_at: string
  prompt: string
  model?: Veo3Model
  aspectRatio?: Veo3AspectRatio
  speed?: Veo3Speed
  progress?: number
  error?: string
  duration?: number
  resolution?: string
}

interface UseVeo3Options {
  onComplete?: (generation: Veo3Generation) => void
  onError?: (error: string, generation?: Veo3Generation) => void
}

interface UseVeo3Return {
  currentGeneration: Veo3Generation | null
  generations: Veo3Generation[]
  isGenerating: boolean
  isPolling: boolean
  isLoading: boolean
  isInitialLoading: boolean
  generate: (prompt: string, aspectRatio?: Veo3AspectRatio, speed?: Veo3Speed, imageUrl?: string, skipCreditDeduction?: boolean) => Promise<string | null>
  checkStatus: (generationId: string) => Promise<Veo3Generation | null>
  refreshGenerations: () => Promise<void>
  stopPolling: () => void
  startPolling: () => void
  deleteGeneration: (generationId: string) => Promise<boolean>
  error: string | null
}

export function useVeo3(options: UseVeo3Options = {}): UseVeo3Return {
  const { onComplete, onError } = options

  const [currentGeneration, setCurrentGeneration] = useState<Veo3Generation | null>(null)
  const [generations, setGenerations] = useState<Veo3Generation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Store callbacks in refs to avoid stale closures
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  // Polling interval reference
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Track IDs that were already notified as completed
  const notifiedIdsRef = useRef<Set<string>>(new Set())

  // Check status of a specific generation
  const checkStatus = useCallback(async (generationId: string): Promise<Veo3Generation | null> => {
    try {
      const response = await fetch(`/api/veo3/status?id=${generationId}`)
      const data: Veo3StatusResponse = await response.json()

      if (!data.success || !data.generation) {
        throw new Error(data.error || 'Failed to fetch status')
      }

      const generation: Veo3Generation = {
        id: data.generation.id,
        status: data.generation.status,
        result_url: data.generation.result_url,
        credits_used: data.generation.credits_used,
        created_at: data.generation.created_at,
        prompt: data.generation.prompt,
        model: data.generation.model,
        aspectRatio: data.generation.aspectRatio,
        speed: data.generation.speed,
        progress: data.generation.progress ?? 0,
        error: data.generation.error,
        duration: data.generation.duration,
        resolution: data.generation.resolution
      }

      // Update in list
      setGenerations(prev => {
        const index = prev.findIndex(g => g.id === generation.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = generation
          return updated
        }
        return prev
      })

      return generation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    }
  }, [])

  // Refresh all generations list
  const refreshGenerations = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/veo3/status')
      const data: Veo3StatusResponse = await response.json()

      if (data.success && data.generations) {
        setGenerations(data.generations.map(g => ({
          id: g.id,
          status: g.status,
          result_url: g.result_url,
          credits_used: g.credits_used,
          created_at: g.created_at,
          prompt: g.prompt,
          model: g.model,
          aspectRatio: g.aspectRatio,
          speed: g.speed,
          progress: g.progress ?? 0,
          error: g.error,
          duration: g.duration,
          resolution: g.resolution
        })))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Poll for status updates - first updates from Laozhang, then reads from database
  const pollStatus = useCallback(async () => {
    try {
      // First, call process API to update database from Laozhang API
      try {
        const processResponse = await fetch('/api/veo3/process', { method: 'POST' })
        const processData = await processResponse.json()
      } catch (processError) {
        // Silent fail - non-critical
      }

      // Then read updated status from our database
      const response = await fetch('/api/veo3/status')
      const data: Veo3StatusResponse = await response.json()

      if (!data.success || !data.generations) {
        return false
      }

      let hasProcessing = false

      // Update local state with database results
      setGenerations(prev => {
        const updated = data.generations!.map(g => {
          const generation: Veo3Generation = {
            id: g.id,
            status: g.status,
            result_url: g.result_url,
            credits_used: g.credits_used,
            created_at: g.created_at,
            prompt: g.prompt,
            model: g.model,
            aspectRatio: g.aspectRatio,
            speed: g.speed,
            progress: g.progress ?? 0,
            error: g.error,
            duration: g.duration,
            resolution: g.resolution
          }

          // Track if any are still processing
          if (g.status === 'pending' || g.status === 'processing') {
            hasProcessing = true
          }

          // Check for completion/failure notifications
          const prevGen = prev.find(p => p.id === g.id)
          if (prevGen) {
            // Notify on status change to completed
            if (g.status === 'completed' && prevGen.status !== 'completed' && !notifiedIdsRef.current.has(g.id)) {
              notifiedIdsRef.current.add(g.id)
              onCompleteRef.current?.(generation)
            }
            // Notify on status change to failed
            else if (g.status === 'failed' && prevGen.status !== 'failed' && !notifiedIdsRef.current.has(g.id)) {
              notifiedIdsRef.current.add(g.id)
              onErrorRef.current?.(g.error || 'Generation failed', generation)
              // Dispatch event to refresh profile (credits may have been refunded)
              window.dispatchEvent(new CustomEvent('credits-updated'))
            }
          }

          return generation
        })

        return updated
      })

      // Update current generation if it exists in results
      setCurrentGeneration(prev => {
        if (!prev) return prev
        const updated = data.generations!.find(g => g.id === prev.id)
        if (updated) {
          return {
            ...prev,
            status: updated.status,
            progress: updated.progress ?? 0,
            result_url: updated.result_url,
            error: updated.error,
            duration: updated.duration,
            resolution: updated.resolution
          }
        }
        return prev
      })

      // Stop polling if no more processing generations
      if (!hasProcessing) {
        return true
      }

      return false // Continue polling
    } catch (err) {
      return false // Continue polling despite error
    }
  }, [])

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return
    }

    setIsPolling(true)

    // Poll immediately first
    pollStatus().then(done => {
      if (done) {
        setIsPolling(false)
        return
      }

      // Then set up interval
      pollingIntervalRef.current = setInterval(async () => {
        const done = await pollStatus()
        if (done) {
          stopPolling()
        }
      }, POLLING_INTERVAL_MS)
    })
  }, [pollStatus])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
  }, [])

  // Generate a new video
  const generate = useCallback(async (
    prompt: string,
    aspectRatio?: Veo3AspectRatio,
    speed?: Veo3Speed,
    imageUrl?: string,
    skipCreditDeduction?: boolean
  ): Promise<string | null> => {
    setIsGenerating(true)
    setError(null)

    // Calculate credits based on speed
    const credits = getVeo3Credits(speed || 'fast')

    // Create optimistic pending generation
    const tempId = `temp-${Date.now()}`
    const pendingGeneration: Veo3Generation = {
      id: tempId,
      status: 'pending',
      result_url: null,
      credits_used: credits,
      created_at: new Date().toISOString(),
      prompt,
      aspectRatio,
      speed,
      progress: 0
    }
    setCurrentGeneration(pendingGeneration)
    setGenerations(prev => [pendingGeneration, ...prev])

    try {
      const response = await fetch('/api/veo3/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, speed, imageUrl, skipCreditDeduction })
      })

      const data = await response.json() as Veo3GenerateResponse

      if (!data.generation_id) {
        const errorMessage = data.error || 'Failed to start generation'
        setError(errorMessage)
        onErrorRef.current?.(errorMessage)
        setGenerations(prev => prev.filter(g => g.id !== tempId))
        return null
      }

      // Create generation object with actual response data
      const newGeneration: Veo3Generation = {
        id: data.generation_id,
        status: 'processing',
        result_url: null,
        credits_used: data.credits_used || credits,
        created_at: new Date().toISOString(),
        prompt,
        aspectRatio,
        speed,
        progress: 0
      }

      setCurrentGeneration(newGeneration)
      setGenerations(prev => {
        // Remove temp generation
        const withoutTemp = prev.filter(g => g.id !== tempId)
        // Check if this generation already exists
        if (withoutTemp.some(g => g.id === newGeneration.id)) {
          return withoutTemp
        }
        return [newGeneration, ...withoutTemp]
      })

      return data.generation_id
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onErrorRef.current?.(errorMessage)
      setGenerations(prev => prev.filter(g => g.id !== tempId))
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // Delete a generation
  const deleteGeneration = useCallback(async (generationId: string): Promise<boolean> => {
    if (generationId.startsWith('temp-')) {
      setGenerations(prev => prev.filter(g => g.id !== generationId))
      setCurrentGeneration(prev => prev?.id === generationId ? null : prev)
      return true
    }

    try {
      const response = await fetch(`/api/veo3/delete?id=${generationId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setGenerations(prev => prev.filter(g => g.id !== generationId))
        setCurrentGeneration(prev => prev?.id === generationId ? null : prev)
        return true
      }

      return false
    } catch {
      return false
    }
  }, [])

  // Load generations on mount
  useEffect(() => {
    const loadGenerations = async () => {
      setIsInitialLoading(true)
      await refreshGenerations()
      setIsInitialLoading(false)
    }

    loadGenerations()
  }, [refreshGenerations])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Check if there are processing generations and auto-start polling
  useEffect(() => {
    if (isInitialLoading || isGenerating) return

    const hasProcessing = generations.some(
      g => (g.status === 'pending' || g.status === 'processing') && !g.id.startsWith('temp-')
    )

    if (hasProcessing && !isPolling) {
      startPolling()
    }
  }, [generations, isInitialLoading, isGenerating, isPolling, startPolling])

  // Auto-delete failed generations after 1 minute
  useEffect(() => {
    const failedGenerations = generations.filter(g => g.status === 'failed' && !g.id.startsWith('temp-'))
    if (failedGenerations.length === 0) return

    const timers: NodeJS.Timeout[] = []

    failedGenerations.forEach(gen => {
      const createdAt = new Date(gen.created_at).getTime()
      const now = Date.now()
      const elapsed = now - createdAt
      const oneMinute = 60 * 1000

      // If already past 1 minute, delete immediately
      if (elapsed >= oneMinute) {
        deleteGeneration(gen.id)
      } else {
        // Schedule deletion for remaining time
        const remainingTime = oneMinute - elapsed
        const timer = setTimeout(() => {
          deleteGeneration(gen.id)
        }, remainingTime)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [generations, deleteGeneration])

  return {
    currentGeneration,
    generations,
    isGenerating,
    isPolling,
    isLoading,
    isInitialLoading,
    generate,
    checkStatus,
    refreshGenerations,
    stopPolling,
    startPolling,
    deleteGeneration,
    error
  }
}
