import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { 
  X, 
  Settings, 
  TrendingUp, 
  Activity, 
  Target, 
  Eye, 
  BarChart3, 
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { useAnalyticsIntegrations, useCreateAnalyticsIntegration, useUpdateAnalyticsIntegration, useDeleteAnalyticsIntegration, CreateIntegrationForm } from '../../hooks/useAnalyticsConfig'

interface AnalyticsConfigModalProps {
  isOpen: boolean
  onClose: () => void
  storeId: string
}

const integrationConfigs = {
  google_analytics: {
    name: 'Google Analytics 4',
    description: 'Track website traffic, user behavior, and conversion data',
    icon: BarChart3,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    fields: [
      { key: 'tracking_id', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', required: true }
    ]
  },
  facebook_pixel: {
    name: 'Facebook Pixel',
    description: 'Track conversions and optimize Facebook ad campaigns',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/20',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', placeholder: '123456789012345', required: true }
    ]
  },
  tiktok_pixel: {
    name: 'TikTok Pixel',
    description: 'Track conversions and optimize TikTok ad campaigns',
    icon: TrendingUp,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', placeholder: 'CXXXXXXXXXXXXXXXXX', required: true }
    ]
  },
  hotjar: {
    name: 'Hotjar',
    description: 'Heatmaps, session recordings, and user behavior insights',
    icon: Eye,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    fields: [
      { key: 'site_id', label: 'Site ID', placeholder: '1234567', required: true }
    ]
  },
  mixpanel: {
    name: 'Mixpanel',
    description: 'Advanced product analytics and user tracking',
    icon: Activity,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    fields: [
      { key: 'api_key', label: 'Project Token', placeholder: 'abc123def456ghi789', required: true }
    ]
  }
}

