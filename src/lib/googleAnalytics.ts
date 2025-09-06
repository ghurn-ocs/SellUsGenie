// Google Analytics 4 Integration Service
// Handles GA4 setup, tracking, and e-commerce events

export interface GA4Config {
  measurementId: string
  enhancedEcommerce: boolean
  conversionTracking: boolean
  audienceTracking: boolean
  customDimensions: Record<string, string>
  customMetrics: Record<string, number>
}

export interface GA4EcommerceItem {
  item_id: string
  item_name: string
  category: string
  quantity: number
  price: number
  currency?: string
  item_brand?: string
  item_category2?: string
  item_category3?: string
  item_variant?: string
}

export interface GA4EcommerceEvent {
  currency: string
  value: number
  transaction_id?: string
  coupon?: string
  shipping?: number
  tax?: number
  items: GA4EcommerceItem[]
}

export class GoogleAnalyticsService {
  private measurementId: string | null = null
  private config: GA4Config | null = null
  private isInitialized = false

  /**
   * Initialize Google Analytics 4
   */
  async initialize(config: GA4Config): Promise<void> {
    this.config = config
    this.measurementId = config.measurementId

    try {
      // Load GA4 script if not already loaded
      await this.loadGA4Script()
      
      // Configure GA4
      this.configureGA4(config)
      
      this.isInitialized = true
      console.log('✅ Google Analytics 4 initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Google Analytics 4:', error)
      throw error
    }
  }

  /**
   * Load GA4 script dynamically
   */
  private async loadGA4Script(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${this.measurementId}"]`)) {
        resolve()
        return
      }

      // Create and load script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load GA4 script'))
      
      document.head.appendChild(script)

      // Initialize gtag function
      if (!(window as any).gtag) {
        (window as any).dataLayer = (window as any).dataLayer || []
        ;(window as any).gtag = function(...args: any[]) {
          (window as any).dataLayer.push(args)
        }
      }
    })
  }

  /**
   * Configure GA4 with custom settings
   */
  private configureGA4(config: GA4Config): void {
    if (!(window as any).gtag) return

    const gtag = (window as any).gtag

    // Initialize GA4
    gtag('js', new Date())
    gtag('config', config.measurementId, {
      enhanced_ecommerce: config.enhancedEcommerce,
      allow_google_signals: config.audienceTracking,
      send_page_view: true,
      custom_map: config.customDimensions
    })

    // Set up custom dimensions
    Object.entries(config.customDimensions).forEach(([key, value]) => {
      gtag('config', config.measurementId, {
        custom_map: { [key]: value }
      })
    })
  }

  /**
   * Track page view
   */
  trackPageView(page_title?: string, page_location?: string): void {
    if (!this.isInitialized || !(window as any).gtag) return

    const gtag = (window as any).gtag
    gtag('event', 'page_view', {
      page_title,
      page_location: page_location || window.location.href
    })
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, parameters: Record<string, any> = {}): void {
    if (!this.isInitialized || !(window as any).gtag) return

    const gtag = (window as any).gtag
    gtag('event', eventName, parameters)
  }

  /**
   * Track e-commerce events
   */
  
  // Track purchase
  trackPurchase(event: GA4EcommerceEvent): void {
    if (!this.isInitialized || !(window as any).gtag) return

    const gtag = (window as any).gtag
    gtag('event', 'purchase', {
      transaction_id: event.transaction_id,
      value: event.value,
      currency: event.currency,
      coupon: event.coupon,
      shipping: event.shipping,
      tax: event.tax,
      items: event.items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        item_brand: item.item_brand,
        item_category2: item.item_category2,
        item_category3: item.item_category3,
        item_variant: item.item_variant
      }))
    })
  }

  // Track add to cart
  trackAddToCart(event: Partial<GA4EcommerceEvent>): void {
    if (!this.isInitialized || !(window as any).gtag) return

    const gtag = (window as any).gtag
    gtag('event', 'add_to_cart', {
      currency: event.currency,
      value: event.value,
      items: event.items
    })
  }

  // Track remove from cart
  trackRemoveFromCart(event: Partial<GA4EcommerceEvent>): void {
    if (!this.isInitialized || !(window as any).gtag) return

    const gtag = (window as any).gtag
    gtag('event', 'remove_from_cart', {
      currency: event.currency,
      value: event.value,
      items: event.items
    })
  }

  // Track view item
  trackViewItem(item: GA4EcommerceItem, currency: string = 'USD'): void {
    if (!this.isInitialized || !(window as any).gtag) return

    const gtag = (window as any).gtag
    gtag('event', 'view_item', {
      currency,
      value: item.price,
      items: [item]
    })
  }

  // Track begin checkout
  trackBeginCheckout(event: Partial<GA4EcommerceEvent>): void {
    if (!this.isInitialized || !(window as any).gtag) return

    const gtag = (window as any).gtag
    gtag('event', 'begin_checkout', {
      currency: event.currency,
      value: event.value,
      items: event.items
    })
  }

  // Track search
  trackSearch(searchTerm: string): void {
    this.trackEvent('search', {
      search_term: searchTerm
    })
  }

  // Track signup
  trackSignup(method: string = 'email'): void {
    this.trackEvent('sign_up', {
      method
    })
  }

  // Track login
  trackLogin(method: string = 'email'): void {
    this.trackEvent('login', {
      method
    })
  }

  /**
   * Validate GA4 Measurement ID format
   */
  static validateMeasurementId(measurementId: string): { isValid: boolean; error?: string } {
    const ga4Pattern = /^G-[A-Z0-9]{10}$/
    
    if (!measurementId) {
      return { isValid: false, error: 'Measurement ID is required' }
    }
    
    if (!ga4Pattern.test(measurementId)) {
      return { isValid: false, error: 'Invalid GA4 Measurement ID format. Should be G-XXXXXXXXXX' }
    }
    
    return { isValid: true }
  }

  /**
   * Test GA4 connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'GA4 not initialized' }
      }

      // Send a test event
      this.trackEvent('test_connection', {
        test_timestamp: new Date().toISOString()
      })

      // In a real implementation, you might want to check if the event was received
      // This would require GA4 Reporting API integration
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): GA4Config | null {
    return this.config
  }

  /**
   * Check if GA4 is initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }

  /**
   * Disable GA4 tracking
   */
  disable(): void {
    if (!(window as any).gtag) return

    const gtag = (window as any).gtag
    gtag('config', this.measurementId, {
      send_page_view: false
    })
    
    this.isInitialized = false
  }

  /**
   * Enable GA4 tracking
   */
  enable(): void {
    if (!this.config) return

    this.configureGA4(this.config)
    this.isInitialized = true
  }
}

// Export singleton instance
export const googleAnalytics = new GoogleAnalyticsService()

// TypeScript declarations for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}