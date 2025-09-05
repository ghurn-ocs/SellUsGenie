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
      // First check if customer with this email already exists in this store
      const { data: existingCustomer, error: checkError } = await supabase
        .from('customers')
        .select('id, email, first_name, last_name')
        .eq('store_id', storeId)
        .eq('email', customerData.email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is what we want
        throw checkError
      }

      if (existingCustomer) {
        throw new Error(`Customer with email ${customerData.email} already exists in this store`)
      }

      // Create the customer
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

  const deleteCustomer = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) throw error
      return { id: customerId }
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

  const checkCustomerExists = async (email: string): Promise<boolean> => {
    if (!email || !storeId) return false
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('store_id', storeId)
        .eq('email', email)
        .maybeSingle()

      if (error) {
        console.error('Error checking customer:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error checking customer:', error)
      return false
    }
  }

  return {
    customers,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    checkCustomerExists,
    getCustomerStats
  }
}
