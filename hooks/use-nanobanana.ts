'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  NanoBananaGeneration,
  NanoBananaGenerateRequest,
  NanoBananaGenerateResponse,
  NanoBananaStatusResponse,
  NanoBananaAspectRatio,
  NanoBananaResolution
} from '@/types/nanobanana'

interface UseNanoBananaOptions {
  onGenerationComplete?: (generation: NanoBananaGeneration) => void
  onError?: (error: string) => void
}

interface UseNanoBananaReturn {
  generations: NanoBananaGeneration[]
  isGenerating: boolean
  error: string | null
  generate: (
    prompt: string,
    aspectRatio?: NanoBananaAspectRatio,
    resolution?: NanoBananaResolution,
    referenceImages?: string[],
    skipCreditDeduction?: boolean
  ) => Promise<NanoBananaGenerateResponse>
  getGeneration: (generationId: string) => Promise<NanoBananaGeneration | null>
  deleteGeneration: (generationId: string) => Promise<boolean>
  loadGenerations: () => Promise<void>
  clearError: () => void
}

export function useNanoBanana(options: UseNanoBananaOptions = {}): UseNanoBananaReturn {
  const [generations, setGenerations] = useState<NanoBananaGeneration[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeGenerations, setActiveGenerations] = useState(0) // Track concurrent generations
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Load existing generations on mount
  useEffect(() => {
    loadGenerations()

    // Cleanup polling on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  const loadGenerations = useCallback(async () => {
    try {
      const response = await fetch('/api/nanobanana/status')
      const data: NanoBananaStatusResponse = await response.json()

      if (data.success && data.generations) {
        // Simply replace with DB records - no temp records to preserve
        setGenerations(data.generations)
      }
    } catch (err) {
      // Silent fail
    }
  }, [])

  // Poll for updates when there are processing generations (DB or temp)
  // This ensures the Results panel updates when generations complete
  useEffect(() => {
    const hasProcessing = generations.some(g => g.status === 'processing')

    if (hasProcessing) {
      // Start polling every 2 seconds for faster updates
      pollingRef.current = setInterval(() => {
        loadGenerations()
      }, 2000)
    } else {
      // Stop polling when no processing
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [generations, loadGenerations])

  const generate = useCallback(async (
    prompt: string,
    aspectRatio: NanoBananaAspectRatio = '1:1',
    resolution: NanoBananaResolution = '1K',
    referenceImages?: string[],
    skipCreditDeduction?: boolean
  ): Promise<NanoBananaGenerateResponse> => {
    setIsGenerating(true)
    setError(null)

    // Note: We don't create temp records anymore because:
    // 1. The API creates a "processing" record in the DB immediately
    // 2. The polling will pick up that record
    // 3. This avoids duplicate records (temp + DB)

    try {
      const requestBody = {
        prompt,
        aspectRatio,
        resolution,
        referenceImages,
        skipCreditDeduction
      }

      const response = await fetch('/api/nanobanana/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data: NanoBananaGenerateResponse = await response.json()

      if (!response.ok || !data.success) {
        const errorMsg = data.error || 'Failed to generate image'
        setError(errorMsg)
        options.onError?.(errorMsg)

        // Reload from DB to get accurate state
        await loadGenerations()

        return data
      }

      // Image generated successfully
      if (data.generation_id && data.result_url) {
        // Reload from DB to get accurate state
        await loadGenerations()

        // Notify completion
        const completedGeneration: NanoBananaGeneration = {
          id: data.generation_id,
          status: 'completed',
          result_url: data.result_url,
          credits_used: data.credits_used || 7,
          created_at: new Date().toISOString(),
          prompt,
          aspectRatio,
          resolution,
          referenceImages
        }
        options.onGenerationComplete?.(completedGeneration)
      }

      return data

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error - check your connection'
      setError(errorMsg)
      options.onError?.(errorMsg)

      // Reload from DB to get accurate state
      await loadGenerations()

      return { success: false, error: errorMsg }
    } finally {
      setIsGenerating(false)
    }
  }, [options, loadGenerations])

  const getGeneration = useCallback(async (
    generationId: string
  ): Promise<NanoBananaGeneration | null> => {
    try {
      const response = await fetch(`/api/nanobanana/status?id=${generationId}`)
      const data: NanoBananaStatusResponse = await response.json()

      if (data.success && data.generation) {
        return data.generation
      }
      return null
    } catch {
      return null
    }
  }, [])

  const deleteGeneration = useCallback(async (generationId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/nanobanana/delete?id=${generationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGenerations(prev => prev.filter(g => g.id !== generationId))
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  // Auto-delete failed generations after 1 minute
  useEffect(() => {
    const failedGenerations = generations.filter(g => g.status === 'failed')
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

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    generations,
    isGenerating,
    error,
    generate,
    getGeneration,
    deleteGeneration,
    loadGenerations,
    clearError
  }
}
