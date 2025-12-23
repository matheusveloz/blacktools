'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { Profile } from '@/types/database'

// Cache key for localStorage
const PROFILE_CACHE_KEY = 'blacktools_profile_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes - longer cache for faster loads

// Get cached profile from localStorage
function getCachedProfile(userId?: string, ignoreExpiry = false): Profile | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      // Cache valid for 5 minutes (fast page loads, background refresh keeps it fresh)
      const isExpired = parsed.timestamp && Date.now() - parsed.timestamp > CACHE_DURATION
      if (ignoreExpiry || !isExpired) {
        // If userId provided, verify it matches
        if (userId && parsed.profile?.id !== userId) {
          return null
        }
        return parsed.profile
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null
}

// Save profile to localStorage cache
function setCachedProfile(profile: Profile | null) {
  if (typeof window === 'undefined') return
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
        profile,
        timestamp: Date.now()
      }))
      // Dispatch event to notify sidebar and other components
      window.dispatchEvent(new CustomEvent('profile-cache-updated'))
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY)
    }
  } catch {
    // Ignore cache errors
  }
}

interface UserContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  deductCredits: (amount: number) => void
}

const UserContext = createContext<UserContextValue | null>(null)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  // Always start with null to avoid hydration mismatch
  // Cache is loaded in useEffect after hydration
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (error) {
      // Retornar null se não conseguir criar o cliente
      // O contexto vai lidar com isso
      return null as any
    }
  }, [])

  // Don't clear cache on mount - let it be used for faster loading
  // Cache will be updated when fresh data is fetched

  // Track if we're currently fetching to avoid duplicate requests
  const fetchingRef = useRef<string | null>(null)
  const lastFetchTimeRef = useRef<number>(0)
  const lastUserIdRef = useRef<string | null>(null)
  const lastProfileDataRef = useRef<string | null>(null) // Store last profile hash to avoid unnecessary updates
  const MIN_FETCH_INTERVAL = 2000 // 2 seconds between fetches
  const INITIAL_SESSION_HANDLED = useRef(false) // Track if INITIAL_SESSION was already handled

  const fetchProfile = useCallback(async (userId: string, force = false): Promise<Profile | null> => {
    // Prevent duplicate concurrent fetches
    if (fetchingRef.current === userId && !force) {
      return null
    }

    // Throttle: don't fetch if we just fetched recently (unless forced)
    const now = Date.now()
    if (!force && now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL) {
      return null
    }

    fetchingRef.current = userId
    lastFetchTimeRef.current = now

    if (!supabase) {
      setLoading(false)
      fetchingRef.current = null
      return null
    }

    // Declare timeoutId outside try block so it can be cleared in catch
    let timeoutId: NodeJS.Timeout | undefined
    
    try {
      // Create timeout promise (10 seconds - balanced for speed and reliability)
      const timeoutPromise = new Promise<null>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), 10000)
      })

      // Create the query promise
      const queryPromise = (async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          // On errors, clear cache to force fresh fetch next time
          if (error.code && error.code !== 'PGRST116') {
            setCachedProfile(null)
          }
          return null
        }
        return data as Profile | null
      })()

      // Race between query and timeout
      const data = await Promise.race([queryPromise, timeoutPromise])
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      fetchingRef.current = null

      if (data) {
        // Check if account is suspended - auto logout
        if (data.account_status === 'suspended') {
          setCachedProfile(null)
          await supabase.auth.signOut()
          const reason = data.account_suspended_reason || 'unknown'
          window.location.href = `/login?suspended=true&reason=${reason}`
          return null
        }

        // Create a hash of the profile data to avoid unnecessary updates
        const profileHash = JSON.stringify(data)

        // Only update if data actually changed (avoid unnecessary re-renders)
        if (lastProfileDataRef.current === profileHash) {
          fetchingRef.current = null
          setLoading(false)
          return data
        }

        lastProfileDataRef.current = profileHash
        setProfile(data)
        setCachedProfile(data) // Cache for next page load
        setLoading(false) // Important: set loading false on success
      } else {
        // If fetch returns null but we have cache, keep the cache
        // Don't clear profile if we have cached data
        const currentProfile = profile
        if (!currentProfile) {
          setLoading(false)
        }
      }
      return data
    } catch (err) {
      // Clear timeout if it wasn't already cleared
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      fetchingRef.current = null
      // Check if it's a timeout error - use cache if available
      if (err instanceof Error && err.message === 'TIMEOUT') {
        // On timeout, try to use cached data if available
        const cached = getCachedProfile(userId)
        if (cached) {
          setProfile(cached)
          setLoading(false)
          return cached
        }
        // Silent timeout handling - timeout is handled gracefully
      }
      setLoading(false)
      return null
    }
  }, [supabase])

  useEffect(() => {
    let isMounted = true
    INITIAL_SESSION_HANDLED.current = false

    // Load cache from localStorage immediately on client-side
    // This prevents hydration mismatch and shows data fast
    if (typeof window !== 'undefined') {
      const cachedProfile = getCachedProfile()
      if (cachedProfile) {
        setProfile(cachedProfile)
        setLoading(false) // Show cached data immediately
      }
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    // Fetch user IMMEDIATELY (don't wait for onAuthStateChange)
    // This makes the page load much faster
    const fetchUserImmediately = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (!isMounted) return

        if (error) {
          setLoading(false)
          return
        }

        setUser(user)

        if (user) {
          lastUserIdRef.current = user.id
          
          // Check if current profile matches this user
          const currentProfile = profile
          const profileMatches = currentProfile && currentProfile.id === user.id
          
          // Check if we have cached data for this user
          const currentCached = getCachedProfile(user.id)
          const hasCachedData = !!currentCached && currentCached.id === user.id
          
          // If we already have matching profile from cache, keep it and fetch fresh in background
          if (profileMatches || hasCachedData) {
            // Use the matching cache (either already set or from getCachedProfile)
            if (hasCachedData && !profileMatches) {
              setProfile(currentCached)
            }
            setLoading(false)
            // Fetch fresh data in background (non-blocking)
            fetchProfile(user.id, true).catch(() => {
              // Silent fail - we already have cache
            })
          } else {
            // No cache or cache doesn't match - fetch immediately
            if (!currentProfile) {
              setLoading(true)
            }
            await fetchProfile(user.id, true)
          }
        } else {
          setProfile(null)
          setCachedProfile(null)
          setLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Start fetching immediately
    fetchUserImmediately()

    if (!supabase) {
      return () => {
        isMounted = false
      }
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return

        const currentUserId = session?.user?.id || null
        
        // Handle INITIAL_SESSION only once
        if (event === 'INITIAL_SESSION') {
          if (INITIAL_SESSION_HANDLED.current) {
            return // Already handled, ignore duplicate
          }
          INITIAL_SESSION_HANDLED.current = true
        }
        
        // Only fetch if user actually changed
        if (currentUserId !== lastUserIdRef.current) {
          lastUserIdRef.current = currentUserId
          setUser(session?.user ?? null)

          if (session?.user) {
            // Only fetch on specific events (not INITIAL_SESSION - already handled by immediate fetch)
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              const currentCached = getCachedProfile(session.user.id)
              const hasCachedData = !!currentCached && currentCached.id === session.user.id
              
              if (!hasCachedData) {
                setLoading(true)
              }
              await fetchProfile(session.user.id)
            }
          } else {
            setProfile(null)
            setCachedProfile(null)
            setLoading(false)
            lastProfileDataRef.current = null
          }
        } else {
          // Same user, only refetch on token refresh
          if (event === 'TOKEN_REFRESHED' && session?.user) {
            await fetchProfile(session.user.id, true)
          }
        }
      }
    )

    // Failsafe timeout: if loading is still true after 10 seconds, force it to false
    const failsafeTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false)
      }
    }, 10000)

    return () => {
      isMounted = false
      clearTimeout(failsafeTimeout)
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]) // Removed fetchProfile from deps to prevent loops

  const signOut = useCallback(async () => {
    // Prevent multiple signout attempts
    if (typeof window !== 'undefined' && (window as any).__signingOut) {
      return
    }
    if (typeof window !== 'undefined') {
      (window as any).__signingOut = true
    }

    // Clear cache and state immediately
    setCachedProfile(null)
    setUser(null)
    setProfile(null)
    lastUserIdRef.current = null
    lastProfileDataRef.current = null

    // Clear workflow store
    try {
      localStorage.removeItem('blacktools-workflow')
    } catch {
      // Ignore
    }

    // Redirect immediately - don't wait for Supabase
    // The signOut will complete in background
    const redirectToLogin = () => {
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
    }

    // Start signout in background (non-blocking)
    supabase?.auth.signOut().catch(() => {
      // Silent fail
    })

    // Redirect immediately
    redirectToLogin()
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) {
      // Don't clear cache or set loading - just fetch in background
      // This prevents UI flicker while still getting fresh data
      await fetchProfile(user.id, true) // Force refresh when explicitly called
    }
  }, [user, fetchProfile])

  // Listen for credits-updated event (dispatched when generation fails/completes)
  useEffect(() => {
    const handleCreditsUpdated = () => {
      if (user) {
        // Refresh profile to get updated credits from server
        fetchProfile(user.id, true)
      }
    }

    window.addEventListener('credits-updated', handleCreditsUpdated)
    return () => {
      window.removeEventListener('credits-updated', handleCreditsUpdated)
    }
  }, [user, fetchProfile])

  // Listen for profile-cache-updated event (dispatched when plan changes)
  // This syncs the React state with localStorage updates from other components
  useEffect(() => {
    const handleCacheUpdated = () => {
      // Read the updated cache and sync to state
      const cached = getCachedProfile(user?.id, true) // Ignore expiry - use latest
      if (cached) {
        setProfile(cached)
        lastProfileDataRef.current = JSON.stringify(cached)
      }
    }

    window.addEventListener('profile-cache-updated', handleCacheUpdated)
    return () => {
      window.removeEventListener('profile-cache-updated', handleCacheUpdated)
    }
  }, [user?.id])

  // Optimistic update for credits (immediate visual feedback)
  // Strategy: Deduct from subscription credits first, then from extras
  const deductCredits = useCallback((amount: number) => {
    setProfile(prev => {
      if (!prev) return prev

      const currentCredits = prev.credits || 0
      const currentExtras = prev.credits_extras || 0

      let newCredits = currentCredits
      let newExtras = currentExtras

      if (currentCredits >= amount) {
        // Subscription credits cover the full amount
        newCredits = currentCredits - amount
      } else {
        // Use all subscription credits, then take from extras
        const remaining = amount - currentCredits
        newCredits = 0
        newExtras = Math.max(0, currentExtras - remaining)
      }

      const updated = {
        ...prev,
        credits: newCredits,
        credits_extras: newExtras
      }
      // Update cache with new credits
      setCachedProfile(updated)
      return updated
    })
  }, [])

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    deductCredits
  }), [user, profile, loading, signOut, refreshProfile, deductCredits])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
