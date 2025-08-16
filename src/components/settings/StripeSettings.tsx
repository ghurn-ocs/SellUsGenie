import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  CreditCard, 
  Key, 
  Globe, 
  Check, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  RefreshCw,
  ExternalLink,
  Webhook,
  Shield,
  TestTube
} from 'lucide-react'
import { useStripeConfig } from '../../hooks/useStripeConfig'
import * as Switch from '@radix-ui/react-switch'
import * as Tabs from '@radix-ui/react-tabs'

const stripeConfigSchema = z.object({
  publishableKey: z.string()
    .min(1, 'Publishable key is required')
    .startsWith('pk_', 'Must start with pk_'),
  secretKey: z.string()
    .min(1, 'Secret key is required')
    .startsWith('sk_', 'Must start with sk_'),
  isLiveMode: z.boolean()
})

type StripeConfigForm = z.infer<typeof stripeConfigSchema>

interface StripeSettingsProps {
  storeId: string
}

export const StripeSettings: React.FC<StripeSettingsProps> = ({ storeId }) => {
  const {
    stripeConfig,
    isLoading,
    updateStripeConfig,
    testWebhook,
    validateApiKeys,
    createWebhookEndpoint,
    isConfigured
  } = useStripeConfig(storeId)

  const [showSecretKey, setShowSecretKey] = useState(false)
  const [activeTab, setActiveTab] = useState('api-keys')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<StripeConfigForm>({
    resolver: zodResolver(stripeConfigSchema),
    defaultValues: {
      publishableKey: stripeConfig?.stripe_publishable_key || '',
      secretKey: '',
      isLiveMode: stripeConfig?.is_live_mode || false
    }
  })

  const isLiveMode = watch('isLiveMode')

  const onSubmit = async (data: StripeConfigForm) => {
    try {
      // Validate keys first
      await validateApiKeys.mutateAsync({
        publishableKey: data.publishableKey,
        secretKey: data.secretKey
      })

      // Save configuration
      await updateStripeConfig.mutateAsync({
        stripe_publishable_key: data.publishableKey,
        stripe_secret_key_encrypted: data.secretKey, // Will be encrypted server-side
        is_live_mode: data.isLiveMode,
        configuration_status: 'active',
        is_configured: true
      })

      // Auto-create webhook if not exists
      if (!stripeConfig?.webhook_endpoint_id) {
        await createWebhookEndpoint.mutateAsync()
      }
    } catch (error) {
      console.error('Failed to save Stripe configuration:', error)
    }
  }

  const handleTestWebhook = async () => {
    try {
      await testWebhook.mutateAsync()
    } catch (error) {
      console.error('Webhook test failed:', error)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'error': return 'text-red-400 bg-red-500/20'
      default: return 'text-[#A0A0A0] bg-[#3A3A3A]'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <Check className="w-4 h-4" />
      case 'pending': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B51E0]"></div>
          <span className="ml-3 text-[#E0E0E0]">Loading Stripe settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Stripe Payment Configuration
          </h3>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Configure Stripe for secure payment processing
          </p>
        </div>
        
        {isConfigured && (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stripeConfig?.configuration_status)}`}>
            {getStatusIcon(stripeConfig?.configuration_status)}
            <span className="ml-2">
              {stripeConfig?.configuration_status === 'active' ? 'Active' : 
               stripeConfig?.configuration_status === 'pending' ? 'Pending' : 
               stripeConfig?.configuration_status === 'error' ? 'Error' : 'Inactive'}
            </span>
          </div>
        )}
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex justify-center space-x-1 bg-[#2A2A2A] p-1 rounded-lg">
          <Tabs.Trigger
            value="api-keys"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
          >
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </Tabs.Trigger>
          <Tabs.Trigger
            value="webhooks"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
          >
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </Tabs.Trigger>
          <Tabs.Trigger
            value="testing"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-[#9B51E0] data-[state=active]:shadow-sm text-[#A0A0A0] hover:text-[#E0E0E0] transition-colors"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Testing
          </Tabs.Trigger>
        </Tabs.List>

        {/* API Keys Tab */}
        <Tabs.Content value="api-keys" className="mt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Environment Toggle */}
            <div className="bg-[#2A2A2A] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Environment</label>
                  <p className="text-sm text-[#A0A0A0] mt-1">
                    {isLiveMode ? 'Live mode - Real payments will be processed' : 'Test mode - Safe for development'}
                  </p>
                </div>
                <Switch.Root
                  checked={isLiveMode}
                  onCheckedChange={(checked) => setValue('isLiveMode', checked)}
                  className="w-11 h-6 bg-[#3A3A3A] rounded-full relative data-[state=checked]:bg-[#9B51E0] transition-colors"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5 translate-x-0.5" />
                </Switch.Root>
              </div>
              
              {isLiveMode && (
                <div className="mt-4 p-3 bg-orange-900 bg-opacity-20 border border-orange-500 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-orange-200">Live Mode Enabled</p>
                      <p className="text-sm text-orange-300 mt-1">
                        You are using live API keys. Real payments will be processed and real money will be transferred.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Publishable Key */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Publishable Key *
              </label>
              <div className="relative">
                <input
                  {...register('publishableKey')}
                  type="text"
                  placeholder={`pk_${isLiveMode ? 'live' : 'test'}_...`}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                />
                <Globe className="absolute right-3 top-2.5 w-5 h-5 text-[#A0A0A0]" />
              </div>
              {errors.publishableKey && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.publishableKey.message}</p>
              )}
              <p className="mt-1 text-xs text-[#A0A0A0]">
                Safe to share publicly - used in your frontend code
              </p>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Secret Key *
              </label>
              <div className="relative">
                <input
                  {...register('secretKey')}
                  type={showSecretKey ? 'text' : 'password'}
                  placeholder={`sk_${isLiveMode ? 'live' : 'test'}_...`}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-2.5 text-[#A0A0A0] hover:text-white"
                >
                  {showSecretKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.secretKey && (
                <p className="mt-1 text-sm text-[#EF4444]">{errors.secretKey.message}</p>
              )}
              <p className="mt-1 text-xs text-[#A0A0A0] flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Keep this secret - used for server-side operations only
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || validateApiKeys.isPending}
                className="bg-[#9B51E0] text-white px-6 py-2 rounded-lg hover:bg-[#A051E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {(isSubmitting || validateApiKeys.isPending) ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {validateApiKeys.isPending ? 'Validating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </button>

              <a
                href={`https://dashboard.stripe.com/${isLiveMode ? 'live/' : 'test/'}apikeys`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9B51E0] hover:text-[#A051E0] text-sm flex items-center"
              >
                Get API Keys
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </form>
        </Tabs.Content>

        {/* Webhooks Tab */}
        <Tabs.Content value="webhooks" className="mt-6">
          <div className="space-y-6">
            <div className="bg-[#2A2A2A] rounded-lg p-6">
              <h4 className="text-lg font-medium text-white mb-4">Webhook Configuration</h4>
              
              {stripeConfig?.webhook_endpoint_id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Webhook Endpoint</p>
                      <p className="text-sm text-[#A0A0A0]">
                        {`${window.location.origin}/api/stripe/webhook`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white mb-2">Enabled Events</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'payment_intent.succeeded',
                        'payment_intent.payment_failed',
                        'invoice.payment_succeeded',
                        'customer.subscription.updated'
                      ].map((event) => (
                        <div key={event} className="text-xs bg-[#3A3A3A] px-2 py-1 rounded text-[#A0A0A0]">
                          {event}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleTestWebhook}
                    disabled={testWebhook.isPending}
                    className="bg-[#3A3A3A] text-white px-4 py-2 rounded-lg hover:bg-[#4A4A4A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {testWebhook.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Webhook
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Webhook className="w-12 h-12 text-[#A0A0A0] mx-auto mb-4" />
                  <h5 className="text-lg font-medium text-white mb-2">No Webhook Configured</h5>
                  <p className="text-sm text-[#A0A0A0] mb-4">
                    Configure your API keys first, then we'll automatically set up webhooks for you.
                  </p>
                  {isConfigured && (
                    <button
                      onClick={() => createWebhookEndpoint.mutate()}
                      disabled={createWebhookEndpoint.isPending}
                      className="bg-[#9B51E0] text-white px-4 py-2 rounded-lg hover:bg-[#A051E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {createWebhookEndpoint.isPending ? 'Creating...' : 'Create Webhook'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Tabs.Content>

        {/* Testing Tab */}
        <Tabs.Content value="testing" className="mt-6">
          <div className="space-y-6">
            <div className="bg-[#2A2A2A] rounded-lg p-6">
              <h4 className="text-lg font-medium text-white mb-4">Test Your Integration</h4>
              
              {!isConfigured ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h5 className="text-lg font-medium text-white mb-2">Configuration Required</h5>
                  <p className="text-sm text-[#A0A0A0]">
                    Complete your API key configuration first to enable testing.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#3A3A3A] rounded-lg p-4">
                      <h6 className="font-medium text-white mb-2">Test Cards</h6>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#A0A0A0]">Success:</span>
                          <span className="text-white font-mono">4242424242424242</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#A0A0A0]">Decline:</span>
                          <span className="text-white font-mono">4000000000000002</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#A0A0A0]">3D Secure:</span>
                          <span className="text-white font-mono">4000000000003220</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#3A3A3A] rounded-lg p-4">
                      <h6 className="font-medium text-white mb-2">Integration Status</h6>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#A0A0A0]">API Keys</span>
                          <Check className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#A0A0A0]">Webhooks</span>
                          {stripeConfig?.webhook_endpoint_id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#A0A0A0]">Last Test</span>
                          <span className="text-xs text-[#A0A0A0]">
                            {stripeConfig?.last_webhook_test ? 
                              new Date(stripeConfig.last_webhook_test).toLocaleDateString() : 
                              'Never'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleTestWebhook}
                      disabled={testWebhook.isPending}
                      className="bg-[#9B51E0] text-white px-4 py-2 rounded-lg hover:bg-[#A051E0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {testWebhook.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Run Full Test
                        </>
                      )}
                    </button>

                    <a
                      href="https://stripe.com/docs/testing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#9B51E0] hover:text-[#A051E0] text-sm flex items-center"
                    >
                      Testing Guide
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}