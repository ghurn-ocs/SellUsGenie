import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface AnalyticsIntegration {
  id: string
  store_id: string
  integration_type: 'google_analytics' | 'facebook_pixel' | 'tiktok_pixel' | 'hotjar' | 'mixpanel'
  integration_name: string
  provider: string
  is_enabled: boolean
  config: {
    tracking_id?: string
    pixel_id?: string
    api_key?: string
    site_id?: string
    [key: string]: any
  }
  credentials: {
    [key: string]: any
  }
  status: 'pending' | 'active' | 'error'
  last_synced?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface CreateIntegrationForm {
  integration_type: 'google_analytics' | 'facebook_pixel' | 'tiktok_pixel' | 'hotjar' | 'mixpanel'
  integration_name: string
  config: {
    tracking_id?: string
    pixel_id?: string
    api_key?: string
    site_id?: string
    [key: string]: any
  }
}

export const useAnalyticsIntegrations = (storeId: string) => {
  return useQuery({
    queryKey: ['analytics-integrations', storeId],
    queryFn: async (): Promise<AnalyticsIntegration[]> => {
      const { data, error } = await supabase
        .from('store_integrations')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })
}

export const useCreateAnalyticsIntegration = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integrationData: CreateIntegrationForm): Promise<AnalyticsIntegration> => {
      const { data, error } = await supabase
        .from('store_integrations')
        .insert({
          store_id: storeId,
          provider: integrationData.integration_type,
          ...integrationData,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-integrations', storeId] })
    }
  })
}

export const useUpdateAnalyticsIntegration = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      integrationId, 
      updates 
    }: { 
      integrationId: string
      updates: Partial<AnalyticsIntegration> 
    }): Promise<AnalyticsIntegration> => {
      const { data, error } = await supabase
        .from('store_integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', integrationId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-integrations', storeId] })
    }
  })
}

export const useDeleteAnalyticsIntegration = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integrationId: string): Promise<void> => {
      const { error } = await supabase
        .from('store_integrations')
        .delete()
        .eq('id', integrationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-integrations', storeId] })
    }
  })
}