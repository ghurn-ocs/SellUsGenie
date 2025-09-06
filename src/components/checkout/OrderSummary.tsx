import React from 'react'
import { useCart } from '../../contexts/CartContext'
import { useCheckout } from '../../contexts/CheckoutContext'
import { PromotionCodeInput } from './PromotionCodeInput'

interface OrderSummaryProps {
  className?: string
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ className = '' }) => {
  const { cartItems } = useCart()
  const { subtotal, discountAmount, totalAfterDiscount, appliedPromotion } = useCheckout()

  const taxAmount = Math.round(totalAfterDiscount * 0.08 * 100) / 100 // 8% tax
  const shippingAmount = totalAfterDiscount >= 50 || appliedPromotion?.type === 'FREE_SHIPPING' ? 0 : 5 // Free shipping over $50 or with promotion
  const total = totalAfterDiscount + taxAmount + shippingAmount

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Cart Items Summary */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Order Summary</h3>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <div className="font-medium">{item.product.name}</div>
                <div className="text-gray-500">Qty: {item.quantity}</div>
              </div>
              <div className="font-medium">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotion Code Input */}
      <div className="border-t pt-4">
        <PromotionCodeInput />
      </div>

      {/* Order Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {appliedPromotion && discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount ({appliedPromotion.code})</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span>Shipping</span>
            {(totalAfterDiscount >= 50 || appliedPromotion?.type === 'FREE_SHIPPING') && (
              <span className="text-green-600 text-xs font-medium">FREE</span>
            )}
          </div>
          <span>
            {shippingAmount > 0 ? `$${shippingAmount.toFixed(2)}` : 'FREE'}
          </span>
        </div>

        <div className="flex justify-between font-medium text-lg border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {totalAfterDiscount < 50 && appliedPromotion?.type !== 'FREE_SHIPPING' && (
          <div className="text-xs text-gray-500">
            Add ${(50 - totalAfterDiscount).toFixed(2)} more for free shipping
          </div>
        )}
      </div>
    </div>
  )
}