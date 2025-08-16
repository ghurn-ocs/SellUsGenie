import React from 'react'
import { CartProvider, useCart } from '../../contexts/CartContext'
import { CheckoutProvider } from '../../contexts/CheckoutContext'
import { CartIcon } from './CartIcon'
import { CartSidebar } from './CartSidebar'
import { CheckoutModal } from '../checkout/CheckoutModal'

interface ShoppingCartSystemProps {
  storeId: string
  children?: React.ReactNode
}

const CartSystemInner: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart()

  return (
    <>
      <CartSidebar />
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  )
}

export const ShoppingCartSystem: React.FC<ShoppingCartSystemProps> = ({ 
  storeId, 
  children 
}) => {
  return (
    <CartProvider storeId={storeId}>
      <CheckoutProvider storeId={storeId}>
        {children}
        <CartSystemInner />
      </CheckoutProvider>
    </CartProvider>
  )
}

// Export cart icon for easy access
export { CartIcon } from './CartIcon'
export { AddToCartButton } from './AddToCartButton'
export { BuyNowButton } from './BuyNowButton'