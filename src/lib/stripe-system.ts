import { loadStripe, Stripe } from '@stripe/stripe-js'
import { supabase } from './supabase'

/**
 * System Stripe configuration with database-first approach
 * This ensures we use the secure system-level Stripe keys from database
 */
class StripeSystem {
  private stripePromise: Promise<Stripe | null> | null = null
  private publishableKey: string | null = null

  /**
   * Get Stripe publishable key from system API keys table
   */
  private async getStripePublishableKey(): Promise<string> {
    try {
      // Try to get from system_api_keys table
      const { data, error } = await supabase
        .from('system_api_keys')
        .select('credentials')
        .eq('key_name', 'stripe_platform')
        .eq('is_active', true)
        .single()

      if (!error && data?.credentials?.publishable_key) {
        return data.credentials.publishable_key
      }

      // Fallback to environment variable
      const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      if (envKey) {
        console.warn('⚠️ Using fallback environment Stripe key. Database key not found.')
        return envKey
      }

      throw new Error('Stripe publishable key not configured in database or environment')
    } catch (error) {
      console.error('Error fetching Stripe publishable key:', error)
      throw new Error('Failed to retrieve Stripe publishable key')
    }
  }

  /**
   * Initialize Stripe with system key (lazy loading)
   */
  async getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      this.stripePromise = this.initializeStripe()
    }
    return this.stripePromise
  }

  private async initializeStripe(): Promise<Stripe | null> {
    try {
      if (!this.publishableKey) {
        this.publishableKey = await this.getStripePublishableKey()
      }
      
      const stripe = await loadStripe(this.publishableKey)
      if (!stripe) {
        console.error('Failed to load Stripe')
        return null
      }

      console.log('✅ Stripe initialized with system key')
      return stripe
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
      return null
    }
  }

  /**
   * Get the publishable key (useful for manual initialization)
   */
  async getPublishableKey(): Promise<string> {
    if (!this.publishableKey) {
      this.publishableKey = await this.getStripePublishableKey()
    }
    return this.publishableKey
  }

  /**
   * Reset the Stripe instance (useful for key rotation)
   */
  reset(): void {
    this.stripePromise = null
    this.publishableKey = null
  }
}

// Export singleton instance
export const stripeSystem = new StripeSystem()

// For backward compatibility, export a promise that resolves to Stripe
export const stripePromise = stripeSystem.getStripe()

export const STRIPE_CONFIG = {
  currency: 'usd',
  country: 'US',
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#8B5CF6', // primary-600
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
}