export const AnalyticsConfigModal: React.FC<AnalyticsConfigModalProps> = ({ isOpen, onClose, storeId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'integrations' | 'settings'>('overview')
  const [showAddIntegration, setShowAddIntegration] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null)
  const [newIntegration, setNewIntegration] = useState<CreateIntegrationForm>({
    integration_type: 'google_analytics',
    integration_name: '',
    config: {}
  })
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // Auto-dismiss notifications after 5 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const { data: integrations = [], isLoading } = useAnalyticsIntegrations(storeId)
  const createIntegration = useCreateAnalyticsIntegration(storeId)
  const updateIntegration = useUpdateAnalyticsIntegration(storeId)
  const deleteIntegration = useDeleteAnalyticsIntegration(storeId)

  const handleCreateIntegration = async () => {
    try {
      const config = integrationConfigs[newIntegration.integration_type]
      const integrationData = {
        ...newIntegration,
        integration_name: newIntegration.integration_name || config.name
      }

      await createIntegration.mutateAsync(integrationData)
      setNotification({ type: 'success', message: `${config.name} integration added successfully` })
      setShowAddIntegration(false)
      setNewIntegration({
        integration_type: 'google_analytics',
        integration_name: '',
        config: {}
      })
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to add integration' })
      console.error('Failed to create integration:', error)
    }
  }

  const handleToggleIntegration = async (integrationId: string, currentEnabled: boolean) => {
    try {
      await updateIntegration.mutateAsync({
        integrationId,
        updates: { is_enabled: !currentEnabled }
      })
      setNotification({ type: 'success', message: `Integration ${!currentEnabled ? 'enabled' : 'disabled'}` })
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to toggle integration' })
    }
  }

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!window.confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      return
    }

    try {
      await deleteIntegration.mutateAsync(integrationId)
      setNotification({ type: 'success', message: 'Integration deleted successfully' })
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to delete integration' })
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Active Integrations</h4>
              <p className="text-sm text-[#A0A0A0]">Currently tracking data</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{integrations.filter(i => i.is_enabled).length}</p>
        </div>

        <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Total Integrations</h4>
              <p className="text-sm text-[#A0A0A0]">Configured services</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{integrations.length}</p>
        </div>
      </div>

      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
        <h4 className="font-medium text-white mb-4">Quick Setup</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(integrationConfigs).slice(0, 3).map(([key, config]) => {
            const Icon = config.icon
            const isConfigured = integrations.some(i => i.integration_type === key)
            
            return (
              <div key={key} className="relative">
                <button
                  onClick={() => {
                    setActiveTab('integrations')
                    if (!isConfigured) {
                      setShowAddIntegration(true)
                      setNewIntegration({
                        integration_type: key as any,
                        integration_name: config.name,
                        config: {}
                      })
                    }
                  }}
                  className="w-full p-4 border border-[#3A3A3A] rounded-lg hover:bg-[#2A2A2A] transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{config.name}</p>
                      <p className="text-xs text-[#A0A0A0] mt-1">{isConfigured ? 'Configured' : 'Add now'}</p>
                    </div>
                  </div>
                  {isConfigured && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Analytics Integrations</h4>
          <p className="text-sm text-[#A0A0A0]">Connect external analytics services to track your store performance</p>
        </div>
        <button
          onClick={() => setShowAddIntegration(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Integration</span>
        </button>
      </div>

      {/* Add Integration Form */}
      {showAddIntegration && (
        <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium text-white">Add New Integration</h5>
            <button
              onClick={() => setShowAddIntegration(false)}
              className="text-[#A0A0A0] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Integration Type</label>
              <select
                value={newIntegration.integration_type}
                onChange={(e) => setNewIntegration({
                  ...newIntegration,
                  integration_type: e.target.value as any,
                  integration_name: integrationConfigs[e.target.value as keyof typeof integrationConfigs].name
                })}
                className="w-full p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
              >
                {Object.entries(integrationConfigs).map(([key, config]) => (
                  <option key={key} value={key}>{config.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Integration Name</label>
              <input
                type="text"
                value={newIntegration.integration_name}
                onChange={(e) => setNewIntegration({ ...newIntegration, integration_name: e.target.value })}
                placeholder="Custom name for this integration"
                className="w-full p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
              />
            </div>

            {integrationConfigs[newIntegration.integration_type].fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-white mb-2">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text"
                  value={newIntegration.config[field.key] || ''}
                  onChange={(e) => setNewIntegration({
                    ...newIntegration,
                    config: { ...newIntegration.config, [field.key]: e.target.value }
                  })}
                  placeholder={field.placeholder}
                  className="w-full p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                  required={field.required}
                />
              </div>
            ))}

            <div className="flex items-center space-x-3 pt-4">
              <button
                onClick={handleCreateIntegration}
                disabled={createIntegration.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{createIntegration.isPending ? 'Adding...' : 'Add Integration'}</span>
              </button>
              <button
                onClick={() => setShowAddIntegration(false)}
                className="px-4 py-2 border border-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:bg-[#2A2A2A] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Integrations */}
      <div className="space-y-4">
        {integrations.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No Integrations Yet</h4>
            <p className="text-[#A0A0A0] mb-4">Connect analytics services to start tracking your store performance</p>
            <button
              onClick={() => setShowAddIntegration(true)}
              className="px-6 py-3 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
            >
              Add Your First Integration
            </button>
          </div>
        ) : (
          integrations.map((integration) => {
            const config = integrationConfigs[integration.integration_type as keyof typeof integrationConfigs]
            const Icon = config?.icon || Settings
            
            return (
              <div key={integration.id} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${config?.bgColor || 'bg-gray-500/20'} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${config?.color || 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">{integration.integration_name}</h5>
                      <p className="text-sm text-[#A0A0A0]">{config?.description || 'Analytics integration'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          integration.is_enabled 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {integration.is_enabled ? 'Active' : 'Disabled'}
                        </span>
                        {integration.status === 'error' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                            Error
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleIntegration(integration.id, integration.is_enabled)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        integration.is_enabled
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {integration.is_enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="p-2 text-[#A0A0A0] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {integration.error_message && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400">Error: {integration.error_message}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
        <h4 className="font-medium text-white mb-4">Data Collection Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Anonymous Analytics</p>
              <p className="text-xs text-[#A0A0A0]">Collect aggregated usage data without personal identifiers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[#3A3A3A] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9B51E0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B51E0]"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Performance Monitoring</p>
              <p className="text-xs text-[#A0A0A0]">Track page load times and Core Web Vitals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-[#3A3A3A] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9B51E0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B51E0]"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Error Tracking</p>
              <p className="text-xs text-[#A0A0A0]">Monitor JavaScript errors and API failures</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-[#3A3A3A] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9B51E0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B51E0]"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
        <h4 className="font-medium text-white mb-4">Data Retention</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Analytics Data Retention</label>
            <select defaultValue="90" className="w-full p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]">
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
              <option value="730">2 years</option>
            </select>
            <p className="text-xs text-[#A0A0A0] mt-1">How long to keep detailed analytics data</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] z-50 overflow-hidden">
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-[#3A3A3A]">
              <div className="flex items-center justify-between">
                <div>
                  <Dialog.Title className="text-xl font-semibold text-white">Analytics Configuration</Dialog.Title>
                  <Dialog.Description className="text-sm text-[#A0A0A0] mt-1">
                    Configure analytics integrations, tracking settings, and data collection preferences
                  </Dialog.Description>
                </div>
                <button onClick={onClose} className="text-[#A0A0A0] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mt-6 bg-[#1E1E1E] p-1 rounded-lg">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'integrations', label: 'Integrations', icon: ExternalLink },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 flex-1 px-4 py-2 text-sm font-medium rounded transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#2A2A2A] text-[#9B51E0] border border-[#3A3A3A]'
                        : 'text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-[#9B51E0] mx-auto mb-2 animate-pulse" />
                    <p className="text-[#A0A0A0]">Loading analytics configuration...</p>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && renderOverviewTab()}
                  {activeTab === 'integrations' && renderIntegrationsTab()}
                  {activeTab === 'settings' && renderSettingsTab()}
                </>
              )}
            </div>

            {/* Notification */}
            {notification && (
              <div className={`fixed bottom-4 right-4 p-4 rounded-lg border backdrop-blur-sm z-[60] ${
                notification.type === 'success' 
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : notification.type === 'error'
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
              }`}>
                <div className="flex items-center space-x-3">
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : notification.type === 'error' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <ExternalLink className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{notification.message}</span>
                  <button
                    onClick={() => setNotification(null)}
                    className="ml-4 text-current hover:opacity-70 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}