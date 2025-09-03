-- Simple Supabase Schema Extraction for Customer Storefront Development
-- Date: 2025-09-02
-- Purpose: Extract database schema with simple, reliable queries

-- ====================
-- TABLE COLUMNS EXTRACTION
-- ====================

-- Get all columns for storefront-related tables
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
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
    'delivery_areas',
    'store_settings'
  )
ORDER BY table_name, ordinal_position;

-- ====================
-- FOREIGN KEY RELATIONSHIPS
-- ====================

-- Get all foreign key relationships
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
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
ORDER BY tc.table_name, tc.constraint_name;

-- ====================
-- TABLE INDEXES
-- ====================

-- Get all indexes for performance reference
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ====================
-- ROW LEVEL SECURITY POLICIES
-- ====================

-- Get all RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;