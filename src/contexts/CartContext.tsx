import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useAnalyticsTracking } from '../hooks/useAnalyticsTracking'
import type { CartItem, Product } from '../lib/supabase'

export interface CartItemWithProduct extends CartItem {
  product: Product
}

interface CartContextType {
  cartItems: CartItemWithProduct[]
  isLoading: boolean
  error: string | null
  
  // Cart operations
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  
  // Cart calculations
  itemCount: number
  subtotal: number
  
  // Cart state
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  
  // Checkout
  initiateCheckout: () => Promise<void>
  isCheckoutOpen: boolean
  setIsCheckoutOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: React.ReactNode
  storeId: string
}

export const CartProvider: React.FC<CartProviderProps> = ({ children, storeId }) => {
  const { user } = useAuth()
  const { trackCartEvent } = useAnalyticsTracking(storeId)
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')

  // Generate session ID for guest carts
  useEffect(() => {
    if (!user) {
      let guestSessionId = localStorage.getItem('cart_session_id')
      if (!guestSessionId) {
        guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('cart_session_id', guestSessionId)
      }
      setSessionId(guestSessionId)
    }
  }, [user])

  // Load cart items
  const loadCartItems = useCallback(async () => {
    if (!storeId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('store_id', storeId)

      if (user) {
        query = query.eq('customer_id', user.id)
      } else if (sessionId) {
        query = query.eq('session_id', sessionId)
      } else {
        setCartItems([])
        setIsLoading(false)
        return
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Filter out items where product might be null (deleted products)
      const validItems = (data || []).filter(item => item.product) as CartItemWithProduct[]
      setCartItems(validItems)
    } catch (err) {
      console.error('Error loading cart items:', err)
      setError('Failed to load cart items')
    } finally {
      setIsLoading(false)
    }
  }, [storeId, user, sessionId])

  useEffect(() => {
    loadCartItems()
  }, [loadCartItems])

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!storeId) return
    
    setError(null)
    
    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId)
      
      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity)
      } else {
        // Add new item
        const cartItemData = {
          store_id: storeId,
          product_id: productId,
          quantity,
          ...(user ? { customer_id: user.id } : { session_id: sessionId })
        }

        const { error } = await supabase
          .from('cart_items')
          .insert([cartItemData])

        if (error) throw error
        
        // Track add to cart event
        await trackCartEvent('add_to_cart', productId, quantity)
        
        await loadCartItems()
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
      setError('Failed to add item to cart')
      throw err
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    setError(null)
    
    try {
      // Get item details before removing for analytics
      const cartItem = cartItems.find(item => item.id === cartItemId)
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)

      if (error) throw error
      
      // Track remove from cart event
      if (cartItem) {
        await trackCartEvent('remove_from_cart', cartItem.product_id, cartItem.quantity)
      }
      
      setCartItems(prev => prev.filter(item => item.id !== cartItemId))
    } catch (err) {
      console.error('Error removing from cart:', err)
      setError('Failed to remove item from cart')
      throw err
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }
    
    setError(null)
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', cartItemId)

      if (error) throw error
      
      setCartItems(prev => 
        prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity }
            : item
        )
      )
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('Failed to update quantity')
      throw err
    }
  }

  const clearCart = async () => {
    setError(null)
    
    try {
      let query = supabase
        .from('cart_items')
        .delete()
        .eq('store_id', storeId)

      if (user) {
        query = query.eq('customer_id', user.id)
      } else if (sessionId) {
        query = query.eq('session_id', sessionId)
      }

      const { error } = await query

      if (error) throw error
      
      setCartItems([])
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('Failed to clear cart')
      throw err
    }
  }

  const initiateCheckout = async () => {
    if (cartItems.length === 0) return
    
    setError(null)
    
    try {
      // Track start checkout event
      const cartValue = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      await trackCartEvent('start_checkout', undefined, undefined, cartValue)
      
      // Close cart sidebar and open checkout modal
      setIsOpen(false)
      setIsCheckoutOpen(true)
    } catch (err) {
      console.error('Error initiating checkout:', err)
      setError('Failed to initiate checkout')
      throw err
    }
  }

  // Calculate totals
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)

  const value = {
    cartItems,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    isOpen,
    setIsOpen,
    initiateCheckout,
    isCheckoutOpen,
    setIsCheckoutOpen,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}