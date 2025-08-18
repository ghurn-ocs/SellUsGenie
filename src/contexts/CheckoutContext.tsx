import React, { createContext, useContext, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'
import type { Order, Customer } from '../lib/supabase'

interface ShippingFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  // Shipping Address
  shippingAddress: {
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  // Billing Address (conditional)
  billingDifferent: boolean
  billingAddress?: {
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

// Legacy interface for backward compatibility
interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface CheckoutContextType {
  // Checkout state
  isCheckingOut: boolean
  error: string | null
  
  // Customer info (updated structure)
  shippingFormData: ShippingFormData | null
  setShippingFormData: (data: ShippingFormData) => void
  
  // Legacy support
  shippingAddress: ShippingAddress | null
  setShippingAddress: (address: ShippingAddress) => void
  
  // Payment
  createPaymentIntent: () => Promise<{ clientSecret: string; orderId: string }>
  confirmPayment: (paymentIntentId: string) => Promise<Order>
  
  // Guest checkout
  isGuestCheckout: boolean
  setIsGuestCheckout: (isGuest: boolean) => void
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

export const useCheckout = () => {
  const context = useContext(CheckoutContext)
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}

interface CheckoutProviderProps {
  children: React.ReactNode
  storeId: string
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children, storeId }) => {
  const { user } = useAuth()
  const { cartItems, subtotal, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [isGuestCheckout, setIsGuestCheckout] = useState(!user)

  const createPaymentIntent = useCallback(async (): Promise<{ clientSecret: string; orderId: string }> => {
    if (cartItems.length === 0) {
      throw new Error('Cart is empty')
    }

    setIsCheckingOut(true)
    setError(null)

    try {
      // Calculate totals
      const subtotalAmount = Math.round(subtotal * 100) // Convert to cents
      const taxAmount = Math.round(subtotalAmount * 0.08) // 8% tax for example
      const shippingAmount = subtotalAmount >= 5000 ? 0 : 500 // Free shipping over $50
      const totalAmount = subtotalAmount + taxAmount + shippingAmount

      // Create customer record if guest checkout
      let customerId = user?.id

      // For logged-in users, ensure customer record exists
      if (user && !isGuestCheckout) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('id', user.id)
          .eq('store_id', storeId)
          .single()

        if (!existingCustomer) {
          // Create customer record for logged-in user
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert([
              {
                id: user.id,
                store_id: storeId,
                email: user.email || `user-${user.id}@example.com`,
                first_name: user.user_metadata?.given_name || 'User',
                last_name: user.user_metadata?.family_name || '',
                phone: user.user_metadata?.phone || null,
              },
            ])
            .select()
            .single()

          if (customerError) {
            console.error('Error creating customer record:', customerError)
            throw new Error('Failed to create customer record')
          }
          customerId = newCustomer.id
        }
      }

      if (isGuestCheckout && shippingAddress) {
        // Check if customer already exists by email
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', shippingAddress.email)
          .eq('store_id', storeId)
          .single()

        if (existingCustomer) {
          customerId = existingCustomer.id
        } else {
          // Create new customer
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert([
              {
                store_id: storeId,
                email: shippingAddress.email,
                first_name: shippingAddress.firstName,
                last_name: shippingAddress.lastName,
                phone: shippingAddress.phone,
              },
            ])
            .select()
            .single()

          if (customerError) throw customerError
          customerId = newCustomer.id
        }
      }

      if (!customerId) {
        throw new Error('Customer ID is required')
      }

      // Create order
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            store_id: storeId,
            customer_id: customerId,
            order_number: orderNumber,
            status: 'pending',
            subtotal: subtotal,
            tax: taxAmount / 100,
            shipping: shippingAmount / 100,
            total: totalAmount / 100,
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }))

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (orderItemsError) throw orderItemsError

      // For production, this would call your backend API to create a Stripe Payment Intent
      // Since no backend API is configured, throw an error
      throw new Error('Payment system is not configured. Please contact the store owner to enable payments.')
    } catch (err) {
      console.error('Error creating payment intent:', err)
      setError(err instanceof Error ? err.message : 'Failed to create payment intent')
      throw err
    } finally {
      setIsCheckingOut(false)
    }
  }, [cartItems, subtotal, user, isGuestCheckout, shippingAddress, storeId])

  const confirmPayment = useCallback(async (paymentIntentId: string): Promise<Order> => {
    setIsCheckingOut(true)
    setError(null)

    try {
      // Update payment intent status
      await supabase
        .from('payment_intents')
        .update({ status: 'succeeded' })
        .eq('stripe_payment_intent_id', paymentIntentId)

      // Get the order
      const { data: paymentIntent } = await supabase
        .from('payment_intents')
        .select('order_id')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (!paymentIntent) {
        throw new Error('Payment intent not found')
      }

      // Update order status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({ status: 'processing' })
        .eq('id', paymentIntent.order_id)
        .select()
        .single()

      if (orderError) throw orderError

      // Clear the cart
      await clearCart()

      return order
    } catch (err) {
      console.error('Error confirming payment:', err)
      setError(err instanceof Error ? err.message : 'Failed to confirm payment')
      throw err
    } finally {
      setIsCheckingOut(false)
    }
  }, [clearCart])

  const value = {
    isCheckingOut,
    error,
    shippingAddress,
    setShippingAddress,
    createPaymentIntent,
    confirmPayment,
    isGuestCheckout,
    setIsGuestCheckout,
  }

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  )
}