// Product Selector for Order Creation
import React, { useState } from 'react'
import { Search, Plus, Package, DollarSign } from 'lucide-react'
import type { Product } from '../types/product'

interface OrderItem {
  product: Product
  quantity: number
  unit_price: number
  total_price: number
}

interface ProductSelectorProps {
  products: Product[]
  selectedItems: OrderItem[]
  onItemAdd: (item: OrderItem) => void
  onItemUpdate: (productId: string, quantity: number) => void
  onItemRemove: (productId: string) => void
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedItems,
  onItemAdd,
  onItemUpdate,
  onItemRemove
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductList, setShowProductList] = useState(false)

  // Filter products based on search term and availability
  const filteredProducts = products.filter(product => 
    product.is_active &&
    product.inventory_quantity > 0 &&
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Check if product is already selected
  const isProductSelected = (productId: string) => 
    selectedItems.some(item => item.product.id === productId)


  const handleAddProduct = (product: Product) => {
    if (isProductSelected(product.id)) return

    const orderItem: OrderItem = {
      product,
      quantity: 1,
      unit_price: product.price,
      total_price: product.price
    }

    onItemAdd(orderItem)
    setSearchTerm('')
    setShowProductList(false)
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      onItemRemove(productId)
    } else {
      onItemUpdate(productId, quantity)
    }
  }

  return (
    <div className="space-y-4">
      {/* Product Search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowProductList(e.target.value.length > 0)
            }}
            onFocus={() => setShowProductList(searchTerm.length > 0)}
            className="w-full pl-10 pr-4 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
            placeholder="Search products by name or SKU..."
          />
        </div>

        {/* Product Search Results */}
        {showProductList && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-[#A0A0A0]">
                {searchTerm ? 'No products found' : 'Type to search products'}
              </div>
            ) : (
              <div className="divide-y divide-[#3A3A3A]">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    disabled={isProductSelected(product.id)}
                    className="w-full p-3 text-left hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-[#9B51E0]" />
                        <span className="font-medium text-white">{product.name}</span>
                        {product.sku && (
                          <span className="text-xs text-[#666] bg-[#3A3A3A] px-2 py-1 rounded">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-[#A0A0A0]">
                        <span>${product.price.toFixed(2)}</span>
                        <span>Stock: {product.inventory_quantity}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isProductSelected(product.id) ? (
                        <span className="text-green-400 text-sm">Added</span>
                      ) : (
                        <Plus className="w-4 h-4 text-[#A0A0A0]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#A0A0A0]">Order Items</h4>
          <div className="space-y-2">
            {selectedItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Package className="w-4 h-4 text-[#9B51E0]" />
                      <span className="font-medium text-white">{item.product.name}</span>
                      {item.product.sku && (
                        <span className="text-xs text-[#666] bg-[#3A3A3A] px-2 py-1 rounded">
                          {item.product.sku}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-[#A0A0A0]">
                      <span>Unit: ${item.unit_price.toFixed(2)}</span>
                      <span>Available: {item.product.inventory_quantity}</span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-[#3A3A3A] hover:bg-[#4A4A4A] flex items-center justify-center text-white text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.product.inventory_quantity}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-center border border-[#3A3A3A] rounded bg-[#2A2A2A] text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#9B51E0]"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.inventory_quantity}
                        className="w-6 h-6 rounded bg-[#3A3A3A] hover:bg-[#4A4A4A] disabled:opacity-50 flex items-center justify-center text-white text-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 min-w-[80px] justify-end">
                      <DollarSign className="w-4 h-4 text-[#9B51E0]" />
                      <span className="font-semibold text-white">
                        ${item.total_price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => onItemRemove(item.product.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Summary */}
      {selectedItems.length > 0 && (
        <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
          <h4 className="text-sm font-medium text-[#A0A0A0] mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">Items ({selectedItems.length})</span>
              <span className="text-white">{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">Subtotal</span>
              <span className="text-white">
                ${selectedItems.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showProductList && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowProductList(false)}
        />
      )}
    </div>
  )
}