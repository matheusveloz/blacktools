'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  User,
  Mail,
  Calendar,
  Coins,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { useSubscription } from '@/hooks/use-subscription'

// Shimmer Component
const Shimmer = ({ className }: { className?: string }) => (
  <div className={`animate-shimmer rounded ${className}`} />
)

// Profile Card Shimmer
const ProfileCardShimmer = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden">
    <div className="p-5 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <div className="flex items-start gap-4">
        <Shimmer className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
        <div className="flex-1 min-w-0 space-y-2">
          <Shimmer className="h-5 w-32" />
          <Shimmer className="h-4 w-48" />
          <Shimmer className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
    <div className="divide-y divide-border">
      <div className="px-5 sm:px-6 py-4 flex items-center gap-3">
        <Shimmer className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-4 w-32" />
        </div>
      </div>
      <div className="px-5 sm:px-6 py-4 flex items-center gap-3">
        <Shimmer className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-4 w-40" />
        </div>
      </div>
      <div className="px-5 sm:px-6 py-4 flex items-center gap-3">
        <Shimmer className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-4 w-28" />
        </div>
      </div>
    </div>
  </div>
)

// Subscription Card Shimmer
const SubscriptionCardShimmer = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden">
    <div className="px-5 sm:px-6 py-4 border-b border-border">
      <Shimmer className="h-5 w-24" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
      <div className="bg-card px-4 sm:px-5 py-4 sm:py-5 space-y-2">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-6 w-16" />
      </div>
      <div className="bg-card px-4 sm:px-5 py-4 sm:py-5 space-y-2">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-6 w-20" />
      </div>
      <div className="bg-card px-4 sm:px-5 py-4 sm:py-5 col-span-2 sm:col-span-1 space-y-2">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-6 w-16" />
      </div>
    </div>
    <div className="p-4 sm:p-5 space-y-3">
      <Shimmer className="h-12 w-full rounded-xl" />
      <Shimmer className="h-3 w-48 mx-auto" />
    </div>
  </div>
)

