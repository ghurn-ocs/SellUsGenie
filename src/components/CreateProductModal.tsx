// Brand new product creation modal - completely rewritten from scratch
import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Save, Loader2, Package } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { ProductService } from '../services/productService'
import { ImageUpload } from './ImageUpload'

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    sku: '',
    inventory: '',
    isActive: true,
    images: [] as string[]
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  // Hooks
  const { user } = useAuth()
  const { currentStore } = useStore()

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        price: '',
        comparePrice: '',
        costPrice: '',
        sku: '',
        inventory: '',
        isActive: true,
        images: []
      })
      setError(null)
      setFieldErrors({})
    }
  }, [isOpen])

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required'
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }
    
    const price = parseFloat(formData.price)
    if (!formData.price || isNaN(price) || price <= 0) {
      errors.price = 'Valid price is required'
    }
    
    const costPrice = parseFloat(formData.costPrice || '0')
    if (formData.costPrice && (isNaN(costPrice) || costPrice < 0)) {
      errors.costPrice = 'Valid cost price is required'
    }
    if (costPrice > 0 && price > 0 && costPrice >= price) {
      errors.costPrice = 'Cost price should be less than selling price'
    }
    
    const inventory = parseInt(formData.inventory)
    if (!formData.inventory || isNaN(inventory) || inventory < 0) {
      errors.inventory = 'Valid inventory quantity is required'
    }
    
    if (formData.comparePrice) {
      const comparePrice = parseFloat(formData.comparePrice)
      if (isNaN(comparePrice) || comparePrice <= price) {
        errors.comparePrice = 'Compare price must be higher than regular price'
      }
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle input changes
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle image upload
  const handleImageUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: [url] // For now, just store one image in array
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 CreateProductModal: Form submission started')
    console.log('👤 User:', user?.email)
    console.log('🏪 Store:', currentStore?.store_name)
    console.log('📝 Form data:', formData)
    
    if (!user) {
      setError('You must be logged in to create products')
      console.error('❌ No authenticated user')
      return
    }
    
    if (!currentStore) {
      setError('Please select a store first')
      console.error('❌ No current store selected')
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
      console.log('📞 Calling ProductService.createProduct...')
      
      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        compare_price: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        cost_price: formData.costPrice ? parseFloat(formData.costPrice) : 0,
        sku: formData.sku.trim() || undefined,
        inventory_quantity: parseInt(formData.inventory),
        is_active: formData.isActive,
        images: formData.images.length > 0 ? formData.images : undefined
      }
      
      console.log('📦 Prepared product data:', productData)
      
      const result = await ProductService.createProduct(currentStore.id, productData)
      
      console.log('✅ Product created successfully:', result)
      
      // Success - close modal and refresh
      onClose()
      onSuccess()
      
    } catch (error) {
      console.error('❌ Product creation failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to create product')
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
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-[#9B51E0]" />
              </div>
              <Dialog.Title className="text-xl font-semibold text-white">
                Create New Product
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
            
            {/* Product Name & SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                  placeholder="Enter product name"
                  disabled={isSubmitting}
                />
                {fieldErrors.name && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                  placeholder="Stock keeping unit"
                  disabled={isSubmitting}
                />
                {fieldErrors.sku && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.sku}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666] resize-vertical"
                placeholder="Describe your product..."
                disabled={isSubmitting}
              />
              {fieldErrors.description && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.description}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Selling Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.price && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Cost Price (COGS)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => handleChange('costPrice', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.costPrice && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.costPrice}</p>
                )}
                <p className="text-xs text-[#666] mt-1">What you pay for this product</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Compare At Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.comparePrice}
                    onChange={(e) => handleChange('comparePrice', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.comparePrice && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.comparePrice}</p>
                )}
                <p className="text-xs text-[#666] mt-1">Higher price for discount display</p>
              </div>
            </div>

            {/* Profit Margin Preview */}
            {formData.price && formData.costPrice && (
              <div className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#A0A0A0]">Profit Margin:</span>
                  <span className="text-green-400 font-medium">
                    {(() => {
                      const selling = parseFloat(formData.price) || 0
                      const cost = parseFloat(formData.costPrice) || 0
                      if (selling > 0 && cost >= 0) {
                        const margin = ((selling - cost) / selling) * 100
                        return `${margin.toFixed(1)}% ($${(selling - cost).toFixed(2)} profit)`
                      }
                      return 'Enter prices to calculate'
                    })()}
                  </span>
                </div>
              </div>
            )}

            {/* Inventory & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Inventory Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.inventory}
                  onChange={(e) => handleChange('inventory', e.target.value)}
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white placeholder-[#666]"
                  placeholder="0"
                  disabled={isSubmitting}
                />
                {fieldErrors.inventory && (
                  <p className="text-red-400 text-sm mt-1">{fieldErrors.inventory}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-3 mt-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-[#9B51E0] bg-[#1E1E1E] border-[#3A3A3A] rounded focus:ring-[#9B51E0] focus:ring-2"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-[#A0A0A0]">Product is active</span>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Product Image (Optional)
              </label>
              <ImageUpload
                onImageUploaded={handleImageUpload}
                currentImage={formData.images[0] || ''}
                bucket="product-images"
                folder="products"
                maxSize={5}
                placeholder="Upload product image"
                className="w-full"
              />
            </div>

            {/* Note: Image alt text handled automatically for now */}

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
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Product</span>
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