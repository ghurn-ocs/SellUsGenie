import type { DeliveryArea } from '../types/deliveryAreas'

// Point-in-polygon algorithm to check if a coordinate is within a polygon
export function isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
  let inside = false
  const x = lng
  const y = lat

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1] // longitude
    const yi = polygon[i][0] // latitude
    const xj = polygon[j][1] // longitude  
    const yj = polygon[j][0] // latitude

    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) {
      inside = !inside
    }
  }

  return inside
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Check if a point is within a circular delivery area
export function isPointInCircle(lat: number, lng: number, centerLat: number, centerLng: number, radiusKm: number): boolean {
  const distance = calculateDistance(lat, lng, centerLat, centerLng)
  return distance <= radiusKm
}

// Main function to check delivery availability
export function checkDeliveryAvailability(
  lat: number, 
  lng: number, 
  deliveryAreas: DeliveryArea[]
): DeliveryArea[] {
  const availableAreas: DeliveryArea[] = []

  for (const area of deliveryAreas) {
    // Skip inactive areas
    if (!area.is_active) continue

    let isWithinArea = false

    switch (area.area_type) {
      case 'polygon':
        if (area.coordinates && Array.isArray(area.coordinates) && area.coordinates.length > 0) {
          // Coordinates should be array of [lat, lng] pairs
          console.log(`🔺 Checking polygon area "${area.name}" with coordinates:`, area.coordinates)
          isWithinArea = isPointInPolygon(lat, lng, area.coordinates as number[][])
          console.log(`🔺 Point (${lat}, ${lng}) in polygon "${area.name}": ${isWithinArea}`)
        }
        break

      case 'circle':
        if (area.coordinates && Array.isArray(area.coordinates) && area.coordinates.length >= 3) {
          // For circle: [centerLat, centerLng, radiusKm]
          const [centerLat, centerLng, radiusKm] = area.coordinates as [number, number, number]
          const distance = calculateDistance(lat, lng, centerLat, centerLng)
          console.log(`⭕ Checking circle area "${area.name}" - Center: (${centerLat}, ${centerLng}), Radius: ${radiusKm}km`)
          console.log(`⭕ Distance from point (${lat}, ${lng}): ${distance.toFixed(2)}km`)
          isWithinArea = isPointInCircle(lat, lng, centerLat, centerLng, radiusKm)
          console.log(`⭕ Point (${lat}, ${lng}) in circle "${area.name}": ${isWithinArea}`)
        }
        break

      case 'postal_code':
        // For postal codes, we'd need reverse geocoding to get the postal code
        // This is more complex and would require additional API calls
        // For now, we'll skip this validation type
        console.warn('Postal code validation not implemented yet')
        break

      case 'city':
        // Similar to postal codes, would need reverse geocoding
        console.warn('City validation not implemented yet')
        break

      default:
        console.warn(`Unknown delivery area type: ${area.area_type}`)
    }

    if (isWithinArea) {
      availableAreas.push(area)
    }
  }

  return availableAreas
}

// Enhanced validation with postal code and city support using reverse geocoding
export async function checkDeliveryAvailabilityWithGeocoding(
  lat: number,
  lng: number,
  deliveryAreas: DeliveryArea[]
): Promise<DeliveryArea[]> {
  console.log('🔍 Checking delivery for coordinates:', { lat, lng })
  console.log('📍 Available delivery areas:', deliveryAreas)
  console.log('✅ Active delivery areas:', deliveryAreas.filter(area => area.is_active))
  
  const availableAreas: DeliveryArea[] = []

  // First check polygon and circle areas
  const geometricAreas = deliveryAreas.filter(area => 
    area.area_type === 'polygon' || area.area_type === 'circle'
  )
  availableAreas.push(...checkDeliveryAvailability(lat, lng, geometricAreas))

  // For postal code and city areas, we need reverse geocoding
  const postalCodeAreas = deliveryAreas.filter(area => area.area_type === 'postal_code' && area.is_active)
  const cityAreas = deliveryAreas.filter(area => area.area_type === 'city' && area.is_active)

  if (postalCodeAreas.length > 0 || cityAreas.length > 0) {
    try {
      // Use Google Maps reverse geocoding
      if (window.google && window.google.maps) {
        const geocoder = new google.maps.Geocoder()
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === 'OK' && results) {
                resolve(results)
              } else {
                reject(new Error(`Reverse geocoding failed: ${status}`))
              }
            }
          )
        })

        if (result.length > 0) {
          const addressComponents = result[0].address_components

          // Check postal code areas
          for (const area of postalCodeAreas) {
            if (area.postal_codes && Array.isArray(area.postal_codes)) {
              for (const component of addressComponents) {
                if (component.types.includes('postal_code')) {
                  const postalCode = component.long_name
                  if (area.postal_codes.includes(postalCode)) {
                    availableAreas.push(area)
                    break
                  }
                }
              }
            }
          }

          // Check city areas
          for (const area of cityAreas) {
            if (area.cities && Array.isArray(area.cities)) {
              for (const component of addressComponents) {
                if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                  const city = component.long_name.toLowerCase()
                  if (area.cities.some(areaCity => areaCity.toLowerCase() === city)) {
                    availableAreas.push(area)
                    break
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error with reverse geocoding:', error)
    }
  }

  // Remove duplicates
  const uniqueAreas = availableAreas.filter((area, index, self) => 
    self.findIndex(a => a.id === area.id) === index
  )

  console.log('🎯 Final available areas:', uniqueAreas)
  return uniqueAreas
}