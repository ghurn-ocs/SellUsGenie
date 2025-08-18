import React, { useRef, useEffect, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressComponents {
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface GooglePlacesAutocompleteProps {
  onAddressSelect: (addressComponents: AddressComponents) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  initialValue?: string
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  onAddressSelect,
  placeholder = "Start typing an address...",
  className = "",
  disabled = false,
  initialValue = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState(initialValue)

  // Memoize the callback to prevent useEffect from re-running
  const onAddressSelectRef = useRef(onAddressSelect)
  onAddressSelectRef.current = onAddressSelect

  useEffect(() => {
    console.log('🗺️ GooglePlacesAutocomplete: useEffect triggered')
    // Check if Google Maps is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('🗺️ Google Maps JavaScript API not loaded - using fallback input')
      return
    }

    if (!inputRef.current) {
      console.log('🗺️ GooglePlacesAutocomplete: No input ref found')
      return
    }

    console.log('🗺️ GooglePlacesAutocomplete: Initializing autocomplete')

    try {
      // Initialize the reliable old autocomplete (still supported)
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        // No componentRestrictions = allow all countries worldwide
        fields: [
          'address_components',
          'formatted_address',
          'geometry',
          'place_id'
        ]
      })

      console.log('🗺️ GooglePlacesAutocomplete: Autocomplete initialized successfully')

      // Listen for place selection
      const handlePlaceSelect = () => {
        console.log('🗺️ Google Places: handlePlaceSelect triggered')
        const place = autocompleteRef.current?.getPlace()
        console.log('🗺️ Google Places: place received:', place)
        
        if (!place || !place.address_components) {
          console.log('🗺️ Google Places: No place or address components found')
          return
        }

        setIsLoading(true)

        try {
          // Parse address components
          const addressComponents = parseAddressComponents(place.address_components)
          console.log('🗺️ Google Places: parsed components:', addressComponents)
          
          // Update input value to formatted address
          setInputValue(place.formatted_address || '')
          
          // Call the callback with parsed components
          console.log('🗺️ Google Places: calling onAddressSelect with:', addressComponents)
          onAddressSelectRef.current(addressComponents)
        } catch (error) {
          console.error('Error parsing address:', error)
        } finally {
          setIsLoading(false)
        }
      }

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect)

      // Cleanup
      return () => {
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current)
        }
      }
    } catch (error) {
      console.warn('Google Places Autocomplete initialization failed:', error)
    }
  }, []) // Empty dependency array - initialize only once

  const parseAddressComponents = (
    components: google.maps.GeocoderAddressComponent[]
  ): AddressComponents => {
    const result: AddressComponents = {
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }

    components.forEach((component) => {
      const types = component.types
      const value = component.long_name

      if (types.includes('street_number')) {
        result.address1 = value + ' ' + result.address1
      } else if (types.includes('route')) {
        result.address1 += value
      } else if (types.includes('subpremise')) {
        result.address2 = value
      } else if (types.includes('locality')) {
        result.city = value
      } else if (types.includes('administrative_area_level_1')) {
        result.state = component.short_name // Use short name for state (e.g., "CA" instead of "California")
      } else if (types.includes('postal_code')) {
        result.postalCode = value
      } else if (types.includes('country')) {
        result.country = component.short_name // Use short name for country (e.g., "US" instead of "United States")
      }
    })

    // Clean up address1 (remove leading/trailing spaces)
    result.address1 = result.address1.trim()

    return result
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission when Enter is pressed on autocomplete
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="Address autocomplete input"
          aria-describedby="address-help"
          className={`w-full pl-10 pr-10 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#A0A0A0] ${className}`}
        />
        
        {/* Map pin icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <MapPin className="w-4 h-4 text-[#A0A0A0]" />
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-[#9B51E0] animate-spin" />
          </div>
        )}
      </div>
      
      {/* Help text */}
      <p className="mt-1 text-xs text-[#A0A0A0]">
        Start typing to search for addresses worldwide
      </p>
    </div>
  )
}

// Hook to load Google Maps script
export const useGoogleMapsScript = (apiKey: string) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true)
      return
    }

    // Check if script is already being loaded
    if (document.querySelector('script[data-google-maps-script]')) {
      // Wait for existing script to load
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true)
          clearInterval(checkLoaded)
        }
      }, 100)
      return () => clearInterval(checkLoaded)
    }

    // Load the script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
    script.async = true
    script.defer = true
    script.setAttribute('data-google-maps-script', 'true')
    
    script.onload = () => {
      setIsLoaded(true)
    }
    
    script.onerror = () => {
      setError('Failed to load Google Maps API')
    }
    
    document.head.appendChild(script)

    return () => {
      // Note: We don't remove the script as it might be used by other components
    }
  }, [apiKey])

  return { isLoaded, error }
}