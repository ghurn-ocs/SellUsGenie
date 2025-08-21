// Integrations Settings Component
// Manage Analytics, Marketing, and third-party integrations

import React, { useState } from 'react'
import { 
  Zap, 
  ExternalLink, 
  Settings as SettingsIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

interface IntegrationsSettingsProps {
  storeId: string
}

interface Integration {
  id: string
  name: string
  description: string
  category: 'analytics' | 'advertising' | 'email' | 'sms'
  provider: string
  status: 'connected' | 'disconnected' | 'error'
  isEnabled: boolean
  lastSynced?: string
  features: string[]
  requiredCredentials: string[]
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  // Analytics
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    description: 'Advanced web analytics and user behavior tracking',
    category: 'analytics',
    provider: 'Google',
    status: 'connected',
    isEnabled: true,
    lastSynced: '2 minutes ago',
    features: ['User tracking', 'Conversion goals', 'Audience insights', 'Real-time data'],
    requiredCredentials: ['Measurement ID', 'API Secret']
  },
  {
    id: 'meta_pixel',
    name: 'Meta Pixel',
    description: 'Facebook and Instagram advertising pixel for conversion tracking',
    category: 'analytics',
    provider: 'Meta',
    status: 'connected',
    isEnabled: true,
    lastSynced: '5 minutes ago',
    features: ['Conversion tracking', 'Audience building', 'Optimization', 'Attribution'],
    requiredCredentials: ['Pixel ID', 'Access Token']
  },
  {
    id: 'tiktok_pixel',
    name: 'TikTok Pixel',
    description: 'TikTok pixel for conversion tracking and audience building',
    category: 'analytics',
    provider: 'TikTok',
    status: 'connected',
    isEnabled: true,
    lastSynced: '1 minute ago',
    features: ['Conversion tracking', 'Audience building', 'Optimization', 'Attribution'],
    requiredCredentials: ['Pixel ID', 'Access Token']
  },
  
  // Advertising
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Google advertising platform integration',
    category: 'advertising',
    provider: 'Google',
    status: 'disconnected',
    isEnabled: false,
    features: ['Campaign management', 'Conversion tracking', 'Audience sync', 'Automated bidding'],
    requiredCredentials: ['Customer ID', 'Developer Token', 'Client ID', 'Client Secret']
  },
  {
    id: 'facebook_ads',
    name: 'Facebook Ads',
    description: 'Facebook and Instagram advertising',
    category: 'advertising',
    provider: 'Meta',
    status: 'disconnected',
    isEnabled: false,
    features: ['Campaign management', 'Audience targeting', 'Conversion optimization', 'Reporting'],
    requiredCredentials: ['Ad Account ID', 'Access Token', 'App ID', 'App Secret']
  },
  {
    id: 'tiktok_ads',
    name: 'TikTok Ads',
    description: 'TikTok advertising platform with video ads',
    category: 'advertising',
    provider: 'TikTok',
    status: 'disconnected',
    isEnabled: false,
    features: ['Campaign management', 'Video ads', 'Conversion tracking', 'Spark ads'],
    requiredCredentials: ['Advertiser ID', 'Access Token', 'App ID']
  },
  
  // Email Marketing
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    description: 'Advanced email and SMS marketing automation',
    category: 'email',
    provider: 'Klaviyo',
    status: 'disconnected',
    isEnabled: false,
    features: ['Email campaigns', 'Behavioral triggers', 'Segmentation', 'SMS marketing'],
    requiredCredentials: ['API Key', 'Private Key']
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation platform',
    category: 'email',
    provider: 'Mailchimp',
    status: 'disconnected',
    isEnabled: false,
    features: ['Email campaigns', 'Audience management', 'Automation', 'Reporting'],
    requiredCredentials: ['API Key', 'Server Prefix']
  },
  
  // SMS Marketing
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and communication platform',
    category: 'sms',
    provider: 'Twilio',
    status: 'disconnected',
    isEnabled: false,
    features: ['SMS campaigns', 'Two-way messaging', 'Phone verification', 'Automation'],
    requiredCredentials: ['Account SID', 'Auth Token', 'Phone Number']
  }
]

