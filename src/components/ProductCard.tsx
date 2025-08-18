import React from 'react'
import { Star, Heart } from 'lucide-react'
import { AddToCartButton, BuyNowButton } from './cart/ShoppingCartSystem'
import type { Product } from '../lib/supabase'

interface ProductCardProps {
  product: Product
  className?: string
  showQuickActions?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  className = '',
  showQuickActions = true 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.image_alt || product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gray-300">
            {product.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}
        
        {!product.is_active && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}

        <button 
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating - placeholder for future implementation */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(4.8)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
          </div>
          
          {product.inventory_quantity > 0 && (
            <span className="text-xs text-green-600 font-medium">
              {product.inventory_quantity} in stock
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {showQuickActions && product.is_active && product.inventory_quantity > 0 && (
          <div className="space-y-2">
            <AddToCartButton 
              productId={product.id}
              className="w-full"
              size="md"
            />
            <BuyNowButton 
              productId={product.id}
              className="w-full"
              size="md"
            />
          </div>
        )}

        {!product.is_active && (
          <button disabled className="w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed">
            Out of Stock
          </button>
        )}

        {product.sku && (
          <p className="text-xs text-gray-400 mt-2">SKU: {product.sku}</p>
        )}
      </div>
    </div>
  )
}