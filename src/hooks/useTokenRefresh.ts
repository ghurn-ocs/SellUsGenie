import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Configuration for token refresh
const TOKEN_REFRESH_CONFIG = {
  // Refresh token when it has less than 5 minutes remaining
  REFRESH_THRESHOLD: 5 * 60 * 1000,
  // Check token expiry every 30 seconds
  CHECK_INTERVAL: 30 * 1000,
  // Maximum number of consecutive refresh failures before giving up
  MAX_RETRY_ATTEMPTS: 3,
  // Delay between retry attempts (exponential backoff)
  RETRY_BASE_DELAY: 1000,
} as const

interface UseTokenRefreshOptions {
  onRefreshSuccess?: () => void
  onRefreshFailure?: (error: Error) => void
  onTokenExpired?: () => void
}

export const useTokenRefresh = (options: UseTokenRefreshOptions = {}) => {
  const { user, signOut } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const isRefreshingRef = useRef(false)

  const checkAndRefreshToken = useCallback(async (): Promise<void> => {
    // Don't check if user is not authenticated or already refreshing
    if (!user || isRefreshingRef.current) {
      return
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.error('Failed to get current session:', error)
        options.onTokenExpired?.()
        return
      }

      const { expires_at } = session
      if (!expires_at) {
        console.warn('Session has no expiration time')
        return
      }

      const expiresAt = expires_at * 1000 // Convert to milliseconds
      const now = Date.now()
      const timeUntilExpiry = expiresAt - now

      // If token is expired or about to expire, refresh it
      if (timeUntilExpiry <= TOKEN_REFRESH_CONFIG.REFRESH_THRESHOLD) {
        console.log(`Token expires in ${Math.floor(timeUntilExpiry / 1000)}s, refreshing...`)
        
        isRefreshingRef.current = true
        
        try {
          const { data, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError) {
            throw refreshError
          }

          if (!data.session) {
            throw new Error('No session returned after refresh')
          }

          console.log('Token refreshed successfully')
          retryCountRef.current = 0 // Reset retry count on success
          options.onRefreshSuccess?.()
          
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          retryCountRef.current += 1
          
          // If we've exceeded max retry attempts, sign out the user
          if (retryCountRef.current >= TOKEN_REFRESH_CONFIG.MAX_RETRY_ATTEMPTS) {
            console.error(`Token refresh failed ${retryCountRef.current} times, signing out user`)
            options.onTokenExpired?.()
            await signOut()
            return
          }

          // Schedule a retry with exponential backoff
          const retryDelay = TOKEN_REFRESH_CONFIG.RETRY_BASE_DELAY * Math.pow(2, retryCountRef.current - 1)
          console.log(`Retrying token refresh in ${retryDelay}ms (attempt ${retryCountRef.current})`)
          
          setTimeout(async () => {
            isRefreshingRef.current = false
            await checkAndRefreshToken()
          }, retryDelay)

          options.onRefreshFailure?.(refreshError as Error)
          return
        } finally {
          isRefreshingRef.current = false
        }
      }
    } catch (error) {
      console.error('Error checking token expiry:', error)
      options.onRefreshFailure?.(error as Error)
    }
  }, [user, signOut, options])

  // Start/stop token refresh monitoring based on authentication state
  useEffect(() => {
    if (user) {
      // Start monitoring when user is authenticated
      console.log('Starting token refresh monitoring')
      
      // Immediate check
      checkAndRefreshToken()
      
      // Set up periodic checks
      intervalRef.current = setInterval(checkAndRefreshToken, TOKEN_REFRESH_CONFIG.CHECK_INTERVAL)
    } else {
      // Clean up when user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      retryCountRef.current = 0
      isRefreshingRef.current = false
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [user, checkAndRefreshToken])

  // Listen for auth state changes to handle token refresh events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed via auth state change')
          retryCountRef.current = 0
          options.onRefreshSuccess?.()
        } else if (event === 'SIGNED_OUT') {
          // Clean up on sign out
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          retryCountRef.current = 0
          isRefreshingRef.current = false
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [options])

  // Return utilities for manual token operations
  return {
    refreshToken: checkAndRefreshToken,
    isRefreshing: isRefreshingRef.current,
    retryCount: retryCountRef.current,
  }
}

// Utility function to get time until token expiry
export const useTokenExpiry = () => {
  const { user } = useAuth()

  const getTimeUntilExpiry = useCallback(async (): Promise<number | null> => {
    if (!user) return null

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.expires_at) {
        return null
      }

      const expiresAt = session.expires_at * 1000
      return Math.max(0, expiresAt - Date.now())
    } catch (error) {
      console.error('Failed to get token expiry:', error)
      return null
    }
  }, [user])

  return { getTimeUntilExpiry }
}