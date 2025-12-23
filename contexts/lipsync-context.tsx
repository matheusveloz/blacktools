'use client'

import { createContext, useContext, ReactNode, useCallback } from 'react'
import { useLipSync, LipSyncGeneration } from '@/hooks/use-lipsync'
import { type LipSyncVideoParams } from '@/types/lipsync'

interface LipSyncContextValue {
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

const LipSyncContext = createContext<LipSyncContextValue | null>(null)

interface LipSyncProviderProps {
  children: ReactNode
}

export function LipSyncProvider({ children }: LipSyncProviderProps) {
  const lipsync = useLipSync()

  // Generate wrapper - passes through skipCreditDeduction flag
  const generateWithCredits = useCallback(async (
    srcVideoUrl: string,
    audioUrl: string,
    audioDurationSeconds: number,
    videoParams?: LipSyncVideoParams,
    skipCreditDeduction?: boolean
  ): Promise<string | null> => {
    const result = await lipsync.generate(srcVideoUrl, audioUrl, audioDurationSeconds, videoParams, skipCreditDeduction)
    return result
  }, [lipsync])

  const value: LipSyncContextValue = {
    currentGeneration: lipsync.currentGeneration,
    generations: lipsync.generations,
    isGenerating: lipsync.isGenerating,
    isPolling: lipsync.isPolling,
    isLoading: lipsync.isLoading,
    isInitialLoading: lipsync.isInitialLoading,
    generate: generateWithCredits,
    checkStatus: lipsync.checkStatus,
    refreshGenerations: lipsync.refreshGenerations,
    stopPolling: lipsync.stopPolling,
    startPolling: lipsync.startPolling,
    deleteGeneration: lipsync.deleteGeneration,
    error: lipsync.error,
  }

  return (
    <LipSyncContext.Provider value={value}>
      {children}
    </LipSyncContext.Provider>
  )
}

export function useLipSyncContext() {
  const context = useContext(LipSyncContext)
  if (!context) {
    throw new Error('useLipSyncContext must be used within a LipSyncProvider')
  }
  return context
}
