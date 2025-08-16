import React from 'react'
import { useProducts } from '../hooks/useProducts'
import { ShoppingCartSystem, CartIcon } from '../components/cart/ShoppingCartSystem'
import { ProductCard } from '../components/ProductCard'

interface StoreFrontProps {
  storeId: string
  storeName: string
}

export const StoreFront: React.FC<StoreFrontProps> = ({ storeId, storeName }) => {
  const { products, isLoading } = useProducts(storeId)

  return (
    <ShoppingCartSystem storeId={storeId}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">{storeName}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <CartIcon />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to {storeName}</h1>
            <p className="text-xl text-primary-100 mb-8">
              Discover amazing products with fast, secure checkout
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Shop our curated collection of high-quality products. 
                Add to cart or buy now with just one click!
              </p>
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
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-600">Check back soon for new products!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-lg font-medium mb-4">{storeName}</h3>
            <p className="text-gray-400">Powered by StreamSell</p>
          </div>
        </footer>
      </div>
    </ShoppingCartSystem>
  )
}