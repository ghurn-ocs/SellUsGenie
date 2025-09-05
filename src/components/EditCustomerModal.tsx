// Edit Customer Modal
import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Save, Loader2, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useCustomers } from '../hooks/useCustomers'
import type { Customer } from '../lib/supabase'

interface EditCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (customerData: any) => Promise<void>
  customer: Customer | null
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer
}) => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [emailWarning, setEmailWarning] = useState<string | null>(null)
  
  // Hooks
  const { user } = useAuth()
  const { currentStore } = useStore()
  const { checkCustomerExists } = useCustomers(currentStore?.id || '')

  // Load customer data when modal opens
  useEffect(() => {
    if (isOpen && customer) {
      setFormData({
        email: customer.email || '',
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        phone: customer.phone || ''
      })
      setError(null)
      setFieldErrors({})
      setEmailWarning(null)
    }
  }, [isOpen, customer])

  // Check for existing customer when email changes (but skip if it's the same customer)
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && formData.email.includes('@') && customer) {
        // Skip check if email hasn't changed
        if (formData.email === customer.email) {
          setEmailWarning(null)
          return
        }
        
        const exists = await checkCustomerExists(formData.email)
        if (exists) {
          setEmailWarning('A customer with this email already exists in your store')
        } else {
          setEmailWarning(null)
        }
      } else {
        setEmailWarning(null)
      }
    }

    // Debounce the check
    const timeoutId = setTimeout(checkEmail, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.email, checkCustomerExists, customer])

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required'
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    
    if (formData.phone && !/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
      errors.phone = 'Valid phone number format required'
    }

    if (emailWarning) {
      errors.email = 'Customer with this email already exists'
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
    
    console.log('🚀 EditCustomerModal: Form submission started')
    console.log('👤 User:', user?.email)
    console.log('🏪 Store:', currentStore?.store_name)
    console.log('📝 Form data:', formData)
    
    if (!user) {
      setError('You must be logged in to edit customers')
      console.error('❌ No authenticated user')
      return
    }
    
    if (!currentStore) {
      setError('Please select a store first')
      console.error('❌ No current store selected')
      return
    }

    if (!customer) {
      setError('No customer selected to edit')
      console.error('❌ No customer provided')
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
      console.log('📞 Calling onSuccess with updated customer data...')
      
      // Prepare customer data
      const customerData = {
        id: customer.id,
        email: formData.email.trim(),
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined
      }
      
      console.log('📦 Prepared customer data:', customerData)
      
      await onSuccess(customerData)
      
      console.log('✅ Customer updated successfully')
      
      // Success - close modal
      onClose()
      
    } catch (error) {
      console.error('❌ Customer update failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to update customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!customer) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-[#9B51E0]" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-semibold text-white">
                  Edit Customer
                </Dialog.Title>
                <Dialog.Description className="text-sm text-[#A0A0A0] mt-1">
                  Update customer information and contact details
                </Dialog.Description>
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
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* OAuth Customer Warning */}
          {(customer.google_id || customer.apple_id) && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-300">
                <strong>OAuth Customer:</strong> This customer was created through {customer.google_id ? 'Google' : 'Apple'} authentication. 
                Changing the email address may affect their ability to sign in automatically during checkout.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                placeholder="customer@example.com"
                disabled={isSubmitting}
              />
              {fieldErrors.email && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.email}</p>
              )}
              {emailWarning && (
                <p className="text-yellow-400 text-sm mt-1">{emailWarning}</p>
              )}
              {!emailWarning && !fieldErrors.email && formData.email !== customer.email && (
                <p className="text-xs text-[#666] mt-1">
                  Email address will be updated for this customer
                </p>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                  placeholder="John"
                  disabled={isSubmitting}
                />
                {fieldErrors.firstName && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                  placeholder="Doe"
                  disabled={isSubmitting}
                />
                {fieldErrors.lastName && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
              />
              {fieldErrors.phone && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Customer Type Information */}
            <div className="p-4 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
              <div className="text-sm text-[#A0A0A0] mb-2">Customer Type</div>
              <div className="text-white">
                {customer.google_id || customer.apple_id ? (
                  <span className="text-green-400">OAuth Customer ({customer.google_id ? 'Google' : 'Apple'})</span>
                ) : (
                  <span className="text-blue-400">Manual Customer</span>
                )}
              </div>
              <div className="text-xs text-[#666] mt-1">
                Customer ID: {customer.id}
              </div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-[#9B51E0] hover:bg-[#8A47D0] rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Customer</span>
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