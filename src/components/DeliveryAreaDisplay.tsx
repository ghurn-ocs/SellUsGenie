import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Clock, DollarSign, Info, AlertCircle } from 'lucide-react'
import { useDeliveryAreas } from '../hooks/useDeliveryAreas'
import type { DeliveryArea } from '../types/deliveryAreas'

interface DeliveryAreaDisplayProps {
  storeId: string
  showMap?: boolean
  compact?: boolean
  onLocationCheck?: (deliveryInfo: DeliveryCheckResult | null) => void
}

export interface DeliveryCheckResult {
  available: boolean
  deliveryArea?: DeliveryArea
  deliveryFee: number
  estimatedTime?: string
  message?: string
}

export const DeliveryAreaDisplay: React.FC<DeliveryAreaDisplayProps> = ({ 
  storeId, 
  showMap = false, 
  compact = false,
  onLocationCheck 
}) => {
  const [customerLocation, setCustomerLocation] = useState<string>('')
  const [checkingLocation, setCheckingLocation] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryCheckResult | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentMap, setCurrentMap] = useState<google.maps.Map | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  
  const { activeDeliveryAreas, isLoading } = useDeliveryAreas(storeId)

  // Load Google Maps API
  useEffect(() => {
    if (!showMap || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) return

    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [showMap])

  // Initialize map
  useEffect(() => {
    if (showMap && mapLoaded && mapRef.current && !currentMap && activeDeliveryAreas.length > 0) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // Default center
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      })

      // Draw delivery areas on map
      activeDeliveryAreas.forEach((area) => {
        if (area.coordinates) {
          if (area.area_type === 'polygon' && area.coordinates.coordinates) {
            const polygon = new google.maps.Polygon({
              paths: area.coordinates.coordinates.map((coord: any) => ({
                lat: coord.lat,
                lng: coord.lng
              })),
              strokeColor: '#9B51E0',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#9B51E0',
              fillOpacity: 0.2,
              map: map
            })

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h4 class="font-medium text-gray-900">${area.name}</h4>
                  <p class="text-sm text-gray-600">${area.description || ''}</p>
                  <div class="mt-2 space-y-1 text-xs">
                    <div>Delivery Fee: ${area.delivery_fee === 0 ? 'Free' : `$${area.delivery_fee.toFixed(2)}`}</div>
                    <div>Delivery Time: ${area.estimated_delivery_time_min || 30}-${area.estimated_delivery_time_max || 60} min</div>
                  </div>
                </div>
              `
            })

            polygon.addListener('click', () => {
              infoWindow.setPosition(area.coordinates.coordinates[0])
              infoWindow.open(map)
            })
          } else if (area.area_type === 'circle' && area.coordinates.center) {
            const circle = new google.maps.Circle({
              strokeColor: '#9B51E0',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#9B51E0',
              fillOpacity: 0.2,
              map: map,
              center: area.coordinates.center,
              radius: area.coordinates.radius
            })

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h4 class="font-medium text-gray-900">${area.name}</h4>
                  <p class="text-sm text-gray-600">${area.description || ''}</p>
                  <div class="mt-2 space-y-1 text-xs">
                    <div>Delivery Fee: ${area.delivery_fee === 0 ? 'Free' : `$${area.delivery_fee.toFixed(2)}`}</div>
                    <div>Delivery Time: ${area.estimated_delivery_time_min || 30}-${area.estimated_delivery_time_max || 60} min</div>
                  </div>
                </div>
              `
            })

            circle.addListener('click', () => {
              infoWindow.setPosition(area.coordinates.center)
              infoWindow.open(map)
            })
          }
        }
      })

      setCurrentMap(map)
    }
  }, [showMap, mapLoaded, activeDeliveryAreas, currentMap])

  const checkDeliveryAvailability = async (location: string) => {
    setCheckingLocation(true)
    
    try {
      // Use Google Geocoding API to get coordinates from address
      const geocoder = new google.maps.Geocoder()
      
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          // Check against delivery areas
          const availableArea = activeDeliveryAreas.find(area => {
            if (area.area_type === 'postal_code' && area.postal_codes) {
              // Extract postal code from geocoded result
              const postalCodeComponent = results[0].address_components.find(
                component => component.types.includes('postal_code')
              )
              return postalCodeComponent && area.postal_codes.includes(postalCodeComponent.short_name)
            } else if (area.area_type === 'city' && area.cities) {
              const cityComponent = results[0].address_components.find(
                component => component.types.includes('locality')
              )
              return cityComponent && area.cities.includes(cityComponent.short_name)
            }
            // For polygon and circle areas, we would need more complex geometry checking
            return false
          })

          const result: DeliveryCheckResult = availableArea ? {
            available: true,
            deliveryArea: availableArea,
            deliveryFee: availableArea.delivery_fee,
            estimatedTime: `${availableArea.estimated_delivery_time_min || 30}-${availableArea.estimated_delivery_time_max || 60} min`,
            message: availableArea.free_delivery_threshold && availableArea.free_delivery_threshold > 0 
              ? `Free delivery on orders over $${availableArea.free_delivery_threshold.toFixed(2)}`
              : undefined
          } : {
            available: false,
            deliveryFee: 0,
            message: 'Delivery not available to this location'
          }

          setDeliveryInfo(result)
          onLocationCheck?.(result)
        } else {
          const result: DeliveryCheckResult = {
            available: false,
            deliveryFee: 0,
            message: 'Unable to verify location'
          }
          setDeliveryInfo(result)
          onLocationCheck?.(result)
        }
      })
    } catch (error) {
      console.error('Error checking delivery availability:', error)
      const result: DeliveryCheckResult = {
        available: false,
        deliveryFee: 0,
        message: 'Error checking delivery availability'
      }
      setDeliveryInfo(result)
      onLocationCheck?.(result)
    } finally {
      setCheckingLocation(false)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (isLoading) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-gray-50 rounded-lg animate-pulse`}>
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    )
  }

  if (activeDeliveryAreas.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delivery Areas</h3>
            <p className="text-sm text-gray-600">No delivery areas configured yet</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Configure delivery areas in your store settings to show delivery options to customers.
        </p>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-blue-900">Delivery Available</p>
            <p className="text-xs text-blue-700">
              We deliver to {activeDeliveryAreas.length} area{activeDeliveryAreas.length > 1 ? 's' : ''}
            </p>
            <div className="mt-2 flex items-center space-x-4 text-xs text-blue-600">
              {activeDeliveryAreas.some(area => area.delivery_fee === 0) && (
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Free options available</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>30-60 min</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Delivery Areas</h3>
          <p className="text-sm text-gray-600">Check if we deliver to your location</p>
        </div>
      </div>

      {/* Location Check */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={customerLocation}
            onChange={(e) => setCustomerLocation(e.target.value)}
            placeholder="Enter your address or postal code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => checkDeliveryAvailability(customerLocation)}
            disabled={!customerLocation.trim() || checkingLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Check delivery availability"
          >
            {checkingLocation ? 'Checking...' : 'Check'}
          </button>
        </div>

        {deliveryInfo && (
          <div className={`mt-3 p-3 rounded-lg border ${
            deliveryInfo.available 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              {deliveryInfo.available ? (
                <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${
                  deliveryInfo.available ? 'text-green-900' : 'text-red-900'
                }`}>
                  {deliveryInfo.available ? 'Delivery Available!' : 'Delivery Not Available'}
                </p>
                {deliveryInfo.available && deliveryInfo.deliveryArea && (
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-green-700">
                      Area: {deliveryInfo.deliveryArea.name}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-green-600">
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{deliveryInfo.deliveryFee === 0 ? 'Free' : `$${deliveryInfo.deliveryFee.toFixed(2)}`}</span>
                      </span>
                      {deliveryInfo.estimatedTime && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{deliveryInfo.estimatedTime}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {deliveryInfo.message && (
                  <p className={`text-xs mt-1 ${
                    deliveryInfo.available ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {deliveryInfo.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Areas List */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-900">Available Delivery Areas:</h4>
        <div className="grid grid-cols-1 gap-3">
          {activeDeliveryAreas.map((area) => (
            <div key={area.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{area.name}</h5>
                <span className="text-sm text-gray-500 capitalize">
                  {area.area_type.replace('_', ' ')}
                </span>
              </div>
              
              {area.description && (
                <p className="text-sm text-gray-600 mb-2">{area.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{area.delivery_fee === 0 ? 'Free' : `$${area.delivery_fee.toFixed(2)}`}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatTime(area.estimated_delivery_time_min || 30)} - {formatTime(area.estimated_delivery_time_max || 60)}
                  </span>
                </div>
              </div>
              
              {area.free_delivery_threshold && area.free_delivery_threshold > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  Free delivery on orders over ${area.free_delivery_threshold.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map Display */}
      {showMap && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Delivery Map:</h4>
          <div
            ref={mapRef}
            className="w-full h-64 bg-gray-100 border border-gray-300 rounded-lg"
          />
          {!mapLoaded && (
            <div className="w-full h-64 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}