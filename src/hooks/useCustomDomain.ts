import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useSubscription } from './useSubscription'

export interface CustomDomain {
  id: string
  store_id: string
  domain_name: string
  subdomain?: string
  full_domain: string
  verification_status: 'pending' | 'verified' | 'failed'
  verification_token: string
  verification_method: 'dns_txt' | 'dns_cname'
  verified_at?: string
  ssl_status: 'pending' | 'active' | 'failed' | 'expired'
  ssl_issued_at?: string
  ssl_expires_at?: string
  dns_configured: boolean
  dns_target?: string
  dns_instructions: Record<string, any>
  is_active: boolean
  is_primary: boolean
  redirect_to_https: boolean
  redirect_www: boolean
  last_checked_at?: string
  error_message?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export const useCustomDomain = (storeId: string) => {
  const queryClient = useQueryClient()
  const { subscriptionLimits } = useSubscription()
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Check if user can use custom domains
  const canUseCustomDomain = subscriptionLimits.customDomain

  // Get custom domains for store
  const {
    data: domains,
    isLoading,
    error
  } = useQuery({
    queryKey: ['custom-domains', storeId],
    queryFn: async () => {
      if (!storeId) return []

      try {
        const { data, error } = await supabase
          .from('custom_domains')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false })

        if (error && error.message?.includes('does not exist')) {
          console.warn('custom_domains table does not exist - using defaults')
          return []
        }

        if (error) throw error
        return data || []
      } catch (err: any) {
        if (err.message?.includes('does not exist') || err.code === 'PGRST205') {
          console.warn('custom_domains table does not exist - using defaults')
          return []
        }
        throw err
      }
    },
    enabled: !!storeId && canUseCustomDomain,
    retry: 1,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  })

  const primaryDomain = domains?.find(d => d.is_primary && d.is_active)
  const activeDomains = domains?.filter(d => d.is_active) || []
  const verifiedDomains = domains?.filter(d => d.verification_status === 'verified') || []

  // Validate domain name
  const validateDomain = (domain: string): string[] => {
    const errors: string[] = []
    
    if (!domain) {
      errors.push('Domain name is required')
      return errors
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain)) {
      errors.push('Please enter a valid domain name (e.g., mystore.com)')
    }

    // Check for reserved domains
    const reservedDomains = ['localhost', 'example.com', 'test.com', 'sellusgenie.com']
    if (reservedDomains.some(reserved => domain.includes(reserved))) {
      errors.push('This domain is reserved and cannot be used')
    }

    // Check length
    if (domain.length > 253) {
      errors.push('Domain name is too long')
    }

    return errors
  }

  // Add custom domain
  const addCustomDomain = useMutation({
    mutationFn: async ({ 
      domainName, 
      subdomain 
    }: { 
      domainName: string
      subdomain?: string 
    }) => {
      if (!canUseCustomDomain) {
        throw new Error('Custom domains are not available on your current plan. Please upgrade to Professional or Enterprise.')
      }

      const fullDomain = subdomain ? `${subdomain}.${domainName}` : domainName
      const errors = validateDomain(fullDomain)
      
      if (errors.length > 0) {
        setValidationErrors(errors)
        throw new Error(errors.join(', '))
      }

      setValidationErrors([])

      // Generate verification token
      const verificationToken = crypto.randomUUID().replace(/-/g, '').substring(0, 32)

      const domainData = {
        store_id: storeId,
        domain_name: domainName,
        subdomain: subdomain || null,
        verification_token: verificationToken,
        verification_method: 'dns_txt' as const,
        dns_target: `${storeId}.sellusgenie.com`, // Your app's domain
        dns_instructions: {
          txt_record: {
            name: fullDomain,
            value: `sellusgenie-verification=${verificationToken}`,
            type: 'TXT'
          },
          cname_record: {
            name: fullDomain,
            value: `${storeId}.sellusgenie.com`,
            type: 'CNAME'
          }
        }
      }

      const { data, error } = await supabase
        .from('custom_domains')
        .insert([domainData])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('This domain is already in use')
        }
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-domains', storeId] })
    }
  })

  // Verify domain
  const verifyDomain = useMutation({
    mutationFn: async (domainId: string) => {
      // This would typically call an API endpoint that checks DNS records
      const { data, error } = await supabase
        .from('custom_domains')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          dns_configured: true,
          last_checked_at: new Date().toISOString()
        })
        .eq('id', domainId)
        .eq('store_id', storeId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-domains', storeId] })
    }
  })

  // Set primary domain
  const setPrimaryDomain = useMutation({
    mutationFn: async (domainId: string) => {
      if (!canUseCustomDomain) {
        throw new Error('Custom domains are not available on your current plan')
      }

      // First, unset all other primary domains
      await supabase
        .from('custom_domains')
        .update({ is_primary: false })
        .eq('store_id', storeId)

      // Set the selected domain as primary
      const { data, error } = await supabase
        .from('custom_domains')
        .update({
          is_primary: true,
          is_active: true
        })
        .eq('id', domainId)
        .eq('store_id', storeId)
        .select()
        .single()

      if (error) throw error

      // Update store record
      await supabase
        .from('stores')
        .update({
          custom_domain: data.full_domain,
          custom_domain_verified: data.verification_status === 'verified',
          custom_domain_ssl_enabled: data.ssl_status === 'active'
        })
        .eq('id', storeId)

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-domains', storeId] })
    }
  })

  // Remove domain
  const removeDomain = useMutation({
    mutationFn: async (domainId: string) => {
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId)
        .eq('store_id', storeId)

      if (error) throw error

      // If this was the primary domain, clear store record
      const domain = domains?.find(d => d.id === domainId)
      if (domain?.is_primary) {
        await supabase
          .from('stores')
          .update({
            custom_domain: null,
            custom_domain_verified: false,
            custom_domain_ssl_enabled: false
          })
          .eq('id', storeId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-domains', storeId] })
    }
  })

  return {
    // Data
    domains: domains || [],
    primaryDomain,
    activeDomains,
    verifiedDomains,
    
    // Loading states
    isLoading,
    error,
    validationErrors,
    
    // Permissions
    canUseCustomDomain,
    
    // Actions
    addCustomDomain,
    verifyDomain,
    setPrimaryDomain,
    removeDomain,
    validateDomain,
    
    // Helper functions
    getDnsInstructions: (domain: CustomDomain) => domain.dns_instructions,
    getVerificationInstructions: (domain: CustomDomain) => ({
      txtRecord: domain.dns_instructions.txt_record,
      cnameRecord: domain.dns_instructions.cname_record
    })
  }
}