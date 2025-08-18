import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'

interface CartIconProps {
  className?: string
  showCount?: boolean
}

export const CartIcon: React.FC<CartIconProps> = ({ 
  className = '',
  showCount = true 
}) => {
  console.log('🛒 CartIcon rendered')
  
  let cartContext
  try {
    cartContext = useCart()
    console.log('✅ CartIcon useCart hook successful:', !!cartContext)
  } catch (error) {
    console.error('❌ CartIcon useCart hook failed:', error)
    return (
      <button
        disabled
        className={`relative p-2 text-red-500 ${className}`}
        title="Cart context not available"
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          !
        </span>
      </button>
    )
  }

  const { itemCount, setIsOpen } = cartContext
  console.log('🛒 CartIcon state:', { itemCount, hasSetIsOpen: typeof setIsOpen === 'function' })

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6" />
      {showCount && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}