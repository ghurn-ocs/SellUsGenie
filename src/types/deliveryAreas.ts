export interface DeliveryArea {
  id: string
  store_id: string
  name: string
  description?: string
  area_type: 'polygon' | 'circle' | 'postal_code' | 'city'
  coordinates?: any // JSONB - flexible structure for different area types
  postal_codes?: string[]
  cities?: string[]
  delivery_fee: number
  free_delivery_threshold?: number
  estimated_delivery_time_min?: number
  estimated_delivery_time_max?: number
  is_active: boolean
  max_orders_per_day?: number
  operating_hours?: any // JSONB
  created_at: string
  updated_at: string
}

export interface DeliveryExclusion {
  id: string
  delivery_area_id: string
  name: string
  coordinates: any // JSONB
  reason?: string
  created_at: string
}

export interface DeliveryTimeSlot {
  id: string
  delivery_area_id: string
  day_of_week: number // 0-6, Sunday = 0
  start_time: string
  end_time: string
  max_orders: number
  is_available: boolean
  created_at: string
}

export interface GoogleMapsPolygon {
  paths: google.maps.LatLng[]
}

export interface GoogleMapsCircle {
  center: google.maps.LatLng
  radius: number // in meters
}

export interface DeliveryAreaFormData {
  name: string
  description: string
  area_type: 'polygon' | 'circle' | 'postal_code' | 'city'
  coordinates?: any
  postal_codes: string[]
  cities: string[]
  delivery_fee: number
  free_delivery_threshold: number
  estimated_delivery_time_min: number
  estimated_delivery_time_max: number
  is_active: boolean
  max_orders_per_day: number
  operating_hours: {
    [key: string]: {
      enabled: boolean
      start: string
      end: string
    }
  }
}

export interface OperatingHours {
  [day: string]: {
    enabled: boolean
    start: string // HH:MM format
    end: string // HH:MM format
  }
}

export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: true, start: '09:00', end: '17:00' },
  saturday: { enabled: true, start: '10:00', end: '16:00' },
  sunday: { enabled: false, start: '10:00', end: '16:00' }
}