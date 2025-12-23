'use client'

import React, { createContext, useContext, useCallback } from 'react'
import { useNanoBanana } from '@/hooks/use-nanobanana'
import { useUser } from '@/hooks/use-user'
import type {
  NanoBananaGeneration,
  NanoBananaGenerateResponse,
  NanoBananaAspectRatio,
  NanoBananaResolution
} from '@/types/nanobanana'
import { NANOBANANA_CREDITS } from '@/types/nanobanana'

interface NanoBananaContextType {
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

const NanoBananaContext = createContext<NanoBananaContextType | null>(null)

export function NanoBananaProvider({ children }: { children: React.ReactNode }) {
  const { refreshProfile } = useUser()

  const handleGenerationComplete = useCallback((generation: NanoBananaGeneration) => {
    // Refresh user credits after successful generation
    refreshProfile()
  }, [refreshProfile])

  const handleError = useCallback((error: string) => {
    // Silent error
  }, [])

  const nanoBanana = useNanoBanana({
    onGenerationComplete: handleGenerationComplete,
    onError: handleError
  })

  // Wrap generate to refresh credits on completion and pass skipCreditDeduction
  const generate = useCallback(async (
    prompt: string,
    aspectRatio: NanoBananaAspectRatio = '1:1',
    resolution: NanoBananaResolution = '1K',
    referenceImages?: string[],
    skipCreditDeduction?: boolean
  ): Promise<NanoBananaGenerateResponse> => {
    const result = await nanoBanana.generate(prompt, aspectRatio, resolution, referenceImages, skipCreditDeduction)

    // Refresh user data after generation attempt
    if (result.success) {
      refreshProfile()
    }

    return result
  }, [nanoBanana, refreshProfile])

  return (
    <NanoBananaContext.Provider
      value={{
        ...nanoBanana,
        generate
      }}
    >
      {children}
    </NanoBananaContext.Provider>
  )
}

export function useNanoBananaContext() {
  const context = useContext(NanoBananaContext)
  if (!context) {
    throw new Error('useNanoBananaContext must be used within a NanoBananaProvider')
  }
  return context
}

// Export credits constant for external use
export { NANOBANANA_CREDITS }
