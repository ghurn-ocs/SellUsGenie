import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/supabase'

export const useProducts = (storeId: string) => {
  const queryClient = useQueryClient()

  const {
    data: products = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['products', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })

  const createProduct = useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'store_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, store_id: storeId }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] })
    }
  })

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] })
    }
  })

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] })
    }
  })

  return {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct
  }
}
