// Modern Products Hook - Rewritten from scratch
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProductService } from '../services/productService'
import type { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../types/product'

export const useProductsNew = (storeId: string, filters?: ProductFilters) => {
  const queryClient = useQueryClient()

  // Query for fetching products
  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products-new', storeId, filters],
    queryFn: () => ProductService.getProducts(storeId, filters),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })

  // Query for product stats
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['product-stats', storeId],
    queryFn: () => ProductService.getProductStats(storeId),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mutation for creating products
  const createProductMutation = useMutation({
    mutationFn: (productData: CreateProductRequest) => {
      console.log('🚀 useProductsNew.createProductMutation.mutationFn started')
      console.log('📦 Mutation data:', productData)
      console.log('🏪 Store ID:', storeId)
      console.log('📞 Calling ProductService.createProduct...')
      
      return ProductService.createProduct(storeId, productData)
    },
    onSuccess: (newProduct) => {
      console.log('✅ useProductsNew.createProductMutation.onSuccess')
      console.log('📦 New product created:', newProduct)
      
      // Update the cache optimistically
      console.log('🔄 Updating TanStack Query cache...')
      queryClient.setQueryData(['products-new', storeId, filters], (old: Product[] = []) => {
        const updated = [newProduct, ...old]
        console.log('📋 Updated cache with products:', updated.length)
        return updated
      })
      
      // Invalidate related queries
      console.log('♻️ Invalidating related queries...')
      queryClient.invalidateQueries({ queryKey: ['products-new', storeId] })
      queryClient.invalidateQueries({ queryKey: ['product-stats', storeId] })
      
      console.log('✅ useProductsNew.createProductMutation.onSuccess completed')
    },
    onError: (error) => {
      console.error('❌ useProductsNew.createProductMutation.onError:', error)
    }
  })

  // Mutation for updating products
  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...updates }: UpdateProductRequest) =>
      ProductService.updateProduct(id, updates),
    onSuccess: (updatedProduct) => {
      console.log('✅ Product updated successfully:', updatedProduct)
      
      // Update the cache optimistically
      queryClient.setQueryData(['products-new', storeId, filters], (old: Product[] = []) =>
        old.map(product => product.id === updatedProduct.id ? updatedProduct : product)
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['products-new', storeId] })
      queryClient.invalidateQueries({ queryKey: ['product-stats', storeId] })
    },
    onError: (error) => {
      console.error('❌ Product update failed:', error)
    }
  })

  // Mutation for deleting products
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => ProductService.deleteProduct(productId),
    onSuccess: (_, deletedProductId) => {
      console.log('✅ Product deleted successfully:', deletedProductId)
      
      // Update the cache optimistically
      queryClient.setQueryData(['products-new', storeId, filters], (old: Product[] = []) =>
        old.filter(product => product.id !== deletedProductId)
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['products-new', storeId] })
      queryClient.invalidateQueries({ queryKey: ['product-stats', storeId] })
    },
    onError: (error) => {
      console.error('❌ Product deletion failed:', error)
    }
  })

  // Mutation for toggling product status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      ProductService.toggleProductStatus(productId, isActive),
    onSuccess: (updatedProduct) => {
      console.log('✅ Product status toggled successfully:', updatedProduct)
      
      // Update the cache optimistically
      queryClient.setQueryData(['products-new', storeId, filters], (old: Product[] = []) =>
        old.map(product => product.id === updatedProduct.id ? updatedProduct : product)
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['products-new', storeId] })
      queryClient.invalidateQueries({ queryKey: ['product-stats', storeId] })
    },
    onError: (error) => {
      console.error('❌ Product status toggle failed:', error)
    }
  })

  return {
    // Data
    products,
    stats,
    isLoading,
    statsLoading,
    error,
    
    // Actions
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    toggleProductStatus: toggleStatusMutation.mutateAsync,
    refetch,
    
    // Loading states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    
    // Error states
    createError: createProductMutation.error,
    updateError: updateProductMutation.error,
    deleteError: deleteProductMutation.error,
    toggleError: toggleStatusMutation.error,
  }
}