import React, { useState } from 'react'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'

interface AddToCartButtonProps {
  productId: string
  quantity?: number
  disabled?: boolean
  className?: string
  showSuccessState?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  quantity = 1,
  disabled = false,
  className = '',
  showSuccessState = true,
  size = 'md',
  variant = 'primary'
}) => {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 disabled:border-gray-300 disabled:text-gray-300'
  }

  const handleAddToCart = async () => {
    if (disabled || isAdding) return

    setIsAdding(true)
    
    try {
      await addToCart(productId, quantity)
      
      if (showSuccessState) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const getButtonContent = () => {
    if (isAdding) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Adding...
        </>
      )
    }
    
    if (showSuccess && showSuccessState) {
      return (
        <>
          <Check className="w-4 h-4 mr-2" />
          Added!
        </>
      )
    }
    
    return (
      <>
        <ShoppingCart className="w-4 h-4 mr-2" />
        Add to Cart
      </>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg transition-colors
        disabled:cursor-not-allowed disabled:opacity-50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
        ${className}
      `}
    >
      {getButtonContent()}
    </button>
  )
}