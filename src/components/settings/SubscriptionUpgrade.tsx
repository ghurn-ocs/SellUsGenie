import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  CreditCard, 
  Check, 
  Crown, 
  Users, 
  Package, 
  BarChart3,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Building,
  Phone,
  Mail
} from 'lucide-react'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan, type BillingAddress } from '../../types/subscription'
import * as Dialog from '@radix-ui/react-dialog'

const billingSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Please enter your full name'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  billingAddress: z.object({
    line1: z.string().min(5, 'Please enter your street address'),
    line2: z.string().optional(),
    city: z.string().min(2, 'Please enter your city'),
    state: z.string().min(2, 'Please enter your state/province'),
    postalCode: z.string().min(3, 'Please enter your postal code'),
    country: z.string().min(2, 'Please select your country')
  })
})

type BillingFormData = z.infer<typeof billingSchema>

interface SubscriptionUpgradeProps {
  currentPlan?: string
  onUpgrade?: (planId: string, billingData: BillingFormData) => Promise<void>
}

export const SubscriptionUpgrade: React.FC<SubscriptionUpgradeProps> = ({
  currentPlan = 'trial',
  onUpgrade
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showBillingForm, setShowBillingForm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      billingAddress: {
        country: 'US'
      }
    }
  })

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowBillingForm(true)
  }

  const handleBillingSubmit = async (data: BillingFormData) => {
    if (!selectedPlan || !onUpgrade) return

    setIsProcessing(true)
    try {
      await onUpgrade(selectedPlan.id, data)
    } catch (error) {
      console.error('Upgrade failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Package className="w-8 h-8" />
      case 'professional': return <BarChart3 className="w-8 h-8" />
      case 'enterprise': return <Crown className="w-8 h-8" />
      default: return <Package className="w-8 h-8" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Upgrade Your Account
        </h3>
        <p className="text-[#A0A0A0] max-w-2xl mx-auto">
          Choose the perfect plan for your business. Upgrade to unlock more stores, products, and powerful features.
        </p>
      </div>

      {/* Current Plan Badge */}
      {currentPlan === 'trial' && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <Zap className="w-5 h-5 text-orange-400 mr-2" />
            <span className="text-orange-300 font-medium">
              You're currently on a trial account
            </span>
          </div>
        </div>
      )}

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-[#2A2A2A] border-2 rounded-xl p-6 transition-all hover:border-[#9B51E0] ${
              plan.popular ? 'border-[#9B51E0] ring-2 ring-[#9B51E0]/20' : 'border-[#3A3A3A]'
            }`}
          >
            {/* Popular Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#9B51E0] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  plan.popular ? 'bg-[#9B51E0]/20 text-[#9B51E0]' : 'bg-[#3A3A3A] text-[#A0A0A0]'
                }`}>
                  {getPlanIcon(plan.id)}
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
              <p className="text-[#A0A0A0] text-sm mb-4">{plan.description}</p>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-white">{formatPrice(plan.price)}</span>
                <span className="text-[#A0A0A0] ml-1">/{plan.interval}</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    feature.included ? 'text-white' : 'text-[#A0A0A0] line-through'
                  }`}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Select Button */}
            <button
              onClick={() => handlePlanSelect(plan)}
              disabled={currentPlan === plan.id}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                currentPlan === plan.id
                  ? 'bg-[#3A3A3A] text-[#A0A0A0] cursor-not-allowed'
                  : plan.popular
                  ? 'bg-[#9B51E0] text-white hover:bg-[#A051E0]'
                  : 'bg-[#3A3A3A] text-white hover:bg-[#4A4A4A] border border-[#4A4A4A]'
              }`}
            >
              {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Billing Form Dialog */}
      <Dialog.Root open={showBillingForm} onOpenChange={setShowBillingForm}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-semibold text-white mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-3" />
              Complete Your Upgrade to {selectedPlan?.name}
            </Dialog.Title>

            <form onSubmit={handleSubmit(handleBillingSubmit)} className="space-y-6">
              {/* Plan Summary */}
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{selectedPlan?.name} Plan</h4>
                    <p className="text-sm text-[#A0A0A0]">{selectedPlan?.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {selectedPlan && formatPrice(selectedPlan.price)}
                    </div>
                    <div className="text-sm text-[#A0A0A0]">per {selectedPlan?.interval}</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h5 className="font-medium text-white flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Information
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Email Address *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Company Name
                    </label>
                    <input
                      {...register('companyName')}
                      type="text"
                      className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <h5 className="font-medium text-white flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Billing Address
                </h5>

                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Street Address *
                  </label>
                  <input
                    {...register('billingAddress.line1')}
                    type="text"
                    className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                    placeholder="123 Main Street"
                  />
                  {errors.billingAddress?.line1 && (
                    <p className="text-red-400 text-sm mt-1">{errors.billingAddress.line1.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Apartment, suite, etc.
                  </label>
                  <input
                    {...register('billingAddress.line2')}
                    type="text"
                    className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                    placeholder="Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      City *
                    </label>
                    <input
                      {...register('billingAddress.city')}
                      type="text"
                      className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                      placeholder="New York"
                    />
                    {errors.billingAddress?.city && (
                      <p className="text-red-400 text-sm mt-1">{errors.billingAddress.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      State/Province *
                    </label>
                    <input
                      {...register('billingAddress.state')}
                      type="text"
                      className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                      placeholder="NY"
                    />
                    {errors.billingAddress?.state && (
                      <p className="text-red-400 text-sm mt-1">{errors.billingAddress.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                      Postal Code *
                    </label>
                    <input
                      {...register('billingAddress.postalCode')}
                      type="text"
                      className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                      placeholder="10001"
                    />
                    {errors.billingAddress?.postalCode && (
                      <p className="text-red-400 text-sm mt-1">{errors.billingAddress.postalCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Country *
                  </label>
                  <select
                    {...register('billingAddress.country')}
                    className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                  {errors.billingAddress?.country && (
                    <p className="text-red-400 text-sm mt-1">{errors.billingAddress.country.message}</p>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-200">Secure Payment</p>
                    <p className="text-sm text-blue-300 mt-1">
                      Your payment information is encrypted and processed securely by Stripe. 
                      We never store your credit card details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBillingForm(false)}
                  className="px-6 py-2 text-[#A0A0A0] bg-[#3A3A3A] rounded-lg hover:bg-[#4A4A4A] transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors flex items-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}