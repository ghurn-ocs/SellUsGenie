// Analytics Integration System
// Google Analytics 4 and Meta Pixel integrations

import { supabase } from '../supabase'

export interface AnalyticsEvent {
  event_name: string
  parameters: Record<string, any>
  user_id?: string
  session_id?: string
  timestamp: Date
  source: 'ga4' | 'meta_pixel' | 'tiktok_pixel' | 'internal'
}

export class GoogleAnalytics4 {
  private measurementId: string
  private apiSecret: string

  constructor(measurementId: string, apiSecret: string) {
    this.measurementId = measurementId
    this.apiSecret = apiSecret
  }

  // Track purchase event
  async trackPurchase(orderData: {
    transaction_id: string
    value: number
    currency: string
    items: Array<{
      item_id: string
      item_name: string
      category: string
      quantity: number
      price: number
    }>
  }) {
    const event: AnalyticsEvent = {
      event_name: 'purchase',
      parameters: {
        transaction_id: orderData.transaction_id,
        value: orderData.value,
        currency: orderData.currency,
        items: orderData.items
      },
      timestamp: new Date(),
      source: 'ga4'
    }

    return this.sendEvent(event)
  }

  // Track add to cart
  async trackAddToCart(itemData: {
    currency: string
    value: number
    items: Array<{
      item_id: string
      item_name: string
      category: string
      quantity: number
      price: number
    }>
  }) {
    const event: AnalyticsEvent = {
      event_name: 'add_to_cart',
      parameters: itemData,
      timestamp: new Date(),
      source: 'ga4'
    }

    return this.sendEvent(event)
  }

  // Track page view
  async trackPageView(pageData: {
    page_title: string
    page_location: string
    user_id?: string
  }) {
    const event: AnalyticsEvent = {
      event_name: 'page_view',
      parameters: pageData,
      timestamp: new Date(),
      source: 'ga4'
    }

    return this.sendEvent(event)
  }

  // Send event to GA4
  private async sendEvent(event: AnalyticsEvent) {
    try {
      const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.generateClientId(),
          events: [{
            name: event.event_name,
            params: event.parameters
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`GA4 tracking failed: ${response.statusText}`)
      }

      // Store event in our database for internal analytics
      await this.storeEvent(event)
      
      return { success: true }
    } catch (error) {
      console.error('GA4 tracking error:', error)
      return { success: false, error }
    }
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private async storeEvent(event: AnalyticsEvent) {
    await supabase
      .from('analytics_events')
      .insert({
        event_name: event.event_name,
        parameters: event.parameters,
        user_id: event.user_id,
        session_id: event.session_id,
        timestamp: event.timestamp.toISOString(),
        source: event.source
      })
  }
}

export class MetaPixel {
  private pixelId: string
  private accessToken: string

  constructor(pixelId: string, accessToken: string) {
    this.pixelId = pixelId
    this.accessToken = accessToken
  }

  // Track purchase
  async trackPurchase(orderData: {
    value: number
    currency: string
    content_ids: string[]
    content_type: string
    num_items: number
  }) {
    const event: AnalyticsEvent = {
      event_name: 'Purchase',
      parameters: orderData,
      timestamp: new Date(),
      source: 'meta_pixel'
    }

    return this.sendEvent(event)
  }

  // Track add to cart
  async trackAddToCart(itemData: {
    value: number
    currency: string
    content_ids: string[]
    content_type: string
  }) {
    const event: AnalyticsEvent = {
      event_name: 'AddToCart',
      parameters: itemData,
      timestamp: new Date(),
      source: 'meta_pixel'
    }

    return this.sendEvent(event)
  }

  // Track view content
  async trackViewContent(contentData: {
    value: number
    currency: string
    content_ids: string[]
    content_type: string
    content_name: string
  }) {
    const event: AnalyticsEvent = {
      event_name: 'ViewContent',
      parameters: contentData,
      timestamp: new Date(),
      source: 'meta_pixel'
    }

    return this.sendEvent(event)
  }

