'use client'

import { createContext, useContext, ReactNode, useCallback } from 'react'
import { useSora2, Sora2Generation } from '@/hooks/use-sora2'
import type { Sora2Size, Sora2Seconds } from '@/types/sora2'

interface Sora2ContextValue {
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

const Sora2Context = createContext<Sora2ContextValue | null>(null)

interface Sora2ProviderProps {
  children: ReactNode
}

export function Sora2Provider({ children }: Sora2ProviderProps) {
  const sora2 = useSora2()

  // Generate wrapper - passes through skipCreditDeduction flag
  const generateWithCredits = useCallback(async (
    prompt: string,
    size?: Sora2Size,
    seconds?: Sora2Seconds,
    imageUrl?: string,
    skipCreditDeduction?: boolean
  ): Promise<string | null> => {
    const result = await sora2.generate(prompt, size, seconds, imageUrl, skipCreditDeduction)
    return result
  }, [sora2])

  const value: Sora2ContextValue = {
    currentGeneration: sora2.currentGeneration,
    generations: sora2.generations,
    isGenerating: sora2.isGenerating,
    isPolling: sora2.isPolling,
    isLoading: sora2.isLoading,
    isInitialLoading: sora2.isInitialLoading,
    generate: generateWithCredits,
    checkStatus: sora2.checkStatus,
    refreshGenerations: sora2.refreshGenerations,
    stopPolling: sora2.stopPolling,
    startPolling: sora2.startPolling,
    deleteGeneration: sora2.deleteGeneration,
    error: sora2.error,
  }

  return (
    <Sora2Context.Provider value={value}>
      {children}
    </Sora2Context.Provider>
  )
}

export function useSora2Context() {
  const context = useContext(Sora2Context)
  if (!context) {
    throw new Error('useSora2Context must be used within a Sora2Provider')
  }
  return context
}

