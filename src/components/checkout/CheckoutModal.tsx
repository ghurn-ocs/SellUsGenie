import React, { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { X, Lock, ShoppingCart } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { stripePromise, STRIPE_CONFIG } from '../../lib/stripe'
import { useCheckout } from '../../contexts/CheckoutContext'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { CheckoutForm } from './CheckoutForm'
import { ShippingForm } from './ShippingForm'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { cartItems, subtotal } = useCart()
  const { 
    shippingAddress, 
    isGuestCheckout, 
    setIsGuestCheckout,
    createPaymentIntent,
    error 
  } = useCheckout()
  
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(user ? 'payment' : 'shipping')
      setClientSecret(null)
      setOrderId(null)
    }
  }, [isOpen, user])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const calculateTotals = () => {
    const tax = subtotal * 0.08 // 8% tax
    const shipping = subtotal >= 50 ? 0 : 5 // Free shipping over $50
    const total = subtotal + tax + shipping
    
    return { tax, shipping, total }
  }

  const { tax, shipping, total } = calculateTotals()

  const handleProceedToPayment = async () => {
    if ((!user && !shippingAddress) || (user && !isGuestCheckout && !shippingAddress)) {
      return
    }

    try {
      const { clientSecret, orderId } = await createPaymentIntent()
      setClientSecret(clientSecret)
      setOrderId(orderId)
      setStep('payment')
    } catch (error) {
      console.error('Failed to create payment intent:', error)
    }
  }

  const handleShippingComplete = (address: any) => {
    handleProceedToPayment()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-green-600" />
              Secure Checkout
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="p-6">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center">
                <div className={`flex items-center ${step === 'shipping' ? 'text-primary-600' : 'text-green-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'shipping' ? 'bg-primary-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {step === 'payment' ? '✓' : '1'}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {user ? 'Review Order' : 'Shipping'}
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                  <div className={`h-full transition-all duration-300 ${
                    step === 'payment' ? 'bg-green-600 w-full' : 'bg-gray-200 w-0'
                  }`} />
                </div>
                <div className={`flex items-center ${step === 'payment' ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'payment' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Payment</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main content */}
              <div className="order-2 lg:order-1">
                {step === 'shipping' && !user && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
                      <button
                        onClick={() => setIsGuestCheckout(!isGuestCheckout)}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        {isGuestCheckout ? 'Sign in instead' : 'Continue as guest'}
                      </button>
                    </div>
                    <ShippingForm onComplete={handleShippingComplete} />
                  </div>
                )}

                {(step === 'shipping' && user) && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Review Your Order</h3>
                    <p className="text-gray-600">
                      You're signed in as {user.email}. Proceed to payment when ready.
                    </p>
                    <button
                      onClick={handleProceedToPayment}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                )}

                {step === 'payment' && clientSecret && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
                    <Elements 
                      stripe={stripePromise} 
                      options={{
                        clientSecret,
                        appearance: STRIPE_CONFIG.appearance,
                      }}
                    >
                      <CheckoutForm 
                        clientSecret={clientSecret}
                        orderId={orderId!}
                        onSuccess={() => onClose()}
                      />
                    </Elements>
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div className="order-1 lg:order-2">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <span className="text-gray-900">{item.product.name}</span>
                          <span className="text-gray-500 ml-2">×{item.quantity}</span>
                        </div>
                        <span className="text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {shipping === 0 ? 'Free' : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {shipping === 0 && subtotal < 50 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        🎉 Add {formatPrice(50 - subtotal)} more for free shipping!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}