export const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({ storeId }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'analytics' | 'advertising' | 'email' | 'sms'>('all')
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({})

  const toggleCredentials = (integrationId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }))
  }

  const filteredIntegrations = activeCategory === 'all' 
    ? AVAILABLE_INTEGRATIONS 
    : AVAILABLE_INTEGRATIONS.filter(integration => integration.category === activeCategory)

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Zap className="w-6 h-6 text-[#9B51E0]" />
        <div>
          <h3 className="text-lg font-semibold text-white">Integrations</h3>
          <p className="text-sm text-[#A0A0A0]">
            Connect your store with analytics, marketing, and advertising platforms
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-1 bg-[#1E1E1E] p-1 rounded-lg border border-[#3A3A3A]">
        {[
          { id: 'all', label: 'All' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'advertising', label: 'Advertising' },
          { id: 'email', label: 'Email' },
          { id: 'sms', label: 'SMS' }
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-[#9B51E0] text-white'
                : 'text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A]'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 hover:border-[#4A4A4A] transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-6 h-6 text-[#9B51E0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-white">{integration.name}</h4>
                    {getStatusIcon(integration.status)}
                  </div>
                  <p className="text-sm text-[#A0A0A0] line-clamp-2">{integration.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-[#666]">by {integration.provider}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-white mb-2">Features</h5>
              <div className="flex flex-wrap gap-1">
                {integration.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-[#3A3A3A] text-[#A0A0A0] rounded"
                  >
                    {feature}
                  </span>
                ))}
                {integration.features.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-[#3A3A3A] text-[#A0A0A0] rounded">
                    +{integration.features.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Connection Status & Last Synced */}
            {integration.status === 'connected' && integration.lastSynced && (
              <div className="mb-4 p-3 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#A0A0A0]">Last synced</span>
                  <span className="text-green-400">{integration.lastSynced}</span>
                </div>
              </div>
            )}

            {/* Required Credentials */}
            {integration.status === 'disconnected' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-white">Required Credentials</h5>
                  <button
                    onClick={() => toggleCredentials(integration.id)}
                    className="text-[#9B51E0] hover:text-[#A051E0] transition-colors"
                  >
                    {showCredentials[integration.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {showCredentials[integration.id] && (
                  <div className="space-y-2">
                    {integration.requiredCredentials.map((credential, index) => (
                      <div key={index} className="text-xs text-[#A0A0A0] bg-[#1E1E1E] px-2 py-1 rounded">
                        {credential}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              {integration.status === 'connected' ? (
                <>
                  <button className="flex-1 px-4 py-2 bg-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:bg-[#4A4A4A] transition-colors flex items-center justify-center space-x-2">
                    <SettingsIcon className="w-4 h-4" />
                    <span>Configure</span>
                  </button>
                  <button className="px-4 py-2 border border-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:border-[#4A4A4A] hover:text-white transition-colors">
                    Disconnect
                  </button>
                </>
              ) : (
                <button className="flex-1 px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors">
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Integration Stats */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Integration Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {AVAILABLE_INTEGRATIONS.filter(i => i.status === 'connected').length}
            </div>
            <div className="text-sm text-[#A0A0A0]">Connected</div>
          </div>
          <div className="text-center p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
            <div className="text-2xl font-bold text-[#9B51E0] mb-1">
              {AVAILABLE_INTEGRATIONS.filter(i => i.category === 'analytics').length}
            </div>
            <div className="text-sm text-[#A0A0A0]">Analytics</div>
          </div>
          <div className="text-center p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {AVAILABLE_INTEGRATIONS.filter(i => i.category === 'advertising').length}
            </div>
            <div className="text-sm text-[#A0A0A0]">Advertising</div>
          </div>
          <div className="text-center p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {AVAILABLE_INTEGRATIONS.filter(i => i.category === 'email' || i.category === 'sms').length}
            </div>
            <div className="text-sm text-[#A0A0A0]">Marketing</div>
          </div>
        </div>
      </div>
    </div>
  )
}