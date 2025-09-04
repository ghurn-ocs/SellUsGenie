import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// Define the interface based on the actual database schema
interface StripeConfiguration {
  id?: string
  store_id: string
  stripe_publishable_key?: string | null
  stripe_secret_key?: string | null
  webhook_endpoint_id?: string | null
  webhook_endpoint_url?: string | null
  webhook_secret?: string | null
  is_configured?: boolean
  is_live_mode?: boolean
  test_mode_configured?: boolean
  live_mode_configured?: boolean
  last_validated_at?: string | null
  created_at?: string
  updated_at?: string
}

export const useStripeConfig = (storeId: string) => {
  const queryClient = useQueryClient()

  const {
    data: stripeConfig,
    isLoading,
    error
  } = useQuery({
    queryKey: ['stripe-config', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_configurations')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle() // Use maybeSingle instead of single to handle no rows gracefully

      if (error) {
        console.error('Error fetching stripe configuration:', error)
        return null
      }
      
      return data
    },
    enabled: !!storeId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const updateStripeConfig = useMutation({
    mutationFn: async (config: Partial<StripeConfiguration>) => {
      const configData = {
        store_id: storeId,
        ...config,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('stripe_configurations')
        .upsert(configData, {
          onConflict: 'store_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating stripe configuration:', error)
        throw error
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-config', storeId] })
    }
  })

  const testWebhook = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/stripe/test-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId })
      })

      if (!response.ok) {
        throw new Error('Failed to test webhook')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-config', storeId] })
    }
  })

  const validateApiKeys = useMutation({
    mutationFn: async (keys: { publishableKey: string; secretKey: string }) => {
      const response = await fetch(`/api/stripe/validate-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...keys, storeId })
      })

      if (!response.ok) {
        throw new Error('Failed to validate API keys')
      }

      return response.json()
    }
  })

  const createWebhookEndpoint = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/stripe/create-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId })
      })

      if (!response.ok) {
        throw new Error('Failed to create webhook endpoint')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-config', storeId] })
    }
  })

  return {
    stripeConfig,
    isLoading,
    error,
    updateStripeConfig,
    testWebhook,
    validateApiKeys,
    createWebhookEndpoint,
    isConfigured: stripeConfig?.is_configured || false,
    isLiveMode: stripeConfig?.is_live_mode || false
  }
}