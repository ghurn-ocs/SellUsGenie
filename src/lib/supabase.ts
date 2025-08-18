import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our multi-tenant schema
export interface StoreOwner {
  id: string
  email: string
  google_id?: string
  apple_id?: string
  subscription_tier: 'trial' | 'basic' | 'pro' | 'enterprise'
  trial_expires_at: string | null
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  store_owner_id: string
  store_name: string
  store_slug: string
  store_domain?: string
  is_active: boolean
  subscription_status: 'active' | 'inactive' | 'trial'
  trial_expires_at: string | null
  // Payment configuration
  stripe_publishable_key?: string
  stripe_webhook_secret?: string
  payment_enabled: boolean
  // Store address
  store_address_line1?: string
  store_address_line2?: string
  store_city?: string
  store_state?: string
  store_postal_code?: string
  store_country?: string
  store_phone?: string
  created_at: string
  updated_at: string
}

export interface StoreOwnerSubscription {
  id: string
  store_owner_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan_type: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  description: string
  price: number
  compare_at_price?: number
  sku?: string
  inventory_quantity: number
  is_active: boolean
  is_featured?: boolean
  image_url?: string
  image_alt?: string
  gallery_images?: string[] // Array of additional image URLs
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  store_id: string
  email: string
  google_id?: string
  apple_id?: string
  first_name?: string
  last_name?: string
  phone?: string
  // Shipping Address
  shipping_address_line1?: string
  shipping_address_line2?: string
  shipping_city?: string
  shipping_state?: string
  shipping_postal_code?: string
  shipping_country?: string
  // Billing Address
  billing_different_from_shipping?: boolean
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_postal_code?: string
  billing_country?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  store_id: string
  customer_id: string
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  tax: number
  shipping: number
  total: number
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  store_id: string
  name: string
  status: 'draft' | 'published'
  content: any // JSON content for the page document
  version: number
  created_at: string
  updated_at: string
}

export interface PageVersion {
  id: string
  page_id: string
  version: number
  content: any // JSON content for the page document at this version
  author_id: string
  note?: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface CartItem {
  id: string
  store_id: string
  customer_id?: string // null for guest carts
  session_id?: string // for guest cart identification
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface PaymentIntent {
  id: string
  store_id: string
  order_id?: string
  stripe_payment_intent_id: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded'
  created_at: string
  updated_at: string
}

export interface StripeConfiguration {
  id: string
  store_id: string
  stripe_account_id?: string
  stripe_publishable_key?: string
  stripe_secret_key_encrypted?: string // Encrypted for security
  webhook_endpoint_id?: string
  webhook_secret?: string
  is_live_mode: boolean
  is_configured: boolean
  configuration_status: 'incomplete' | 'pending' | 'active' | 'error'
  last_webhook_test?: string
  webhook_events_enabled: string[] // JSON array of enabled webhook events
  created_at: string
  updated_at: string
}

export interface WebhookEvent {
  id: string
  store_id: string
  stripe_event_id: string
  event_type: string
  processed: boolean
  processing_attempts: number
  error_message?: string
  event_data: any // JSON data from Stripe
  created_at: string
  processed_at?: string
}

// Updated subscription interface for user-level billing
export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId: string
  stripeCustomerId: string
  createdAt: string
  updatedAt: string
}
