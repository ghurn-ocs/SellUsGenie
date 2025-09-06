import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Package, Plus, Minus, RotateCcw } from 'lucide-react'
import type { Product } from '../types/product'

const stockUpdateSchema = z.object({
  inventory_quantity: z.number().min(0, 'Inventory quantity must be 0 or greater')
})

type StockUpdateFormData = z.infer<typeof stockUpdateSchema>

interface StockUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  mode: 'update' | 'add'
  products?: Product[]
  storeId: string
}

export const StockUpdateModal: React.FC<StockUpdateModalProps> = ({ 
  isOpen, 
  onClose, 
  product,
  mode,
  products = [],
  storeId
}) => {
  const queryClient = useQueryClient()
  const [stockChange, setStockChange] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(product)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<StockUpdateFormData>({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: {
      inventory_quantity: selectedProduct?.inventory_quantity || 0
    }
  })

  const currentQuantity = watch('inventory_quantity')

  const updateStockMutation = useMutation({
    mutationFn: async (data: StockUpdateFormData) => {
      if (!selectedProduct) throw new Error('No product selected')

      const { error } = await supabase
        .from('products')
        .update({ 
          inventory_quantity: data.inventory_quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProduct.id)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate the correct query keys for products
      queryClient.invalidateQueries({ queryKey: ['products-new', storeId] })
      queryClient.invalidateQueries({ queryKey: ['product-stats', storeId] })
      onClose()
      reset()
      setStockChange(0)
    }
  })

  const handleStockAdjustment = (adjustment: number) => {
    const currentValue = currentQuantity || 0
    const newValue = Math.max(0, currentValue + adjustment)
    setValue('inventory_quantity', newValue)
    setStockChange(stockChange + adjustment)
  }

  const handleReset = () => {
    setValue('inventory_quantity', selectedProduct?.inventory_quantity || 0)
    setStockChange(0)
  }

  const onSubmit = (data: StockUpdateFormData) => {
    updateStockMutation.mutate(data)
  }

  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'update' && product) {
        setSelectedProduct(product)
        setValue('inventory_quantity', product.inventory_quantity)
        setStockChange(0)
      } else if (mode === 'add') {
        if (products.length > 0) {
          setSelectedProduct(products[0])
          setValue('inventory_quantity', products[0].inventory_quantity)
        } else {
          setSelectedProduct(null)
          setValue('inventory_quantity', 0)
        }
        setStockChange(0)
      }
    }
  }, [product, isOpen, setValue, mode, products])

  const handleProductChange = (productId: string) => {
    const selected = products.find(p => p.id === productId)
    if (selected) {
      setSelectedProduct(selected)
      setValue('inventory_quantity', selected.inventory_quantity)
      setStockChange(0)
    }
  }

  if (mode === 'update' && !product) return null
  if (mode === 'add' && (!products || products.length === 0)) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-[#3A3A3A] bg-[#1E1E1E] p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#9B51E0]" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-semibold text-white">
                    {mode === 'update' ? 'Update Stock' : 'Add Stock'}
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-[#A0A0A0]">
                    {mode === 'update' 
                      ? 'Adjust the inventory quantity for this product'
                      : 'Add stock to this product'
                    }
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4 text-[#A0A0A0]" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>
          </div>

          {/* Product Selection for Add Mode */}
          {mode === 'add' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#A0A0A0]">
                Select Product
              </label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#2A2A2A] text-white"
              >
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} - ${prod.price} (Stock: {prod.inventory_quantity})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Product Info */}
          {selectedProduct && (
            <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A]">
            <div className="flex items-center space-x-3">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <img 
                  src={selectedProduct.images[0]} 
                  alt={selectedProduct.name} 
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 bg-[#3A3A3A] rounded flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#666]" />
                </div>
              )}
              <div>
                <p className="font-medium text-white">{selectedProduct.name}</p>
                <p className="text-sm text-[#A0A0A0]">${selectedProduct.price}</p>
                <p className="text-xs text-[#A0A0A0]">
                  Current Stock: {selectedProduct.inventory_quantity}
                </p>
              </div>
            </div>
          </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Stock Adjustment Controls */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#A0A0A0]">
                New Inventory Quantity
              </label>
              
              {/* Quick Adjustment Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleStockAdjustment(-10)}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] rounded hover:bg-[#4A4A4A] transition-colors text-xs"
                  >
                    <Minus className="w-3 h-3" />
                    <span>10</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStockAdjustment(-1)}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] rounded hover:bg-[#4A4A4A] transition-colors text-xs"
                  >
                    <Minus className="w-3 h-3" />
                    <span>1</span>
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center space-x-1 px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] rounded hover:bg-[#4A4A4A] transition-colors text-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleStockAdjustment(1)}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] rounded hover:bg-[#4A4A4A] transition-colors text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStockAdjustment(10)}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#3A3A3A] text-[#A0A0A0] rounded hover:bg-[#4A4A4A] transition-colors text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>10</span>
                  </button>
                </div>
              </div>

              {/* Direct Input */}
              <input
                {...register('inventory_quantity', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-[#3A3A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent bg-[#2A2A2A] text-white text-center text-2xl font-bold"
              />
              {errors.inventory_quantity && (
                <p className="text-sm text-red-500">{errors.inventory_quantity.message}</p>
              )}
              
              {/* Change Indicator */}
              {stockChange !== 0 && (
                <div className={`text-center text-sm ${stockChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stockChange > 0 ? '+' : ''}{stockChange} from original
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 border border-[#3A3A3A] rounded-lg text-[#A0A0A0] hover:bg-[#3A3A3A] transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={updateStockMutation.isPending}
                className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] disabled:bg-[#9B51E0]/50 disabled:cursor-not-allowed transition-colors"
              >
                {updateStockMutation.isPending ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}