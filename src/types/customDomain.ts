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
  dns_instructions: DnsInstructions
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

export interface DnsInstructions {
  txt_record: {
    name: string
    value: string
    type: 'TXT'
  }
  cname_record: {
    name: string
    value: string
    type: 'CNAME'
  }
}

export interface DomainVerificationResult {
  domain_id: string
  verification_status: 'verified' | 'failed'
  dns_configured: boolean
  ssl_status: 'pending' | 'active' | 'failed'
  error_message?: string
  checked_at: string
}

export interface CustomDomainSettings {
  enabled: boolean
  primary_domain?: string
  redirect_to_https: boolean
  redirect_www: boolean
  ssl_enabled: boolean
}

// Plan restrictions
export const DOMAIN_PLAN_LIMITS = {
  trial: {
    customDomain: false,
    maxDomains: 0,
    sslIncluded: false,
    subdomainsAllowed: false
  },
  starter: {
    customDomain: false,
    maxDomains: 0,
    sslIncluded: false,
    subdomainsAllowed: false
  },
  professional: {
    customDomain: true,
    maxDomains: 3,
    sslIncluded: true,
    subdomainsAllowed: true
  },
  enterprise: {
    customDomain: true,
    maxDomains: -1, // unlimited
    sslIncluded: true,
    subdomainsAllowed: true
  }
} as const

export type PlanType = keyof typeof DOMAIN_PLAN_LIMITS