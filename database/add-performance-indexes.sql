-- Performance Optimization: Add Missing Database Indexes
-- Generated: September 3, 2025
-- Purpose: Improve query performance for multi-tenant filtering and relationships

-- ============================================================================
-- High Priority: Multi-tenant filtering indexes
-- These significantly improve performance for store-scoped queries
-- ============================================================================

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store_active ON products(store_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_store_featured ON products(store_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_store_status ON orders(store_id, status);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_store_email ON customers(store_id, email);

-- Cart items table indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_store_customer ON cart_items(store_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_store_session ON cart_items(store_id, session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- Page documents table indexes
CREATE INDEX IF NOT EXISTS idx_page_documents_store_id ON page_documents(store_id);
CREATE INDEX IF NOT EXISTS idx_page_documents_store_status ON page_documents(store_id, status);
CREATE INDEX IF NOT EXISTS idx_page_documents_store_slug ON page_documents(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_page_documents_navigation ON page_documents(store_id, navigation_placement);
CREATE INDEX IF NOT EXISTS idx_page_documents_page_type ON page_documents(store_id, page_type);

-- ============================================================================
-- Medium Priority: Analytics and performance queries
-- ============================================================================

-- Analytics events table indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_id ON analytics_events(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_timestamp ON analytics_events(store_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(store_id, event_name);

-- Customer analytics table indexes
CREATE INDEX IF NOT EXISTS idx_customer_analytics_store_id ON customer_analytics(store_id);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_customer_id ON customer_analytics(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_rfm_segment ON customer_analytics(store_id, rfm_segment);

-- Product analytics table indexes
CREATE INDEX IF NOT EXISTS idx_product_analytics_store_id ON product_analytics(store_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);

-- ============================================================================
-- Low Priority: Additional optimization indexes
-- ============================================================================

-- Store tables
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(store_slug);
CREATE INDEX IF NOT EXISTS idx_stores_owner_active ON stores(store_owner_id, is_active);

-- Store owner indexes
CREATE INDEX IF NOT EXISTS idx_store_owners_email ON store_owners(email);
CREATE INDEX IF NOT EXISTS idx_store_owners_subscription ON store_owners(subscription_tier);

-- Attribution touchpoints
CREATE INDEX IF NOT EXISTS idx_attribution_touchpoints_store_id ON attribution_touchpoints(store_id);
CREATE INDEX IF NOT EXISTS idx_attribution_touchpoints_customer_id ON attribution_touchpoints(customer_id);
CREATE INDEX IF NOT EXISTS idx_attribution_touchpoints_order_id ON attribution_touchpoints(order_id);

-- ============================================================================
-- Query Performance Analysis
-- Run this after adding indexes to verify improvements
-- ============================================================================

-- Analyze all tables to update query planner statistics
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE customers;
ANALYZE cart_items;
ANALYZE page_documents;
ANALYZE analytics_events;
ANALYZE customer_analytics;
ANALYZE product_analytics;
ANALYZE stores;
ANALYZE store_owners;

-- ============================================================================
-- Notes and Monitoring
-- ============================================================================

-- These indexes should significantly improve:
-- 1. Multi-tenant query performance (store_id filtering)
-- 2. Join operations between related tables
-- 3. Analytics aggregation queries
-- 4. Order and product listing queries
-- 5. Customer lookup operations

-- Monitor query performance using:
-- EXPLAIN ANALYZE SELECT ... (to see if indexes are being used)
-- pg_stat_user_indexes (to track index usage statistics)

-- To check index usage after deployment:
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/