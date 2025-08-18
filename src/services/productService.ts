// Modern Product Service - Rewritten from scratch
import { supabase } from '../lib/supabase'
import type { Product, CreateProductRequest, ProductFilters, ProductStats } from '../types/product'

export class ProductService {
  /**
   * Fetch all products for a store with optional filtering
   */
  static async getProducts(storeId: string, filters?: ProductFilters): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
      
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      
      if (filters?.price_min !== undefined) {
        query = query.gte('price', filters.price_min)
      }
      
      if (filters?.price_max !== undefined) {
        query = query.lte('price', filters.price_max)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ ProductService.getProducts error:', error)
        throw new Error(`Failed to fetch products: ${error.message}`)
      }

      console.log('✅ ProductService.getProducts success:', data?.length, 'products')
      return data || []
    } catch (error) {
      console.error('❌ ProductService.getProducts exception:', error)
      throw error
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(storeId: string, productData: CreateProductRequest): Promise<Product> {
    try {
      console.log('🚀 ProductService.createProduct called:', { storeId, productData })

      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('❌ Auth check failed:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }
      
      if (!user) {
        console.error('❌ No authenticated user')
        throw new Error('User must be authenticated to create products')
      }
      
      console.log('✅ User authenticated:', user.email, 'ID:', user.id)

      // Verify store ownership
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .eq('store_owner_id', user.id)
        .single()
        
      if (storeError) {
        console.error('❌ Store verification failed:', storeError)
        throw new Error(`Store access error: ${storeError.message}`)
      }
      
      if (!store) {
        console.error('❌ Store not found or access denied')
        throw new Error('Store not found or access denied')
      }
      
      console.log('✅ Store verified:', store.store_name)

      const newProduct = {
        ...productData,
        store_id: storeId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📝 Inserting product data:', newProduct)

      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single()

      if (error) {
        console.error('❌ ProductService.createProduct error:', error)
        console.error('📋 Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Failed to create product: ${error.message}`)
      }

      console.log('✅ ProductService.createProduct success:', data)
      return data
    } catch (error) {
      console.error('❌ ProductService.createProduct exception:', error)
      throw error
    }
  }

  /**
   * Update an existing product
   */
  static async updateProduct(productId: string, updates: Partial<CreateProductRequest>): Promise<Product> {
    try {
      console.log('🔄 ProductService.updateProduct called:', { productId, updates })

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        console.error('❌ ProductService.updateProduct error:', error)
        throw new Error(`Failed to update product: ${error.message}`)
      }

      console.log('✅ ProductService.updateProduct success:', data)
      return data
    } catch (error) {
      console.error('❌ ProductService.updateProduct exception:', error)
      throw error
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      console.log('🗑️ ProductService.deleteProduct called:', productId)

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('❌ ProductService.deleteProduct error:', error)
        throw new Error(`Failed to delete product: ${error.message}`)
      }

      console.log('✅ ProductService.deleteProduct success')
    } catch (error) {
      console.error('❌ ProductService.deleteProduct exception:', error)
      throw error
    }
  }

  /**
   * Get product statistics
   */
  static async getProductStats(storeId: string): Promise<ProductStats> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('is_active, inventory_quantity')
        .eq('store_id', storeId)

      if (error) {
        console.error('❌ ProductService.getProductStats error:', error)
        throw new Error(`Failed to fetch product stats: ${error.message}`)
      }

      const products = data || []
      
      return {
        total: products.length,
        active: products.filter(p => p.is_active).length,
        inactive: products.filter(p => !p.is_active).length,
        low_stock: products.filter(p => p.inventory_quantity < 10).length
      }
    } catch (error) {
      console.error('❌ ProductService.getProductStats exception:', error)
      throw error
    }
  }

  /**
   * Toggle product active status
   */
  static async toggleProductStatus(productId: string, isActive: boolean): Promise<Product> {
    try {
      return await this.updateProduct(productId, { is_active: isActive })
    } catch (error) {
      console.error('❌ ProductService.toggleProductStatus exception:', error)
      throw error
    }
  }
}