import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface GoogleMapsConfig {
  apiKey?: string
  isConfigured: boolean
  source: 'system_api_keys' | 'integration' | 'setting' | 'env' | 'none'
}

/**
 * Hook to get Google Maps API key from multiple sources:
 * 1. System API keys table (platform-wide, preferred)
 * 2. Store integrations table (store-specific override)
 * 3. Store settings table (fallback)
 * 4. Environment variable (fallback)
 */
export const useGoogleMapsConfig = (storeId: string) => {
  return useQuery<GoogleMapsConfig>({
    queryKey: ['google-maps-config', storeId],
    queryFn: async (): Promise<GoogleMapsConfig> => {
      // First, try system-level Google Maps API key using secure RPC function
      const { data: systemKey, error: systemError } = await supabase.rpc('get_system_api_key', {
        key_name: 'system_google_maps_key'
      })

      if (!systemError && systemKey) {
        return {
          apiKey: systemKey,
          isConfigured: true,
          source: 'system_api_keys'
        }
      }

      // Then check store integrations for custom key
      const { data: integrations, error: integrationsError } = await supabase
        .from('store_integrations')
        .select('*')
        .eq('store_id', storeId)
        .eq('integration_type', 'google_maps')
        .maybeSingle()

      if (!integrationsError && integrations?.credentials?.api_key) {
        return {
          apiKey: integrations.credentials.api_key,
          isConfigured: true,
          source: 'integration'
        }
      }

      // Fallback to store settings
      const { data: settings, error: settingsError } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', storeId)
        .eq('setting_key', 'google_maps_api_key')
        .maybeSingle()

      if (!settingsError && settings?.setting_value?.api_key) {
        return {
          apiKey: settings.setting_value.api_key,
          isConfigured: true,
          source: 'setting'
        }
      }

      // Final fallback to environment variable
      const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (envApiKey) {
        return {
          apiKey: envApiKey,
          isConfigured: true,
          source: 'env'
        }
      }

      return {
        apiKey: undefined,
        isConfigured: false,
        source: 'none'
      }
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}