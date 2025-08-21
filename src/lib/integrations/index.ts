// Integration Management System
// Centralized system for managing third-party integrations

export interface Integration {
  id: string
  name: string
  type: 'analytics' | 'marketing' | 'advertising' | 'email' | 'sms'
  provider: string
  isEnabled: boolean
  config: Record<string, any>
  credentials: Record<string, any>
  lastSynced?: Date
  status: 'active' | 'error' | 'disabled' | 'pending'
}

export interface IntegrationManager {
  getIntegrations(storeId: string): Promise<Integration[]>
  enableIntegration(storeId: string, integrationId: string, config: any): Promise<void>
  disableIntegration(storeId: string, integrationId: string): Promise<void>
  syncIntegration(storeId: string, integrationId: string): Promise<void>
  getIntegrationData(storeId: string, integrationId: string): Promise<any>
}

// Available integrations
export const AVAILABLE_INTEGRATIONS = {
  // Analytics
  GOOGLE_ANALYTICS_4: {
    id: 'ga4',
    name: 'Google Analytics 4',
    type: 'analytics' as const,
    provider: 'Google',
    description: 'Advanced web analytics and user behavior tracking',
    features: ['user_tracking', 'conversion_goals', 'audience_insights', 'real_time_data'],
    requiredCredentials: ['measurement_id', 'api_secret']
  },
  
  META_PIXEL: {
    id: 'meta_pixel',
    name: 'Meta Pixel',
    type: 'analytics' as const,
    provider: 'Meta',
    description: 'Facebook and Instagram advertising pixel for conversion tracking',
    features: ['conversion_tracking', 'audience_building', 'optimization', 'attribution'],
    requiredCredentials: ['pixel_id', 'access_token']
  },

  // Advertising
  GOOGLE_ADS: {
    id: 'google_ads',
    name: 'Google Ads',
    type: 'advertising' as const,
    provider: 'Google',
    description: 'Google advertising platform integration',
    features: ['campaign_management', 'conversion_tracking', 'audience_sync', 'automated_bidding'],
    requiredCredentials: ['customer_id', 'developer_token', 'client_id', 'client_secret']
  },

  FACEBOOK_ADS: {
    id: 'facebook_ads',
    name: 'Facebook Ads',
    type: 'advertising' as const,
    provider: 'Meta',
    description: 'Facebook and Instagram advertising',
    features: ['campaign_management', 'audience_targeting', 'conversion_optimization', 'reporting'],
    requiredCredentials: ['ad_account_id', 'access_token', 'app_id', 'app_secret']
  },

  TIKTOK_ADS: {
    id: 'tiktok_ads',
    name: 'TikTok Ads',
    type: 'advertising' as const,
    provider: 'TikTok',
    description: 'TikTok advertising platform with pixel tracking',
    features: ['campaign_management', 'video_ads', 'conversion_tracking', 'audience_insights', 'spark_ads'],
    requiredCredentials: ['advertiser_id', 'access_token', 'pixel_id', 'app_id']
  },

  TIKTOK_PIXEL: {
    id: 'tiktok_pixel',
    name: 'TikTok Pixel',
    type: 'analytics' as const,
    provider: 'TikTok',
    description: 'TikTok pixel for conversion tracking and audience building',
    features: ['conversion_tracking', 'audience_building', 'optimization', 'attribution'],
    requiredCredentials: ['pixel_id', 'access_token']
  },

  // Email Marketing
  KLAVIYO: {
    id: 'klaviyo',
    name: 'Klaviyo',
    type: 'email' as const,
    provider: 'Klaviyo',
    description: 'Advanced email and SMS marketing automation',
    features: ['email_campaigns', 'behavioral_triggers', 'segmentation', 'sms_marketing'],
    requiredCredentials: ['api_key', 'private_key']
  },

  MAILCHIMP: {
    id: 'mailchimp',
    name: 'Mailchimp',
    type: 'email' as const,
    provider: 'Mailchimp',
    description: 'Email marketing and automation platform',
    features: ['email_campaigns', 'audience_management', 'automation', 'reporting'],
    requiredCredentials: ['api_key', 'server_prefix']
  },

  // SMS Marketing
  TWILIO: {
    id: 'twilio',
    name: 'Twilio',
    type: 'sms' as const,
    provider: 'Twilio',
    description: 'SMS and communication platform',
    features: ['sms_campaigns', 'two_way_messaging', 'phone_verification', 'automation'],
    requiredCredentials: ['account_sid', 'auth_token', 'phone_number']
  }
} as const

export type IntegrationType = keyof typeof AVAILABLE_INTEGRATIONS