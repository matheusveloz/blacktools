'use client'

import { useCallback, memo, useSyncExternalStore, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Video, Mic, Sparkles, LogOut, Settings, User, Zap, Loader2, ArrowUpCircle, Coins, Infinity, ExternalLink, MessageSquare, Users } from 'lucide-react'
import { TOOLS, TOOL_CONFIG, ToolType } from '@/lib/constants'
import { useWorkflowStore } from '@/stores/workflow-store'
import { useUserContext } from '@/contexts/user-context'
import { useSubscription } from '@/hooks/use-subscription'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Shimmer Component for Credits
const CreditsShimmer = () => (
  <div className="animate-shimmer h-6 w-16 rounded" />
)

// Read cached credits synchronously from localStorage
// Cache is valid for 5 minutes (matches user-context)
// Returns total credits (credits + credits_extras)
function getCachedCredits(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem('blacktools_profile_cache')
    if (cached) {
      const parsed = JSON.parse(cached)

      // Check cache age - valid for 5 minutes
      const cacheAge = Date.now() - (parsed.timestamp || 0)
      const MAX_CACHE_AGE = 5 * 60 * 1000 // 5 minutes

      if (cacheAge > MAX_CACHE_AGE) {
        // Cache too old - but don't remove it, let context handle refresh
        return null
      }

      // Use cached data
      if (parsed.profile && typeof parsed.profile.credits === 'number') {
        const credits = parsed.profile.credits || 0
        const creditsExtras = parsed.profile.credits_extras || 0
        return credits + creditsExtras
      }
    }
  } catch {
    // Ignore
  }
  return null
}

// Subscribe to storage changes (including same-tab updates)
function subscribeToCacheChanges(callback: () => void) {
  // Listen to storage events (cross-tab)
  window.addEventListener('storage', callback)
  
  // Also listen to custom events for same-tab updates
  const handleCustomStorage = () => callback()
  window.addEventListener('profile-cache-updated', handleCustomStorage)
  
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('profile-cache-updated', handleCustomStorage)
  }
}

// Server snapshot returns null (no localStorage on server)
function getServerSnapshot(): number | null {
  return null
}

// Custom Banana icon
const BananaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5" />
    <path d="M5.15 17.89c5.52-1.52 8.65-6.89 7-12C11.55 4 11 3 11 3c1 0 4 0 6 2s3.5 4.5 3 8c-.5 3.5-3 6.5-6.5 8-3.5 1.5-7 1-9.85.11" />
  </svg>
)

// Telegram icon
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const toolIcons: Record<ToolType, React.ReactNode> = {
  lipsync: <Mic className="w-[18px] h-[18px]" />,
  infinitetalk: <Infinity className="w-[18px] h-[18px]" />,
  sora2: <Video className="w-[18px] h-[18px]" />,
  veo3: <Sparkles className="w-[18px] h-[18px]" />,
  avatar: <BananaIcon className="w-[18px] h-[18px]" />,
}

interface SidebarProps {
  onToolSelect?: () => void
}

// Feedback categories
const FEEDBACK_CATEGORIES = [
  { id: 'bug', label: 'Bug Report', description: 'Something is not working correctly' },
  { id: 'improvement', label: 'Improvement', description: 'Suggest an enhancement' },
  { id: 'payment', label: 'Payment Issue', description: 'Billing or subscription problem' },
  { id: 'feature', label: 'Feature Request', description: 'Request a new feature' },
  { id: 'other', label: 'Other', description: 'General feedback' },
] as const

type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number]['id']