  // Send event to Meta Pixel
  private async sendEvent(event: AnalyticsEvent) {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.pixelId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          data: [{
            event_name: event.event_name,
            event_time: Math.floor(event.timestamp.getTime() / 1000),
            user_data: {
              client_ip_address: '{{client_ip_address}}',
              client_user_agent: '{{client_user_agent}}'
            },
            custom_data: event.parameters
          }],
          test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined
        })
      })

      if (!response.ok) {
        throw new Error(`Meta Pixel tracking failed: ${response.statusText}`)
      }

      // Store event in our database
      await this.storeEvent(event)
      
      return { success: true }
    } catch (error) {
      console.error('Meta Pixel tracking error:', error)
      return { success: false, error }
    }
  }

  private async storeEvent(event: AnalyticsEvent) {
    await supabase
      .from('analytics_events')
      .insert({
        event_name: event.event_name,
        parameters: event.parameters,
        timestamp: event.timestamp.toISOString(),
        source: event.source
      })
  }
}

export class TikTokPixel {
  private pixelId: string
  private accessToken: string

  constructor(pixelId: string, accessToken: string) {
    this.pixelId = pixelId
    this.accessToken = accessToken
  }

  // Track purchase
  async trackPurchase(orderData: {
    value: number
    currency: string
    content_ids: string[]
    content_type: string
    quantity: number
    description: string
  }) {
    const event: AnalyticsEvent = {
      event_name: 'CompletePayment',
      parameters: orderData,
      timestamp: new Date(),
      source: 'tiktok_pixel'
    }

    return this.sendEvent(event)
  }

  // Track add to cart
  async trackAddToCart(itemData: {
    value: number
    currency: string
    content_ids: string[]
    content_type: string
    quantity: number
    description: string
  }) {
    const event: AnalyticsEvent = {
      event_name: 'AddToCart',
      parameters: itemData,
      timestamp: new Date(),
      source: 'tiktok_pixel'
    }

    return this.sendEvent(event)
  }

  // Track view content
  async trackViewContent(contentData: {
    value: number
    currency: string
    content_ids: string[]
    content_type: string
    description: string
  }) {
    const event: AnalyticsEvent = {
      event_name: 'ViewContent',
      parameters: contentData,
      timestamp: new Date(),
      source: 'tiktok_pixel'
    }

    return this.sendEvent(event)
  }

  // Track initiate checkout
  async trackInitiateCheckout(checkoutData: {
    value: number
    currency: string
    content_ids: string[]
    content_type: string
    quantity: number
  }) {
    const event: AnalyticsEvent = {
      event_name: 'InitiateCheckout',
      parameters: checkoutData,
      timestamp: new Date(),
      source: 'tiktok_pixel'
    }

    return this.sendEvent(event)
  }

