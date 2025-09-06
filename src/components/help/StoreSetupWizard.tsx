import React, { useState, useMemo } from 'react'
import { 
  Check,
  ChevronRight,
  Store,
  Package,
  CreditCard,
  Truck,
  Settings,
  Rocket,
  AlertTriangle,
  Play,
  Eye,
  User,
  MapPin,
  Image,
  Palette,
  FileText,
  Globe,
  Star,
  Target,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { GenieMascot } from '../ui/GenieMascot'
import { useStore } from '../../contexts/StoreContext'
import { useLocation } from 'wouter'
import { useProducts } from '../../hooks/useProducts'
import { usePaymentConfiguration } from '../../hooks/usePaymentConfiguration'
import { useStripeConfig } from '../../hooks/useStripeConfig'

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: 'essential' | 'recommended' | 'optional'
  estimatedTime: string
  completed: boolean
  action: () => void
  details: string[]
  tips?: string[]
}

interface StoreSetupWizardProps {
  onClose?: () => void
  onNavigateToTab?: (tab: string) => void
}

export const StoreSetupWizard: React.FC<StoreSetupWizardProps> = ({ onClose, onNavigateToTab }) => {
  const { currentStore } = useStore()
  const [, navigate] = useLocation()
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  
  // Fetch real store data
  const storeId = currentStore?.id || ''
  const { products = [], isLoading: productsLoading } = useProducts(storeId)
  const { isPaymentEnabled, hasStripeKeys, isLoading: paymentLoading } = usePaymentConfiguration(storeId)
  const { stripeConfig, isConfigured: stripeConfigured, isLoading: stripeLoading } = useStripeConfig(storeId)

  // Navigation handlers
  const navigateToProducts = () => {
    onNavigateToTab?.('products')
    navigate('/dashboard?tab=products')
  }

  const navigateToSettings = (section?: string) => {
    onNavigateToTab?.('settings')
    const url = section ? `/dashboard?tab=settings&section=${section}` : '/dashboard?tab=settings'
    navigate(url)
  }

  const navigateToPageBuilder = () => {
    onNavigateToTab?.('page-builder')
    navigate('/dashboard?tab=page-builder')
  }

  // Dynamic setup steps based on real store data
  const setupSteps: SetupStep[] = useMemo(() => [
    {
      id: 'store-info',
      title: 'Store Information',
      description: 'Set your business details and store information',
      icon: Store,
      category: 'essential',
      estimatedTime: '5 min',
      completed: !!(currentStore?.name && currentStore?.description),
      action: () => navigateToSettings('business'),
      details: [
        'Business name and store description',
        'Contact information and address',
        'Business hours and policies',
        'Store branding (update logo/tagline in Settings → Business → Store Branding)'
      ],
      tips: [
        'Choose a memorable store name',
        'Keep description under 160 characters for SEO',
        'Update store name, tagline, and logo in Settings → Business → Store Branding tab'
      ]
    },
    {
      id: 'first-products',
      title: 'Add Your First Products',
      description: `Upload at least 3 products with photos and descriptions (Currently: ${products.length} products)`,
      icon: Package,
      category: 'essential',
      estimatedTime: '30 min',
      completed: products.length >= 3,
      action: navigateToProducts,
      details: [
        'High-quality product photos (multiple angles)',
        'Clear, benefit-focused descriptions',
        'Accurate pricing and inventory',
        'Product categories and tags'
      ],
      tips: [
        'Use natural lighting for photos',
        'Write descriptions focusing on benefits, not just features',
        'Include size, weight, and material information'
      ]
    },
    {
      id: 'payment-setup',
      title: 'Payment Processing',
      description: stripeConfigured ? 'Payment processing is configured ✅' : 'Set up Stripe to accept credit cards',
      icon: CreditCard,
      category: 'essential',
      estimatedTime: '15 min',
      completed: stripeConfigured && (hasStripeKeys || isPaymentEnabled),
      action: () => navigateToSettings('payment'),
      details: [
        'Connect Stripe account for credit cards',
        'Set up automatic payouts to your bank',
        'Configure sales tax collection',
        'Test payment processing'
      ],
      tips: [
        'Stripe is the most trusted payment processor',
        'Test payments in sandbox mode first',
        'Complete KYC verification for live payments'
      ]
    },
    {
      id: 'shipping-setup',
      title: 'Shipping Configuration',
      description: 'Define shipping zones, rates, and delivery options',
      icon: Truck,
      category: 'essential',
      estimatedTime: '20 min',
      completed: !!(currentStore && products.length > 0),
      action: () => navigateToSettings('delivery'),
      details: [
        'Define shipping zones (local, national, international)',
        'Set shipping rates and free shipping thresholds',
        'Configure delivery time estimates',
        'Set up packaging and handling fees'
      ],
      tips: [
        'Offer free shipping over $50 to increase order value',
        'Use flat-rate shipping for simplicity',
        'Always include tracking information'
      ]
    },
    {
      id: 'store-design',
      title: 'Customize Store Appearance',
      description: 'Make your store look professional and trustworthy',
      icon: Palette,
      category: 'recommended',
      estimatedTime: '45 min',
      completed: false,
      action: navigateToPageBuilder,
      details: [
        'Choose colors that match your brand',
        'Add your logo and favicon',
        'Customize homepage layout',
        'Set up navigation menu'
      ],
      tips: [
        'Keep design clean and professional',
        'Use high-contrast colors for readability',
        'Make sure mobile version looks good'
      ]
    },
    {
      id: 'policies-setup',
      title: 'Legal Pages & Policies',
      description: 'Add required legal pages for customer trust',
      icon: FileText,
      category: 'essential',
      estimatedTime: '30 min',
      completed: false,
      action: () => navigateToSettings('policies'),
      details: [
        'Privacy Policy (required by law)',
        'Terms of Service',
        'Return and Refund Policy',
        'Shipping Policy'
      ],
      tips: [
        'Use our policy templates as starting points',
        'Be clear about return timeframes',
        'Include customer service contact info'
      ]
    },
    {
      id: 'domain-setup',
      title: 'Custom Domain (Optional)',
      description: 'Connect your own domain for professional branding',
      icon: Globe,
      category: 'recommended',
      estimatedTime: '15 min',
      completed: false,
      action: () => navigateToSettings('domain'),
      details: [
        'Purchase domain from registrar',
        'Update DNS settings',
        'Connect domain to your store',
        'Set up SSL certificate (automatic)'
      ],
      tips: [
        'Choose .com if available',
        'Keep domain short and memorable',
        'Avoid hyphens and numbers'
      ]
    },
    {
      id: 'test-order',
      title: 'Test Your Store',
      description: 'Place a test order to ensure everything works',
      icon: CheckCircle2,
      category: 'essential',
      estimatedTime: '10 min',
      completed: false,
      action: () => window.open('/', '_blank'),
      details: [
        'Browse your store as a customer',
        'Add items to cart and checkout',
        'Test payment processing',
        'Verify email confirmations work'
      ],
      tips: [
        'Test on both desktop and mobile',
        'Try different payment methods',
        'Check that inventory updates correctly'
      ]
    },
    {
      id: 'go-live',
      title: 'Launch Your Store',
      description: 'Make your store public and start promoting',
      icon: Rocket,
      category: 'essential',
      estimatedTime: '5 min',
      completed: false,
      action: () => navigateToSettings('general'),
      details: [
        'Remove "Coming Soon" or maintenance mode',
        'Submit to Google for indexing',
        'Share on social media',
        'Tell friends and family'
      ],
      tips: [
        'Announce your launch with a special offer',
        'Start collecting email addresses from day one',
        'Monitor your first week closely'
      ]
    }
  ], [currentStore, products.length, stripeConfigured, hasStripeKeys, isPaymentEnabled])

  const essentialSteps = setupSteps.filter(step => step.category === 'essential')
  const recommendedSteps = setupSteps.filter(step => step.category === 'recommended')
  const completedCount = setupSteps.filter(step => step.completed).length
  const progressPercentage = (completedCount / setupSteps.length) * 100

  if (productsLoading || paymentLoading || stripeLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your store setup status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🚀 Store Setup Wizard</h1>
              <p className="text-gray-400">Follow these steps to get your store ready for business</p>
            </div>
            <div className="hidden md:block">
              <GenieMascot />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Setup Progress</span>
              <span className="text-blue-400 font-medium">{completedCount} of {setupSteps.length} completed</span>
            </div>
            <div className="w-full bg-[#2A2A2A] rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {progressPercentage < 100 ? `${Math.round(100 - progressPercentage)}% remaining` : 'All done! 🎉'}
            </div>
          </div>
        </div>
      </div>

      {/* Essential Steps */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            Essential Steps
          </h2>
          <span className="text-sm text-gray-400">
            {essentialSteps.filter(step => step.completed).length} of {essentialSteps.length} completed
          </span>
        </div>

        <div className="space-y-4">
          {essentialSteps.map((step) => (
            <div
              key={step.id}
              className={`bg-[#1E1E1E] rounded-lg border transition-all duration-200 ${
                step.completed 
                  ? 'border-green-500/30 bg-green-900/10' 
                  : 'border-[#3A3A3A] hover:border-blue-500/30'
              }`}
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${step.completed ? 'bg-green-600' : 'bg-[#2A2A2A]'}`}>
                      {step.completed ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <step.icon className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-blue-400 flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {step.category}
                        </span>
                        <span className="text-xs text-gray-500">⏱️ {step.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        step.action()
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {step.completed ? 'Review' : 'Start'}
                    </button>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedStep === step.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {expandedStep === step.id && (
                <div className="px-6 pb-6 border-t border-[#3A3A3A]">
                  <div className="pt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">What you'll do:</h4>
                      <ul className="space-y-1">
                        {step.details.map((detail, index) => (
                          <li key={index} className="text-sm text-gray-400 flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {step.tips && (
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Pro Tips:
                        </h4>
                        <ul className="space-y-1">
                          {step.tips.map((tip, index) => (
                            <li key={index} className="text-sm text-green-400 flex items-start">
                              <span className="text-green-500 mr-2">💡</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Steps */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Star className="w-5 h-5 text-yellow-400 mr-2" />
            Recommended Steps
          </h2>
          <span className="text-sm text-gray-400">
            {recommendedSteps.filter(step => step.completed).length} of {recommendedSteps.length} completed
          </span>
        </div>

        <div className="space-y-4">
          {recommendedSteps.map((step) => (
            <div
              key={step.id}
              className={`bg-[#1E1E1E] rounded-lg border transition-all duration-200 ${
                step.completed 
                  ? 'border-green-500/30 bg-green-900/10' 
                  : 'border-[#3A3A3A] hover:border-yellow-500/30'
              }`}
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${step.completed ? 'bg-green-600' : 'bg-[#2A2A2A]'}`}>
                      {step.completed ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <step.icon className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-yellow-400 flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {step.category}
                        </span>
                        <span className="text-xs text-gray-500">⏱️ {step.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        step.action()
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {step.completed ? 'Review' : 'Start'}
                    </button>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedStep === step.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {expandedStep === step.id && (
                <div className="px-6 pb-6 border-t border-[#3A3A3A]">
                  <div className="pt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">What you'll do:</h4>
                      <ul className="space-y-1">
                        {step.details.map((detail, index) => (
                          <li key={index} className="text-sm text-gray-400 flex items-start">
                            <span className="text-yellow-400 mr-2">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {step.tips && (
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Pro Tips:
                        </h4>
                        <ul className="space-y-1">
                          {step.tips.map((tip, index) => (
                            <li key={index} className="text-sm text-green-400 flex items-start">
                              <span className="text-green-500 mr-2">💡</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] text-center">
        <div className="space-y-4">
          <div className="text-sm text-gray-400">
            Need help? Check our{' '}
            <button 
              onClick={() => onClose?.()}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              comprehensive help center
            </button>
            {' '}or{' '}
            <button 
              onClick={() => navigateToSettings('general')}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              contact support
            </button>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              ← Back to Help Center
            </button>
          )}
        </div>
      </div>
    </div>
  )
}