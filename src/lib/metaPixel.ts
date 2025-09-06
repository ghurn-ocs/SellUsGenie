// Meta Pixel Integration Service
// Handles Facebook Pixel setup, tracking, and e-commerce events

export interface MetaPixelConfig {
  pixelId: string
  enableAdvancedMatching: boolean
  enableAutoConfig: boolean
  customParameters?: Record<string, any>
}

export interface MetaPixelEcommerceEvent {
  currency: string
  value: number
  content_ids?: string[]
  content_type?: string
  content_name?: string
  content_category?: string
  num_items?: number
  search_string?: string
  contents?: Array<{
    id: string
    quantity: number
    item_price?: number
  }>
  predicted_ltv?: number
  status?: string
}

export class MetaPixelService {
  private pixelId: string | null = null
  private config: MetaPixelConfig | null = null
  private isInitialized = false

  /**
   * Initialize Meta Pixel
   */
  async initialize(config: MetaPixelConfig): Promise<void> {
    this.config = config
    this.pixelId = config.pixelId

    try {
      // Load Facebook Pixel script if not already loaded
      await this.loadPixelScript()
      
      // Configure Meta Pixel
      this.configurePixel(config)
      
      this.isInitialized = true
      console.log('✅ Meta Pixel initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Meta Pixel:', error)
      throw error
    }
  }

