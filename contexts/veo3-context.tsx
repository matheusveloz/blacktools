'use client'

import { createContext, useContext, ReactNode, useCallback } from 'react'
import { useVeo3, Veo3Generation } from '@/hooks/use-veo3'
import type { Veo3AspectRatio, Veo3Speed } from '@/types/veo3'

interface Veo3ContextValue {
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

const Veo3Context = createContext<Veo3ContextValue | null>(null)

interface Veo3ProviderProps {
  children: ReactNode
}

export function Veo3Provider({ children }: Veo3ProviderProps) {
  const veo3 = useVeo3()

  // Generate wrapper - passes through skipCreditDeduction flag
  const generateWithCredits = useCallback(async (
    prompt: string,
    aspectRatio?: Veo3AspectRatio,
    speed?: Veo3Speed,
    imageUrl?: string,
    skipCreditDeduction?: boolean
  ): Promise<string | null> => {
    const result = await veo3.generate(prompt, aspectRatio, speed, imageUrl, skipCreditDeduction)
    return result
  }, [veo3])

  const value: Veo3ContextValue = {
    currentGeneration: veo3.currentGeneration,
    generations: veo3.generations,
    isGenerating: veo3.isGenerating,
    isPolling: veo3.isPolling,
    isLoading: veo3.isLoading,
    isInitialLoading: veo3.isInitialLoading,
    generate: generateWithCredits,
    checkStatus: veo3.checkStatus,
    refreshGenerations: veo3.refreshGenerations,
    stopPolling: veo3.stopPolling,
    startPolling: veo3.startPolling,
    deleteGeneration: veo3.deleteGeneration,
    error: veo3.error,
  }

  return (
    <Veo3Context.Provider value={value}>
      {children}
    </Veo3Context.Provider>
  )
}

export function useVeo3Context() {
  const context = useContext(Veo3Context)
  if (!context) {
    throw new Error('useVeo3Context must be used within a Veo3Provider')
  }
  return context
}
