import React from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import * as Dialog from '@radix-ui/react-dialog'

export const CartSidebar: React.FC = () => {
  const {
    cartItems,
    isLoading,
    error,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
    isOpen,
    setIsOpen,
    initiateCheckout
  } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      await updateQuantity(cartItemId, newQuantity)
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId)
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const handleCheckout = async () => {
    try {
      await initiateCheckout()
    } catch (error) {
      console.error('Failed to initiate checkout:', error)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Shopping Cart ({itemCount})
            </Dialog.Title>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some products to get started!</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.product.price)}
                      </p>
                      {item.product.compare_at_price && item.product.compare_at_price > item.product.price && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(item.product.compare_at_price)}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {cartItems.length > 1 && (
                  <button
                    onClick={clearCart}
                    className="w-full text-sm text-red-600 hover:text-red-800 py-2"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-gray-900">Subtotal</span>
                <span className="text-base font-medium text-gray-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              
              <p className="text-xs text-gray-500">
                Shipping and taxes calculated at checkout.
              </p>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Checkout
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-primary-600 py-2 text-sm font-medium hover:text-primary-800"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}