  /**
   * Load Meta Pixel script dynamically
   */
  private async loadPixelScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src*="connect.facebook.net"]`)) {
        resolve()
        return
      }

      // Initialize fbq function
      if (!(window as any).fbq) {
        const f = (window as any).fbq = function() {
          if (f.callMethod) {
            f.callMethod.apply(f, arguments)
          } else {
            f.queue.push(arguments)
          }
        }
        if (!f._fbq) f._fbq = f
        f.push = f
        f.loaded = true
        f.version = '2.0'
        f.queue = []
      }

      // Create and load script
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Meta Pixel script'))
      
      document.head.appendChild(script)
    })
  }

  /**
   * Configure Meta Pixel with custom settings
   */
  private configurePixel(config: MetaPixelConfig): void {
    if (!(window as any).fbq) return

    const fbq = (window as any).fbq

    // Initialize pixel
    fbq('init', config.pixelId, {
      em: 'insert_email_variable', // Enhanced matching
      external_id: 'insert_external_id_variable',
      ...config.customParameters
    })

    // Enable advanced matching if configured
    if (config.enableAdvancedMatching) {
      fbq('init', config.pixelId, {}, {
        agent: 'wordpress-facebook-for-woocommerce',
        em: 'insert_email_variable'
      })
    }

    // Enable automatic configuration if configured
    if (config.enableAutoConfig) {
      fbq('track', 'PageView')
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, parameters: Record<string, any> = {}): void {
    if (!this.isInitialized || !(window as any).fbq) return

    const fbq = (window as any).fbq
    fbq('track', eventName, parameters)
  }

  /**
   * Track standard event
   */
  trackStandardEvent(eventName: string, parameters: MetaPixelEcommerceEvent = {} as MetaPixelEcommerceEvent): void {
    if (!this.isInitialized || !(window as any).fbq) return

    const fbq = (window as any).fbq
    fbq('track', eventName, parameters)
  }

  /**
   * E-commerce event tracking methods
   */
  
  // Track page view
  trackPageView(): void {
    this.trackStandardEvent('PageView')
  }

  // Track view content
  trackViewContent(event: MetaPixelEcommerceEvent): void {
    this.trackStandardEvent('ViewContent', {
      content_ids: event.content_ids || [],
      content_type: event.content_type || 'product',
      content_name: event.content_name,
      content_category: event.content_category,
      currency: event.currency,
      value: event.value
    })
  }

  // Track add to cart
  trackAddToCart(event: MetaPixelEcommerceEvent): void {
    this.trackStandardEvent('AddToCart', {
      content_ids: event.content_ids || [],
      content_type: event.content_type || 'product',
      currency: event.currency,
      value: event.value,
      contents: event.contents
    })
  }

  // Track add to wishlist
  trackAddToWishlist(event: MetaPixelEcommerceEvent): void {
    this.trackStandardEvent('AddToWishlist', {
      content_ids: event.content_ids || [],
      content_type: event.content_type || 'product',
      currency: event.currency,
      value: event.value,
      contents: event.contents
    })
  }

  // Track initiate checkout
  trackInitiateCheckout(event: MetaPixelEcommerceEvent): void {
    this.trackStandardEvent('InitiateCheckout', {
      content_ids: event.content_ids || [],
      content_type: event.content_type || 'product',
      currency: event.currency,
      value: event.value,
      num_items: event.num_items,
      contents: event.contents
    })
  }

  // Track add payment info
  trackAddPaymentInfo(event: MetaPixelEcommerceEvent): void {
    this.trackStandardEvent('AddPaymentInfo', {
      content_ids: event.content_ids || [],
      content_type: event.content_type || 'product',
      currency: event.currency,
      value: event.value,
      contents: event.contents
    })
  }

  // Track purchase
  trackPurchase(event: MetaPixelEcommerceEvent): void {
    this.trackStandardEvent('Purchase', {
      content_ids: event.content_ids || [],
      content_type: event.content_type || 'product',
      currency: event.currency,
      value: event.value,
      num_items: event.num_items,
      contents: event.contents,
      predicted_ltv: event.predicted_ltv
    })
  }

  // Track search
  trackSearch(searchString: string, event?: Partial<MetaPixelEcommerceEvent>): void {
    this.trackStandardEvent('Search', {
      search_string: searchString,
      content_ids: event?.content_ids,
      content_type: event?.content_type || 'product',
      currency: event?.currency || 'USD',
      value: event?.value || 0
    })
  }

  // Track lead generation
  trackLead(event?: Partial<MetaPixelEcommerceEvent>): void {
    this.trackStandardEvent('Lead', {
      content_name: event?.content_name,
      content_category: event?.content_category,
      currency: event?.currency || 'USD',
      value: event?.value || 0
    })
  }

  // Track complete registration
  trackCompleteRegistration(event?: Partial<MetaPixelEcommerceEvent>): void {
    this.trackStandardEvent('CompleteRegistration', {
      content_name: event?.content_name,
      currency: event?.currency || 'USD',
      value: event?.value || 0,
      status: event?.status || 'registered'
    })
  }

  /**
   * Advanced tracking methods
   */

  // Track custom conversion
  trackCustomConversion(conversionName: string, parameters: Record<string, any> = {}): void {
    if (!this.isInitialized || !(window as any).fbq) return

    const fbq = (window as any).fbq
    fbq('trackCustom', conversionName, parameters)
  }

  // Track single custom audience event
  trackSingleCustom(eventName: string, parameters: Record<string, any> = {}): void {
    if (!this.isInitialized || !(window as any).fbq) return

    const fbq = (window as any).fbq
    fbq('trackSingle', this.pixelId, eventName, parameters)
  }

  /**
   * Utility methods
   */

  // Validate Pixel ID format
  static validatePixelId(pixelId: string): { isValid: boolean; error?: string } {
    if (!pixelId) {
      return { isValid: false, error: 'Pixel ID is required' }
    }
    
    // Meta Pixel IDs are typically 15-16 digit numbers
    const pixelIdPattern = /^\d{15,16}$/
    if (!pixelIdPattern.test(pixelId)) {
      return { isValid: false, error: 'Invalid Meta Pixel ID format. Should be 15-16 digits' }
    }
    
    return { isValid: true }
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Meta Pixel not initialized' }
      }

      // Send a test event
      this.trackCustomConversion('TestConnection', {
        test_timestamp: new Date().toISOString(),
        source: 'SellUsGenie'
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  // Get current configuration
  getConfig(): MetaPixelConfig | null {
    return this.config
  }

  // Check if initialized
  isReady(): boolean {
    return this.isInitialized
  }

  // Disable tracking
  disable(): void {
    if (!(window as any).fbq) return
    // Meta Pixel doesn't have a direct disable method, but we can stop tracking
    this.isInitialized = false
  }

  // Enable tracking
  enable(): void {
    if (!this.config) return
    this.configurePixel(this.config)
    this.isInitialized = true
  }

  // Set user properties for enhanced matching
  setUserProperties(userData: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    dateOfBirth?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    externalId?: string
  }): void {
    if (!this.isInitialized || !(window as any).fbq) return

    const fbq = (window as any).fbq
    const userData_hashed: Record<string, string> = {}

    // Hash sensitive data before sending
    if (userData.email) userData_hashed.em = userData.email.toLowerCase().trim()
    if (userData.phone) userData_hashed.ph = userData.phone.replace(/[^0-9]/g, '')
    if (userData.firstName) userData_hashed.fn = userData.firstName.toLowerCase().trim()
    if (userData.lastName) userData_hashed.ln = userData.lastName.toLowerCase().trim()
    if (userData.dateOfBirth) userData_hashed.db = userData.dateOfBirth
    if (userData.city) userData_hashed.ct = userData.city.toLowerCase().trim()
    if (userData.state) userData_hashed.st = userData.state.toLowerCase().trim()
    if (userData.zipCode) userData_hashed.zp = userData.zipCode
    if (userData.country) userData_hashed.country = userData.country.toLowerCase().trim()
    if (userData.externalId) userData_hashed.external_id = userData.externalId

    // Initialize with enhanced matching data
    fbq('init', this.pixelId, userData_hashed)
  }
}

// Export singleton instance
export const metaPixel = new MetaPixelService()

// TypeScript declarations for fbq
declare global {
  interface Window {
    fbq: (...args: any[]) => void
    _fbq: any
  }
}