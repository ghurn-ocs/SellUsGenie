import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCheckout } from '../../contexts/CheckoutContext'
import { useDeliveryAreas } from '../../hooks/useDeliveryAreas'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { GooglePlacesAutocomplete, useGoogleMapsScript } from '../GooglePlacesAutocomplete'
import { useModal } from '../../contexts/ModalContext'
import { GOOGLE_MAPS_API_KEY } from '../../lib/googleMaps'
import { COUNTRIES, getStatesForCountry, countryRequiresState, getStateLabel, getPostalCodeLabel } from '../../lib/countries'

const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  // Shipping Address
  shippingAddress: z.object({
    address1: z.string().min(1, 'Shipping address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'Shipping city is required'),
    state: z.string().min(1, 'Shipping state is required'),
    postalCode: z.string().min(1, 'Shipping postal code is required'),
    country: z.string().min(1, 'Shipping country is required'),
  }),
  // Billing Address (conditional)
  billingDifferent: z.boolean(),
  billingAddress: z.object({
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
}).refine((data) => {
  // If billing is different, all billing fields are required
  if (data.billingDifferent) {
    return (
      data.billingAddress?.address1 &&
      data.billingAddress?.city &&
      data.billingAddress?.state &&
      data.billingAddress?.postalCode &&
      data.billingAddress?.country
    )
  }
  return true
}, {
  message: "Billing address is required when different from shipping",
  path: ["billingAddress"]
})

type ShippingFormData = z.infer<typeof shippingSchema>

interface ShippingFormProps {
  onComplete: (data: ShippingFormData) => void
  storeId: string
}

export const ShippingForm: React.FC<ShippingFormProps> = ({ onComplete, storeId }) => {
  const { user } = useAuth()
  const { setShippingAddress, shippingAddress } = useCheckout()
  const { checkDeliveryAvailability, deliveryAreas } = useDeliveryAreas(storeId)
  const modal = useModal()
  const [deliveryStatus, setDeliveryStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null)
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null)
  const [lastCheckedAddress, setLastCheckedAddress] = useState<string>('')
  const [isAddressFromAutocomplete, setIsAddressFromAutocomplete] = useState(false)
  const [billingDifferent, setBillingDifferent] = useState(false)
  
  // Load Google Maps script
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMapsScript(GOOGLE_MAPS_API_KEY || '')
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.user_metadata?.given_name || '',
      lastName: user?.user_metadata?.family_name || '',
      billingDifferent: false,
      shippingAddress: {
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      },
      billingAddress: {
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      }
    }
  })

  // Watch address fields for delivery validation
  const watchedShippingFields = watch(['shippingAddress.address1', 'shippingAddress.city', 'shippingAddress.state', 'shippingAddress.postalCode', 'shippingAddress.country'])
  const watchedBillingDifferent = watch('billingDifferent')
  const shippingCountry = watch('shippingAddress.country')
  const billingCountry = watch('billingAddress.country')
  
  // Get states for selected countries
  const shippingStates = getStatesForCountry(shippingCountry)
  const billingStates = getStatesForCountry(billingCountry)
  const shippingRequiresState = countryRequiresState(shippingCountry)
  const billingRequiresState = countryRequiresState(billingCountry)
  const shippingStateLabel = getStateLabel(shippingCountry)
  const billingStateLabel = getStateLabel(billingCountry)
  const shippingPostalLabel = getPostalCodeLabel(shippingCountry)
  const billingPostalLabel = getPostalCodeLabel(billingCountry)
  
  // Sync billingDifferent state with form
  React.useEffect(() => {
    setBillingDifferent(watchedBillingDifferent)
  }, [watchedBillingDifferent])

  // Geocode address and check delivery availability
  const checkDelivery = async (address: string) => {
    if (!address.trim()) return

    setDeliveryStatus('checking')
    
    try {
      // Use Google Geocoding API to get coordinates
      const geocoder = new google.maps.Geocoder()
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results)
          } else {
            reject(new Error(`Geocoding failed: ${status}`))
          }
        })
      })

      if (result.length > 0) {
        const location = result[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()

        // Check delivery availability
        const deliveryResult = await checkDeliveryAvailability.mutateAsync({
          latitude: lat,
          longitude: lng
        })

        if (deliveryResult && deliveryResult.length > 0) {
          setDeliveryStatus('available')
          setDeliveryInfo(deliveryResult[0])
        } else {
          setDeliveryStatus('unavailable')
          setDeliveryInfo(null)
        }
      } else {
        setDeliveryStatus('unavailable')
        setDeliveryInfo(null)
      }
    } catch (error) {
      console.error('Error checking delivery:', error)
      setDeliveryStatus('unavailable')
      setDeliveryInfo(null)
    }
  }

  // Debounced delivery check when shipping address changes
  useEffect(() => {
    const [address1, city, state, postalCode, country] = watchedShippingFields
    
    if (address1 && city && state && postalCode && country) {
      const fullAddress = `${address1}, ${city}, ${state} ${postalCode}, ${country}`
      
      // Only check if the address has actually changed and it's not from autocomplete
      if (fullAddress !== lastCheckedAddress && !isAddressFromAutocomplete) {
        const timeoutId = setTimeout(() => {
          checkDelivery(fullAddress)
          setLastCheckedAddress(fullAddress)
        }, 1000) // Debounce for 1 second

        return () => clearTimeout(timeoutId)
      } else if (isAddressFromAutocomplete) {
        // Reset the flag after one cycle
        setIsAddressFromAutocomplete(false)
      }
    } else {
      setDeliveryStatus(null)
      setDeliveryInfo(null)
      setLastCheckedAddress('')
    }
  }, [watchedShippingFields, lastCheckedAddress, isAddressFromAutocomplete])

  const onSubmit = async (data: ShippingFormData) => {
    if (deliveryStatus === 'unavailable') {
      await modal.showWarning(
        'Delivery Not Available',
        'We\'re sorry, but delivery is not currently available to this address. Please try a different address or contact us to see if we can arrange special delivery to your area.'
      )
      return
    }
    
    setShippingAddress(data)
    onComplete(data)
  }

  // Handle shipping address selection from Google Places Autocomplete
  const handleShippingAddressSelect = (addressComponents: any) => {
    // Set flag to prevent loop from useEffect
    setIsAddressFromAutocomplete(true)
    
    // Update shipping address fields
    setValue('shippingAddress.address1', addressComponents.address1)
    setValue('shippingAddress.address2', addressComponents.address2)
    setValue('shippingAddress.city', addressComponents.city)
    setValue('shippingAddress.state', addressComponents.state)
    setValue('shippingAddress.postalCode', addressComponents.postalCode)
    setValue('shippingAddress.country', addressComponents.country)

    // Trigger delivery check with the new address directly
    const fullAddress = `${addressComponents.address1}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.postalCode}, ${addressComponents.country}`
    setTimeout(() => {
      checkDelivery(fullAddress)
      setLastCheckedAddress(fullAddress)
    }, 100) // Small delay to allow form updates to process
  }

  // Handle billing address selection from Google Places Autocomplete
  const handleBillingAddressSelect = (addressComponents: any) => {
    // Update billing address fields
    setValue('billingAddress.address1', addressComponents.address1)
    setValue('billingAddress.address2', addressComponents.address2)
    setValue('billingAddress.city', addressComponents.city)
    setValue('billingAddress.state', addressComponents.state)
    setValue('billingAddress.postalCode', addressComponents.postalCode)
    setValue('billingAddress.country', addressComponents.country)
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              {...register('firstName')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
            {user && <span className="text-xs text-gray-500 ml-1">(from your account)</span>}
          </label>
          <input
            {...register('email')}
            type="email"
            disabled={!!user}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent ${
              user ? 'bg-gray-50 text-gray-600' : ''
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          {isGoogleMapsLoaded ? (
            <GooglePlacesAutocomplete
              onAddressSelect={handleShippingAddressSelect}
              placeholder="Start typing your address..."
              initialValue={getValues('shippingAddress.address1')}
            />
          ) : (
            <input
              {...register('shippingAddress.address1')}
              type="text"
              placeholder="Street address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          )}
          {errors.shippingAddress?.address1 && (
            <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.address1.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('shippingAddress.address2')}
            type="text"
            placeholder="Apartment, suite, etc. (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              {...register('shippingAddress.city')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
            {errors.shippingAddress?.city && (
              <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {shippingStateLabel} *
            </label>
            {shippingRequiresState ? (
              <select
                {...register('shippingAddress.state')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              >
                <option value="">Select {shippingStateLabel}</option>
                {shippingStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...register('shippingAddress.state')}
                type="text"
                placeholder={`Enter ${shippingStateLabel.toLowerCase()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              />
            )}
            {errors.shippingAddress?.state && (
              <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {shippingPostalLabel} *
            </label>
            <input
              {...register('shippingAddress.postalCode')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
            {errors.shippingAddress?.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.postalCode.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            {...register('shippingAddress.country')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.shippingAddress?.country && (
            <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.country.message}</p>
          )}
        </div>
      </div>

      {/* Billing Address Toggle */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            {...register('billingDifferent')}
            type="checkbox"
            id="billingDifferent"
            className="w-4 h-4 text-[#9B51E0] bg-gray-100 border-gray-300 rounded focus:ring-[#9B51E0] focus:ring-2"
          />
          <label htmlFor="billingDifferent" className="ml-3 text-sm font-medium text-gray-700">
            Billing address is different from shipping address
          </label>
        </div>
      </div>

      {/* Billing Address Section */}
      {billingDifferent && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            {isGoogleMapsLoaded ? (
              <GooglePlacesAutocomplete
                onAddressSelect={handleBillingAddressSelect}
                placeholder="Start typing your billing address..."
                initialValue={getValues('billingAddress.address1')}
              />
            ) : (
              <input
                {...register('billingAddress.address1')}
                type="text"
                placeholder="Street address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              />
            )}
            {errors.billingAddress?.address1 && (
              <p className="mt-1 text-sm text-red-600">{errors.billingAddress.address1.message}</p>
            )}
          </div>

          <div>
            <input
              {...register('billingAddress.address2')}
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                {...register('billingAddress.city')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              />
              {errors.billingAddress?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.billingAddress.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {billingStateLabel} *
              </label>
              {billingRequiresState ? (
                <select
                  {...register('billingAddress.state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                >
                  <option value="">Select {billingStateLabel}</option>
                  {billingStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...register('billingAddress.state')}
                  type="text"
                  placeholder={`Enter ${billingStateLabel.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                />
              )}
              {errors.billingAddress?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.billingAddress.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {billingPostalLabel} *
              </label>
              <input
                {...register('billingAddress.postalCode')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              />
              {errors.billingAddress?.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.billingAddress.postalCode.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              {...register('billingAddress.country')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            >
              <option value="">Select Country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.billingAddress?.country && (
              <p className="mt-1 text-sm text-red-600">{errors.billingAddress.country.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Delivery Status Indicator */}
      {deliveryStatus && (
        <div className={`p-4 rounded-lg border ${
          deliveryStatus === 'checking' ? 'bg-yellow-50 border-yellow-200' :
          deliveryStatus === 'available' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {deliveryStatus === 'checking' && (
              <>
                <MapPin className="w-5 h-5 text-yellow-600 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-medium text-yellow-800">Checking Delivery Availability</h4>
                  <p className="text-sm text-yellow-700">Verifying if we deliver to your address...</p>
                </div>
              </>
            )}
            
            {deliveryStatus === 'available' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Delivery Available!</h4>
                  {deliveryInfo && (
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Area: {deliveryInfo.name}</p>
                      <p>Delivery Fee: ${deliveryInfo.delivery_fee}</p>
                      {deliveryInfo.estimated_delivery_time_min && deliveryInfo.estimated_delivery_time_max && (
                        <p>Estimated Delivery: {deliveryInfo.estimated_delivery_time_min}-{deliveryInfo.estimated_delivery_time_max} hours</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {deliveryStatus === 'unavailable' && (
              <>
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Delivery Not Available</h4>
                  <p className="text-sm text-red-700">
                    Sorry, we don't currently deliver to this address. Please try a different address or contact us for assistance.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || deliveryStatus === 'unavailable'}
        className="w-full bg-[#9B51E0] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#8A47D0] disabled:bg-[#9B51E0]/50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Processing...' : 
         deliveryStatus === 'unavailable' ? 'Delivery Not Available' :
         'Continue to Payment'}
      </button>
    </form>
  )
}