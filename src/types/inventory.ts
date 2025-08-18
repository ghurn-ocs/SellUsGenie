// Inventory Management Type Definitions
// Comprehensive type system for inventory tracking, alerts, and management

export interface InventoryHistory {
  id: string
  product_id: string
  store_id: string
  change_type: 'sale' | 'restock' | 'adjustment' | 'return' | 'damage' | 'transfer'
  quantity_change: number
  previous_quantity: number
  new_quantity: number
  cost_per_unit?: number
  total_cost?: number
  reference_id?: string
  reference_type?: string
  notes?: string
  created_by?: string
  created_at: string
  
  // Relations
  product?: {
    id: string
    name: string
    sku?: string
  }
}

export interface InventoryAlert {
  id: string
  store_id: string
  product_id: string
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiry_warning'
  threshold_value?: number
  current_value: number
  alert_message: string
  is_acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  created_at: string
  resolved_at?: string
  
  // Relations
  product?: {
    id: string
    name: string
    sku?: string
    image?: string
  }
}

export interface InventorySettings {
  id: string
  store_id: string
  low_stock_threshold: number
  out_of_stock_threshold: number
  overstock_threshold: number
  enable_low_stock_alerts: boolean
  enable_out_of_stock_alerts: boolean
  enable_overstock_alerts: boolean
  auto_update_from_orders: boolean
  track_inventory_cost: boolean
  default_reorder_quantity: number
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  store_id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Computed
  products_count?: number
}

export interface ProductSupplier {
  id: string
  product_id: string
  supplier_id: string
  supplier_sku?: string
  lead_time_days: number
  minimum_order_quantity: number
  cost_per_unit?: number
  is_preferred: boolean
  created_at: string
  updated_at: string
  
  // Relations
  supplier?: Supplier
}

export interface InventoryLocation {
  id: string
  store_id: string
  name: string
  description?: string
  address?: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Computed
  products_count?: number
  total_value?: number
}

export interface ProductLocationInventory {
  id: string
  product_id: string
  location_id: string
  quantity: number
  reserved_quantity: number
  reorder_point: number
  max_stock?: number
  bin_location?: string
  created_at: string
  updated_at: string
  
  // Relations
  location?: InventoryLocation
  product?: {
    id: string
    name: string
    sku?: string
    price: number
  }
}

export interface ReorderSuggestion {
  id: string
  store_id: string
  product_id: string
  current_stock: number
  suggested_quantity: number
  priority_score: number
  reason?: string
  estimated_stockout_date?: string
  created_at: string
  is_actioned: boolean
  actioned_at?: string
  
  // Relations
  product?: {
    id: string
    name: string
    sku?: string
    price: number
    cost_price?: number
    reorder_point?: number
  }
}

// Enhanced Product interface for inventory management
export interface ProductWithInventory {
  id: string
  name: string
  sku?: string
  price: number
  cost_price?: number
  inventory: number
  reserved_quantity: number
  reorder_point: number
  max_stock?: number
  inventory_tracking: boolean
  last_restocked_at?: string
  average_cost: number
  created_at: string
  updated_at: string
  
  // Computed inventory fields
  available_quantity?: number // inventory - reserved_quantity
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
  days_of_stock_remaining?: number
  inventory_value?: number // quantity * average_cost
  inventory_turnover_rate?: number
  
  // Relations
  suppliers?: ProductSupplier[]
  location_inventory?: ProductLocationInventory[]
  recent_history?: InventoryHistory[]
}

// Analytics and Reporting Types
export interface InventoryAnalytics {
  total_products: number
  total_inventory_value: number
  out_of_stock_count: number
  low_stock_count: number
  overstock_count: number
  average_inventory_turnover: number
  top_selling_products: Array<{
    product_id: string
    product_name: string
    quantity_sold: number
    revenue: number
  }>
  slow_moving_products: Array<{
    product_id: string
    product_name: string
    current_stock: number
    days_since_last_sale: number
  }>
  stock_levels_by_category: Array<{
    category: string
    total_products: number
    out_of_stock: number
    low_stock: number
    in_stock: number
  }>
  inventory_movement_trend: Array<{
    date: string
    restocks: number
    sales: number
    adjustments: number
  }>
}

export interface InventoryOverview {
  total_inventory_value: number
  active_alerts_count: number
  reorder_suggestions_count: number
  products_needing_attention: number
  inventory_turnover_rate: number
  stock_accuracy_percentage: number
  recent_activities: InventoryHistory[]
  critical_alerts: InventoryAlert[]
  top_reorder_suggestions: ReorderSuggestion[]
}

// Form and Action Types
export interface InventoryAdjustmentForm {
  product_id: string
  adjustment_type: 'increase' | 'decrease' | 'set_to'
  quantity: number
  cost_per_unit?: number
  reason: string
  notes?: string
}

export interface RestockForm {
  product_id: string
  quantity: number
  cost_per_unit?: number
  supplier_id?: string
  reference_number?: string
  notes?: string
}

export interface BulkInventoryUpdate {
  updates: Array<{
    product_id: string
    inventory: number
    reorder_point?: number
    max_stock?: number
  }>
}

export interface CreateSupplierForm {
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  notes?: string
}

export interface CreateLocationForm {
  name: string
  description?: string
  address?: string
  is_default?: boolean
}

// Filter and Search Types
export interface InventoryFilters {
  stock_status?: ('in_stock' | 'low_stock' | 'out_of_stock' | 'overstock')[]
  categories?: string[]
  suppliers?: string[]
  locations?: string[]
  inventory_range?: {
    min: number
    max: number
  }
  value_range?: {
    min: number
    max: number
  }
  last_restocked?: {
    start: string
    end: string
  }
  inventory_tracking?: boolean
}

export interface AlertFilters {
  alert_types?: ('low_stock' | 'out_of_stock' | 'overstock' | 'expiry_warning')[]
  is_acknowledged?: boolean
  date_range?: {
    start: string
    end: string
  }
  products?: string[]
}

export interface HistoryFilters {
  change_types?: ('sale' | 'restock' | 'adjustment' | 'return' | 'damage' | 'transfer')[]
  products?: string[]
  date_range?: {
    start: string
    end: string
  }
  created_by?: string[]
}

// Inventory Valuation Methods
export type InventoryValuationMethod = 'FIFO' | 'LIFO' | 'Average' | 'Standard'

export interface InventoryValuation {
  method: InventoryValuationMethod
  total_cost: number
  total_quantity: number
  average_cost: number
  product_valuations: Array<{
    product_id: string
    product_name: string
    quantity: number
    unit_cost: number
    total_value: number
  }>
}

// Inventory Reports
export interface InventoryReport {
  id: string
  report_type: 'stock_levels' | 'movement' | 'valuation' | 'turnover' | 'abc_analysis'
  parameters: Record<string, any>
  generated_at: string
  data: any
  format: 'json' | 'csv' | 'pdf'
}

// Stock Movement Types for better tracking
export interface StockMovement {
  product_id: string
  product_name: string
  movement_type: 'in' | 'out'
  quantity: number
  cost_per_unit?: number
  total_cost?: number
  reference: string
  timestamp: string
  location?: string
}