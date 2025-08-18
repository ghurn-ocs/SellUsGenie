import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { MapPin, Save, Loader2 } from 'lucide-react'

const storeAddressSchema = z.object({
  store_address_line1: z.string().min(1, 'Address line 1 is required'),
  store_address_line2: z.string().optional(),
  store_city: z.string().min(1, 'City is required'),
  store_state: z.string().min(1, 'State is required'),
  store_postal_code: z.string().min(1, 'Postal code is required'),
  store_country: z.string().min(1, 'Country is required'),
  store_phone: z.string().optional(),
})

type StoreAddressFormData = z.infer<typeof storeAddressSchema>

interface StoreAddressSettingsProps {
  storeId: string
}

export const StoreAddressSettings: React.FC<StoreAddressSettingsProps> = ({ storeId }) => {
  // Fetch store data
  const { data: store } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!storeId
  })
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<StoreAddressFormData>({
    resolver: zodResolver(storeAddressSchema),
    defaultValues: {
      store_address_line1: store?.store_address_line1 || '',
      store_address_line2: store?.store_address_line2 || '',
      store_city: store?.store_city || '',
      store_state: store?.store_state || '',
      store_postal_code: store?.store_postal_code || '',
      store_country: store?.store_country || 'US',
      store_phone: store?.store_phone || '',
    }
  })

  const updateStoreAddress = useMutation({
    mutationFn: async (data: StoreAddressFormData) => {
      if (!storeId) throw new Error('No store ID provided')

      const { error } = await supabase
        .from('stores')
        .update({
          store_address_line1: data.store_address_line1,
          store_address_line2: data.store_address_line2,
          store_city: data.store_city,
          store_state: data.store_state,
          store_postal_code: data.store_postal_code,
          store_country: data.store_country,
          store_phone: data.store_phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', storeId] })
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      setMessage({ type: 'success', text: 'Store address updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    },
    onError: (error) => {
      console.error('Error updating store address:', error)
      setMessage({ type: 'error', text: 'Failed to update store address. Please try again.' })
      setTimeout(() => setMessage(null), 3000)
    }
  })

  const onSubmit = async (data: StoreAddressFormData) => {
    setIsSubmitting(true)
    try {
      await updateStoreAddress.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  if (!store) {
    return (
      <div className="text-center py-8">
        <p className="text-[#A0A0A0]">Loading store information...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <MapPin className="w-6 h-6 text-[#9B51E0] mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-white">Store Address</h2>
          <p className="text-sm text-[#A0A0A0]">
            Set your store's physical address for delivery calculations and legal requirements.
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#A0A0A0] mb-1">
            Address Line 1 *
          </label>
          <input
            {...register('store_address_line1')}
            type="text"
            placeholder="Street address"
            className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#A0A0A0]"
          />
          {errors.store_address_line1 && (
            <p className="mt-1 text-sm text-red-600">{errors.store_address_line1.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A0A0A0] mb-1">
            Address Line 2
          </label>
          <input
            {...register('store_address_line2')}
            type="text"
            placeholder="Suite, apartment, building (optional)"
            className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#A0A0A0]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-1">
              City *
            </label>
            <input
              {...register('store_city')}
              type="text"
              className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#A0A0A0]"
            />
            {errors.store_city && (
              <p className="mt-1 text-sm text-red-600">{errors.store_city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-1">
              State *
            </label>
            <select
              {...register('store_state')}
              className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#A0A0A0]"
            >
              <option value="">Select State</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.store_state && (
              <p className="mt-1 text-sm text-red-600">{errors.store_state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-1">
              ZIP Code *
            </label>
            <input
              {...register('store_postal_code')}
              type="text"
              className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#A0A0A0]"
            />
            {errors.store_postal_code && (
              <p className="mt-1 text-sm text-red-600">{errors.store_postal_code.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-1">
              Country *
            </label>
            <select
              {...register('store_country')}
              className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#A0A0A0]"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
            </select>
            {errors.store_country && (
              <p className="mt-1 text-sm text-red-600">{errors.store_country.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A0A0] mb-1">
              Store Phone Number
            </label>
            <input
              {...register('store_phone')}
              type="tel"
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#A0A0A0]"
            />
          </div>
        </div>

        <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-[#9B51E0] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white">Why do we need your store address?</h4>
              <ul className="text-sm text-[#A0A0A0] mt-1 space-y-1">
                <li>• Calculate accurate delivery distances and fees</li>
                <li>• Display store location to customers</li>
                <li>• Meet legal requirements for business registration</li>
                <li>• Enable local search and discovery</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#9B51E0] text-white rounded-lg font-medium hover:bg-[#8A47D0] disabled:bg-[#9B51E0]/50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Store Address
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}