import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Order } from '../lib/supabase'

export const useOrders = (storeId: string) => {
  const queryClient = useQueryClient()

  const {
    data: orders = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['orders', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })

  const createOrder = useMutation({
    mutationFn: async (orderData: {
      customer_id: string
      order_number: string
      subtotal: number
      tax: number
      shipping: number
      total: number
      notes?: string
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .insert([{ ...orderData, store_id: storeId, status: 'pending' }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', storeId] })
    }
  })

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', storeId] })
    }
  })

  const getOrderStats = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const pendingOrders = orders.filter(order => order.status === 'pending').length
    const completedOrders = orders.filter(order => order.status === 'delivered').length

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders
    }
  }

  return {
    orders,
    isLoading,
    error,
    createOrder,
    updateOrderStatus,
    getOrderStats
  }
}
