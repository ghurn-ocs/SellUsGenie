import { useEffect, useRef } from 'react'
// @react-query-skip: Event tracking hook, not data fetching
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { AnalyticsTracker } from '../services/analyticsService'

export const useAnalyticsTracking = (storeId?: string) => {
  const { user } = useAuth()
  const { currentStore } = useStore()
  const trackerRef = useRef<AnalyticsTracker | null>(null)
  const pageViewStartTime = useRef<number>(Date.now())

  // Use provided storeId or fall back to currentStore
  const activeStoreId = storeId || currentStore?.id

  // Initialize tracker when store is available
  useEffect(() => {
    if (activeStoreId) {
      trackerRef.current = new AnalyticsTracker(activeStoreId, user?.id)
    }
  }, [activeStoreId, user?.id])

  // Track page views
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (trackerRef.current) {
      trackerRef.current.trackPageView(pagePath, pageTitle)
      pageViewStartTime.current = Date.now()
    }
  }

  // Track product views with duration
  const trackProductView = (productId: string) => {
    if (trackerRef.current) {
      const viewDuration = Math.floor((Date.now() - pageViewStartTime.current) / 1000)
      trackerRef.current.trackProductView(productId, viewDuration)
    }
  }

  // Track cart events
  const trackCartEvent = async (
    eventType: 'add_to_cart' | 'remove_from_cart' | 'view_cart' | 'start_checkout' | 'abandon_cart' | 'complete_purchase',
    productId?: string,
    quantity?: number,
    cartValue?: number
  ) => {
    if (trackerRef.current) {
      await trackerRef.current.trackCartEvent(eventType, productId, quantity, cartValue)
    }
  }

  // Update session with conversion
  const markConversion = () => {
    if (trackerRef.current) {
      trackerRef.current.updateSession(true)
    }
  }

  // Track page view on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const pagePath = window.location.pathname
      const pageTitle = document.title
      trackPageView(pagePath, pageTitle)
    }

    // Track initial page load
    handleRouteChange()

    // Listen for route changes (for SPA navigation)
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [activeStoreId])

  return {
    trackPageView,
    trackProductView,
    trackCartEvent,
    markConversion
  }
}