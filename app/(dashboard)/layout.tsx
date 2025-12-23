'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, PanelRightOpen, PanelRightClose, User } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { ResultsPanel } from '@/components/dashboard/results-panel'
import { SubscriptionAlertModal } from '@/components/subscription/subscription-alert-modal'
import { TrialWelcomeModal } from '@/components/subscription/trial-welcome-modal'
import { useWorkflowStore } from '@/stores/workflow-store'
import { Sora2Provider } from '@/contexts/sora2-context'
import { Veo3Provider } from '@/contexts/veo3-context'
import { LipSyncProvider } from '@/contexts/lipsync-context'
import { InfiniteTalkProvider } from '@/contexts/infinitetalk-context'
import { NanoBananaProvider } from '@/contexts/nanobanana-context'
import { UserProvider } from '@/contexts/user-context'

// Context for mobile menu state
interface MobileMenuContextType {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  isResultsOpen: boolean
  setIsResultsOpen: (open: boolean) => void
}

const MobileMenuContext = createContext<MobileMenuContextType | null>(null)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isResultsOpen, setIsResultsOpen] = useState(false)

  // Rehydrate the store on client-side mount
  useEffect(() => {
    const unsubscribe = useWorkflowStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })

    // Check if already hydrated
    if (useWorkflowStore.persist.hasHydrated()) {
      setIsHydrated(true)
    } else {
      useWorkflowStore.persist.rehydrate()
    }

    return () => {
      unsubscribe()
    }
  }, [])

  // Close mobile menus on resize to desktop (only width changes, not height from keyboard)
  useEffect(() => {
    let lastWidth = window.innerWidth
    const handleResize = () => {
      const currentWidth = window.innerWidth
      // Only react to width changes (not height changes from virtual keyboard)
      if (currentWidth !== lastWidth && currentWidth >= 1024) {
        setIsSidebarOpen(false)
        setIsResultsOpen(false)
      }
      lastWidth = currentWidth
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <UserProvider>
      <Sora2Provider>
        <Veo3Provider>
          <LipSyncProvider>
            <InfiniteTalkProvider>
            <NanoBananaProvider>
              <MobileMenuContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, isResultsOpen, setIsResultsOpen }}>
                {/* Subscription Alert Modal - shows when canceled or payment failed */}
                <SubscriptionAlertModal />
                {/* Trial Welcome Modal - shows when user is in trial */}
                <TrialWelcomeModal />
                <div className="h-dvh overflow-hidden bg-background flex flex-col fixed inset-0 lg:relative">
                  {/* Mobile Header - Fixed at top, always visible */}
                  <header className="lg:hidden fixed top-0 left-0 right-0 flex items-center justify-between p-3 border-b border-border bg-card z-[60]">
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors touch-manipulation"
                      aria-label="Open menu"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => router.push('/settings')}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity touch-manipulation"
                      aria-label="Go to settings"
                    >
                      <h1 className="text-lg font-semibold">
                        blacktools<span className="text-muted-foreground">.ai</span>
                      </h1>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => router.push('/settings')}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors touch-manipulation"
                        aria-label="My account"
                      >
                        <User className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setIsResultsOpen(true)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors touch-manipulation"
                        aria-label="Open results"
                      >
                        <PanelRightOpen className="w-5 h-5" />
                      </button>
                    </div>
                  </header>

                  {/* Spacer for fixed header on mobile */}
                  <div className="lg:hidden h-[57px] flex-shrink-0" />

                  {/* Main Layout */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:flex w-[220px] flex-shrink-0">
                      <Sidebar />
                    </aside>

                    {/* Mobile Sidebar Overlay */}
                    {isSidebarOpen && (
                      <div className="lg:hidden fixed inset-0 z-[200] flex">
                        <div
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                          onClick={() => setIsSidebarOpen(false)}
                        />
                        <div className="relative w-[280px] max-w-[85vw] bg-card animate-in slide-in-from-left duration-300">
                          <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg transition-colors z-10"
                            aria-label="Close menu"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <Sidebar onToolSelect={() => setIsSidebarOpen(false)} />
                        </div>
                      </div>
                    )}

                    {/* Main Content */}
                    <main className="flex-1 overflow-hidden">{children}</main>

                    {/* Desktop Results Panel */}
                    <aside className="hidden lg:flex w-[300px] flex-shrink-0">
                      <ResultsPanel />
                    </aside>

                    {/* Mobile Results Panel Overlay */}
                    {isResultsOpen && (
                      <div className="lg:hidden fixed inset-0 z-[200] flex justify-end">
                        <div
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                          onClick={() => setIsResultsOpen(false)}
                        />
                        <div className="relative w-[320px] max-w-[90vw] bg-card animate-in slide-in-from-right duration-300">
                          <button
                            onClick={() => setIsResultsOpen(false)}
                            className="absolute top-4 left-4 p-2 hover:bg-secondary rounded-lg transition-colors z-10"
                            aria-label="Close results"
                          >
                            <PanelRightClose className="w-5 h-5" />
                          </button>
                          <ResultsPanel />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </MobileMenuContext.Provider>
            </NanoBananaProvider>
            </InfiniteTalkProvider>
          </LipSyncProvider>
        </Veo3Provider>
      </Sora2Provider>
    </UserProvider>
  )
}
