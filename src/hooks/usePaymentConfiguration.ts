import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export const usePaymentConfiguration = (storeId: string) => {
  const {
    data: paymentConfig,
    isLoading,
    error
  } = useQuery({
    queryKey: ['paymentConfig', storeId],
    queryFn: async () => {
      if (!storeId) throw new Error('Store ID is required')

      try {
        const { data, error } = await supabase
          .from('stores')
          .select('payment_enabled, stripe_publishable_key')
          .eq('id', storeId)
          .single()

        if (error) {
          console.warn('Payment configuration query failed:', error.message)
          // Return default values if the columns don't exist yet
          return {
            isPaymentEnabled: false,
            hasStripeKeys: false,
            paymentEnabled: false
          }
        }

        return {
          isPaymentEnabled: (data.payment_enabled || false) && !!(data.stripe_publishable_key || ''),
          hasStripeKeys: !!(data.stripe_publishable_key || ''),
          paymentEnabled: data.payment_enabled || false
        }
      } catch (err) {
        console.warn('Payment configuration error:', err)
        // Return safe defaults
        return {
          isPaymentEnabled: false,
          hasStripeKeys: false,
          paymentEnabled: false
        }
      }
    },
    enabled: !!storeId,
    retry: 1, // Only retry once to avoid excessive requests
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  return {
    isPaymentEnabled: paymentConfig?.isPaymentEnabled ?? false,
    hasStripeKeys: paymentConfig?.hasStripeKeys ?? false,
    paymentEnabled: paymentConfig?.paymentEnabled ?? false,
    isLoading,
    error
  }
}