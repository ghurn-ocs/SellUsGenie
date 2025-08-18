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
    console.log('🔑 CartContext: Setting up session ID, user:', user?.id || 'Guest')
    if (!user) {
      let guestSessionId = localStorage.getItem('cart_session_id')
      console.log('💾 Existing session ID from localStorage:', guestSessionId)
      if (!guestSessionId) {
        guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem('cart_session_id', guestSessionId)
        console.log('✨ Generated new session ID:', guestSessionId)
      }
      setSessionId(guestSessionId)
      console.log('🔑 Session ID set:', guestSessionId)
    } else {
      console.log('👤 User logged in, using customer_id:', user.id)
      setSessionId('')
    }
  }, [user])

  // Load cart items
  const loadCartItems = useCallback(async () => {
    console.log('🔄 loadCartItems called with:', { storeId, userId: user?.id, sessionId })
    if (!storeId) {
      console.log('❌ No storeId, skipping cart load')
      return
    }
    
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
        console.log('👤 Loading cart for logged in user:', user.id)
        query = query.eq('customer_id', user.id)
      } else if (sessionId) {
        console.log('🔑 Loading cart for session:', sessionId)
        query = query.eq('session_id', sessionId)
      } else {
        console.log('⏳ No user or session ID yet, skipping cart load')
        setCartItems([])
        setIsLoading(false)
        return
      }

      console.log('🔍 Executing cart query...')
      const { data, error } = await query.order('created_at', { ascending: false })
      
      console.log('📊 Cart query result:', { data: data?.length || 0, error })

      if (error) {
        console.error('❌ Cart query error:', error)
        throw error
      }

      // Filter out items where product might be null (deleted products)
      const validItems = (data || []).filter(item => item.product) as CartItemWithProduct[]
      console.log('✅ Valid cart items loaded:', validItems.length)
      setCartItems(validItems)
    } catch (err) {
      console.error('❌ Error loading cart items:', err)
      setError('Failed to load cart items')
    } finally {
      setIsLoading(false)
    }
  }, [storeId, user, sessionId])

  useEffect(() => {
    loadCartItems()
  }, [loadCartItems])

  const addToCart = async (productId: string, quantity: number = 1) => {
    console.log('🛒 CartContext.addToCart called')
    console.log('📦 Product ID:', productId)
    console.log('🔢 Quantity:', quantity)
    console.log('🏪 Store ID:', storeId)
    console.log('👤 User:', user?.id || 'Guest')
    console.log('🔑 Session ID:', sessionId)

    if (!storeId) {
      console.error('❌ No store ID provided')
      return
    }
    
    setError(null)
    
    try {
      // Check if item already exists in cart
      console.log('🔍 Checking for existing cart item...')
      console.log('🛒 Current cart items:', cartItems.length)
      const existingItem = cartItems.find(item => item.product_id === productId)
      console.log('📦 Existing item found:', !!existingItem)
      
      if (existingItem) {
        console.log('➕ Updating existing item quantity:', existingItem.quantity + quantity)
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + quantity)
      } else {
        // Add new item
        console.log('🆕 Adding new cart item...')
        
        // For logged-in users, create customer record if it doesn't exist
        if (user) {
          console.log('👤 Ensuring customer record exists for user:', user.id)
          try {
            // Check if customer exists
            const { data: existingCustomer } = await supabase
              .from('customers')
              .select('id')
              .eq('id', user.id)
              .single()

            if (!existingCustomer) {
              console.log('🆕 Creating customer record for user:', user.id)
              // Create customer record
              const { error: customerError } = await supabase
                .from('customers')
                .insert([{
                  id: user.id,
                  store_id: storeId,
                  email: user.email || `user-${user.id}@example.com`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }])

              if (customerError) {
                console.error('❌ Error creating customer record:', customerError)
                // If customer creation fails, fall back to session-based cart
                console.log('⚠️ Falling back to session-based cart')
                const fallbackSessionId = `user_fallback_${user.id}_${Date.now()}`
                const cartItemData = {
                  store_id: storeId,
                  product_id: productId,
                  quantity,
                  session_id: fallbackSessionId
                }

                console.log('📝 Fallback cart item data:', cartItemData)

                const { data, error } = await supabase
                  .from('cart_items')
                  .insert([cartItemData])
                  .select()

                console.log('💾 Fallback insert result:', { data, error })

                if (error) {
                  console.error('❌ Fallback insert error:', error)
                  throw error
                }

                console.log('✅ Cart item inserted with fallback session:', data)
                
                // Track add to cart event
                console.log('📊 Tracking cart event...')
                try {
                  await trackCartEvent('add_to_cart', productId, quantity)
                  console.log('✅ Analytics tracking successful')
                } catch (analyticsError) {
                  console.error('⚠️ Analytics tracking failed (non-critical):', analyticsError)
                }
                
                console.log('🔄 Reloading cart items...')
                await loadCartItems()
                console.log('✅ Cart items reloaded')
                return
              } else {
                console.log('✅ Customer record created successfully')
              }
            } else {
              console.log('✅ Customer record already exists')
            }
          } catch (customerCheckError) {
            console.error('❌ Error checking/creating customer:', customerCheckError)
            // Fall back to session-based cart
            console.log('⚠️ Falling back to session-based cart due to customer check error')
            const fallbackSessionId = `user_fallback_${user.id}_${Date.now()}`
            const cartItemData = {
              store_id: storeId,
              product_id: productId,
              quantity,
              session_id: fallbackSessionId
            }

            console.log('📝 Fallback cart item data (customer check failed):', cartItemData)

            const { data, error } = await supabase
              .from('cart_items')
              .insert([cartItemData])
              .select()

            console.log('💾 Fallback insert result (customer check failed):', { data, error })

            if (error) {
              console.error('❌ Fallback insert error (customer check failed):', error)
              throw error
            }

            console.log('✅ Cart item inserted with fallback session (customer check failed):', data)
            
            // Track add to cart event
            console.log('📊 Tracking cart event...')
            try {
              await trackCartEvent('add_to_cart', productId, quantity)
              console.log('✅ Analytics tracking successful')
            } catch (analyticsError) {
              console.error('⚠️ Analytics tracking failed (non-critical):', analyticsError)
            }
            
            console.log('🔄 Reloading cart items...')
            await loadCartItems()
            console.log('✅ Cart items reloaded')
            return
          }
        }

        const cartItemData = {
          store_id: storeId,
          product_id: productId,
          quantity,
          ...(user ? { customer_id: user.id } : { session_id: sessionId })
        }

        console.log('📝 Cart item data:', cartItemData)

        const { data, error } = await supabase
          .from('cart_items')
          .insert([cartItemData])
          .select()

        console.log('💾 Supabase insert result:', { data, error })

        if (error) {
          console.error('❌ Supabase insert error:', error)
          throw error
        }
        
        console.log('✅ Cart item inserted successfully:', data)
        
        // Track add to cart event
        console.log('📊 Tracking cart event...')
        try {
          await trackCartEvent('add_to_cart', productId, quantity)
          console.log('✅ Analytics tracking successful')
        } catch (analyticsError) {
          console.error('⚠️ Analytics tracking failed (non-critical):', analyticsError)
          // Don't throw - analytics failure shouldn't prevent cart operations
        }
        
        console.log('🔄 Reloading cart items...')
        await loadCartItems()
        console.log('✅ Cart items reloaded')
      }
    } catch (err) {
      console.error('❌ Error adding to cart:', err)
      console.error('Error details:', {
        err,
        productId,
        quantity,
        storeId,
        userId: user?.id,
        sessionId
      })
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
    console.log('🛒 initiateCheckout called')
    console.log('📦 Cart items:', cartItems.length)
    
    if (cartItems.length === 0) {
      console.log('❌ No items in cart, skipping checkout')
      return
    }
    
    setError(null)
    
    try {
      // Track start checkout event
      const cartValue = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      console.log('💰 Cart value for tracking:', cartValue)
      await trackCartEvent('start_checkout', undefined, undefined, cartValue)
      
      // Close cart sidebar and open checkout modal
      console.log('🔄 Closing cart sidebar, opening checkout modal')
      setIsOpen(false)
      setIsCheckoutOpen(true)
      console.log('✅ Checkout modal should now be open')
    } catch (err) {
      console.error('❌ Error initiating checkout:', err)
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