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
import { GooglePlacesAutocomplete, useGoogleMapsScript } from '../GooglePlacesAutocomplete'
import { GOOGLE_MAPS_API_KEY } from '../../lib/googleMaps'
import * as Dialog from '@radix-ui/react-dialog'

const billingSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Please enter your full name'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  billingAddress: z.object({
    line1: z.string().min(1, 'Please enter your street address'),
    line2: z.string().optional(),
    city: z.string().min(1, 'Please enter your city'),
    state: z.string().min(1, 'Please enter your state/province'),
    postalCode: z.string().min(1, 'Please enter your postal code'),
    country: z.string().min(2, 'Please select your country')
  })
})

type BillingFormData = z.infer<typeof billingSchema>

// Comprehensive country list for international support
const COUNTRIES = [
  { code: 'AD', name: 'Andorra' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AL', name: 'Albania' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AO', name: 'Angola' },
  { code: 'AQ', name: 'Antarctica' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AX', name: 'Åland Islands' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BI', name: 'Burundi' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BQ', name: 'Caribbean Netherlands' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BV', name: 'Bouvet Island' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BZ', name: 'Belize' },
  { code: 'CA', name: 'Canada' },
  { code: 'CC', name: 'Cocos Islands' },
  { code: 'CD', name: 'Democratic Republic of the Congo' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'CG', name: 'Republic of the Congo' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'CK', name: 'Cook Islands' },
  { code: 'CL', name: 'Chile' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CW', name: 'Curaçao' },
  { code: 'CX', name: 'Christmas Island' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DE', name: 'Germany' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EE', name: 'Estonia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'ES', name: 'Spain' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GE', name: 'Georgia' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'GR', name: 'Greece' },
  { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GU', name: 'Guam' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HM', name: 'Heard Island and McDonald Islands' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HR', name: 'Croatia' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HU', name: 'Hungary' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'IN', name: 'India' },
  { code: 'IO', name: 'British Indian Ocean Territory' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JE', name: 'Jersey' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JO', name: 'Jordan' },
  { code: 'JP', name: 'Japan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KM', name: 'Comoros' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'KP', name: 'North Korea' },
  { code: 'KR', name: 'South Korea' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LY', name: 'Libya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MD', name: 'Moldova' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MF', name: 'Saint Martin' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'ML', name: 'Mali' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'MO', name: 'Macao' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MT', name: 'Malta' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MV', name: 'Maldives' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NE', name: 'Niger' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NU', name: 'Niue' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'OM', name: 'Oman' },
  { code: 'PA', name: 'Panama' },
  { code: 'PE', name: 'Peru' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PL', name: 'Poland' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  { code: 'PN', name: 'Pitcairn' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'PS', name: 'Palestinian Territory' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PW', name: 'Palau' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Réunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RS', name: 'Serbia' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SH', name: 'Saint Helena' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SM', name: 'San Marino' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'SY', name: 'Syria' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'TD', name: 'Chad' },
  { code: 'TF', name: 'French Southern Territories' },
  { code: 'TG', name: 'Togo' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UM', name: 'United States Minor Outlying Islands' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VG', name: 'British Virgin Islands' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'WF', name: 'Wallis and Futuna' },
  { code: 'WS', name: 'Samoa' },
  { code: 'YE', name: 'Yemen' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
]

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
  
  // Load Google Maps for address autocomplete
  const { isLoaded: isGoogleMapsLoaded, error: googleMapsError } = useGoogleMapsScript(GOOGLE_MAPS_API_KEY || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      billingAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      }
    }
  })

  // Watch form values to ensure reactivity
  const watchedAddress = watch('billingAddress')

  const handleAddressSelect = (addressComponents: any) => {
    console.log('🏠 Address selected:', addressComponents)
    console.log('🏠 Current watched address BEFORE:', watchedAddress)
    
    // Set values immediately with validation
    setValue('billingAddress.line1', addressComponents.address1 || '', { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true
    })
    setValue('billingAddress.line2', addressComponents.address2 || '', { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true
    })
    setValue('billingAddress.city', addressComponents.city || '', { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true
    })
    setValue('billingAddress.state', addressComponents.state || '', { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true
    })
    setValue('billingAddress.postalCode', addressComponents.postalCode || '', { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true
    })
    setValue('billingAddress.country', addressComponents.country || 'US', { 
      shouldValidate: true, 
      shouldDirty: true,
      shouldTouch: true
    })
    
    // Trigger validation for the entire address section
    trigger('billingAddress')
    
    // Check values after a short delay
    setTimeout(() => {
      console.log('🏠 Address values set, watched address AFTER:', watchedAddress)
      const currentValues = watch('billingAddress')
      console.log('🏠 Current form values:', currentValues)
    }, 200)
  }

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

                {/* Google Places Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Search Address *
                  </label>
                  {googleMapsError && (
                    <div className="w-full px-3 py-2 border border-red-500 rounded-lg bg-red-500/10 text-red-300 text-sm mb-2">
                      Error loading Google Maps: {googleMapsError}
                    </div>
                  )}
                  {isGoogleMapsLoaded ? (
                    <div>
                      <GooglePlacesAutocomplete
                        onAddressSelect={handleAddressSelect}
                        placeholder="Start typing your address..."
                        className="mb-2"
                      />
                      <p className="text-xs text-[#A0A0A0]">
                        Start typing to search addresses worldwide. Select from dropdown to auto-fill fields below.
                      </p>
                    </div>
                  ) : (
                    <div className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg bg-[#1E1E1E] text-[#A0A0A0] flex items-center">
                      <div className="animate-pulse">Loading Google Maps address search...</div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={watchedAddress.line1 || ''}
                    onChange={(e) => setValue('billingAddress.line1', e.target.value, { shouldValidate: true })}
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
                    type="text"
                    value={watchedAddress.line2 || ''}
                    onChange={(e) => setValue('billingAddress.line2', e.target.value, { shouldValidate: true })}
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
                      type="text"
                      value={watchedAddress.city || ''}
                      onChange={(e) => setValue('billingAddress.city', e.target.value, { shouldValidate: true })}
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
                      type="text"
                      value={watchedAddress.state || ''}
                      onChange={(e) => setValue('billingAddress.state', e.target.value, { shouldValidate: true })}
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
                      type="text"
                      value={watchedAddress.postalCode || ''}
                      onChange={(e) => setValue('billingAddress.postalCode', e.target.value, { shouldValidate: true })}
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
                    value={watchedAddress.country || 'US'}
                    onChange={(e) => setValue('billingAddress.country', e.target.value, { shouldValidate: true })}
                    className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.billingAddress?.country && (
                    <p className="text-red-400 text-sm mt-1">{errors.billingAddress.country.message}</p>
                  )}
                </div>
              </div>

              {/* Company Information Notice */}
              <div className="bg-[#9B51E0]/20 border border-[#9B51E0]/30 rounded-lg p-4">
                <div className="flex items-start">
                  <Building className="w-5 h-5 text-[#C9A9E8] mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-[#C9A9E8]">About Your Purchase</p>
                    <p className="text-sm text-[#C9A9E8] mt-1">
                      SellUsGenie is owned by <strong>Omni Cyber Solutions LLC, USA</strong>. 
                      Your payment statement will show charges from Omni Cyber Solutions LLC, USA.
                    </p>
                  </div>
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
                      We never store your credit card details. Purchases are processed internationally.
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