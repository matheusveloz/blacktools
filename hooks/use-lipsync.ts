'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  LipSyncStatus,
  LipSyncVideoParams,
  LipSyncGenerateResponse,
  LipSyncStatusResponse,
} from '@/types/lipsync'
import { calculateLipSyncCredits } from '@/types/lipsync'

/**
 * LipSync Hook - Frontend state management for NewportAI LipSync API
 *
 * Flow:
 * 1. generate() calls /api/lipsync/generate → creates task, returns immediately
 * 2. startPolling() polls /api/lipsync/status every 5s to read from database
 * 3. /api/lipsync/process updates database from NewportAI API
 * 4. Updates status in real-time as database gets updated
 * 5. Stops polling when all generations are completed/failed
 */

const POLLING_INTERVAL_MS = 5000

export interface LipSyncGeneration {
  id: string
  status: LipSyncStatus
  result_url: string | null
  credits_used: number
  created_at: string
  srcVideoUrl: string
  audioUrl: string
  audioDurationSeconds: number
  error?: string
}

interface UseLipSyncOptions {
  onComplete?: (generation: LipSyncGeneration) => void
  onError?: (error: string, generation?: LipSyncGeneration) => void
}

interface UseLipSyncReturn {
  currentGeneration: LipSyncGeneration | null
  generations: LipSyncGeneration[]
  isGenerating: boolean
  isPolling: boolean
  isLoading: boolean
  isInitialLoading: boolean
  generate: (
    srcVideoUrl: string,
    audioUrl: string,
    audioDurationSeconds: number,
    videoParams?: LipSyncVideoParams,
    skipCreditDeduction?: boolean
  ) => Promise<string | null>
  checkStatus: (generationId: string) => Promise<LipSyncGeneration | null>
  refreshGenerations: () => Promise<void>
  stopPolling: () => void
  startPolling: () => void
  deleteGeneration: (generationId: string) => Promise<boolean>
  error: string | null
}

