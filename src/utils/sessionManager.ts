import { supabase } from '../lib/supabase'

// Session timeout configuration (in milliseconds)
export const SESSION_CONFIG = {
  // 30 minutes of inactivity before timeout
  TIMEOUT_DURATION: 30 * 60 * 1000,
  // Show warning 5 minutes before timeout
  WARNING_DURATION: 5 * 60 * 1000,
  // Events that reset the activity timer
  ACTIVITY_EVENTS: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'] as const,
  // Minimum time between activity checks (to avoid excessive processing)
  ACTIVITY_THROTTLE: 1000,
} as const

export interface SessionState {
  isActive: boolean
  lastActivity: number
  showWarning: boolean
  timeUntilTimeout: number
}

export type SessionEventListener = (state: SessionState) => void

class SessionManager {
  private listeners: Set<SessionEventListener> = new Set()
  private activityTimer: NodeJS.Timeout | null = null
  private warningTimer: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private lastActivityCheck: number = Date.now()
  private showWarning: boolean = false
  private isActive: boolean = true
  private isClient: boolean = false

  constructor() {
    // Only initialize browser-specific code on the client side
    if (typeof window !== 'undefined') {
      this.isClient = true
      this.bindActivityListeners()
      this.startActivityTimer()
      this.handleVisibilityChange()
    }
  }

  // Subscribe to session state changes
  subscribe(listener: SessionEventListener): () => void {
    this.listeners.add(listener)
    // Immediately call with current state
    listener(this.getSessionState())
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Get current session state
  getSessionState(): SessionState {
    const timeUntilTimeout = Math.max(0, this.lastActivity + SESSION_CONFIG.TIMEOUT_DURATION - Date.now())
    return {
      isActive: this.isActive,
      lastActivity: this.lastActivity,
      showWarning: this.showWarning,
      timeUntilTimeout,
    }
  }

  // Reset activity timer (called when user is active)
  resetActivity(): void {
    const now = Date.now()
    
    // Throttle activity updates to avoid excessive processing
    if (now - this.lastActivityCheck < SESSION_CONFIG.ACTIVITY_THROTTLE) {
      return
    }

    this.lastActivityCheck = now
    this.lastActivity = now
    this.showWarning = false
    this.isActive = true

    this.clearTimers()
    this.startActivityTimer()
    this.notifyListeners()
  }

  // Extend session (called when user chooses to stay logged in)
  extendSession(): void {
    this.resetActivity()
  }

  // Force logout due to inactivity
  async forceLogout(): Promise<void> {
    this.isActive = false
    this.clearTimers()
    this.removeActivityListeners()
    
    try {
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear any sensitive data from localStorage/sessionStorage
      this.clearSensitiveData()
      
      // Notify listeners of forced logout
      this.notifyListeners()
    } catch (error) {
      console.error('Error during forced logout:', error)
    }
  }

  // Check if session is still valid with Supabase
  async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        return false
      }

      // Check if token is close to expiry and needs refresh
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
      const now = Date.now()
      const isExpiringSoon = (expiresAt - now) < (5 * 60 * 1000) // 5 minutes before expiry

      if (isExpiringSoon) {
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.error('Failed to refresh session:', refreshError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  // Clean up when component unmounts or user logs out
  cleanup(): void {
    this.clearTimers()
    this.removeActivityListeners()
    this.listeners.clear()
  }

  private bindActivityListeners(): void {
    if (!this.isClient || typeof document === 'undefined') return
    
    SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true })
    })
  }

  private removeActivityListeners(): void {
    if (!this.isClient || typeof document === 'undefined') return
    
    SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
      document.removeEventListener(event, this.handleActivity)
    })
  }

  private handleActivity = (): void => {
    if (this.isActive) {
      this.resetActivity()
    }
  }

  private startActivityTimer(): void {
    // Set warning timer
    this.warningTimer = setTimeout(() => {
      this.showWarning = true
      this.notifyListeners()
    }, SESSION_CONFIG.TIMEOUT_DURATION - SESSION_CONFIG.WARNING_DURATION)

    // Set timeout timer
    this.activityTimer = setTimeout(() => {
      this.forceLogout()
    }, SESSION_CONFIG.TIMEOUT_DURATION)
  }

  private clearTimers(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
      this.activityTimer = null
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }
  }

  private handleVisibilityChange(): void {
    if (!this.isClient || typeof document === 'undefined') return
    
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && this.isActive) {
        // When tab becomes visible, validate session
        const isValid = await this.validateSession()
        if (!isValid) {
          this.forceLogout()
        } else {
          this.resetActivity()
        }
      }
    })
  }

  private clearSensitiveData(): void {
    if (!this.isClient || typeof window === 'undefined') return
    
    // Clear any application-specific sensitive data
    const keysToRemove = [
      'analytics_session_id',
      'current_store_id',
      'cart_data',
      'checkout_data'
    ]
    
    keysToRemove.forEach(key => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key)
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key)
      }
    })
  }

  private notifyListeners(): void {
    const state = this.getSessionState()
    this.listeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        console.error('Error in session state listener:', error)
      }
    })
  }
}

// Export lazy singleton instance - only create when actually needed on client side
let _sessionManager: SessionManager | null = null

export const getSessionManager = (): SessionManager => {
  if (!_sessionManager) {
    _sessionManager = new SessionManager()
  }
  return _sessionManager
}

// For backwards compatibility - this will only work on client side
export const sessionManager = typeof window !== 'undefined' ? getSessionManager() : {} as SessionManager

// Utility functions for common use cases
export const useSessionTimeout = () => {
  return {
    resetActivity: () => typeof window !== 'undefined' ? getSessionManager().resetActivity() : undefined,
    extendSession: () => typeof window !== 'undefined' ? getSessionManager().extendSession() : undefined,
    forceLogout: () => typeof window !== 'undefined' ? getSessionManager().forceLogout() : Promise.resolve(),
    validateSession: () => typeof window !== 'undefined' ? getSessionManager().validateSession() : Promise.resolve(false),
    subscribe: (listener: SessionEventListener) => typeof window !== 'undefined' ? getSessionManager().subscribe(listener) : () => {},
  }
}

// Format time remaining for display
export const formatTimeRemaining = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}