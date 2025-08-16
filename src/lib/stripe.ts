import { loadStripe } from '@stripe/stripe-js'

// This is the public key - safe to expose in frontend
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key')
}

export const stripePromise = loadStripe(stripePublishableKey)

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