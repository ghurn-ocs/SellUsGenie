import React, { useState } from 'react'
import type { Product } from '../lib/supabase'
import * as Dialog from '@radix-ui/react-dialog'

interface ProductListProps {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onToggleActive: (productId: string, isActive: boolean) => void
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (productId: string) => {
    onDelete(productId)
    setDeleteConfirm(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
        <p className="text-gray-600">Get started by adding your first product to your store.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#3A3A3A] rounded-lg flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.image_alt || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <span className="line-through">${product.compare_at_price.toFixed(2)}</span>
                  )}
                  <span>•</span>
                  <span>SKU: {product.sku || 'N/A'}</span>
                  <span>•</span>
                  <span>Stock: {product.inventory_quantity}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleActive(product.id, !product.is_active)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  product.is_active
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {product.is_active ? 'Deactivate' : 'Activate'}
              </button>
              
              <button
                onClick={() => onEdit(product)}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                Edit
              </button>
              
              <button
                onClick={() => setDeleteConfirm(product.id)}
                className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
              Delete Product
            </Dialog.Title>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export default ProductList
