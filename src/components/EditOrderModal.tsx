// Edit Order Modal
import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Save, Loader2, ShoppingCart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useCustomers } from '../hooks/useCustomers'
import type { Order } from '../lib/supabase'

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (orderData: any) => Promise<void>
  order: Order | null
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  order
}) => {
  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    orderNumber: '',
    status: 'pending' as Order['status'],
    subtotal: '',
    tax: '',
    shipping: '',
    total: '',
    notes: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  // Hooks
  const { user } = useAuth()
  const { currentStore } = useStore()
  const { customers } = useCustomers(currentStore?.id || '')

  // Load order data when modal opens
  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        customerId: order.customer_id,
        orderNumber: order.order_number,
        status: order.status,
        subtotal: order.subtotal.toString(),
        tax: order.tax.toString(),
        shipping: order.shipping.toString(),
        total: order.total.toString(),
        notes: order.notes || ''
      })
      setError(null)
      setFieldErrors({})
    }
  }, [isOpen, order])

  // Auto-calculate total when subtotal, tax, or shipping changes
  useEffect(() => {
    const subtotal = parseFloat(formData.subtotal) || 0
    const tax = parseFloat(formData.tax) || 0
    const shipping = parseFloat(formData.shipping) || 0
    const total = subtotal + tax + shipping
    const totalString = total.toFixed(2)
    
    if (total > 0) {
      setFormData(prev => {
        if (prev.total !== totalString) {
          return { ...prev, total: totalString }
        }
        return prev
      })
    }
  }, [formData.subtotal, formData.tax, formData.shipping])

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.customerId) {
      errors.customerId = 'Customer is required'
    }
    
    if (!formData.orderNumber.trim()) {
      errors.orderNumber = 'Order number is required'
    }
    
    const subtotal = parseFloat(formData.subtotal)
    if (!formData.subtotal || isNaN(subtotal) || subtotal < 0) {
      errors.subtotal = 'Valid subtotal is required'
    }
    
    const tax = parseFloat(formData.tax)
    if (formData.tax && (isNaN(tax) || tax < 0)) {
      errors.tax = 'Valid tax amount required'
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
    
    console.log('🚀 EditOrderModal: Form submission started')
    console.log('👤 User:', user?.email)
    console.log('🏪 Store:', currentStore?.store_name)
    console.log('📝 Form data:', formData)
    
    if (!user) {
      setError('You must be logged in to edit orders')
      console.error('❌ No authenticated user')
      return
    }
    
    if (!currentStore) {
      setError('Please select a store first')
      console.error('❌ No current store selected')
      return
    }

    if (!order) {
      setError('No order selected to edit')
      console.error('❌ No order provided')
      return
    }
    
    if (!validateForm()) {
      setError('Please fix the form errors before submitting')
      console.error('❌ Form validation failed:', fieldErrors)
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('📞 Calling onSuccess with updated order data...')
      
      // Prepare order data
      const orderData = {
        id: order.id,
        customer_id: formData.customerId,
        order_number: formData.orderNumber.trim(),
        status: formData.status,
        subtotal: parseFloat(formData.subtotal),
        tax: parseFloat(formData.tax) || 0,
        shipping: parseFloat(formData.shipping) || 0,
        total: parseFloat(formData.total),
        notes: formData.notes.trim() || undefined
      }
      
      console.log('📦 Prepared order data:', orderData)
      
      await onSuccess(orderData)
      
      console.log('✅ Order updated successfully')
      
      // If this is an unpaid order update, customer needs to be notified
      if (order.status === 'to_be_paid') {
        console.log('📧 Order update notification required for unpaid order:', order.order_number)
        // TODO: Implement email notification system for order updates
        // - Send revised payment details to customer  
        // - Include note about what was updated
        // - Generate new Stripe payment link if amounts changed
        // - Update payment link expiration if needed
      }
      
      // Success - close modal
      onClose()
      
    } catch (error) {
      console.error('❌ Order update failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to update order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!order) return null

  const statusOptions: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
              </div>
              <Dialog.Title className="text-xl font-semibold text-white">
                Edit Order #{order.order_number}
              </Dialog.Title>
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
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
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

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Order Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                disabled={isSubmitting}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Subtotal *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.subtotal}
                    onChange={(e) => handleChange('subtotal', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.subtotal && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.subtotal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Tax
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.tax}
                    onChange={(e) => handleChange('tax', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.tax && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.tax}</p>
                )}
              </div>

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
            </div>

            {/* Total (read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-start-3">
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Total
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B51E0]">$</span>
                  <input
                    type="text"
                    value={formData.total}
                    readOnly
                    className="w-full pl-8 pr-3 py-2 border border-[#3A3A3A] rounded-lg bg-[#1E1E1E] text-[#9B51E0] font-semibold"
                  />
                </div>
              </div>
            </div>

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

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6">
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
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Order</span>
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