  // Send event to TikTok Pixel
  private async sendEvent(event: AnalyticsEvent) {
    try {
      const response = await fetch(`https://business-api.tiktok.com/open_api/v1.3/pixel/track/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': this.accessToken
        },
        body: JSON.stringify({
          pixel_code: this.pixelId,
          event: event.event_name,
          event_id: this.generateEventId(),
          timestamp: Math.floor(event.timestamp.getTime() / 1000).toString(),
          context: {
            user_agent: '{{user_agent}}',
            ip: '{{ip_address}}',
            ad: {
              callback: 'E.C.P' // Enhanced Conversion for Publishers
            }
          },
          properties: event.parameters,
          test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined
        })
      })

      if (!response.ok) {
        throw new Error(`TikTok Pixel tracking failed: ${response.statusText}`)
      }

      // Store event in our database
      await this.storeEvent(event)
      
      return { success: true }
    } catch (error) {
      console.error('TikTok Pixel tracking error:', error)
      return { success: false, error }
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private async storeEvent(event: AnalyticsEvent) {
    await supabase
      .from('analytics_events')
      .insert({
        event_name: event.event_name,
        parameters: event.parameters,
        timestamp: event.timestamp.toISOString(),
        source: event.source
      })
  }
}

// Analytics Manager - Central hub for all analytics integrations
export class AnalyticsManager {
  private storeId: string
  private ga4?: GoogleAnalytics4
  private metaPixel?: MetaPixel
  private tiktokPixel?: TikTokPixel

  constructor(storeId: string) {
    this.storeId = storeId
    this.initializeIntegrations()
  }

  private async initializeIntegrations() {
    try {
      const { data: integrations } = await supabase
        .from('store_integrations')
        .select('*')
        .eq('store_id', this.storeId)
        .eq('is_enabled', true)

      integrations?.forEach(integration => {
        switch (integration.integration_type) {
          case 'ga4':
            this.ga4 = new GoogleAnalytics4(
              integration.config.measurement_id,
              integration.credentials.api_secret
            )
            break
          case 'meta_pixel':
            this.metaPixel = new MetaPixel(
              integration.config.pixel_id,
              integration.credentials.access_token
            )
            break
          case 'tiktok_pixel':
            this.tiktokPixel = new TikTokPixel(
              integration.config.pixel_id,
              integration.credentials.access_token
            )
            break
        }
      })
    } catch (error) {
      console.error('Failed to initialize analytics integrations:', error)
    }
  }

  // Track events across all enabled platforms
  async trackPurchase(orderData: any) {
    const promises = []

    if (this.ga4) {
      promises.push(this.ga4.trackPurchase(orderData))
    }

    if (this.metaPixel) {
      promises.push(this.metaPixel.trackPurchase({
        value: orderData.value,
        currency: orderData.currency,
        content_ids: orderData.items.map((item: any) => item.item_id),
        content_type: 'product',
        num_items: orderData.items.length
      }))
    }

    if (this.tiktokPixel) {
      promises.push(this.tiktokPixel.trackPurchase({
        value: orderData.value,
        currency: orderData.currency,
        content_ids: orderData.items.map((item: any) => item.item_id),
        content_type: 'product',
        quantity: orderData.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        description: `Purchase of ${orderData.items.length} items`
      }))
    }

    return Promise.allSettled(promises)
  }

  async trackAddToCart(itemData: any) {
    const promises = []

    if (this.ga4) {
      promises.push(this.ga4.trackAddToCart(itemData))
    }

    if (this.metaPixel) {
      promises.push(this.metaPixel.trackAddToCart({
        value: itemData.value,
        currency: itemData.currency,
        content_ids: itemData.items.map((item: any) => item.item_id),
        content_type: 'product'
      }))
    }

    if (this.tiktokPixel) {
      promises.push(this.tiktokPixel.trackAddToCart({
        value: itemData.value,
        currency: itemData.currency,
        content_ids: itemData.items.map((item: any) => item.item_id),
        content_type: 'product',
        quantity: itemData.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        description: `Added ${itemData.items.length} items to cart`
      }))
    }

    return Promise.allSettled(promises)
  }

  async trackPageView(pageData: any) {
    const promises = []

    if (this.ga4) {
      promises.push(this.ga4.trackPageView(pageData))
    }

    if (this.metaPixel) {
      promises.push(this.metaPixel.trackViewContent({
        value: 0,
        currency: 'USD',
        content_ids: [pageData.page_location],
        content_type: 'page',
        content_name: pageData.page_title
      }))
    }

    if (this.tiktokPixel) {
      promises.push(this.tiktokPixel.trackViewContent({
        value: 0,
        currency: 'USD',
        content_ids: [pageData.page_location],
        content_type: 'page',
        description: pageData.page_title
      }))
    }

    return Promise.allSettled(promises)
  }

  // Track checkout initiation across all platforms
  async trackInitiateCheckout(checkoutData: any) {
    const promises = []

    if (this.tiktokPixel) {
      promises.push(this.tiktokPixel.trackInitiateCheckout({
        value: checkoutData.value,
        currency: checkoutData.currency,
        content_ids: checkoutData.items.map((item: any) => item.item_id),
        content_type: 'product',
        quantity: checkoutData.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      }))
    }

    // GA4 and Meta can use existing ecommerce events for checkout tracking
    // Add custom checkout events if needed

    return Promise.allSettled(promises)
  }
}