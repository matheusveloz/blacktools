'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  Sora2Size,
  Sora2Seconds,
  Sora2Status,
  Sora2GenerateResponse,
  Sora2StatusResponse
} from '@/types/sora2'

/**
 * Sora 2 Hook - Frontend state management for Async API
 *
 * Flow:
 * 1. generate() calls /api/sora2/generate → creates task, returns immediately
 * 2. startPolling() polls /api/sora2/status every 5s to read from database
 * 3. Cron job (/api/sora2/cron) updates database from Laozhang API in background
 * 4. Updates progress in real-time as database gets updated
 * 5. Stops polling when all generations are completed/failed
 */

// Polling interval in milliseconds (5 seconds recommended for Async API)
const POLLING_INTERVAL_MS = 5000

export interface Sora2Generation {
  id: string
  status: Sora2Status
  result_url: string | null
  credits_used: number
  created_at: string
  prompt: string
  size?: Sora2Size
  seconds?: Sora2Seconds
  progress?: number
  error?: string
}

interface UseSora2Options {
  onComplete?: (generation: Sora2Generation) => void
  onError?: (error: string, generation?: Sora2Generation) => void
}

interface UseSora2Return {
  currentGeneration: Sora2Generation | null
  generations: Sora2Generation[]
  isGenerating: boolean
  isPolling: boolean
  isLoading: boolean
  isInitialLoading: boolean
  generate: (prompt: string, size?: Sora2Size, seconds?: Sora2Seconds, imageUrl?: string, skipCreditDeduction?: boolean) => Promise<string | null>
  checkStatus: (generationId: string) => Promise<Sora2Generation | null>
  refreshGenerations: () => Promise<void>
  stopPolling: () => void
  startPolling: () => void
  deleteGeneration: (generationId: string) => Promise<boolean>
  error: string | null
}

export function useSora2(options: UseSora2Options = {}): UseSora2Return {
  const { onComplete, onError } = options

  const [currentGeneration, setCurrentGeneration] = useState<Sora2Generation | null>(null)
  const [generations, setGenerations] = useState<Sora2Generation[]>([])
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
  const checkStatus = useCallback(async (generationId: string): Promise<Sora2Generation | null> => {
    try {
      const response = await fetch(`/api/sora2/status?id=${generationId}`)
      const data: Sora2StatusResponse = await response.json()

      if (!data.success || !data.generation) {
        throw new Error(data.error || 'Failed to fetch status')
      }

      const generation: Sora2Generation = {
        id: data.generation.id,
        status: data.generation.status,
        result_url: data.generation.result_url,
        credits_used: data.generation.credits_used,
        created_at: data.generation.created_at,
        prompt: data.generation.prompt,
        size: data.generation.size,
        seconds: data.generation.seconds,
        progress: data.generation.progress ?? 0,
        error: data.generation.error
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
      const response = await fetch('/api/sora2/status')
      const data: Sora2StatusResponse = await response.json()

      if (data.success && data.generations) {
        setGenerations(data.generations.map(g => ({
          id: g.id,
          status: g.status,
          result_url: g.result_url,
          credits_used: g.credits_used,
          created_at: g.created_at,
          prompt: g.prompt,
          size: g.size,
          seconds: g.seconds,
          progress: g.progress ?? 0,
          error: g.error
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
      // This is needed for local development (cron doesn't run locally)
      try {
        const processResponse = await fetch('/api/sora2/process', { method: 'POST' })
        const processData = await processResponse.json()
      } catch (processError) {
        // Silent fail - non-critical
      }

      // Then read updated status from our database
      const response = await fetch('/api/sora2/status')
      const data: Sora2StatusResponse = await response.json()

      if (!data.success || !data.generations) {
        return false
      }

      let hasProcessing = false

      // Update local state with database results
      setGenerations(prev => {
        const updated = data.generations!.map(g => {
          const generation: Sora2Generation = {
            id: g.id,
            status: g.status,
            result_url: g.result_url,
            credits_used: g.credits_used,
            created_at: g.created_at,
            prompt: g.prompt,
            size: g.size,
            seconds: g.seconds,
            progress: g.progress ?? 0,
            error: g.error
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
            error: updated.error
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
    size?: Sora2Size,
    seconds?: Sora2Seconds,
    imageUrl?: string,
    skipCreditDeduction?: boolean
  ): Promise<string | null> => {
    setIsGenerating(true)
    setError(null)

    // Create optimistic pending generation
    const tempId = `temp-${Date.now()}`
    const pendingGeneration: Sora2Generation = {
      id: tempId,
      status: 'pending',
      result_url: null,
      credits_used: 20,
      created_at: new Date().toISOString(),
      prompt,
      size,
      seconds,
      progress: 0
    }
    setCurrentGeneration(pendingGeneration)
    setGenerations(prev => [pendingGeneration, ...prev])

    try {
      const response = await fetch('/api/sora2/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size, seconds, imageUrl, skipCreditDeduction })
      })

      const data = await response.json() as Sora2GenerateResponse

      if (!data.generation_id) {
        const errorMessage = data.error || 'Failed to start generation'
        setError(errorMessage)
        onErrorRef.current?.(errorMessage)
        setGenerations(prev => prev.filter(g => g.id !== tempId))
        return null
      }

      // Create generation object with actual response data
      const newGeneration: Sora2Generation = {
        id: data.generation_id,
        status: 'processing', // Task created, now processing on API side
        result_url: null,
        credits_used: data.credits_used || 20,
        created_at: new Date().toISOString(),
        prompt,
        size,
        seconds,
        progress: 0
      }

      setCurrentGeneration(newGeneration)
      setGenerations(prev => {
        // Remove temp generation
        const withoutTemp = prev.filter(g => g.id !== tempId)
        // Check if this generation already exists (polling may have added it)
        if (withoutTemp.some(g => g.id === newGeneration.id)) {
          return withoutTemp // Already exists, just remove temp
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
      const response = await fetch(`/api/sora2/delete?id=${generationId}`, {
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
  // Only auto-start when NOT actively generating (to avoid race conditions)
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
