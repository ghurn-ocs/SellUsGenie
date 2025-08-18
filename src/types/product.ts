// Modern Product Types - Rewritten from scratch
export interface Product {
  id: string
  store_id: string
  name: string
  description: string
  price: number
  compare_price?: number
  sku?: string
  inventory_quantity: number
  is_active: boolean
  is_featured?: boolean
  images?: string[]
  created_at: string
  updated_at: string
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  compare_price?: number
  sku?: string
  inventory_quantity: number
  is_active: boolean
  is_featured?: boolean
  images?: string[]
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string
}

export interface ProductFilters {
  search?: string
  is_active?: boolean
  price_min?: number
  price_max?: number
}

export interface ProductStats {
  total: number
  active: number
  inactive: number
  low_stock: number
}