export default function SettingsPage() {
  const router = useRouter()
  const { profile, user, signOut, loading: userLoading, refreshProfile } = useUser()
  const {
    plan,
    credits,
    creditsExtras,
    totalCredits,
    currentPeriodStart,
    currentPeriodEnd,
    isActive,
    isPastDue,
    isCanceled,
    openPortal,
    syncSubscription,
    loading: subLoading
  } = useSubscription()

  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  // Start with true to show shimmer until first sync completes
  const [isSyncing, setIsSyncing] = useState(true)

  // Sync subscription on page load to ensure fresh data
  useEffect(() => {
    let mounted = true
    const syncOnLoad = async () => {
      if (profile?.id) {
        try {
          // Force sync to get latest data from Stripe
          await syncSubscription(true)
        } finally {
          if (mounted) setIsSyncing(false)
        }
      } else if (!userLoading && !subLoading) {
        // No profile and not loading - stop syncing state
        if (mounted) setIsSyncing(false)
      }
    }
    syncOnLoad()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, userLoading, subLoading])

  // Show loading shimmer while syncing or loading
  // isSyncing starts true and only becomes false after first sync completes
  // This ensures we don't show stale cache data before sync finishes
  const loading = isSyncing || userLoading || subLoading

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true)
    await openPortal()
    setIsOpeningPortal(false)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    router.push('/login')
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = () => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
          <CheckCircle2 className="w-3 h-3" />
          Active
        </span>
      )
    }
    if (isPastDue) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
          <Clock className="w-3 h-3" />
          Past Due
        </span>
      )
    }
    if (isCanceled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
          <XCircle className="w-3 h-3" />
          Canceled
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
        <XCircle className="w-3 h-3" />
        No Subscription
      </span>
    )
  }

  const getPlanDisplayName = (planId: string | null | undefined) => {
    if (!planId) return 'Free'
    const planLower = planId.toLowerCase()
    if (planLower.includes('pro')) return 'Pro'
    if (planLower.includes('starter')) return 'Starter'
    if (planLower.includes('enterprise')) return 'Enterprise'
    return planId.charAt(0).toUpperCase() + planId.slice(1)
  }

  const getDaysUntilRenewal = () => {
    if (!currentPeriodEnd) return null
    const now = new Date()
    const diff = currentPeriodEnd.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="pt-2 sm:pt-0">
          <h1 className="text-2xl sm:text-3xl font-bold">My Account</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your profile and subscription
          </p>
        </div>

        {/* Profile Card */}
        {loading ? (
          <ProfileCardShimmer />
        ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Profile Header with Avatar */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl sm:text-3xl font-bold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() ||
                   profile?.email?.charAt(0)?.toUpperCase() ||
                   'U'}
                </div>
                {isActive && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-card">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Name and Email */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold truncate">
                  {profile?.full_name || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {profile?.email || user?.email}
                </p>
                <div className="mt-2">
                  {getStatusBadge()}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="divide-y divide-border">
            <div className="px-5 sm:px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || 'Not set'}
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">
                  {profile?.email || user?.email}
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Subscription Card */}
        {loading ? (
          <SubscriptionCardShimmer />
        ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Subscription</h3>
            </div>
          </div>

          {/* Subscription Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
            {/* Current Plan */}
            <div className="bg-card px-4 sm:px-5 py-4 sm:py-5">
              <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
              <p className="text-lg sm:text-xl font-bold text-primary">
                {getPlanDisplayName(plan)}
              </p>
            </div>

            {/* Credits */}
            <div className="bg-card px-4 sm:px-5 py-4 sm:py-5">
              <p className="text-xs text-muted-foreground mb-1">Credits</p>
              <div className="flex items-baseline gap-1">
                <p className="text-lg sm:text-xl font-bold">{totalCredits.toLocaleString()}</p>
                <Coins className="w-4 h-4 text-yellow-500" />
              </div>
              {creditsExtras > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {credits.toLocaleString()} + {creditsExtras.toLocaleString()} extras
                </p>
              )}
            </div>

            {/* Next Billing / Days Left */}
            <div className="bg-card px-4 sm:px-5 py-4 sm:py-5 col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">
                {isActive ? 'Billing Period' : 'Status'}
              </p>
              {isActive && currentPeriodEnd ? (
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {getDaysUntilRenewal()} days
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {currentPeriodStart ? `${formatDate(currentPeriodStart)} - ` : 'Until '}{formatDate(currentPeriodEnd)}
                  </p>
                </div>
              ) : isActive ? (
                <p className="text-lg sm:text-xl font-bold text-green-500">
                  Active
                </p>
              ) : (
                <p className="text-lg sm:text-xl font-bold text-muted-foreground">
                  {isCanceled ? 'Canceled' : isPastDue ? 'Past Due' : 'Inactive'}
                </p>
              )}
            </div>
          </div>

          {/* Subscription Actions */}
          <div className="p-4 sm:p-5 space-y-3">
            {isActive ? (
              <>
                <button
                  onClick={handleOpenPortal}
                  disabled={isOpeningPortal}
                  className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-muted rounded-xl transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Manage Subscription</span>
                  </div>
                  {isOpeningPortal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Manage billing, update payment method, or cancel subscription
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors font-medium"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Subscribe Now</span>
                </button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Get access to all AI tools and start generating
                </p>
              </>
            )}
          </div>
        </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-border">
            <h3 className="font-semibold">Quick Actions</h3>
          </div>

          <div className="divide-y divide-border">
            <button
              onClick={() => router.push(isActive ? '/buy-credits' : '/pricing')}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Buy More Credits</p>
                  <p className="text-xs text-muted-foreground">{isActive ? 'Purchase extra credits' : 'Upgrade plan or subscribe'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Start Creating</p>
                  <p className="text-xs text-muted-foreground">Go to workflow editor</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Subscribe or Upgrade button */}
            <button
              onClick={() => router.push('/pricing')}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{isActive ? 'Upgrade Plan' : 'Subscribe'}</p>
                  <p className="text-xs text-muted-foreground">
                    {isActive ? 'Change your subscription plan' : 'Choose a plan to get more credits'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {isActive && (
              <button
                onClick={handleOpenPortal}
                disabled={isOpeningPortal}
                className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Billing & Invoices</p>
                    <p className="text-xs text-muted-foreground">View payment history</p>
                  </div>
                </div>
                {isOpeningPortal ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors font-medium disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>

        {/* Footer spacing for mobile */}
        <div className="h-4 sm:h-8" />
      </div>
    </div>
  )
}
