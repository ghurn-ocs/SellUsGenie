// Professional Order Creation Modal with Product Selection
import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Save, Loader2, ShoppingCart, CreditCard, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useCustomers } from '../hooks/useCustomers'
import { useProductsNew } from '../hooks/useProductsNew'
import { ProductSelector } from './ProductSelector'
import type { Product } from '../types/product'

interface OrderItem {
  product: Product
  quantity: number
  unit_price: number
  total_price: number
}

interface ProfessionalOrderData {
  customer_id: string
  order_number: string
  status: 'to_be_paid'
  payment_status: 'unpaid'
  subtotal: number
  tax: number
  shipping: number
  total: number
  notes?: string
  order_items: Array<{
    product_id: string
    product_name: string
    product_sku?: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}

interface CreateOrderModalProfessionalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (orderData: ProfessionalOrderData) => Promise<void>
}

export const CreateOrderModalProfessional: React.FC<CreateOrderModalProfessionalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    orderNumber: '',
    shipping: '0.00',
    notes: ''
  })
  
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  // Hooks
  const { user } = useAuth()
  const { currentStore } = useStore()
  const { customers } = useCustomers(currentStore?.id || '')
  const { products } = useProductsNew(currentStore?.id || '')

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
      setFormData({
        customerId: '',
        orderNumber,
        shipping: '0.00',
        notes: ''
      })
      setSelectedItems([])
      setError(null)
      setFieldErrors({})
    }
  }, [isOpen])

  // Calculate order totals (no tax calculation for manual orders - Stripe handles it)
  const subtotal = selectedItems.reduce((sum, item) => sum + item.total_price, 0)
  const shippingAmount = parseFloat(formData.shipping || '0')
  // Tax will be calculated by Stripe based on customer location
  const total = subtotal + shippingAmount

  // Product selector handlers
  const handleItemAdd = (item: OrderItem) => {
    setSelectedItems(prev => [...prev, item])
  }

  const handleItemUpdate = (productId: string, quantity: number) => {
    setSelectedItems(prev => 
      prev.map(item => {
        if (item.product.id === productId) {
          const total_price = item.unit_price * quantity
          return { ...item, quantity, total_price }
        }
        return item
      })
    )
  }

  const handleItemRemove = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.product.id !== productId))
  }

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.customerId) {
      errors.customerId = 'Customer is required'
    }
    
    if (!formData.orderNumber.trim()) {
      errors.orderNumber = 'Order number is required'
    }
    
    if (selectedItems.length === 0) {
      errors.items = 'At least one product must be selected'
    }
    
    // Check inventory availability
    for (const item of selectedItems) {
      if (item.quantity > item.product.inventory_quantity) {
        errors.inventory = `Insufficient stock for ${item.product.name} (Available: ${item.product.inventory_quantity})`
        break
      }
    }
    
    const shipping = parseFloat(formData.shipping)
    if (formData.shipping && (isNaN(shipping) || shipping < 0)) {
      errors.shipping = 'Valid shipping amount required'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 CreateOrderModalProfessional: Form submission started')
    
    if (!user) {
      setError('You must be logged in to create orders')
      return
    }
    
    if (!currentStore) {
      setError('Please select a store first')
      return
    }
    
    if (!validateForm()) {
      setError('Please fix the form errors before submitting')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Prepare professional order data
      const orderData: ProfessionalOrderData = {
        customer_id: formData.customerId,
        order_number: formData.orderNumber.trim(),
        status: 'to_be_paid',
        payment_status: 'unpaid',
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: 0, // Tax will be calculated by Stripe upon payment
        shipping: parseFloat(formData.shipping || '0'),
        total: parseFloat(total.toFixed(2)),
        notes: formData.notes.trim() || undefined,
        order_items: selectedItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_sku: item.product.sku || undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))
      }
      
      console.log('📦 Creating professional order:', orderData)
      
      await onSuccess(orderData)
      
      console.log('✅ Professional order created successfully')
      
      // Success - close modal
      onClose()
      
    } catch (error) {
      console.error('❌ Order creation failed:', error)
      
      let errorMessage = 'Failed to create order'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message)
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-4xl z-50 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-semibold text-white">
                  Create New Order
                </Dialog.Title>
                <p className="text-sm text-[#A0A0A0] mt-1">
                  Manual orders are marked "To be paid" and customers receive a payment link
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-[#A0A0A0] hover:text-white transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Customer & Order Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Customer *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleChange('customerId', e.target.value)}
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                  disabled={isSubmitting}
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} - {customer.email}
                    </option>
                  ))}
                </select>
                {fieldErrors.customerId && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.customerId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Order Number *
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => handleChange('orderNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                  placeholder="ORD-123456"
                  disabled={isSubmitting}
                />
                {fieldErrors.orderNumber && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.orderNumber}</p>
                )}
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Products *
              </label>
              <ProductSelector
                products={products}
                selectedItems={selectedItems}
                onItemAdd={handleItemAdd}
                onItemUpdate={handleItemUpdate}
                onItemRemove={handleItemRemove}
              />
              {fieldErrors.items && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.items}</p>
              )}
              {fieldErrors.inventory && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.inventory}</p>
              )}
            </div>

            {/* Pricing Details */}
            {selectedItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                    Shipping
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.shipping}
                      onChange={(e) => handleChange('shipping', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldErrors.shipping && (
                    <p className="text-red-400 text-sm mt-1">{fieldErrors.shipping}</p>
                  )}
                </div>

                {/* Order Total Summary */}
                <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Order Total</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0]">Subtotal</span>
                      <span className="text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0]">Tax</span>
                      <span className="text-amber-400 text-xs">Will be calculated upon payment</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A0A0A0]">Shipping</span>
                      <span className="text-white">${shippingAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-[#3A3A3A] pt-1 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">Total</span>
                        <span className="text-xl font-bold text-[#9B51E0]">${total.toFixed(2)}*</span>
                      </div>
                      <p className="text-xs text-amber-400 mt-1">*Plus taxes calculated by Stripe</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666] resize-vertical"
                placeholder="Add any special instructions or notes..."
                disabled={isSubmitting}
              />
            </div>

            {/* Payment & Tax Info */}
            {selectedItems.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-medium text-blue-400">Payment & Tax Information</h4>
                </div>
                <div className="space-y-2 text-sm text-blue-300">
                  <p>
                    This order will be marked as <strong>"To be paid"</strong> and the customer will receive 
                    a Stripe payment link via email. Once paid, the order status will automatically update 
                    to <strong>"Paid"</strong> and be ready for fulfillment.
                  </p>
                  <p className="text-amber-300">
                    <strong>Tax Calculation:</strong> Stripe will calculate the appropriate taxes based on the 
                    customer's location and applicable tax rates. The final order total will be updated after 
                    payment with the correct tax amount.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-[#3A3A3A]">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedItems.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Order...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Order & Send Payment Link</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}