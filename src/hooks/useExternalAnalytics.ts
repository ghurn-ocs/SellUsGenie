// External Analytics Integration Hook
// Manages initialization and event tracking for GA4 and Meta Pixel

import { useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { googleAnalytics } from '../lib/googleAnalytics'
import { metaPixel } from '../lib/metaPixel'
import type { AnalyticsIntegration } from './useAnalyticsConfig'

interface AnalyticsEventData {
  // Common fields
  currency?: string
  value?: number
  
  // Product data
  items?: Array<{
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
  }>
  
  // Page data
  page_title?: string
  page_location?: string
  
  // Search data
  search_term?: string
  
  // User data
  user_id?: string
  
  // Transaction data
  transaction_id?: string
  coupon?: string
  shipping?: number
  tax?: number
}

export const useExternalAnalytics = (storeId: string) => {
  // Fetch store integrations
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['analytics-integrations', storeId],
    queryFn: async (): Promise<AnalyticsIntegration[]> => {
      const { data, error } = await supabase
        .from('store_integrations')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_enabled', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })

  // Initialize analytics services when integrations change
  useEffect(() => {
    if (isLoading || !integrations.length) return

    const initializeAnalytics = async () => {
      for (const integration of integrations) {
        try {
          switch (integration.integration_type) {
            case 'google_analytics':
              if (integration.config.tracking_id) {
                await googleAnalytics.initialize({
                  measurementId: integration.config.tracking_id,
                  enhancedEcommerce: integration.config.enhanced_ecommerce ?? true,
                  conversionTracking: integration.config.conversion_tracking ?? true,
                  audienceTracking: integration.config.audience_tracking ?? false,
                  customDimensions: {},
                  customMetrics: {}
                })
                console.log('✅ Google Analytics 4 initialized for store:', storeId)
              }
              break
              
            case 'facebook_pixel':
              if (integration.config.pixel_id) {
                await metaPixel.initialize({
                  pixelId: integration.config.pixel_id,
                  enableAdvancedMatching: integration.config.enable_advanced_matching ?? true,
                  enableAutoConfig: integration.config.enable_auto_config ?? true
                })
                console.log('✅ Meta Pixel initialized for store:', storeId)
              }
              break
          }
        } catch (error) {
          console.error(`Failed to initialize ${integration.integration_type}:`, error)
        }
      }
    }

    initializeAnalytics()
  }, [integrations, isLoading, storeId])

  // Tracking functions
  const trackPageView = useCallback((data: AnalyticsEventData = {}) => {
    const pageData = {
      page_title: data.page_title || document.title,
      page_location: data.page_location || window.location.href,
      user_id: data.user_id
    }

    // Track with Google Analytics
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackPageView(pageData.page_title, pageData.page_location)
    }

    // Track with Meta Pixel
    if (metaPixel.isReady()) {
      metaPixel.trackPageView()
    }
  }, [])

  const trackPurchase = useCallback((data: AnalyticsEventData) => {
    if (!data.transaction_id || !data.value || !data.currency) {
      console.warn('Purchase tracking requires transaction_id, value, and currency')
      return
    }

    // Track with Google Analytics
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackPurchase({
        transaction_id: data.transaction_id,
        value: data.value,
        currency: data.currency,
        coupon: data.coupon,
        shipping: data.shipping,
        tax: data.tax,
        items: data.items || []
      })
    }

    // Track with Meta Pixel
    if (metaPixel.isReady()) {
      metaPixel.trackPurchase({
        currency: data.currency,
        value: data.value,
        content_ids: data.items?.map(item => item.item_id) || [],
        content_type: 'product',
        num_items: data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        contents: data.items?.map(item => ({
          id: item.item_id,
          quantity: item.quantity,
          item_price: item.price
        }))
      })
    }
  }, [])

  const trackAddToCart = useCallback((data: AnalyticsEventData) => {
    if (!data.currency || !data.value || !data.items?.length) {
      console.warn('Add to cart tracking requires currency, value, and items')
      return
    }

    // Track with Google Analytics
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackAddToCart({
        currency: data.currency,
        value: data.value,
        items: data.items
      })
    }

    // Track with Meta Pixel
    if (metaPixel.isReady()) {
      metaPixel.trackAddToCart({
        currency: data.currency,
        value: data.value,
        content_ids: data.items.map(item => item.item_id),
        content_type: 'product',
        contents: data.items.map(item => ({
          id: item.item_id,
          quantity: item.quantity,
          item_price: item.price
        }))
      })
    }
  }, [])

  const trackViewItem = useCallback((data: AnalyticsEventData) => {
    if (!data.items?.length || !data.currency) {
      console.warn('View item tracking requires items and currency')
      return
    }

    const item = data.items[0]

    // Track with Google Analytics
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackViewItem(item, data.currency)
    }

    // Track with Meta Pixel
    if (metaPixel.isReady()) {
      metaPixel.trackViewContent({
        currency: data.currency,
        value: item.price,
        content_ids: [item.item_id],
        content_type: 'product',
        content_name: item.item_name,
        content_category: item.category
      })
    }
  }, [])

  const trackBeginCheckout = useCallback((data: AnalyticsEventData) => {
    if (!data.currency || !data.value || !data.items?.length) {
      console.warn('Begin checkout tracking requires currency, value, and items')
      return
    }

    // Track with Google Analytics
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackBeginCheckout({
        currency: data.currency,
        value: data.value,
        items: data.items
      })
    }

    // Track with Meta Pixel
    if (metaPixel.isReady()) {
      metaPixel.trackInitiateCheckout({
        currency: data.currency,
        value: data.value,
        content_ids: data.items.map(item => item.item_id),
        content_type: 'product',
        num_items: data.items.reduce((sum, item) => sum + item.quantity, 0),
        contents: data.items.map(item => ({
          id: item.item_id,
          quantity: item.quantity,
          item_price: item.price
        }))
      })
    }
  }, [])

  const trackSearch = useCallback((data: AnalyticsEventData) => {
    if (!data.search_term) {
      console.warn('Search tracking requires search_term')
      return
    }

    // Track with Google Analytics
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackSearch(data.search_term)
    }

    // Track with Meta Pixel
    if (metaPixel.isReady()) {
      metaPixel.trackSearch(data.search_term, {
        currency: data.currency || 'USD',
        value: data.value || 0
      })
    }
  }, [])

  const trackSignup = useCallback((data: AnalyticsEventData = {}) => {
    // Track with Google Analytics
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackSignup('email')
    }

    // Track with Meta Pixel
    if (metaPixel.isReady()) {
      metaPixel.trackCompleteRegistration({
        currency: data.currency || 'USD',
        value: data.value || 0
      })
    }
  }, [])

  const trackLogin = useCallback((data: AnalyticsEventData = {}) => {
    // Track with Google Analytics
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackLogin('email')
    }
    
    // Meta Pixel doesn't have a standard login event, but we can track it as a custom event
    if (metaPixel.isReady()) {
      metaPixel.trackCustomConversion('Login', {
        source: 'SellUsGenie',
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  const trackCustomEvent = useCallback((eventName: string, parameters: Record<string, any> = {}) => {
    // Track with Google Analytics
    if (googleAnalytics.isReady()) {
      googleAnalytics.trackEvent(eventName, parameters)
    }

    // Track with Meta Pixel
    if (metaPixel.isReady()) {
      metaPixel.trackCustomConversion(eventName, parameters)
    }
  }, [])

  // Set user properties for enhanced matching
  const setUserProperties = useCallback((userData: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    userId?: string
  }) => {
    if (metaPixel.isReady()) {
      metaPixel.setUserProperties({
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        externalId: userData.userId
      })
    }
  }, [])

  return {
    isLoading,
    integrations,
    // Tracking methods
    trackPageView,
    trackPurchase,
    trackAddToCart,
    trackViewItem,
    trackBeginCheckout,
    trackSearch,
    trackSignup,
    trackLogin,
    trackCustomEvent,
    setUserProperties,
    // Service status
    ga4Ready: googleAnalytics.isReady(),
    metaPixelReady: metaPixel.isReady()
  }
}

// Helper hook for automatic page view tracking
export const usePageViewTracking = (storeId: string, dependencies: any[] = []) => {
  const { trackPageView } = useExternalAnalytics(storeId)

  useEffect(() => {
    trackPageView()
  }, [trackPageView, ...dependencies])
}