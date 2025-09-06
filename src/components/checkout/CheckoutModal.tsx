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
import { CheckoutAuthSelection } from './CheckoutAuthSelection'
import { UserRegistrationForm } from './UserRegistrationForm'
import { OrderSummary } from './OrderSummary'
import { usePaymentConfiguration } from '../../hooks/usePaymentConfiguration'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  storeId: string
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, storeId }) => {
  const { user } = useAuth()
  const { cartItems } = useCart()
  const { 
    shippingAddress, 
    isGuestCheckout, 
    setIsGuestCheckout,
    createPaymentIntent,
    error,
    subtotal,
    totalAfterDiscount
  } = useCheckout()
  const { isPaymentEnabled } = usePaymentConfiguration(storeId)
  
  const [step, setStep] = useState<'auth' | 'registration' | 'shipping' | 'payment'>('auth')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'existing' | 'register' | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Check if user just signed up (no profile data yet)
      const needsRegistration = user && !shippingAddress && checkoutMode === 'register'
      
      if (user && needsRegistration) {
        setStep('registration')
        setIsNewUser(true)
      } else {
        setStep(user ? 'shipping' : 'auth')
        setIsNewUser(false)
      }
      
      setClientSecret(null)
      setOrderId(null)
      if (!isOpen) setCheckoutMode(null)
    }
  }, [isOpen, user, shippingAddress, checkoutMode])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const calculateTotals = () => {
    const tax = totalAfterDiscount * 0.08 // 8% tax on discounted amount
    const shipping = totalAfterDiscount >= 50 ? 0 : 5 // Free shipping over $50
    const total = totalAfterDiscount + tax + shipping
    
    return { tax, shipping, total }
  }

  const { tax, shipping, total } = calculateTotals()

  const handleProceedToPayment = async () => {
    // For guest users, we need a shipping address
    if (!user && !shippingAddress) {
      console.error('No shipping address provided for guest checkout')
      return
    }

    try {
      console.log('Creating payment intent...')
      const { clientSecret, orderId } = await createPaymentIntent()
      console.log('Payment intent created:', { clientSecret, orderId })
      setClientSecret(clientSecret)
      setOrderId(orderId)
      setStep('payment')
    } catch (error) {
      console.error('Failed to create payment intent:', error)
      // Show error to user
      alert('Failed to initialize payment. Please try again.')
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
                {/* Step 1: Authentication (only show if not logged in) */}
                {!user && (
                  <>
                    <div className={`flex items-center ${
                      step === 'auth' ? 'text-[#9B51E0]' : 
                      step === 'registration' || step === 'shipping' || step === 'payment' ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === 'auth' ? 'bg-[#9B51E0] text-white' :
                        step === 'registration' || step === 'shipping' || step === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step === 'registration' || step === 'shipping' || step === 'payment' ? '✓' : '1'}
                      </div>
                      <span className="ml-2 text-sm font-medium">Authentication</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                      <div className={`h-full transition-all duration-300 ${
                        step === 'registration' || step === 'shipping' || step === 'payment' ? 'bg-green-600 w-full' : 'bg-gray-200 w-0'
                      }`} />
                    </div>
                  </>
                )}

                {/* Step 2: Registration (only for new OAuth users) */}
                {isNewUser && (
                  <>
                    <div className={`flex items-center ${
                      step === 'registration' ? 'text-[#9B51E0]' : 
                      step === 'shipping' || step === 'payment' ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === 'registration' ? 'bg-[#9B51E0] text-white' :
                        step === 'shipping' || step === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step === 'shipping' || step === 'payment' ? '✓' : '2'}
                      </div>
                      <span className="ml-2 text-sm font-medium">Complete Profile</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                      <div className={`h-full transition-all duration-300 ${
                        step === 'shipping' || step === 'payment' ? 'bg-green-600 w-full' : 'bg-gray-200 w-0'
                      }`} />
                    </div>
                  </>
                )}
                
                {/* Shipping/Review Step */}
                <div className={`flex items-center ${
                  step === 'shipping' ? 'text-[#9B51E0]' : 
                  step === 'payment' ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'shipping' ? 'bg-[#9B51E0] text-white' :
                    step === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step === 'payment' ? '✓' : (user ? (isNewUser ? '3' : '1') : '2')}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {user && shippingAddress ? 'Review Order' : 'Shipping Address'}
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                  <div className={`h-full transition-all duration-300 ${
                    step === 'payment' ? 'bg-green-600 w-full' : 'bg-gray-200 w-0'
                  }`} />
                </div>
                
                {/* Payment Step */}
                <div className={`flex items-center ${step === 'payment' ? 'text-[#9B51E0]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === 'payment' ? 'bg-[#9B51E0] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {user ? (isNewUser ? '4' : '2') : '3'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Payment</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main content */}
              <div className="order-2 lg:order-1">
                {step === 'auth' && !user && (
                  <CheckoutAuthSelection
                    onGuestCheckout={() => {
                      setCheckoutMode('guest')
                      setIsGuestCheckout(true)
                      setStep('shipping')
                    }}
                    onExistingLogin={() => {
                      setCheckoutMode('existing')
                      setStep('shipping')
                    }}
                    onAuthSuccess={() => {
                      setCheckoutMode('register')
                      setIsNewUser(true)
                      setStep('registration')
                    }}
                    cartItemCount={cartItems.length}
                    cartTotal={new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(subtotal)}
                  />
                )}

                {step === 'registration' && user && isNewUser && (
                  <UserRegistrationForm
                    onComplete={(data) => {
                      setShippingAddress(data)
                      setStep('shipping')
                    }}
                    storeId={storeId}
                  />
                )}

                {step === 'shipping' && !user && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
                      <button
                        onClick={() => setIsGuestCheckout(!isGuestCheckout)}
                        className="text-sm text-[#9B51E0] hover:text-[#8A47D0]"
                      >
                        {isGuestCheckout ? 'Sign in instead' : 'Continue as guest'}
                      </button>
                    </div>
                    <ShippingForm onComplete={handleShippingComplete} storeId={storeId} />
                  </div>
                )}

                {(step === 'shipping' && user && shippingAddress) && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Review Your Order</h3>
                    <p className="text-gray-600">
                      You're signed in as {user.email}. Your shipping address has been saved.
                    </p>
                    
                    {/* Show saved shipping address */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-700">
                        <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                        <p>{shippingAddress.address1}</p>
                        {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                        <p>{shippingAddress.country}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShippingAddress(null)
                          // Stay on shipping step to re-enter address
                        }}
                        className="mt-2 text-sm text-[#9B51E0] hover:text-[#8A47D0]"
                      >
                        Change Address
                      </button>
                    </div>
                    
                    <button
                      onClick={handleProceedToPayment}
                      disabled={!isPaymentEnabled}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        isPaymentEnabled 
                          ? 'bg-[#9B51E0] text-white hover:bg-[#8A47D0]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isPaymentEnabled ? 'Proceed to Payment' : 'Payment Not Available'}
                    </button>
                    
                    {!isPaymentEnabled && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start space-x-2">
                          <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-amber-900">!</span>
                          </div>
                          <div>
                            <p className="text-sm text-amber-800 font-medium">Payment System Not Configured</p>
                            <p className="text-sm text-amber-700">
                              Please contact the store owner to enable the payment system.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(step === 'shipping' && user && !shippingAddress) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                      <span className="text-sm text-gray-600">Signed in as {user.email}</span>
                    </div>
                    <ShippingForm onComplete={handleShippingComplete} storeId={storeId} />
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
                        storeId={storeId}
                      />
                    </Elements>
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div className="order-1 lg:order-2">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-0">
                  <OrderSummary />
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}