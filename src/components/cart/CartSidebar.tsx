import React, { useState } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag, MapPin, AlertCircle } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { DeliveryAreaDisplay, type DeliveryCheckResult } from '../DeliveryAreaDisplay'
import { useModal } from '../../contexts/ModalContext'
import * as Dialog from '@radix-ui/react-dialog'

interface CartSidebarProps {}

export const CartSidebar: React.FC<CartSidebarProps> = () => {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryCheckResult | null>(null)
  const [showDeliveryCheck, setShowDeliveryCheck] = useState(false)
  const modal = useModal()

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
    // Check if delivery info is available and delivery is not available
    if (deliveryInfo && !deliveryInfo.available) {
      await modal.showWarning(
        'Delivery Not Available',
        'We\'re sorry, but delivery is not currently available to your location. Please check our delivery areas in the store information or contact us to see if we can arrange special delivery to your area.'
      )
      return
    }
    
    try {
      await initiateCheckout()
    } catch (error) {
      console.error('Failed to initiate checkout:', error)
    }
  }

  const handleDeliveryLocationCheck = (result: DeliveryCheckResult | null) => {
    setDeliveryInfo(result)
  }

  const getTotalWithDelivery = () => {
    const deliveryFee = deliveryInfo?.available ? deliveryInfo.deliveryFee : 0
    const freeDeliveryThreshold = deliveryInfo?.deliveryArea?.free_delivery_threshold || 0
    
    // Apply free delivery if threshold is met
    if (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) {
      return subtotal
    }
    
    return subtotal + deliveryFee
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
            <div className="border-t border-gray-200 space-y-4">
              {/* Delivery Check Section */}
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setShowDeliveryCheck(!showDeliveryCheck)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Check Delivery Availability</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {showDeliveryCheck ? 'Hide' : 'Show'}
                  </span>
                </button>

                {showDeliveryCheck && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <DeliveryAreaDisplay
                      storeId={cartItems[0]?.product?.store_id || ''}
                      compact={true}
                      onLocationCheck={handleDeliveryLocationCheck}
                    />
                  </div>
                )}

                {deliveryInfo && (
                  <div className={`p-3 rounded-lg border ${
                    deliveryInfo.available 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {deliveryInfo.available ? (
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${
                          deliveryInfo.available ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {deliveryInfo.available ? 'Delivery Available!' : 'Delivery Not Available'}
                        </p>
                        {deliveryInfo.available && (
                          <div className="mt-1 space-y-1 text-xs text-green-700">
                            {deliveryInfo.deliveryFee > 0 && (
                              <p>Delivery Fee: ${deliveryInfo.deliveryFee.toFixed(2)}</p>
                            )}
                            {deliveryInfo.estimatedTime && (
                              <p>Estimated Time: {deliveryInfo.estimatedTime}</p>
                            )}
                          </div>
                        )}
                        {deliveryInfo.message && (
                          <p className={`text-xs mt-1 ${
                            deliveryInfo.available ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {deliveryInfo.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Total */}
              <div className="px-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm text-gray-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                
                {deliveryInfo?.available && deliveryInfo.deliveryFee > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivery Fee</span>
                      <span className="text-sm text-gray-900">
                        {deliveryInfo.deliveryArea?.free_delivery_threshold && 
                         subtotal >= deliveryInfo.deliveryArea.free_delivery_threshold
                          ? 'FREE'
                          : formatPrice(deliveryInfo.deliveryFee)
                        }
                      </span>
                    </div>
                    
                    {deliveryInfo.deliveryArea?.free_delivery_threshold && 
                     subtotal >= deliveryInfo.deliveryArea.free_delivery_threshold && (
                      <p className="text-xs text-green-600">
                        You qualified for free delivery!
                      </p>
                    )}
                  </>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-base font-medium text-gray-900">
                    {formatPrice(getTotalWithDelivery())}
                  </span>
                </div>
              </div>
              
              <div className="p-4 pt-0">
                <p className="text-xs text-gray-500 mb-4">
                  {deliveryInfo?.available 
                    ? 'Taxes calculated at checkout.' 
                    : 'Check delivery availability before checkout.'
                  }
                </p>
                
                <button
                  onClick={handleCheckout}
                  disabled={deliveryInfo ? !deliveryInfo.available : false}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {deliveryInfo && !deliveryInfo.available ? 'Delivery Not Available' : 'Checkout'}
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-primary-600 py-2 text-sm font-medium hover:text-primary-800 mt-2"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}