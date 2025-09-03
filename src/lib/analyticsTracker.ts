// Real-time Analytics Tracking System
// Tracks events and sends them to Supabase analytics_events table

import { supabase } from './supabase'

interface AnalyticsEvent {
  event_name: string
  event_category?: string
  parameters?: Record<string, any>
  user_id?: string
  session_id?: string
  visitor_id?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  page_url?: string
  page_title?: string
  device_type?: string
  browser?: string
  os?: string
}

class AnalyticsTracker {
  private storeId: string | null = null
  private sessionId: string
  private visitorId: string
  private userId: string | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
    this.visitorId = this.getOrCreateVisitorId()
    this.detectDeviceInfo()
  }

  // Initialize with store context
  initialize(storeId: string, userId?: string) {
    this.storeId = storeId
    this.userId = userId || null
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get or create persistent visitor ID
  private getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem('analytics_visitor_id')
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('analytics_visitor_id', visitorId)
    }
    return visitorId
  }

  // Detect device and browser information
  private detectDeviceInfo() {
    const userAgent = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent)
    
    this.deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
    this.browser = this.getBrowserName(userAgent)
    this.os = this.getOSName(userAgent)
  }

  private deviceType: string = 'desktop'
  private browser: string = 'unknown'
  private os: string = 'unknown'

  private getBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'unknown'
  }

  private getOSName(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'unknown'
  }

  // Extract UTM parameters from URL
  private getUTMParameters(): Partial<AnalyticsEvent> {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined
    }
  }

  // Track generic event
  async trackEvent(event: Partial<AnalyticsEvent>) {
    if (!this.storeId) {
      console.warn('Analytics tracker not initialized with store ID')
      return
    }

    const fullEvent: AnalyticsEvent = {
      event_name: event.event_name!,
      event_category: event.event_category || 'general',
      parameters: event.parameters || {},
      user_id: this.userId,
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      page_url: window.location.href,
      page_title: document.title,
      device_type: this.deviceType,
      browser: this.browser,
      os: this.os,
      ...this.getUTMParameters(),
      ...event
    }

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          store_id: this.storeId,
          event_name: fullEvent.event_name,
          event_category: fullEvent.event_category || 'general',
          parameters: fullEvent.parameters || {},
          user_id: fullEvent.user_id || null,
          session_id: fullEvent.session_id,
          visitor_id: fullEvent.visitor_id,
          source: 'internal', // Analytics event source (internal tracking)
          utm_source: fullEvent.utm_source || null,
          utm_medium: fullEvent.utm_medium || null,
          utm_campaign: fullEvent.utm_campaign || null,
          utm_term: fullEvent.utm_term || null,
          utm_content: fullEvent.utm_content || null,
          page_url: fullEvent.page_url,
          page_title: fullEvent.page_title,
          device_type: fullEvent.device_type,
          browser: fullEvent.browser,
          os: fullEvent.os,
          ip_address: null, // Will be set server-side
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        })

      if (error) {
        console.error('Failed to track analytics event:', error)
      }
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  // Track page view
  async trackPageView(page?: string) {
    await this.trackEvent({
      event_name: 'page_view',
      event_category: 'engagement',
      parameters: {
        page: page || window.location.pathname
      }
    })
  }

  // Track purchase
  async trackPurchase(orderData: {
    order_id: string
    total: number
    currency: string
    items?: Array<{
      product_id: string
      product_name: string
      quantity: number
      price: number
      category?: string
    }>
  }) {
    await this.trackEvent({
      event_name: 'purchase',
      event_category: 'ecommerce',
      parameters: {
        transaction_id: orderData.order_id,
        value: orderData.total,
        currency: orderData.currency,
        items: orderData.items
      }
    })

    // Track attribution touchpoint for conversion
    await this.trackAttributionTouchpoint({
      converted: true,
      order_id: orderData.order_id,
      conversion_value: orderData.total
    })
  }

  // Track add to cart
  async trackAddToCart(productData: {
    product_id: string
    product_name: string
    price: number
    quantity: number
    category?: string
  }) {
    await this.trackEvent({
      event_name: 'add_to_cart',
      event_category: 'ecommerce',
      parameters: {
        item_id: productData.product_id,
        item_name: productData.product_name,
        price: productData.price,
        quantity: productData.quantity,
        item_category: productData.category
      }
    })
  }

  // Track search
  async trackSearch(query: string, resultsCount?: number) {
    await this.trackEvent({
      event_name: 'search',
      event_category: 'engagement',
      parameters: {
        search_term: query,
        results_count: resultsCount
      }
    })
  }

  // Track product view
  async trackProductView(productData: {
    product_id: string
    product_name: string
    price: number
    category?: string
  }) {
    await this.trackEvent({
      event_name: 'view_item',
      event_category: 'ecommerce',
      parameters: {
        item_id: productData.product_id,
        item_name: productData.product_name,
        price: productData.price,
        item_category: productData.category
      }
    })
  }

  // Track user registration
  async trackRegistration(method: string = 'email') {
    await this.trackEvent({
      event_name: 'sign_up',
      event_category: 'engagement',
      parameters: {
        method
      }
    })
  }

  // Track user login
  async trackLogin(method: string = 'email') {
    await this.trackEvent({
      event_name: 'login',
      event_category: 'engagement',
      parameters: {
        method
      }
    })
  }

  // Track attribution touchpoint
  async trackAttributionTouchpoint(data: {
    converted?: boolean
    order_id?: string
    conversion_value?: number
  }) {
    if (!this.storeId) return

    const utmParams = this.getUTMParameters()
    
    try {
      await supabase
        .from('attribution_touchpoints')
        .insert({
          store_id: this.storeId,
          customer_id: this.userId,
          session_id: this.sessionId,
          channel: utmParams.utm_medium || 'direct',
          source: utmParams.utm_source || 'direct',
          medium: utmParams.utm_medium || 'direct',
          campaign: utmParams.utm_campaign || null,
          content: utmParams.utm_content || null,
          term: utmParams.utm_term || null,
          converted: data.converted || false,
          order_id: data.order_id || null,
          conversion_value: data.conversion_value || 0,
          value_contribution: data.conversion_value || 0 // Simple attribution model
        })
    } catch (error) {
      console.error('Failed to track attribution touchpoint:', error)
    }
  }

  // Update user ID when user logs in
  setUserId(userId: string) {
    this.userId = userId
  }

  // Clear user ID when user logs out
  clearUserId() {
    this.userId = null
  }
}

// Global analytics tracker instance
export const analytics = new AnalyticsTracker()

// React hook for analytics tracking
import { useStore } from '../contexts/StoreContext'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

export const useAnalyticsTracker = () => {
  const { currentStore } = useStore()
  const { user } = useAuth()

  useEffect(() => {
    if (currentStore?.id) {
      analytics.initialize(currentStore.id, user?.id)
    }
  }, [currentStore?.id, user?.id])

  useEffect(() => {
    if (user?.id) {
      analytics.setUserId(user.id)
    } else {
      analytics.clearUserId()
    }
  }, [user?.id])

  // Track page views automatically
  useEffect(() => {
    if (currentStore?.id) {
      analytics.trackPageView()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore?.id])

  return analytics
}