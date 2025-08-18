import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { DeliveryArea, DeliveryAreaFormData } from '../types/deliveryAreas'
import { checkDeliveryAvailabilityWithGeocoding } from '../lib/deliveryAreaUtils'

export const useDeliveryAreas = (storeId: string) => {
  const queryClient = useQueryClient()

  // Fetch delivery areas for a store
  const {
    data: deliveryAreas = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['deliveryAreas', storeId],
    queryFn: async () => {
      if (!storeId) return []

      const { data, error } = await supabase
        .from('delivery_areas')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching delivery areas:', error)
        throw error
      }

      return data as DeliveryArea[]
    },
    enabled: !!storeId
  })

  // Create delivery area
  const createDeliveryArea = useMutation({
    mutationFn: async (formData: DeliveryAreaFormData) => {
      if (!storeId) throw new Error('Store ID is required')

      const { data, error } = await supabase
        .from('delivery_areas')
        .insert([{
          store_id: storeId,
          name: formData.name,
          description: formData.description,
          area_type: formData.area_type,
          coordinates: formData.coordinates,
          postal_codes: formData.postal_codes,
          cities: formData.cities,
          delivery_fee: formData.delivery_fee,
          free_delivery_threshold: formData.free_delivery_threshold || null,
          estimated_delivery_time_min: formData.estimated_delivery_time_min,
          estimated_delivery_time_max: formData.estimated_delivery_time_max,
          is_active: formData.is_active,
          max_orders_per_day: formData.max_orders_per_day,
          operating_hours: formData.operating_hours
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating delivery area:', error)
        throw error
      }

      return data as DeliveryArea
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryAreas', storeId] })
    }
  })

  // Update delivery area
  const updateDeliveryArea = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: DeliveryAreaFormData }) => {
      const { data, error } = await supabase
        .from('delivery_areas')
        .update({
          name: formData.name,
          description: formData.description,
          area_type: formData.area_type,
          coordinates: formData.coordinates,
          postal_codes: formData.postal_codes,
          cities: formData.cities,
          delivery_fee: formData.delivery_fee,
          free_delivery_threshold: formData.free_delivery_threshold || null,
          estimated_delivery_time_min: formData.estimated_delivery_time_min,
          estimated_delivery_time_max: formData.estimated_delivery_time_max,
          is_active: formData.is_active,
          max_orders_per_day: formData.max_orders_per_day,
          operating_hours: formData.operating_hours
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating delivery area:', error)
        throw error
      }

      return data as DeliveryArea
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryAreas', storeId] })
    }
  })

  // Delete delivery area
  const deleteDeliveryArea = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('delivery_areas')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting delivery area:', error)
        throw error
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryAreas', storeId] })
    }
  })

  // Toggle delivery area active status
  const toggleDeliveryArea = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('delivery_areas')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error toggling delivery area:', error)
        throw error
      }

      return data as DeliveryArea
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryAreas', storeId] })
    }
  })

  // Check if a location is within delivery areas
  const checkDeliveryAvailability = useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      try {
        // Use client-side validation with current delivery areas
        const availableAreas = await checkDeliveryAvailabilityWithGeocoding(
          latitude, 
          longitude, 
          deliveryAreas
        )
        
        return availableAreas
      } catch (error) {
        console.error('Error checking delivery availability:', error)
        throw error
      }
    }
  })

  return {
    deliveryAreas,
    isLoading,
    error,
    refetch,
    createDeliveryArea,
    updateDeliveryArea,
    deleteDeliveryArea,
    toggleDeliveryArea,
    checkDeliveryAvailability,
    // Computed properties
    activeDeliveryAreas: deliveryAreas.filter(area => area.is_active),
    totalDeliveryAreas: deliveryAreas.length
  }
}