export function useLipSync(options: UseLipSyncOptions = {}): UseLipSyncReturn {
  const { onComplete, onError } = options

  const [currentGeneration, setCurrentGeneration] = useState<LipSyncGeneration | null>(null)
  const [generations, setGenerations] = useState<LipSyncGeneration[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const notifiedIdsRef = useRef<Set<string>>(new Set())

  // Check status of a specific generation
  const checkStatus = useCallback(async (generationId: string): Promise<LipSyncGeneration | null> => {
    try {
      const response = await fetch(`/api/lipsync/status?id=${generationId}`)
      const data: LipSyncStatusResponse = await response.json()

      if (!data.success || !data.generation) {
        throw new Error(data.error || 'Failed to fetch status')
      }

      const generation: LipSyncGeneration = {
        id: data.generation.id,
        status: data.generation.status,
        result_url: data.generation.result_url,
        credits_used: data.generation.credits_used,
        created_at: data.generation.created_at,
        srcVideoUrl: data.generation.srcVideoUrl || '',
        audioUrl: data.generation.audioUrl || '',
        audioDurationSeconds: data.generation.audioDurationSeconds || 0,
        error: data.generation.error,
      }

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
      const response = await fetch('/api/lipsync/status')
      const data: LipSyncStatusResponse = await response.json()

      if (data.success && data.generations) {
        setGenerations(data.generations.map(g => ({
          id: g.id,
          status: g.status,
          result_url: g.result_url,
          credits_used: g.credits_used,
          created_at: g.created_at,
          srcVideoUrl: g.srcVideoUrl || '',
          audioUrl: g.audioUrl || '',
          audioDurationSeconds: g.audioDurationSeconds || 0,
          error: g.error,
        })))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Poll for status updates
  const pollStatus = useCallback(async () => {
    try {
      // First, call process API to update database from NewportAI API
      try {
        const processResponse = await fetch('/api/lipsync/process', { method: 'POST' })
        const processData = await processResponse.json()
      } catch (processError) {
        // Silent fail - non-critical
      }

      // Then read updated status from database
      const response = await fetch('/api/lipsync/status')
      const data: LipSyncStatusResponse = await response.json()

      if (!data.success || !data.generations) {
        return false
      }

      let hasProcessing = false

      setGenerations(prev => {
        const updated = data.generations!.map(g => {
          const generation: LipSyncGeneration = {
            id: g.id,
            status: g.status,
            result_url: g.result_url,
            credits_used: g.credits_used,
            created_at: g.created_at,
            srcVideoUrl: g.srcVideoUrl || '',
            audioUrl: g.audioUrl || '',
            audioDurationSeconds: g.audioDurationSeconds || 0,
            error: g.error,
          }

          if (g.status === 'pending' || g.status === 'processing') {
            hasProcessing = true
          }

          const prevGen = prev.find(p => p.id === g.id)
          if (prevGen) {
            if (g.status === 'completed' && prevGen.status !== 'completed' && !notifiedIdsRef.current.has(g.id)) {
              notifiedIdsRef.current.add(g.id)
              onCompleteRef.current?.(generation)
            } else if (g.status === 'failed' && prevGen.status !== 'failed' && !notifiedIdsRef.current.has(g.id)) {
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

      setCurrentGeneration(prev => {
        if (!prev) return prev
        const updated = data.generations!.find(g => g.id === prev.id)
        if (updated) {
          return {
            ...prev,
            status: updated.status,
            result_url: updated.result_url,
            error: updated.error,
          }
        }
        return prev
      })

      if (!hasProcessing) {
        return true
      }

      return false
    } catch (err) {
      return false
    }
  }, [])

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return
    }

    setIsPolling(true)

    pollStatus().then(done => {
      if (done) {
        setIsPolling(false)
        return
      }

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

  // Generate a new LipSync video
  const generate = useCallback(async (
    srcVideoUrl: string,
    audioUrl: string,
    audioDurationSeconds: number,
    videoParams?: LipSyncVideoParams,
    skipCreditDeduction?: boolean
  ): Promise<string | null> => {
    setIsGenerating(true)
    setError(null)

    const creditsRequired = calculateLipSyncCredits(audioDurationSeconds)

    // Create optimistic pending generation
    const tempId = `temp-${Date.now()}`
    const pendingGeneration: LipSyncGeneration = {
      id: tempId,
      status: 'pending',
      result_url: null,
      credits_used: creditsRequired,
      created_at: new Date().toISOString(),
      srcVideoUrl,
      audioUrl,
      audioDurationSeconds,
    }
    setCurrentGeneration(pendingGeneration)
    setGenerations(prev => [pendingGeneration, ...prev])

    try {
      const response = await fetch('/api/lipsync/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srcVideoUrl,
          audioUrl,
          audioDurationSeconds,
          videoParams,
          skipCreditDeduction,
        }),
      })

      const data = await response.json() as LipSyncGenerateResponse

      if (!data.generation_id) {
        const errorMessage = data.error || 'Failed to start generation'
        setError(errorMessage)
        onErrorRef.current?.(errorMessage)
        setGenerations(prev => prev.filter(g => g.id !== tempId))
        return null
      }

      const newGeneration: LipSyncGeneration = {
        id: data.generation_id,
        status: 'processing',
        result_url: null,
        credits_used: data.credits_used || creditsRequired,
        created_at: new Date().toISOString(),
        srcVideoUrl,
        audioUrl,
        audioDurationSeconds,
      }

      setCurrentGeneration(newGeneration)
      setGenerations(prev => {
        const withoutTemp = prev.filter(g => g.id !== tempId)
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
    try {
      const response = await fetch(`/api/lipsync/delete?id=${generationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        return false
      }

      // Remove from local state
      setGenerations(prev => prev.filter(g => g.id !== generationId))
      if (currentGeneration?.id === generationId) {
        setCurrentGeneration(null)
      }

      return true
    } catch (err) {
      return false
    }
  }, [currentGeneration])

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

  // Auto-start polling if there are processing generations
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
    error,
  }
}
