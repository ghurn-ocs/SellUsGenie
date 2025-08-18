import React, { useState } from 'react'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'

interface AddToCartButtonProps {
  productId: string
  quantity?: number
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  showSuccessState?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  quantity = 1,
  disabled = false,
  className = '',
  style,
  showSuccessState = true,
  size = 'md',
  variant = 'primary'
}) => {
  console.log('🔘 AddToCartButton rendered for product:', productId)
  
  let cartContext
  try {
    cartContext = useCart()
    console.log('✅ AddToCartButton useCart hook successful:', !!cartContext)
  } catch (error) {
    console.error('❌ AddToCartButton useCart hook failed:', error)
    return (
      <button
        disabled
        className={`${className} bg-red-500 text-white px-4 py-2 rounded opacity-50 cursor-not-allowed`}
        title="Cart context not available"
      >
        Cart Error
      </button>
    )
  }

  const { addToCart } = cartContext
  console.log('🛒 AddToCartButton addToCart function available:', typeof addToCart === 'function')
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

    console.log('🛒 AddToCartButton: Starting add to cart process')
    console.log('📦 Product ID:', productId)
    console.log('🔢 Quantity:', quantity)

    setIsAdding(true)
    
    try {
      console.log('📞 Calling addToCart function...')
      await addToCart(productId, quantity)
      console.log('✅ Add to cart successful!')
      
      if (showSuccessState) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
      }
    } catch (error) {
      console.error('❌ Failed to add to cart:', error)
      console.error('Error details:', {
        error,
        productId,
        quantity,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
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
      style={style}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg transition-colors
        disabled:cursor-not-allowed disabled:opacity-50
        text-white hover:opacity-90
        ${sizeClasses[size]}
        ${!style ? variantClasses[variant] : ''}
        ${showSuccess && !style ? 'bg-green-600 hover:bg-green-700' : ''}
        ${className}
      `}
    >
      {getButtonContent()}
    </button>
  )
}