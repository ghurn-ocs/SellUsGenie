// Modern Product List - Rewritten from scratch
import React, { useState } from 'react'
import { Edit3, Trash2, Eye, EyeOff, Package, DollarSign, BarChart3, ExternalLink } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import type { Product } from '../types/product'

interface ProductListNewProps {
  products: Product[]
  isLoading: boolean
  onView?: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onToggleActive: (productId: string, isActive: boolean) => void
  onToggleFeatured: (productId: string, isFeatured: boolean) => void
  isDeleting?: boolean
  isToggling?: boolean
}

export const ProductListNew: React.FC<ProductListNewProps> = ({
  products,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  isDeleting = false,
  isToggling = false
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (productId: string) => {
    onDelete(productId)
    setDeleteConfirm(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#3A3A3A] rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-[#3A3A3A] rounded w-3/4"></div>
                <div className="h-3 bg-[#3A3A3A] rounded w-1/2"></div>
                <div className="h-3 bg-[#3A3A3A] rounded w-2/3"></div>
              </div>
              <div className="w-32 h-8 bg-[#3A3A3A] rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-[#3A3A3A] rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-[#A0A0A0]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">No products yet</h3>
        <p className="text-[#A0A0A0] mb-6 max-w-md mx-auto">
          Get started by adding your first product to your store. Your products will appear here once created.
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-[#666]">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Manage inventory</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Set pricing</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Track performance</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-6 hover:border-[#4A4A4A] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Product Image */}
              <div className="w-16 h-16 bg-[#3A3A3A] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.image_alt || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-8 h-8 text-[#A0A0A0]" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {product.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      product.is_active
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {product.is_featured && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                <p className="text-sm text-[#A0A0A0] mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-[#9B51E0]" />
                    <span className="font-semibold text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-[#666] line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {product.sku && (
                    <div className="text-[#A0A0A0]">
                      <span className="text-[#666]">SKU:</span> {product.sku}
                    </div>
                  )}

                  <div className="text-[#A0A0A0]">
                    <span className="text-[#666]">Stock:</span>{' '}
                    <span
                      className={
                        product.inventory_quantity < 10
                          ? 'text-yellow-400'
                          : product.inventory_quantity === 0
                          ? 'text-red-400'
                          : 'text-green-400'
                      }
                    >
                      {product.inventory_quantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* View Button */}
              {onView && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('👁️ View clicked for product:', product.name, product.id)
                    onView(product)
                  }}
                  className="p-2 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg transition-colors"
                  title="View product details"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}

              {/* Toggle Active Status */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🔄 Toggle active clicked for product:', product.name, product.id)
                  onToggleActive(product.id, !product.is_active)
                }}
                disabled={isToggling}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                  product.is_active
                    ? 'text-green-400 hover:bg-green-500/20 hover:text-green-300'
                    : 'text-gray-400 hover:bg-gray-500/20 hover:text-gray-300'
                }`}
                title={product.is_active ? 'Deactivate product' : 'Activate product'}
              >
                {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              {/* Toggle Featured Status */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('⭐ Toggle featured clicked for product:', product.name, product.id)
                  onToggleFeatured(product.id, !product.is_featured)
                }}
                disabled={isToggling}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                  product.is_featured
                    ? 'text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300'
                    : 'text-gray-400 hover:bg-gray-500/20 hover:text-gray-300'
                }`}
                title={product.is_featured ? 'Remove from featured' : 'Add to featured'}
              >
                <span className="text-sm font-medium">
                  {product.is_featured ? '⭐' : '☆'}
                </span>
              </button>

              {/* Edit Button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('✏️ Edit clicked for product:', product.name, product.id)
                  onEdit(product)
                }}
                className="p-2 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-colors"
                title="Edit product"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🗑️ Delete clicked for product:', product.name, product.id)
                  setDeleteConfirm(product.id)
                }}
                disabled={isDeleting}
                className="p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors disabled:opacity-50"
                title="Delete product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold text-white mb-4">
              Delete Product
            </Dialog.Title>
            <p className="text-[#A0A0A0] mb-6">
              Are you sure you want to delete this product? This action cannot be undone and will
              remove the product from your store permanently.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}