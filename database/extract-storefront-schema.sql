-- Extract Supabase Table and Field Structure for Customer Storefront Development
-- Date: 2025-09-02
-- Purpose: Document database schema for Customer Storefront development reference

-- ====================
-- STOREFRONT-RELATED TABLES SCHEMA EXTRACTION
-- ====================

-- This query extracts the complete table structure for all tables relevant to Customer Storefront development
-- Including stores, products, customers, orders, page_documents, and related tables

-- Query 1: Get all table columns with details
SELECT 
  'TABLE: ' || table_name as table_info,
  column_name,
  data_type || 
    CASE 
      WHEN character_maximum_length IS NOT NULL 
      THEN '(' || character_maximum_length || ')' 
      ELSE '' 
    END as data_type,
  is_nullable,
  COALESCE(column_default, '') as column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'stores',
    'products', 
    'customers',
    'orders',
    'order_items',
    'page_documents',
    'page_history',
    'page_templates',
    'store_page_layouts',
    'store_owners',
    'subscriptions',
    'product_categories',
    'product_images',
    'customer_addresses',
    'customer_orders',
    'delivery_areas',
    'store_settings',
    'system_settings'
  )
ORDER BY table_name, ordinal_position;

-- ====================
-- TABLE RELATIONSHIPS AND CONSTRAINTS
-- ====================

-- Query 2: Get foreign key relationships
SELECT 
  'FOREIGN_KEY' as constraint_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'stores', 'products', 'customers', 'orders', 'order_items',
    'page_documents', 'page_history', 'page_templates', 'store_page_layouts',
    'store_owners', 'subscriptions', 'product_categories', 'product_images',
    'customer_addresses', 'customer_orders', 'delivery_areas', 'store_settings', 'system_settings'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- ====================
-- INDEXES FOR PERFORMANCE
-- ====================

-- Query 3: Get table indexes
SELECT 
  'INDEX' as object_type,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN (
    'stores', 'products', 'customers', 'orders', 'order_items',
    'page_documents', 'page_history', 'page_templates', 'store_page_layouts',
    'store_owners', 'subscriptions', 'product_categories', 'product_images',
    'customer_addresses', 'customer_orders', 'delivery_areas', 'store_settings', 'system_settings'
  )
ORDER BY tablename, indexname;

-- ====================
-- ROW LEVEL SECURITY POLICIES
-- ====================

-- Query 4: Get RLS policies
SELECT 
  'RLS_POLICY' as object_type,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'stores', 'products', 'customers', 'orders', 'order_items',
    'page_documents', 'page_history', 'page_templates', 'store_page_layouts',
    'store_owners', 'subscriptions', 'product_categories', 'product_images',
    'customer_addresses', 'customer_orders', 'delivery_areas', 'store_settings', 'system_settings'
  )
ORDER BY tablename, policyname;

-- ====================
-- SPECIFIC STOREFRONT QUERIES FOR DEVELOPMENT REFERENCE
-- ====================

/*
-- Sample queries that Customer Storefront will commonly use:

-- Get store information with header/footer pages
SELECT 
  s.*,
  header_page.id as header_page_id,
  header_page.sections as header_sections,
  header_page.theme_overrides as header_theme,
  footer_page.id as footer_page_id,
  footer_page.sections as footer_sections,
  footer_page.theme_overrides as footer_theme
FROM stores s
LEFT JOIN page_documents header_page ON s.id = header_page.store_id 
  AND header_page.name = 'Site Header' 
  AND header_page.status = 'published'
LEFT JOIN page_documents footer_page ON s.id = footer_page.store_id 
  AND footer_page.name = 'Site Footer' 
  AND footer_page.status = 'published'
WHERE s.slug = 'store-slug';

-- Get published pages for navigation
SELECT 
  id, name, slug, navigation_placement, sections, theme_overrides
FROM page_documents 
WHERE store_id = 'store-uuid' 
  AND status = 'published' 
  AND navigation_placement IN ('header', 'footer', 'both')
ORDER BY name;

-- Get products for storefront display
SELECT 
  p.*,
  pi.image_url,
  pi.alt_text,
  pc.name as category_name
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
LEFT JOIN product_categories pc ON p.category_id = pc.id
WHERE p.store_id = 'store-uuid' 
  AND p.status = 'active'
  AND p.inventory_quantity > 0
ORDER BY p.display_order, p.created_at DESC;

-- Get customer order history
SELECT 
  o.*,
  oi.product_id,
  oi.quantity,
  oi.unit_price,
  p.name as product_name
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.customer_id = 'customer-uuid'
ORDER BY o.created_at DESC;
*/