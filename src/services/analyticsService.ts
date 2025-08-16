import { supabase } from '../lib/supabase'
import type { 
  PageView, 
  ProductView, 
  CartEvent, 
  CustomerSession,
  ProductPerformance,
  StoreAnalytics,
  CustomerBehavior 
} from '../types/analytics'

// Generate a session ID for tracking
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get or create session ID from localStorage
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Detect device type from user agent
export const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/tablet|ipad|playbook|silk/.test(userAgent)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) return 'mobile'
  return 'desktop'
}

// Get browser information
export const getBrowser = (): string => {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Unknown'
}

export class AnalyticsTracker {
  private storeId: string
  private customerId?: string
  private sessionId: string

  constructor(storeId: string, customerId?: string) {
    this.storeId = storeId
    this.customerId = customerId
    this.sessionId = getSessionId()
  }

  // Track page views
  async trackPageView(pagePath: string, pageTitle?: string): Promise<void> {
    try {
      const pageView: Omit<PageView, 'id' | 'created_at'> = {
        store_id: this.storeId,
        customer_id: this.customerId,
        session_id: this.sessionId,
        page_path: pagePath,
        page_title: pageTitle,
        referrer: document.referrer || undefined,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        browser: getBrowser()
      }

      await supabase.from('page_views').insert([pageView])
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }

  // Track product views
  async trackProductView(productId: string, viewDuration?: number): Promise<void> {
    try {
      const productView: Omit<ProductView, 'id' | 'created_at'> = {
        store_id: this.storeId,
        product_id: productId,
        customer_id: this.customerId,
        session_id: this.sessionId,
        referrer: document.referrer || undefined,
        device_type: getDeviceType(),
        view_duration: viewDuration
      }

      await supabase.from('product_views').insert([productView])
    } catch (error) {
      console.error('Error tracking product view:', error)
    }
  }

  // Track cart events
  async trackCartEvent(
    eventType: 'add_to_cart' | 'remove_from_cart' | 'view_cart' | 'start_checkout' | 'abandon_cart' | 'complete_purchase',
    productId?: string,
    quantity?: number,
    cartValue?: number
  ): Promise<void> {
    try {
      const cartEvent: Omit<CartEvent, 'id' | 'created_at'> = {
        store_id: this.storeId,
        customer_id: this.customerId,
        session_id: this.sessionId,
        event_type: eventType,
        product_id: productId,
        quantity: quantity,
        cart_value: cartValue
      }

      await supabase.from('cart_events').insert([cartEvent])
    } catch (error) {
      console.error('Error tracking cart event:', error)
    }
  }

  // Update session data
  async updateSession(converted: boolean = false): Promise<void> {
    try {
      const sessionData = {
        store_id: this.storeId,
        customer_id: this.customerId,
        session_id: this.sessionId,
        device_type: getDeviceType(),
        browser: getBrowser(),
        converted
      }

      // Upsert session data
      await supabase
        .from('customer_sessions')
        .upsert([sessionData], { onConflict: 'session_id' })
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }
}

// Analytics calculation functions
export class AnalyticsCalculator {
  constructor(private storeId: string) {}

  // Get website analytics for a date range
  async getWebsiteAnalytics(startDate: string, endDate: string) {
    try {
      // Get page views
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('*')
        .eq('store_id', this.storeId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      // Get sessions
      const { data: sessions } = await supabase
        .from('customer_sessions')
        .select('*')
        .eq('store_id', this.storeId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (!pageViews || !sessions) return null

      const totalVisitors = sessions.length
      const uniqueVisitors = new Set(sessions.map(s => s.customer_id || s.session_id)).size
      const totalPageViews = pageViews.length
      const bounceRate = sessions.filter(s => s.page_views <= 1).length / totalVisitors * 100
      const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.total_time || 0), 0) / sessions.length
      const conversions = sessions.filter(s => s.converted).length
      const conversionRate = (conversions / totalVisitors) * 100

      const deviceBreakdown = sessions.reduce((acc, session) => {
        acc[session.device_type] = (acc[session.device_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalVisitors,
        uniqueVisitors,
        pageViews: totalPageViews,
        bounceRate,
        averageSessionDuration: avgSessionDuration,
        conversionRate,
        mobileTraffic: deviceBreakdown.mobile || 0,
        desktopTraffic: deviceBreakdown.desktop || 0,
        tabletTraffic: deviceBreakdown.tablet || 0
      }
    } catch (error) {
      console.error('Error calculating website analytics:', error)
      return null
    }
  }

  // Get product performance analytics
  async getProductAnalytics(startDate: string, endDate: string) {
    try {
      // Get product views
      const { data: productViews } = await supabase
        .from('product_views')
        .select('product_id, store_id')
        .eq('store_id', this.storeId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      // Get cart events
      const { data: cartEvents } = await supabase
        .from('cart_events')
        .select('*')
        .eq('store_id', this.storeId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (!productViews || !cartEvents) return null

      // Calculate product performance
      const productPerformance = productViews.reduce((acc, view) => {
        if (!acc[view.product_id]) {
          acc[view.product_id] = {
            views: 0,
            addToCarts: 0,
            purchases: 0
          }
        }
        acc[view.product_id].views++
        return acc
      }, {} as Record<string, any>)

      // Add cart events to performance
      cartEvents.forEach(event => {
        if (event.product_id && productPerformance[event.product_id]) {
          if (event.event_type === 'add_to_cart') {
            productPerformance[event.product_id].addToCarts++
          } else if (event.event_type === 'complete_purchase') {
            productPerformance[event.product_id].purchases++
          }
        }
      })

      return productPerformance
    } catch (error) {
      console.error('Error calculating product analytics:', error)
      return null
    }
  }

  // Get customer behavior analytics
  async getCustomerAnalytics(startDate: string, endDate: string) {
    try {
      const { data: sessions } = await supabase
        .from('customer_sessions')
        .select('*')
        .eq('store_id', this.storeId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (!sessions) return null

      const totalSessions = sessions.length
      const uniqueCustomers = new Set(sessions.map(s => s.customer_id).filter(Boolean)).size
      const conversions = sessions.filter(s => s.converted).length
      const conversionRate = (conversions / totalSessions) * 100

      return {
        totalSessions,
        uniqueCustomers,
        conversions,
        conversionRate
      }
    } catch (error) {
      console.error('Error calculating customer analytics:', error)
      return null
    }
  }
}