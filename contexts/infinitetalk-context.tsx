'use client'

import { createContext, useContext, ReactNode, useCallback } from 'react'
import { useInfiniteTalk, InfiniteTalkGeneration } from '@/hooks/use-infinitetalk'
import { type InfiniteTalkParams } from '@/types/infinitetalk'

interface InfiniteTalkContextValue {
  currentGeneration: InfiniteTalkGeneration | null
  generations: InfiniteTalkGeneration[]
  isGenerating: boolean
  isPolling: boolean
  isLoading: boolean
  isInitialLoading: boolean
  generate: (
    imageUrl: string,
    audioUrl: string,
    audioDurationSeconds: number,
    params?: InfiniteTalkParams,
    skipCreditDeduction?: boolean
  ) => Promise<string | null>
  checkStatus: (generationId: string) => Promise<InfiniteTalkGeneration | null>
  refreshGenerations: () => Promise<void>
  stopPolling: () => void
  startPolling: () => void
  deleteGeneration: (generationId: string) => Promise<boolean>
  error: string | null
}

const InfiniteTalkContext = createContext<InfiniteTalkContextValue | null>(null)

interface InfiniteTalkProviderProps {
  children: ReactNode
}

export function InfiniteTalkProvider({ children }: InfiniteTalkProviderProps) {
  const infinitetalk = useInfiniteTalk()

  // Generate wrapper - passes through skipCreditDeduction flag
  const generateWithCredits = useCallback(async (
    imageUrl: string,
    audioUrl: string,
    audioDurationSeconds: number,
    params?: InfiniteTalkParams,
    skipCreditDeduction?: boolean
  ): Promise<string | null> => {
    const result = await infinitetalk.generate(imageUrl, audioUrl, audioDurationSeconds, params, skipCreditDeduction)
    return result
  }, [infinitetalk])

  const value: InfiniteTalkContextValue = {
    currentGeneration: infinitetalk.currentGeneration,
    generations: infinitetalk.generations,
    isGenerating: infinitetalk.isGenerating,
    isPolling: infinitetalk.isPolling,
    isLoading: infinitetalk.isLoading,
    isInitialLoading: infinitetalk.isInitialLoading,
    generate: generateWithCredits,
    checkStatus: infinitetalk.checkStatus,
    refreshGenerations: infinitetalk.refreshGenerations,
    stopPolling: infinitetalk.stopPolling,
    startPolling: infinitetalk.startPolling,
    deleteGeneration: infinitetalk.deleteGeneration,
    error: infinitetalk.error,
  }

  return (
    <InfiniteTalkContext.Provider value={value}>
      {children}
    </InfiniteTalkContext.Provider>
  )
}

export function useInfiniteTalkContext() {
  const context = useContext(InfiniteTalkContext)
  if (!context) {
    throw new Error('useInfiniteTalkContext must be used within a InfiniteTalkProvider')
  }
  return context
}
