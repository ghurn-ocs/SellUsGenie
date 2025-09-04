import React, { useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { ShoppingCartSystem, CartIcon } from '../cart/ShoppingCartSystem'
import { ProductCard } from '../ProductCard'
import { DeliveryAreaDisplay } from '../DeliveryAreaDisplay'
import { PolicyPage } from './PolicyPage'
import { ProductsPage } from './ProductsPage'
import { Menu, X, ChevronRight } from 'lucide-react'

interface EnhancedStoreFrontProps {
  storeId: string
  storeName: string
  customizations?: any
}

type ViewMode = 'home' | 'products' | 'privacy' | 'returns' | 'about' | 'contact' | 'terms'

interface StorePolicy {
  privacy_policy?: string
  returns_policy?: string
  about_us?: string
  terms_of_service?: string
  contact_us?: string
}

export const EnhancedStoreFront: React.FC<EnhancedStoreFrontProps> = ({ 
  storeId, 
  storeName,
  customizations
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Get all products
  const { products, isLoading } = useProducts(storeId)
  
  // Get featured products for home page
  const featuredProducts = products.filter(product => product.is_featured && product.is_active)
  
  // Fetch store policies
  const { data: policies } = useQuery({
    queryKey: ['store-policies', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_policies')
        .select('*')
        .eq('store_id', storeId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data || {}
    }
  })

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
    setMobileMenuOpen(false)
  }

  const navigation = [
    { name: 'Home', mode: 'home' as ViewMode },
    { name: 'Products', mode: 'products' as ViewMode },
    { name: 'About', mode: 'about' as ViewMode },
    { name: 'Contact Us', mode: 'contact' as ViewMode },
  ]

  const footerLinks = [
    { name: 'Terms of Service', mode: 'terms' as ViewMode },
    { name: 'Privacy Policy', mode: 'privacy' as ViewMode },
    { name: 'Returns Policy', mode: 'returns' as ViewMode },
    { name: 'About Us', mode: 'about' as ViewMode },
    { name: 'Contact Us', mode: 'contact' as ViewMode },
  ]

  // Policy page views
  if (viewMode === 'privacy') {
    return (
      <PolicyPage
        storeId={storeId}
        storeName={storeName}
        policyType="privacy"
        content={policies?.privacy_policy || ''}
        onBack={() => setViewMode('home')}
      />
    )
  }

  if (viewMode === 'returns') {
    return (
      <PolicyPage
        storeId={storeId}
        storeName={storeName}
        policyType="returns"
        content={policies?.returns_policy || ''}
        onBack={() => setViewMode('home')}
      />
    )
  }

  if (viewMode === 'about') {
    return (
      <PolicyPage
        storeId={storeId}
        storeName={storeName}
        policyType="about"
        content={policies?.about_us || ''}
        onBack={() => setViewMode('home')}
      />
    )
  }

  if (viewMode === 'contact') {
    return (
      <PolicyPage
        storeId={storeId}
        storeName={storeName}
        policyType="contact"
        content={policies?.contact_us || ''}
        onBack={() => setViewMode('home')}
      />
    )
  }

  if (viewMode === 'terms') {
    return (
      <PolicyPage
        storeId={storeId}
        storeName={storeName}
        policyType="terms"
        content={policies?.terms_of_service || ''}
        onBack={() => setViewMode('home')}
      />
    )
  }

  // Products page view
  if (viewMode === 'products') {
    return (
      <ProductsPage
        storeId={storeId}
        storeName={storeName}
        onBack={() => setViewMode('home')}
      />
    )
  }

  // Home page view
  return (
    <ShoppingCartSystem storeId={storeId}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                {customizations?.branding?.logo && (
                  <img 
                    src={customizations.branding.logo} 
                    alt={`${customizations?.branding?.storeName || storeName} logo`}
                    className="h-10 w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                )}
                <h1 className="text-2xl font-bold text-primary-600">
                  {customizations?.branding?.storeName || storeName}
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleViewChange(item.mode)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === item.mode
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </nav>

              <div className="flex items-center space-x-4">
                <CartIcon />
                
                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-400 hover:text-gray-500"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleViewChange(item.mode)}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {customizations?.branding?.logo && (
              <div className="mb-6">
                <img 
                  src={customizations.branding.logo} 
                  alt={`${customizations?.branding?.storeName || storeName} logo`}
                  className="h-16 w-auto object-contain mx-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
            <h1 className="text-4xl font-bold mb-4">
              {customizations?.hero?.title || `Welcome to ${customizations?.branding?.storeName || storeName}`}
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              {customizations?.hero?.subtitle || 'Discover amazing products with fast, secure checkout'}
            </p>
            {customizations?.hero?.ctaText && (
              <button className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors">
                {customizations.hero.ctaText}
              </button>
            )}
          </div>
        </section>

        {/* Delivery Areas Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DeliveryAreaDisplay storeId={storeId} showMap={false} />
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div className="text-center flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Shop our hand-picked selection of featured products. 
                  Add to cart or buy now with just one click!
                </p>
              </div>
              {products.length > featuredProducts.length && (
                <button
                  onClick={() => setViewMode('products')}
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Products
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="aspect-square bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 animate-pulse rounded" />
                      <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                      <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
                      <div className="h-10 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No featured products</h3>
                <p className="text-gray-600 mb-4">Check out all our products instead!</p>
                {products.length > 0 && (
                  <button
                    onClick={() => setViewMode('products')}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Browse All Products
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    showQuickActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Fast Checkout</h3>
                <p className="text-gray-600">Complete your purchase in just a few clicks with our streamlined checkout process.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-gray-600">Your payment information is protected with bank-level security powered by Stripe.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Free Shipping</h3>
                <p className="text-gray-600">Free shipping on orders over $50. Fast and reliable delivery to your door.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                {customizations?.branding?.logo && (
                  <img 
                    src={customizations.branding.logo} 
                    alt={`${customizations?.branding?.storeName || storeName} logo`}
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                )}
                <h3 className="text-lg font-medium">
                  {customizations?.branding?.storeName || storeName}
                </h3>
              </div>
              <p className="text-gray-400 mb-6">
                {customizations?.branding?.tagline || 'Your trusted online store'}
              </p>
              
              {/* Policy Links */}
              <div className="flex flex-wrap justify-center gap-6 mb-6">
                {footerLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => setViewMode(link.mode)}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
              
              <p className="text-gray-400 text-sm">Powered by SellUsGenie</p>
            </div>
          </div>
        </footer>
      </div>
    </ShoppingCartSystem>
  )
}