import React, { useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { ShoppingCartSystem, CartIcon } from '../cart/ShoppingCartSystem'
import { ProductCard } from '../ProductCard'
import { ArrowLeft, Grid, Filter, Search } from 'lucide-react'

interface ProductsPageProps {
  storeId: string
  storeName: string
  onBack: () => void
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ 
  storeId, 
  storeName, 
  onBack 
}) => {
  const { products, isLoading } = useProducts(storeId)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('newest')

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    switch (sortBy) {
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price)
      case 'newest':
      default:
        return filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }
  }, [products, searchTerm, sortBy])

  return (
    <ShoppingCartSystem storeId={storeId}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={onBack}
                  className="flex items-center text-gray-600 hover:text-gray-900 mr-6 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Store
                </button>
                <div className="flex items-center">
                  <Grid className="w-6 h-6 text-gray-400 mr-3" />
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">All Products</h1>
                    <p className="text-sm text-gray-500">{storeName}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <CartIcon />
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${filteredAndSortedProducts.length} products`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
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
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {searchTerm ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products found for "{searchTerm}"
                    </h3>
                    <p className="text-gray-600 mb-4">Try searching with different keywords</p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                    <p className="text-gray-600">Check back soon for new products!</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    showQuickActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ShoppingCartSystem>
  )
}