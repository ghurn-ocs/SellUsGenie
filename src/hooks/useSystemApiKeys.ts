import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface SystemApiKey {
  id: string
  key_name: string
  key_type: string
  provider: string
  credentials: Record<string, any>
  config?: Record<string, any>
  is_active: boolean
  description?: string
}

/**
 * Hook to retrieve a specific system API key by name
 */
export const useSystemApiKey = (keyName: string) => {
  return useQuery<string | null>({
    queryKey: ['system-api-key', keyName],
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from('system_api_keys')
        .select('credentials')
        .eq('key_name', keyName)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        console.error(`Error fetching system API key "${keyName}":`, error)
        return null
      }

      return data?.credentials?.key || null
    },
    enabled: !!keyName,
    staleTime: 1000 * 60 * 15, // 15 minutes (system keys don't change often)
    retry: 2
  })
}

/**
 * Hook to retrieve all system API keys
 */
export const useSystemApiKeys = () => {
  return useQuery<SystemApiKey[]>({
    queryKey: ['system-api-keys'],
    queryFn: async (): Promise<SystemApiKey[]> => {
      const { data, error } = await supabase
        .from('system_api_keys')
        .select('*')
        .eq('is_active', true)
        .order('key_name')

      if (error) {
        console.error('Error fetching system API keys:', error)
        return []
      }

      return data || []
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 2
  })
}

/**
 * Utility function to get a system API key synchronously (for use in services)
 * Returns a promise that resolves to the key or throws an error
 */
export const getSystemApiKey = async (keyName: string): Promise<string> => {
  const { data, error } = await supabase
    .from('system_api_keys')
    .select('credentials')
    .eq('key_name', keyName)
    .eq('is_active', true)
    .single()

  if (error) {
    throw new Error(`System API key "${keyName}" not found: ${error.message}`)
  }

  if (!data?.credentials?.key) {
    throw new Error(`System API key "${keyName}" has no key value`)
  }

  return data.credentials.key
}

/**
 * Utility to get system configuration (non-key data)
 */
export const getSystemConfig = async (keyName: string): Promise<Record<string, any> | null> => {
  const { data, error } = await supabase
    .from('system_api_keys')
    .select('config')
    .eq('key_name', keyName)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error(`Error fetching system config for "${keyName}":`, error)
    return null
  }

  return data?.config || null
}