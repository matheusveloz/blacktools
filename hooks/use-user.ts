'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types/database'

// Cache key for localStorage
const PROFILE_CACHE_KEY = 'blacktools_profile_cache'

// Get cached profile from localStorage
function getCachedProfile(userId?: string, ignoreExpiry = false): Profile | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      // Cache valid for 60 seconds (balanced for UX and freshness)
      // Also verify user ID matches to avoid stale cache issues
      const isExpired = parsed.timestamp && Date.now() - parsed.timestamp > 60000
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
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY)
    }
  } catch {
    // Ignore cache errors
  }
}

export function useUser() {
  // Always start with null to avoid hydration mismatch
  // Cache is loaded in useEffect after hydration
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Memoize supabase client to prevent re-creation on every render
  const supabase = useMemo(() => createClient(), [])

  // Helper to get Facebook cookies for attribution
  const getFacebookCookies = useCallback(() => {
    if (typeof document === 'undefined') return { fbc: null, fbp: null }

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    return {
      fbc: cookies['_fbc'] || null,
      fbp: cookies['_fbp'] || null,
    }
  }, [])

  // Helper function to create profile if it doesn't exist via API
  const createProfileIfNotExists = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Get Facebook cookies for attribution tracking
      const { fbc, fbp } = getFacebookCookies()

      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fbc, fbp }),
      })

      if (!response.ok) {
        return null
      }

      const { profile } = await response.json()

      if (profile) {
        return profile as Profile
      }

      return null
    } catch (err) {
      return null
    }
  }, [getFacebookCookies])

  // Load cache from localStorage immediately on client-side
  useEffect(() => {
    // Only access localStorage after component mounts (client-side)
    if (typeof window === 'undefined') return

    // Load cache immediately to show data fast (without userId check for initial load)
    const cachedProfile = getCachedProfile()
    if (cachedProfile) {
      setProfile(cachedProfile)
      setLoading(false) // Show cached data immediately - don't wait for user fetch
    }
    setIsHydrated(true)
  }, [])

  // Track if we're currently fetching to avoid duplicate requests
  const fetchingRef = useRef<string | null>(null)
  const lastFetchTimeRef = useRef<number>(0)
  const lastProfileDataRef = useRef<string | null>(null) // Store last profile hash
  const MIN_FETCH_INTERVAL = 1000 // Reduced to 1 second for better responsiveness
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

    if (!supabase) {
      setLoading(false)
      return null
    }

    fetchingRef.current = userId
    lastFetchTimeRef.current = now

    // Declare timeoutId outside try block so it can be cleared in catch
    let timeoutId: NodeJS.Timeout | undefined
    
    try {
      // Create timeout promise (15 seconds - increased for better reliability)
      const timeoutPromise = new Promise<null>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), 15000)
      })

      // Create the query promise
      const queryPromise = (async (): Promise<Profile | null> => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle() // Use maybeSingle instead of single to avoid throwing errors

        if (error) {
          // If profile doesn't exist, try to create it
          if (error.code === 'PGRST116') {
            return await createProfileIfNotExists(userId)
          }
          // On other errors, clear cache to force fresh fetch next time
          if (error.code && error.code !== 'PGRST116') {
            setCachedProfile(null)
          }
          return null
        }

        if (!data) {
          return await createProfileIfNotExists(userId)
        }

        return data as Profile
      })()

      // Race between query and timeout
      const data = await Promise.race([queryPromise, timeoutPromise])
      clearTimeout(timeoutId!)
      
      fetchingRef.current = null

      if (data) {
        // Create a hash of the profile data to avoid unnecessary updates
        const profileHash = JSON.stringify(data)
        
        // Only update if data actually changed
        if (lastProfileDataRef.current === profileHash) {
          fetchingRef.current = null
          setLoading(false)
          return data
        }
        
        lastProfileDataRef.current = profileHash
        // Always update profile with fresh data
        setProfile(data)
        setCachedProfile(data) // Cache for faster next load
        setLoading(false)
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
      if (typeof timeoutId !== 'undefined') {
        clearTimeout(timeoutId)
      }
      
      fetchingRef.current = null
      // Timeout or other error - use cache if available
      if (err instanceof Error && err.message === 'TIMEOUT') {
        // On timeout, use cached data if available
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
  }, [supabase, createProfileIfNotExists])

  const lastUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Only run after hydration to avoid SSR issues
    if (!isHydrated) return

    let isMounted = true
    INITIAL_SESSION_HANDLED.current = false

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

        if (user) {
          setUser(user)
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
      } catch (err) {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Start fetching immediately
    fetchUserImmediately()

    // Also listen to auth state changes for updates (sign in/out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
            // Only fetch on specific events
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
  }, [supabase, isHydrated]) // Removed fetchProfile from deps to prevent loops

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setCachedProfile(null)
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      // Clear cache before refresh to ensure fresh data
      setCachedProfile(null)
      setLoading(true)
      await fetchProfile(user.id, true) // Force refresh when explicitly called
    }
  }

  // Optimistically deduct credits from local state (UI updates immediately)
  // The actual deduction happens on the server when generation completes
  const deductCreditsOptimistic = (amount: number) => {
    if (profile) {
      setProfile(prev => prev ? {
        ...prev,
        credits: Math.max(0, (prev.credits || 0) - amount)
      } : null)
    }
  }

  return { user, profile, loading, signOut, refreshProfile, deductCreditsOptimistic }
}
