import React, { useState } from 'react'
import { Loader2, Tag, X, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useCheckout } from '../../contexts/CheckoutContext'

interface PromotionCodeInputProps {
  className?: string
}

export const PromotionCodeInput: React.FC<PromotionCodeInputProps> = ({
  className = ''
}) => {
  const { appliedPromotion, validatePromotion, applyPromotion, removePromotion } = useCheckout()
  const [promotionCode, setPromotionCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleValidatePromotion = async (code: string) => {
    setIsValidating(true)
    setError(null)

    try {
      const result = await validatePromotion(code.toUpperCase())

      if (result.valid && result.promotion) {
        applyPromotion(result.promotion)
        setPromotionCode('')
      } else {
        setError(result.error || 'Invalid promotion code')
      }
    } catch (err) {
      console.error('Error validating promotion:', err)
      setError(err instanceof Error ? err.message : 'Failed to validate promotion code')
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!promotionCode.trim()) {
      setError('Please enter a promotion code')
      return
    }

    await handleValidatePromotion(promotionCode.trim())
  }

  const handleRemove = () => {
    removePromotion()
    setError(null)
  }

  const formatDiscountAmount = (promotion: typeof appliedPromotion) => {
    if (!promotion) return ''
    switch (promotion.type) {
      case 'PERCENTAGE':
        return `-$${promotion.discount_amount.toFixed(2)} (${promotion.value}% off)`
      case 'FIXED_AMOUNT':
        return `-$${promotion.discount_amount.toFixed(2)}`
      case 'FREE_SHIPPING':
        return 'Free Shipping Applied'
      case 'BOGO':
        return `-$${promotion.discount_amount.toFixed(2)} (Buy One Get One)`
      default:
        return `-$${promotion.discount_amount.toFixed(2)}`
    }
  }

  if (appliedPromotion) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-green-900">
                {appliedPromotion.code} Applied
              </div>
              <div className="text-sm text-green-700">
                {appliedPromotion.name}
              </div>
              <div className="text-sm font-medium text-green-800">
                {formatDiscountAmount(appliedPromotion)}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter promotion code"
              value={promotionCode}
              onChange={(e) => {
                setPromotionCode(e.target.value.toUpperCase())
                setError(null)
              }}
              disabled={isValidating}
              className="uppercase placeholder:normal-case"
            />
          </div>
          <Button
            type="submit"
            disabled={isValidating || !promotionCode.trim()}
            className="min-w-[100px]"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Applying
              </>
            ) : (
              <>
                <Tag className="w-4 h-4 mr-2" />
                Apply
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}
      </form>

      <div className="text-xs text-gray-500">
        Have a promotion code? Enter it above to apply discounts to your order.
      </div>
    </div>
  )
}