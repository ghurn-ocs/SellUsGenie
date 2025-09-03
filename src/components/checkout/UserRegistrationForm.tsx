import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { useDeliveryAreas } from '../../hooks/useDeliveryAreas'
import { useAuth } from '../../contexts/AuthContext'
import { GooglePlacesAutocomplete, useGoogleMapsScript } from '../GooglePlacesAutocomplete'
import { GOOGLE_MAPS_API_KEY } from '../../lib/googleMaps'
import { COUNTRIES, getStatesForCountry, countryRequiresState, getStateLabel, getPostalCodeLabel } from '../../lib/countries'
import { useModal } from '../../contexts/ModalContext'

const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

interface UserRegistrationFormProps {
  onComplete: (data: RegistrationFormData) => void
  storeId: string
}

export const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({ onComplete, storeId }) => {
  const { user } = useAuth()
  const { checkDeliveryAvailability } = useDeliveryAreas(storeId)
  const modal = useModal()
  const [deliveryStatus, setDeliveryStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null)
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null)
  const [lastCheckedAddress, setLastCheckedAddress] = useState<string>('')
  const [isAddressFromAutocomplete, setIsAddressFromAutocomplete] = useState(false)
  
  // Load Google Maps script
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMapsScript(GOOGLE_MAPS_API_KEY || '')
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: user?.user_metadata?.given_name || '',
      lastName: user?.user_metadata?.family_name || '',
      country: 'US'
    }
  })

  // Watch address fields for delivery validation
  const watchedFields = watch(['address1', 'city', 'state', 'postalCode', 'country'])
  const selectedCountry = watch('country')
  
  // Get states for selected country
  const availableStates = getStatesForCountry(selectedCountry)
  const requiresState = countryRequiresState(selectedCountry)
  const stateLabel = getStateLabel(selectedCountry)
  const postalCodeLabel = getPostalCodeLabel(selectedCountry)

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

  // Debounced delivery check when address changes
  React.useEffect(() => {
    const [address1, city, state, postalCode, country] = watchedFields
    
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
  }, [watchedFields, lastCheckedAddress, isAddressFromAutocomplete])

  // Handle address selection from Google Places Autocomplete
  const handleAddressSelect = (addressComponents: any) => {
    // Set flag to prevent loop from useEffect
    setIsAddressFromAutocomplete(true)
    
    // Update all form fields with the selected address
    setValue('address1', addressComponents.address1)
    setValue('address2', addressComponents.address2)
    setValue('city', addressComponents.city)
    setValue('state', addressComponents.state)
    setValue('postalCode', addressComponents.postalCode)
    setValue('country', addressComponents.country)

    // Trigger delivery check with the new address directly
    const fullAddress = `${addressComponents.address1}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.postalCode}, ${addressComponents.country}`
    setTimeout(() => {
      checkDelivery(fullAddress)
      setLastCheckedAddress(fullAddress)
    }, 100) // Small delay to allow form updates to process
  }

  const onSubmit = async (data: RegistrationFormData) => {
    if (deliveryStatus === 'unavailable') {
      await modal.showWarning(
        'Delivery Not Available',
        'We\'re sorry, but delivery is not currently available to this address. Please try a different address or contact us to see if we can arrange special delivery to your area.'
      )
      return
    }
    
    onComplete(data)
  }


  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-[#9B51E0]/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6 text-[#9B51E0]" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Complete Your Profile</h2>
        <p className="text-gray-600 text-sm">
          Welcome {user?.user_metadata?.given_name || user?.email}! Please provide your delivery address to complete your order.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Address *
          </label>
          {isGoogleMapsLoaded ? (
            <GooglePlacesAutocomplete
              onAddressSelect={handleAddressSelect}
              placeholder="Start typing your address..."
              initialValue={getValues('address1')}
            />
          ) : (
            <input
              {...register('address1')}
              type="text"
              placeholder="Street address"
              className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#A0A0A0]"
            />
          )}
          {errors.address1 && (
            <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('address2')}
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
              {...register('city')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {stateLabel} *
            </label>
            {requiresState ? (
              <select
                {...register('state')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              >
                <option value="">Select {stateLabel}</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...register('state')}
                type="text"
                placeholder={`Enter ${stateLabel.toLowerCase()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
              />
            )}
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {postalCodeLabel} *
            </label>
            <input
              {...register('postalCode')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            {...register('country')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>

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
           'Complete Registration & Continue'}
        </button>
      </form>
    </div>
  )
}