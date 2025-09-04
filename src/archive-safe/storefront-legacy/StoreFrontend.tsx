import React, { useState, useEffect } from 'react'
import { useLocation, useRoute } from 'wouter'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useAnalyticsTracking } from '../hooks/useAnalyticsTracking'
import type { Product, Store } from '../lib/supabase'
import { GenieMascot } from '../components/ui/GenieMascot'

interface StoreFrontendProps {}

const StoreFrontend: React.FC<StoreFrontendProps> = () => {
  const [, setLocation] = useLocation()
  const [, params] = useRoute('/store/:storeSlug')
  const { user, signInWithGoogle, signOut } = useAuth()
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<{ [key: string]: number }>({})

  // Get store slug from URL parameter
  const storeSlug = params?.storeSlug
  
  // Initialize analytics tracking once we have store ID
  const { trackPageView, trackProductView } = useAnalyticsTracking(store?.id)

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      try {
        // Fetch store details
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('store_slug', storeSlug)
          .eq('is_active', true)
          .single()

        if (storeError) {
          console.error('Store not found:', storeError)
          setLocation('/')
          return
        }

        setStore(storeData)

        // Fetch products for this store
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (productsError) {
          console.error('Error fetching products:', productsError)
        } else {
          setProducts(productsData || [])
        }
      } catch (error) {
        console.error('Error loading store:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStoreAndProducts()
  }, [storeSlug, setLocation])

  // Track page view when store is loaded
  useEffect(() => {
    if (store) {
      trackPageView(window.location.pathname, `${store.store_name} - Home`)
    }
  }, [store, trackPageView])

  const addToCart = (productId: string) => {
    // Track product view when adding to cart (implicit view)
    trackProductView(productId)
    
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[productId] > 1) {
        newCart[productId] -= 1
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0)
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId)
      return total + (product?.price || 0) * quantity
    }, 0)
  }

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login
      return
    }
    // TODO: Implement checkout process
    console.log('Proceeding to checkout...')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B51E0] mx-auto mb-4"></div>
          <p className="text-[#E0E0E0]">Loading store...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Store Not Found</h1>
          <p className="text-[#E0E0E0]">The store you're looking for doesn't exist or is inactive.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {/* Header */}
      <header className="bg-[#2A2A2A] shadow-lg border-b border-[#3A3A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#9B51E0]">{store.store_name}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <div className="relative">
                <button className="flex items-center space-x-2 text-[#E0E0E0] hover:text-[#9B51E0] transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Cart ({getCartItemCount()})</span>
                </button>
                
                {getCartItemCount() > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-[#2A2A2A] rounded-lg shadow-lg border border-[#3A3A3A] p-4 z-50">
                    <h3 className="font-semibold text-white mb-3">Shopping Cart</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(cart).map(([productId, quantity]) => {
                        const product = products.find(p => p.id === productId)
                        if (!product) return null
                        
                        return (
                          <div key={productId} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-white">{product.name}</p>
                              <p className="text-sm text-[#A0A0A0]">${product.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => removeFromCart(productId)}
                                className="w-6 h-6 bg-[#3A3A3A] rounded-full flex items-center justify-center text-[#E0E0E0] hover:bg-[#4A4A4A] transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-white">{quantity}</span>
                              <button
                                onClick={() => addToCart(productId)}
                                className="w-6 h-6 bg-[#3A3A3A] rounded-full flex items-center justify-center text-[#E0E0E0] hover:bg-[#4A4A4A] transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="border-t border-[#3A3A3A] pt-3 mt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-white">Total:</span>
                        <span className="font-semibold text-white">${getCartTotal().toFixed(2)}</span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-[#FF7F00] text-white py-2 px-4 rounded-lg hover:bg-[#FF8C00] transition-colors font-medium"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Auth */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#A0A0A0]">{user.email}</span>
                  <button
                    onClick={signOut}
                    className="text-sm text-[#A0A0A0] hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={signInWithGoogle}
                    className="text-sm text-[#A0A0A0] hover:text-[#9B51E0] transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome to <span className="text-[#9B51E0]">{store.store_name}</span>
          </h2>
          <p className="text-xl text-[#E0E0E0]">
            Discover amazing products and start shopping today.
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No products available</h3>
            <p className="text-[#A0A0A0]">Check back soon for new products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="card hover:shadow-lg transition-shadow bg-[#2A2A2A] border border-[#3A3A3A]">
                <div className="aspect-square bg-[#1E1E1E] rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-[#A0A0A0] text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-sm text-[#A0A0A0] line-through">${product.compare_at_price.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="text-sm text-[#A0A0A0]">Stock: {product.inventory_quantity}</span>
                </div>
                
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.inventory_quantity === 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    product.inventory_quantity === 0
                      ? 'bg-[#3A3A3A] text-[#A0A0A0] cursor-not-allowed'
                      : 'bg-[#00AEEF] text-white hover:bg-[#007AFF]'
                  }`}
                >
                  {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#2A2A2A] border-t border-[#3A3A3A] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <GenieMascot mood="happy" size="sm" className="mr-2" />
              <span className="text-[#9B51E0] font-medium">Powered by Sell Us Genie</span>
            </div>
            <p className="text-[#A0A0A0]">
              &copy; 2024 {store.store_name}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default StoreFrontend
