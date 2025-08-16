// Analytics tracking types
export interface PageView {
  id: string
  store_id: string
  customer_id?: string // null for anonymous visitors
  session_id: string
  page_path: string
  page_title?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  country?: string
  device_type: 'mobile' | 'desktop' | 'tablet'
  browser?: string
  created_at: string
}

export interface ProductView {
  id: string
  store_id: string
  product_id: string
  customer_id?: string
  session_id: string
  referrer?: string
  device_type: 'mobile' | 'desktop' | 'tablet'
  view_duration?: number // seconds spent on product page
  created_at: string
}

export interface CartEvent {
  id: string
  store_id: string
  customer_id?: string
  session_id: string
  event_type: 'add_to_cart' | 'remove_from_cart' | 'view_cart' | 'start_checkout' | 'abandon_cart' | 'complete_purchase'
  product_id?: string
  quantity?: number
  cart_value?: number
  created_at: string
}

export interface CustomerSession {
  id: string
  store_id: string
  customer_id?: string
  session_id: string
  session_start: string
  session_end?: string
  page_views: number
  total_time: number // total session duration in seconds
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  device_type: 'mobile' | 'desktop' | 'tablet'
  browser?: string
  country?: string
  converted: boolean // did they make a purchase
  created_at: string
  updated_at: string
}

export interface ProductPerformance {
  id: string
  store_id: string
  product_id: string
  date: string // YYYY-MM-DD format
  views: number
  unique_views: number
  add_to_carts: number
  purchases: number
  revenue: number
  return_count: number
  created_at: string
  updated_at: string
}

export interface StoreAnalytics {
  id: string
  store_id: string
  date: string // YYYY-MM-DD format
  total_visitors: number
  unique_visitors: number
  page_views: number
  bounce_rate: number
  average_session_duration: number
  conversion_rate: number
  mobile_visitors: number
  desktop_visitors: number
  tablet_visitors: number
  top_pages: { [path: string]: number }
  traffic_sources: { [source: string]: number }
  created_at: string
  updated_at: string
}

export interface CustomerBehavior {
  id: string
  store_id: string
  customer_id: string
  total_sessions: number
  total_orders: number
  total_spent: number
  average_order_value: number
  days_since_first_order: number
  days_since_last_order: number
  favorite_categories: string[]
  preferred_device: 'mobile' | 'desktop' | 'tablet'
  customer_segment: 'new' | 'returning' | 'loyal' | 'at_risk' | 'churned'
  lifetime_value: number
  created_at: string
  updated_at: string
}