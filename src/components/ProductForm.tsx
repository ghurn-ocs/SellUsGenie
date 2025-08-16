import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import { ImageUpload } from './ImageUpload'
import { useTrialLimits } from '../hooks/useTrialLimits'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  compare_at_price: z.number().min(0, 'Compare price must be positive').optional(),
  sku: z.string().optional(),
  inventory_quantity: z.number().min(0, 'Inventory must be non-negative'),
  is_active: z.boolean(),
  image_url: z.string().optional(),
  image_alt: z.string().optional()
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProductFormData) => Promise<void>
  product?: {
    id: string
    name: string
    description: string
    price: number
    compare_at_price?: number
    sku?: string
    inventory_quantity: number
    is_active: boolean
    image_url?: string
    image_alt?: string
  }
  isLoading?: boolean
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(product?.image_url || '')
  const { isTrialStore, getProductLimitMessage } = useTrialLimits()
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      compare_at_price: product?.compare_at_price || undefined,
      sku: product?.sku || '',
      inventory_quantity: product?.inventory_quantity || 0,
      is_active: product?.is_active ?? true,
      image_url: product?.image_url || '',
      image_alt: product?.image_alt || ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      const imageUrl = product?.image_url || ''
      setCurrentImageUrl(imageUrl)
      reset({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        compare_at_price: product?.compare_at_price || undefined,
        sku: product?.sku || '',
        inventory_quantity: product?.inventory_quantity || 0,
        is_active: product?.is_active ?? true,
        image_url: imageUrl,
        image_alt: product?.image_alt || ''
      })
    }
  }, [isOpen, product, reset])

  const handleImageUpload = (url: string) => {
    setCurrentImageUrl(url)
    setValue('image_url', url)
  }

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data)
      onClose()
      reset()
      setCurrentImageUrl('')
    } catch (error) {
      console.error('Error submitting product:', error)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-semibold text-white mb-4">
            {product ? 'Edit Product' : 'Add New Product'}
          </Dialog.Title>
          
          {isTrialStore && !product && (
            <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
              <p className="text-sm text-orange-300">
                {getProductLimitMessage()}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Product Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  SKU
                </label>
                <input
                  {...register('sku')}
                  type="text"
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                  placeholder="Stock keeping unit"
                />
                {errors.sku && (
                  <p className="text-red-600 text-sm mt-1">{errors.sku.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Product Image
              </label>
              <ImageUpload
                currentImage={currentImageUrl}
                onImageUploaded={handleImageUpload}
                bucket="product-images"
                folder="products"
                placeholder="Upload product image"
              />
              <p className="text-sm text-[#A0A0A0] mt-1">
                Recommended: 800x800px or larger, JPG/PNG format
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                Image Alt Text
              </label>
              <input
                {...register('image_alt')}
                type="text"
                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                placeholder="Describe the image for accessibility"
              />
              <p className="text-sm text-[#A0A0A0] mt-1">
                Help screen readers understand what's in the image
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]">$</span>
                  <input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0]">$</span>
                  <input
                    {...register('compare_at_price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.compare_at_price && (
                  <p className="text-red-600 text-sm mt-1">{errors.compare_at_price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">
                  Inventory Quantity *
                </label>
                <input
                  {...register('inventory_quantity', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#1E1E1E] text-white"
                  placeholder="0"
                />
                {errors.inventory_quantity && (
                  <p className="text-red-600 text-sm mt-1">{errors.inventory_quantity.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                {...register('is_active')}
                type="checkbox"
                id="is_active"
                className="w-4 h-4 text-[#9B51E0] border-[#3A3A3A] bg-[#1E1E1E] rounded focus:ring-[#9B51E0]"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-[#A0A0A0]">
                Product is active
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#A0A0A0] bg-[#3A3A3A] rounded-lg hover:bg-[#4A4A4A] transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ProductForm
