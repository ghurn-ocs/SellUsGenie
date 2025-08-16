import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Customer } from '../lib/supabase'

export const useCustomers = (storeId: string) => {
  const queryClient = useQueryClient()

  const {
    data: customers = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['customers', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })

  const createCustomer = useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'store_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, store_id: storeId }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', storeId] })
    }
  })

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Customer>) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', storeId] })
    }
  })

  const getCustomerStats = () => {
    const totalCustomers = customers.length
    const customersWithOrders = 0 // TODO: Calculate from separate orders query if needed
    const totalRevenue = 0 // TODO: Calculate from separate orders query if needed

    return {
      totalCustomers,
      customersWithOrders,
      totalRevenue
    }
  }

  return {
    customers,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    getCustomerStats
  }
}
