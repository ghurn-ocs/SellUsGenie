// Re-export from the new system-based Stripe implementation
// This maintains backward compatibility while using database-first configuration
export { stripePromise, stripeSystem } from './stripe-system'

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