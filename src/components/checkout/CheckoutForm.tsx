import React, { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Loader2, CreditCard, Shield } from 'lucide-react'
import { useCheckout } from '../../contexts/CheckoutContext'

interface CheckoutFormProps {
  clientSecret: string
  orderId: string
  onSuccess: () => void
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  orderId,
  onSuccess
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const { confirmPayment } = useCheckout()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentSucceeded, setPaymentSucceeded] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setErrorMessage(submitError.message || 'An error occurred')
        setIsProcessing(false)
        return
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update order status in our database
        await confirmPayment(paymentIntent.id)
        setPaymentSucceeded(true)
        
        // Show success for a moment before closing
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      console.error('Payment error:', err)
      setErrorMessage('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentSucceeded) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Your order has been placed and you'll receive a confirmation email shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-900">Secure Payment</h4>
          <p className="text-sm text-blue-700">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Complete Order
            </>
          )}
        </button>

        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            SSL Encrypted
          </span>
          <span>•</span>
          <span>Powered by Stripe</span>
          <span>•</span>
          <span>PCI Compliant</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        By completing your order, you agree to our terms of service and privacy policy.
      </div>
    </form>
  )
}