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
  const { itemCount, setIsOpen } = useCart()

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