export const Sidebar = memo(function Sidebar({ onToolSelect }: SidebarProps) {
  const router = useRouter()
  // Use store directly - only subscribe to what we need
  const selectedTool = useWorkflowStore((state) => state.selectedTool)
  const switchTool = useWorkflowStore((state) => state.switchTool)
  const { profile, loading, signOut, user, refreshProfile } = useUserContext()
  const { isTrialing, syncSubscription } = useSubscription()

  // Feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)

  const handleSubmitFeedback = async () => {
    if (!feedbackCategory || !feedbackMessage.trim() || !user) return

    setFeedbackSubmitting(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: feedbackCategory,
          message: feedbackMessage.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Feedback sent!', {
          description: 'Thank you for your feedback.',
        })
        setFeedbackOpen(false)
        setFeedbackCategory(null)
        setFeedbackMessage('')
      } else {
        toast.error('Failed to send feedback', {
          description: data.error || 'Please try again.',
        })
      }
    } catch {
      toast.error('Failed to send feedback')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  // Refresh on window focus only (not on every mount)
  // This prevents unnecessary delays while still keeping data fresh
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id && document.visibilityState === 'visible') {
        // Only refresh if tab was hidden for a while (check cache age)
        const cached = localStorage.getItem('blacktools_profile_cache')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            const cacheAge = Date.now() - (parsed.timestamp || 0)
            // Only refresh if cache is older than 60 seconds
            if (cacheAge > 60000) {
              refreshProfile()
              syncSubscription(true)
            }
          } catch {
            // Invalid cache, refresh
            refreshProfile()
          }
        }
      }
    }

    window.addEventListener('visibilitychange', handleFocus)
    return () => window.removeEventListener('visibilitychange', handleFocus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Skip trial removed - no longer using trial system

  // Read cached credits synchronously - no loading flash
  const cachedCredits = useSyncExternalStore(
    subscribeToCacheChanges,
    getCachedCredits,
    getServerSnapshot
  )

  // Calculate total credits from profile (subscription + extras)
  const profileTotalCredits = profile
    ? (profile.credits || 0) + (profile.credits_extras || 0)
    : undefined

  // Display: prioritize cache for instant display, then profile from context
  // NEVER show 0 - always show shimmer if we don't have real data yet
  const hasRealData = cachedCredits !== null || profileTotalCredits !== undefined
  const displayCredits = cachedCredits ?? profileTotalCredits ?? null
  
  // Show loading if:
  // 1. Context is still loading AND no cache available
  // 2. OR we don't have real data yet (prevents showing 0)
  const showLoading = !hasRealData

  // Tools that require Pro or Premium plan
  const proOnlyTools: ToolType[] = ['infinitetalk']

  const handleToolSelect = useCallback((tool: ToolType) => {
    // Check if tool requires Pro/Premium plan
    if (proOnlyTools.includes(tool)) {
      const userPlan = profile?.subscription_plan
      const hasProAccess = userPlan === 'pro' || userPlan === 'premium'

      if (!hasProAccess) {
        toast.error(
          'Infinite Talk requires a Pro or Premium plan',
          {
            description: 'Upgrade your plan to access this feature.',
            action: {
              label: 'Upgrade',
              onClick: () => router.push('/pricing'),
            },
          }
        )
        return
      }
    }

    if (selectedTool !== tool) {
      switchTool(tool)
    }
    // Close mobile menu when tool is selected
    onToolSelect?.()
  }, [selectedTool, switchTool, onToolSelect, profile?.subscription_plan, router])

  // Check if user has Pro access (for styling locked tools)
  const hasProAccess = profile?.subscription_plan === 'pro' || profile?.subscription_plan === 'premium'

  return (
    <aside className="bg-card border-r border-border flex flex-col h-full w-full">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <h1 className="text-[22px] font-semibold tracking-tight">
          blacktools<span className="text-muted-foreground">.ai</span>
        </h1>
      </div>

      {/* Tools Section */}
      <div className="p-4 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-muted-foreground mb-3">
          AI Tools
        </p>
        <div className="flex flex-col gap-1">
          {Object.entries(TOOLS).map(([key, value]) => {
            const tool = value as ToolType
            const config = TOOL_CONFIG[tool]
            const isActive = selectedTool === tool
            const isProOnly = proOnlyTools.includes(tool)
            const isLocked = isProOnly && !hasProAccess

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleToolSelect(tool)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all text-left cursor-pointer',
                  isActive
                    ? 'bg-white text-black'
                    : isLocked
                    ? 'text-gray-500 hover:bg-secondary hover:text-gray-400'
                    : 'text-gray-300 hover:bg-secondary hover:text-white'
                )}
              >
                <span className={isActive ? 'text-black' : ''}>{toolIcons[tool]}</span>
                <span className="flex-1">{config.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Feedback Button */}
      <div className="px-4 mb-2">
        <button
          onClick={() => setFeedbackOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-primary/10 border border-primary/30 rounded-lg text-[13px] text-primary hover:bg-primary/20 hover:border-primary/50 transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium">Feedback</span>
        </button>
      </div>

      {/* Join Telegram Community */}
      <div className="px-4 mb-3">
        <a
          href="https://t.me/+HWxbKEAIlIk3NGEx"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#0088cc]/10 border border-[#0088cc]/30 rounded-lg text-[13px] text-[#0088cc] hover:bg-[#0088cc]/20 hover:border-[#0088cc]/50 transition-all cursor-pointer group"
        >
          <TelegramIcon className="w-4 h-4" />
          <span className="font-medium">Join Telegram</span>
          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>

      {/* Trial banner removed - no longer using trial system */}

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {/* Credits & Plan - Clickable to go to settings */}
        <button
          type="button"
          onClick={() => {
            router.push('/settings')
            onToolSelect?.()
          }}
          className="w-full p-3 bg-secondary rounded-lg mb-3 hover:bg-muted transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Credits</span>
            {/* Always show shimmer until we have real data */}
            {showLoading ? (
              <CreditsShimmer />
            ) : (
              <span className="text-lg font-bold">{displayCredits?.toLocaleString() || '0'}</span>
            )}
          </div>
          {/* Only show plan when we have profile data */}
          {!showLoading && profile?.subscription_plan && (
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Plan</span>
              <span className="text-xs font-medium capitalize">{profile.subscription_plan}</span>
            </div>
          )}
        </button>

        {/* Upgrade/Subscribe - show if not on premium plan */}
        {profile?.subscription_plan !== 'premium' && (
          <button
            type="button"
            onClick={() => {
              router.push('/pricing')
              onToolSelect?.()
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-border rounded-lg text-[13px] text-muted-foreground hover:border-white hover:text-white transition-all cursor-pointer mb-2"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>{profile?.subscription_status === 'active' ? 'Upgrade' : 'Subscribe'}</span>
          </button>
        )}

        {/* Buy Credits - show if has active subscription and not trialing */}
        {(profile?.subscription_status === 'active') && (
          <button
            type="button"
            onClick={() => {
              router.push('/buy-credits')
              onToolSelect?.()
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-border rounded-lg text-[13px] text-muted-foreground hover:border-white hover:text-white transition-all cursor-pointer mb-2"
          >
            <Coins className="w-4 h-4" />
            <span>Buy Credits</span>
          </button>
        )}

        {/* Affiliates */}
        <button
          type="button"
          onClick={() => {
            router.push('/affiliates')
            onToolSelect?.()
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-border rounded-lg text-[13px] text-muted-foreground hover:border-white hover:text-white transition-all cursor-pointer mb-2"
        >
          <Users className="w-4 h-4" />
          <span>Affiliates</span>
        </button>

        {/* My Account */}
        <button
          type="button"
          onClick={() => {
            router.push('/settings')
            onToolSelect?.()
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-border rounded-lg text-[13px] text-muted-foreground hover:border-white hover:text-white transition-all cursor-pointer mb-2"
        >
          <User className="w-4 h-4" />
          <span>My Account</span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-border rounded-lg text-[13px] text-muted-foreground hover:border-white hover:text-white transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Feedback Modal */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFeedbackCategory(cat.id)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all',
                      feedbackCategory === cat.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <div className="text-sm font-medium">{cat.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{cat.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Message
              </label>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Describe your feedback in detail..."
                rows={4}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setFeedbackOpen(false)
                setFeedbackCategory(null)
                setFeedbackMessage('')
              }}
              className="order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={!feedbackCategory || !feedbackMessage.trim() || feedbackSubmitting}
              className="order-1 sm:order-2"
            >
              {feedbackSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Feedback'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
})

