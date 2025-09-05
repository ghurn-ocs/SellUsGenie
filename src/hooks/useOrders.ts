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

  // Professional order creation with order items (atomic transaction)
  const createProfessionalOrder = useMutation({
    mutationFn: async (orderData: {
      customer_id: string
      order_number: string
      status: 'to_be_paid'
      payment_status: 'unpaid'
      subtotal: number
      tax: number
      shipping: number
      total: number
      notes?: string
      order_items: Array<{
        product_id: string
        product_name: string
        product_sku?: string
        quantity: number
        unit_price: number
        total_price: number
      }>
    }) => {
      console.log('🚀 Creating professional order with items:', orderData)

      // Start transaction by creating the order first
      const { order_items, ...orderDataForDB } = orderData
      
      // Map field names to match actual database schema
      const orderForDB = {
        store_id: storeId,
        customer_id: orderDataForDB.customer_id,
        order_number: orderDataForDB.order_number,
        status: orderDataForDB.status,
        payment_status: orderDataForDB.payment_status,
        subtotal: orderDataForDB.subtotal,
        tax_amount: orderDataForDB.tax,        // Map to tax_amount
        shipping_amount: orderDataForDB.shipping, // Map to shipping_amount  
        total_amount: orderDataForDB.total,    // Map to total_amount
        // Also set the legacy fields for backward compatibility
        tax: orderDataForDB.tax,
        shipping: orderDataForDB.shipping,
        total: orderDataForDB.total,
        notes: orderDataForDB.notes
      }
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderForDB])
        .select()
        .single()

      if (orderError) {
        console.error('❌ Order creation failed:', orderError)
        throw orderError
      }

      console.log('✅ Order created:', order)

      // Create order items
      const orderItemsToInsert = order_items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }))

      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert)
        .select()

      if (itemsError) {
        console.error('❌ Order items creation failed:', itemsError)
        // If order items fail, we should delete the order (rollback)
        await supabase.from('orders').delete().eq('id', order.id)
        throw itemsError
      }

      console.log('✅ Order items created:', orderItems)

      // TODO: Generate Stripe payment link
      // TODO: Send email to customer with payment link
      // TODO: Update inventory quantities

      return { order, orderItems }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', storeId] })
    }
  })

  // Legacy simple order creation (for backward compatibility)
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

  const updateOrder = useMutation({
    mutationFn: async (orderData: {
      id: string
      customer_id?: string
      order_number?: string
      status?: Order['status']
      subtotal?: number
      tax?: number
      shipping?: number
      total?: number
      notes?: string
    }) => {
      const { id, total, ...updates } = orderData
      // Map 'total' to 'total_amount' if provided
      const updatesForDB = {
        ...updates,
        ...(total !== undefined && { total: total })
      }
      const { data, error } = await supabase
        .from('orders')
        .update(updatesForDB)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', storeId] })
    }
  })

  const deleteOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error
      return { id: orderId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', storeId] })
    }
  })

  // Update order with tax amount after Stripe payment (called by webhook)
  const updateOrderTaxAfterPayment = useMutation({
    mutationFn: async (orderData: {
      orderId: string
      tax: number
      total: number
      status: 'paid'
      payment_status: 'paid'
      stripe_payment_intent_id?: string
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({
          tax: orderData.tax,
          total: orderData.total,
          status: orderData.status,
          payment_status: orderData.payment_status,
          stripe_payment_intent_id: orderData.stripe_payment_intent_id
        })
        .eq('id', orderData.orderId)
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
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
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
    createProfessionalOrder,
    updateOrder,
    updateOrderStatus,
    updateOrderTaxAfterPayment,
    deleteOrder,
    getOrderStats
  }
}
