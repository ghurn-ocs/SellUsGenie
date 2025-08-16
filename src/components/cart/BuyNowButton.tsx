import React, { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'

interface BuyNowButtonProps {
  productId: string
  quantity?: number
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const BuyNowButton: React.FC<BuyNowButtonProps> = ({
  productId,
  quantity = 1,
  disabled = false,
  className = '',
  size = 'md'
}) => {
  const { addToCart, initiateCheckout, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const handleBuyNow = async () => {
    if (disabled || isProcessing) return

    setIsProcessing(true)
    
    try {
      // Clear cart first to ensure only this item
      await clearCart()
      
      // Add the product to cart
      await addToCart(productId, quantity)
      
      // Immediately proceed to checkout
      await initiateCheckout()
    } catch (error) {
      console.error('Failed to process buy now:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <button
      onClick={handleBuyNow}
      disabled={disabled || isProcessing}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg transition-colors
        bg-orange-600 text-white hover:bg-orange-700
        disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-orange-300
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Buy Now
        </>
      )}
    </button>
  )
}