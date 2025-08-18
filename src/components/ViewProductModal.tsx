// View Product Modal - Display product details
import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Package, DollarSign, Eye, EyeOff, Calendar, Hash } from 'lucide-react'
import type { Product } from '../types/product'

interface ViewProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export const ViewProductModal: React.FC<ViewProductModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!product) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <Dialog.Title className="text-xl font-semibold text-white">
                Product Details
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-[#A0A0A0] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Image */}
          {product.images && product.images.length > 0 && (
            <div className="mb-6">
              <div className="w-full h-64 bg-[#1E1E1E] rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Product Information */}
          <div className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Product Name
                </label>
                <div className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                  <p className="text-white font-medium">{product.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Status
                  </label>
                  <div className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                    <div className="flex items-center space-x-2">
                      {product.is_active ? (
                        <>
                          <Eye className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 font-medium">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Description
              </label>
              <div className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                <p className="text-white whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Price
                </label>
                <div className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-[#9B51E0]" />
                    <span className="text-white font-semibold">${product.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {product.compare_price && (
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Compare Price
                  </label>
                  <div className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-[#666]" />
                      <span className="text-[#A0A0A0] line-through">${product.compare_price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Inventory
                </label>
                <div className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                  <span className={`font-medium ${
                    product.inventory_quantity === 0 ? 'text-red-400' :
                    product.inventory_quantity < 10 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {product.inventory_quantity} units
                  </span>
                </div>
              </div>
            </div>

            {/* SKU & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {product.sku && (
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    SKU
                  </label>
                  <div className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-[#A0A0A0]" />
                      <span className="text-white font-mono">{product.sku}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Created
                </label>
                <div className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#A0A0A0]" />
                    <span className="text-[#A0A0A0]">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Last Updated
                </label>
                <div className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#A0A0A0]" />
                    <span className="text-[#A0A0A0]">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-[#9B51E0] hover:bg-[#8A47D0] rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}