// Integrations Settings Component
// Manage Email, Analytics, and Accounting integrations

import React, { useState } from 'react'
import { 
  Mail, 
  BarChart3, 
  Calculator,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Settings as SettingsIcon,
  Zap,
  Eye,
  EyeOff,
  Shield,
  Lock,
  Clock,
  Activity,
  TrendingUp,
  X,
  Plus,
  Settings,
  TestTube,
  Save,
  AlertCircle
} from 'lucide-react'
import { useEmailConfig } from '../../hooks/useEmailConfig'
import { useAnalyticsIntegrations, useCreateAnalyticsIntegration, useUpdateAnalyticsIntegration, useDeleteAnalyticsIntegration, AnalyticsIntegration } from '../../hooks/useAnalyticsConfig'
import { googleAnalytics, GoogleAnalyticsService } from '../../lib/googleAnalytics'

interface IntegrationsSettingsProps {
  storeId: string
}

export const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({ storeId }) => {
  const [activeSubTab, setActiveSubTab] = useState<'email' | 'analytics' | 'accounting'>('email')

  const renderTabContent = () => {
    switch (activeSubTab) {
      case 'email':
        return <EmailIntegrationsTab storeId={storeId} />
      case 'analytics':
        return <AnalyticsIntegrationsTab storeId={storeId} />
      case 'accounting':
        return <AccountingIntegrationsTab />
      default:
        return null
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
            Connect your store with external services and platforms
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex space-x-1 bg-[#1E1E1E] p-1 rounded-lg border border-[#3A3A3A]">
        {[
          { id: 'email' as const, label: 'Email', icon: Mail },
          { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
          { id: 'accounting' as const, label: 'Accounting', icon: Calculator }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-[#9B51E0] text-white'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Email Integrations Tab Component
const EmailIntegrationsTab: React.FC<{ storeId: string }> = ({ storeId }) => {
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [formData, setFormData] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    username: '',
    password: '',
    from_name: '',
    from_email: ''
  })
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const { 
    config, 
    isConfigured, 
    isLoading, 
    isTesting,
    saveConfig, 
    testConfig, 
    deleteConfig,
    error 
  } = useEmailConfig(storeId)

  // Initialize form data from existing config
  React.useEffect(() => {
    if (config) {
      setFormData({
        host: config.smtp_host,
        port: config.smtp_port,
        secure: config.smtp_secure,
        username: config.smtp_username,
        password: config.smtp_password,
        from_name: config.from_name,
        from_email: config.from_email
      })
    }
  }, [config])

  const handleSaveConfig = async () => {
    try {
      await saveConfig({
        host: formData.host,
        port: formData.port,
        secure: formData.secure,
        username: formData.username,
        password: formData.password,
        from_name: formData.from_name,
        from_email: formData.from_email
      })
      setShowConfigForm(false)
      setTestResult({ success: true, message: 'Email configuration saved successfully!' })
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'Failed to save configuration' })
    }
  }

  const handleTestConfig = async () => {
    try {
      const result = await testConfig({
        host: formData.host,
        port: formData.port,
        secure: formData.secure,
        username: formData.username,
        password: formData.password,
        from_name: formData.from_name,
        from_email: formData.from_email
      })
      
      setTestResult({
        success: result.success,
        message: result.success ? 'Connection test successful!' : result.error || 'Connection test failed'
      })
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'Connection test failed' })
    }
  }

  const handleDeleteConfig = async () => {
    try {
      await deleteConfig()
      setShowConfigForm(false)
      setTestResult({ success: true, message: 'Email configuration removed successfully!' })
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'Failed to remove configuration' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-white">Email Services</h4>
      </div>

      {/* Google Email Services */}
      <div className="space-y-4">
        <div className="border border-[#3A3A3A] rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h5 className="font-medium text-white">Google Email Services</h5>
                <p className="text-sm text-[#A0A0A0]">
                  Connect your Gmail account to send automated emails
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#9B51E0] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className={`px-2 py-1 text-xs rounded ${
                  isConfigured 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {isConfigured ? 'Connected' : 'Not Connected'}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <h6 className="text-sm font-medium text-white">Features:</h6>
              <ul className="text-sm text-[#A0A0A0] space-y-1">
                <li>• Order confirmation emails</li>
                <li>• Shipping notifications</li>
                <li>• Cart abandonment recovery</li>
                <li>• Customer support emails</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h6 className="text-sm font-medium text-white">Requirements:</h6>
              <ul className="text-sm text-[#A0A0A0] space-y-1">
                <li>• Google account with Gmail</li>
                <li>• App password (recommended)</li>
                <li>• SMTP access enabled</li>
                <li>• Secure connection (TLS)</li>
              </ul>
            </div>
          </div>

          {/* Status Messages */}
          {(error || testResult) && (
            <div className={`p-3 rounded-lg border ${
              error || (testResult && !testResult.success)
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}>
              <p className="text-sm">{error || testResult?.message}</p>
            </div>
          )}

          {/* Configuration Status */}
          {isConfigured && config && (
            <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h6 className="font-medium text-white">Current Configuration</h6>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowConfigForm(true)}
                    className="text-sm text-[#9B51E0] hover:text-[#B573F8] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteConfig}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#A0A0A0]">Host:</span>
                  <span className="ml-2 text-white">{config.smtp_host}</span>
                </div>
                <div>
                  <span className="text-[#A0A0A0]">Port:</span>
                  <span className="ml-2 text-white">{config.smtp_port}</span>
                </div>
                <div>
                  <span className="text-[#A0A0A0]">From:</span>
                  <span className="ml-2 text-white">{config.from_name} ({config.from_email})</span>
                </div>
                <div>
                  <span className="text-[#A0A0A0]">Last tested:</span>
                  <span className="ml-2 text-white">
                    {config.last_tested_at ? new Date(config.last_tested_at).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#3A3A3A]">
            <div className="flex items-center space-x-2 text-sm text-[#A0A0A0]">
              <Shield className="w-4 h-4" />
              <span>Your email credentials are encrypted and secure</span>
            </div>
            <div className="flex items-center space-x-2">
              {isConfigured ? (
                <>
                  <button
                    onClick={() => setShowConfigForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#9B51E0]/20 text-[#9B51E0] border border-[#9B51E0]/30 rounded-lg hover:bg-[#9B51E0]/30 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Configure</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowConfigForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Setup Gmail SMTP</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Email Services Placeholder */}
        <div className="border border-[#3A3A3A] rounded-lg p-4 opacity-60">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h5 className="font-medium text-white">Microsoft Outlook</h5>
                <p className="text-sm text-[#A0A0A0]">
                  Connect your Outlook account for email services
                </p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* SMTP Configuration Form Modal */}
      {showConfigForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Gmail SMTP Configuration</h3>
                  <p className="text-sm text-[#A0A0A0]">Configure your Gmail SMTP settings for sending emails</p>
                </div>
                <button
                  onClick={() => setShowConfigForm(false)}
                  className="text-[#A0A0A0] hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* SMTP Server Settings */}
                <div>
                  <h4 className="text-md font-medium text-white mb-3">Server Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">SMTP Host</label>
                      <input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:border-[#9B51E0] focus:outline-none"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Port</label>
                      <input
                        type="number"
                        value={formData.port}
                        onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                        className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:border-[#9B51E0] focus:outline-none"
                        placeholder="587"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.secure}
                        onChange={(e) => setFormData(prev => ({ ...prev, secure: e.target.checked }))}
                        className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0]"
                      />
                      <span className="text-white">Use SSL/TLS (for port 465)</span>
                    </label>
                  </div>
                </div>

                {/* Authentication */}
                <div>
                  <h4 className="text-md font-medium text-white mb-3">Authentication</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Gmail Address</label>
                      <input
                        type="email"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:border-[#9B51E0] focus:outline-none"
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">App Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:border-[#9B51E0] focus:outline-none"
                        placeholder="Your Gmail app password"
                      />
                      <p className="text-xs text-[#A0A0A0] mt-1">
                        Use a Gmail App Password for better security. <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-[#9B51E0] hover:underline">Learn how to create one</a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sender Information */}
                <div>
                  <h4 className="text-md font-medium text-white mb-3">Sender Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">From Name</label>
                      <input
                        type="text"
                        value={formData.from_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, from_name: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:border-[#9B51E0] focus:outline-none"
                        placeholder="Your Store Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">From Email</label>
                      <input
                        type="email"
                        value={formData.from_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, from_email: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:border-[#9B51E0] focus:outline-none"
                        placeholder="noreply@yourstore.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[#3A3A3A]">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleTestConfig}
                      disabled={isTesting}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 transition-colors"
                    >
                      {isTesting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowConfigForm(false)}
                      className="px-4 py-2 text-[#A0A0A0] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveConfig}
                      className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#B573F8] transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Integrations Tab Component
const AnalyticsIntegrationsTab: React.FC<{ storeId: string }> = ({ storeId }) => {
  const [showGA4Modal, setShowGA4Modal] = useState(false)
  const [ga4Config, setGA4Config] = useState({
    measurementId: '',
    enhancedEcommerce: true,
    conversionTracking: true,
    audienceTracking: false
  })
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null)

  const { 
    data: integrations = [], 
    isLoading: isLoadingIntegrations 
  } = useAnalyticsIntegrations(storeId)
  
  const createIntegrationMutation = useCreateAnalyticsIntegration(storeId)
  const updateIntegrationMutation = useUpdateAnalyticsIntegration(storeId)
  const deleteIntegrationMutation = useDeleteAnalyticsIntegration(storeId)

  const ga4Integration = integrations.find(i => i.integration_type === 'google_analytics')
  
  const handleSaveGA4Config = async () => {
    try {
      const validation = GoogleAnalyticsService.validateMeasurementId(ga4Config.measurementId)
      if (!validation.isValid) {
        setTestResult({ success: false, error: validation.error })
        return
      }

      const integrationData = {
        integration_type: 'google_analytics' as const,
        integration_name: 'Google Analytics 4',
        config: {
          tracking_id: ga4Config.measurementId,
          enhanced_ecommerce: ga4Config.enhancedEcommerce,
          conversion_tracking: ga4Config.conversionTracking,
          audience_tracking: ga4Config.audienceTracking
        }
      }

      if (ga4Integration) {
        await updateIntegrationMutation.mutateAsync({
          integrationId: ga4Integration.id,
          updates: {
            config: integrationData.config,
            integration_name: integrationData.integration_name
          }
        })
      } else {
        await createIntegrationMutation.mutateAsync(integrationData)
      }

      setShowGA4Modal(false)
      setTestResult(null)
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save configuration' 
      })
    }
  }

  const handleTestGA4Connection = async () => {
    setIsTestingConnection(true)
    setTestResult(null)

    try {
      const validation = GoogleAnalyticsService.validateMeasurementId(ga4Config.measurementId)
      if (!validation.isValid) {
        setTestResult({ success: false, error: validation.error })
        return
      }

      await googleAnalytics.initialize({
        measurementId: ga4Config.measurementId,
        enhancedEcommerce: ga4Config.enhancedEcommerce,
        conversionTracking: ga4Config.conversionTracking,
        audienceTracking: ga4Config.audienceTracking,
        customDimensions: {},
        customMetrics: {}
      })

      const result = await googleAnalytics.testConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleDeleteGA4Integration = async () => {
    if (ga4Integration && confirm('Are you sure you want to remove Google Analytics 4 integration?')) {
      try {
        await deleteIntegrationMutation.mutateAsync(ga4Integration.id)
      } catch (error) {
        console.error('Failed to delete integration:', error)
      }
    }
  }

  const openGA4Modal = () => {
    if (ga4Integration) {
      setGA4Config({
        measurementId: ga4Integration.config.tracking_id || '',
        enhancedEcommerce: ga4Integration.config.enhanced_ecommerce ?? true,
        conversionTracking: ga4Integration.config.conversion_tracking ?? true,
        audienceTracking: ga4Integration.config.audience_tracking ?? false
      })
    }
    setTestResult(null)
    setShowGA4Modal(true)
  }

  if (isLoadingIntegrations) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-white">Analytics Platform Connections</h4>
      </div>

      <p className="text-sm text-[#A0A0A0]">
        Connect your store with analytics platforms to track performance, user behavior, and optimize your marketing campaigns.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {/* Google Analytics 4 Integration */}
        <div className="border border-red-500/20 bg-red-500/10 rounded-lg p-4 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-medium text-white mb-1">Google Analytics 4</h5>
                <p className="text-sm text-[#A0A0A0]">Track website visitors, user behavior, and conversion metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {ga4Integration ? (
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                  Connected
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded">
                  Not Connected
                </span>
              )}
            </div>
          </div>

          {ga4Integration && (
            <div className="mb-4 p-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[#A0A0A0]">Measurement ID:</span>
                  <span className="text-sm text-white font-mono">{ga4Integration.config.tracking_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#A0A0A0]">Enhanced E-commerce:</span>
                  <span className="text-sm text-white">
                    {ga4Integration.config.enhanced_ecommerce ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#A0A0A0]">Status:</span>
                  <span className="text-sm text-green-400">{ga4Integration.status}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <h6 className="text-sm font-medium text-white">Features:</h6>
              <ul className="text-sm text-[#A0A0A0] space-y-1">
                <li>• Website traffic tracking</li>
                <li>• User behavior analysis</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h6 className="text-sm font-medium text-white">Advanced:</h6>
              <ul className="text-sm text-[#A0A0A0] space-y-1">
                <li>• Conversion tracking</li>
                <li>• Custom events</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#3A3A3A]">
            <div className="flex items-center space-x-2 text-sm text-[#A0A0A0]">
              <Shield className="w-4 h-4" />
              <span>Direct API integration</span>
            </div>
            <div className="flex space-x-2">
              {ga4Integration && (
                <button
                  onClick={handleDeleteGA4Integration}
                  disabled={deleteIntegrationMutation.isPending}
                  className="flex items-center space-x-2 px-3 py-2 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              )}
              <button
                onClick={openGA4Modal}
                disabled={createIntegrationMutation.isPending || updateIntegrationMutation.isPending}
                className="flex items-center space-x-2 px-4 py-2 border border-red-500/20 text-red-400 rounded-lg hover:opacity-80 disabled:opacity-50 transition-colors"
              >
                {ga4Integration ? (
                  <>
                    <Settings className="w-4 h-4" />
                    <span>Configure</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Setup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Integrations */}
        <div className="border border-blue-500/20 bg-blue-500/10 rounded-lg p-4 opacity-60">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-medium text-white mb-1">Meta Pixel (Facebook)</h5>
                <p className="text-sm text-[#A0A0A0]">Track conversions and optimize Facebook advertising campaigns</p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* GA4 Configuration Modal */}
      {showGA4Modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">
                {ga4Integration ? 'Configure' : 'Setup'} Google Analytics 4
              </h3>
              <button
                onClick={() => setShowGA4Modal(false)}
                className="text-[#A0A0A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Measurement ID
                </label>
                <input
                  type="text"
                  value={ga4Config.measurementId}
                  onChange={(e) => setGA4Config({ ...ga4Config, measurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:border-red-500"
                />
                <p className="text-xs text-[#A0A0A0] mt-1">
                  Find this in your GA4 property settings
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={ga4Config.enhancedEcommerce}
                    onChange={(e) => setGA4Config({ ...ga4Config, enhancedEcommerce: e.target.checked })}
                    className="w-4 h-4 text-red-500 bg-[#2A2A2A] border border-[#3A3A3A] rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-white">Enhanced E-commerce</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={ga4Config.conversionTracking}
                    onChange={(e) => setGA4Config({ ...ga4Config, conversionTracking: e.target.checked })}
                    className="w-4 h-4 text-red-500 bg-[#2A2A2A] border border-[#3A3A3A] rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-white">Conversion Tracking</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={ga4Config.audienceTracking}
                    onChange={(e) => setGA4Config({ ...ga4Config, audienceTracking: e.target.checked })}
                    className="w-4 h-4 text-red-500 bg-[#2A2A2A] border border-[#3A3A3A] rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-white">Google Signals (Audience Tracking)</span>
                </label>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg border ${
                  testResult.success 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <div className="flex items-center space-x-2">
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {testResult.success ? 'Connection successful!' : testResult.error}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleTestGA4Connection}
                  disabled={isTestingConnection || !ga4Config.measurementId}
                  className="flex items-center space-x-2 px-4 py-2 border border-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:text-white disabled:opacity-50 transition-colors"
                >
                  {isTestingConnection ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleSaveGA4Config}
                  disabled={
                    !ga4Config.measurementId || 
                    createIntegrationMutation.isPending || 
                    updateIntegrationMutation.isPending
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {(createIntegrationMutation.isPending || updateIntegrationMutation.isPending) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Configuration</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h6 className="text-sm font-medium text-blue-300 mb-1">
              Integration Benefits
            </h6>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Unified analytics dashboard with all platform data</li>
              <li>• Automated conversion tracking across all channels</li>
              <li>• Advanced attribution and customer journey analysis</li>
              <li>• Real-time performance monitoring and alerts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Accounting Integrations Tab Component
const AccountingIntegrationsTab: React.FC = () => {
  const accountingServices = [
    {
      name: 'Intuit QuickBooks',
      description: 'Sync your sales data with QuickBooks for seamless accounting',
      icon: Calculator,
      color: 'blue'
    },
    {
      name: 'Zoho Books',
      description: 'Integrate with Zoho Books for comprehensive financial management',
      icon: BarChart3,
      color: 'green'
    },
    {
      name: 'Odoo Accounting',
      description: 'Connect with Odoo for enterprise-grade accounting features',
      icon: Activity,
      color: 'purple'
    },
    {
      name: 'Xero',
      description: 'Streamline your accounting workflow with Xero integration',
      icon: TrendingUp,
      color: 'cyan'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-white">Accounting Integrations</h4>
        <span className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg">
          Coming Soon
        </span>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 text-center">
        <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Accounting Integrations Coming Soon
        </h3>
        <p className="text-[#A0A0A0] mb-6">
          We're working on seamless integrations with popular accounting platforms to automatically sync your daily sales results and financial data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accountingServices.map((service) => {
          const Icon = service.icon
          const colorClasses = {
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            green: 'bg-green-500/10 text-green-400 border-green-500/20',
            purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
          }[service.color] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'

          return (
            <div 
              key={service.name}
              className={`border rounded-lg p-4 transition-colors opacity-60 ${colorClasses}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-white mb-1">{service.name}</h5>
                  <p className="text-sm text-[#A0A0A0]">{service.description}</p>
                  <div className="mt-3 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#A0A0A0]" />
                    <span className="text-xs text-[#A0A0A0]">Available Q2 2025</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h6 className="text-sm font-medium text-blue-300 mb-1">
              Planned Features
            </h6>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Automatic daily sales synchronization</li>
              <li>• Real-time inventory updates</li>
              <li>• Tax calculation and reporting</li>
              <li>• Financial statement integration</li>
              <li>• Multi-currency support</li>
              <li>• Audit trail and compliance reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}