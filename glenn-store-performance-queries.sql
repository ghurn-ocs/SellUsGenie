-- Performance Testing Queries for Glenn's Store
-- Store: Glenn's Store
-- UUID: 6ee170b7-9c5d-4c02-b32f-ef0c2da925d4
-- Owner ID: b168edfe-a6ee-4bf7-b0c6-b35b3b2ac5bc

-- ============================================================================
-- PRODUCT PERFORMANCE TEST
-- This query tests the effectiveness of our product indexes
-- ============================================================================

EXPLAIN ANALYZE 
SELECT 
    p.id,
    p.name,
    p.price,
    p.compare_at_price,
    p.stock_quantity,
    p.is_active,
    p.is_featured,
    COUNT(oi.id) as order_count,
    SUM(oi.quantity) as total_sold,
    SUM(oi.total_price) as revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE p.store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
    AND p.is_active = true
    AND (o.status IS NULL OR o.status != 'cancelled')
GROUP BY p.id, p.name, p.price, p.compare_at_price, p.stock_quantity, p.is_active, p.is_featured
ORDER BY revenue DESC NULLS LAST, p.name
LIMIT 20;

-- ============================================================================
-- CUSTOMER ANALYTICS PERFORMANCE TEST
-- Tests customer-related indexes and aggregation performance
-- ============================================================================

EXPLAIN ANALYZE
SELECT 
    c.id,
    c.email,
    c.first_name,
    c.last_name,
    c.created_at,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent,
    AVG(o.total) as avg_order_value,
    MAX(o.created_at) as last_order_date,
    MIN(o.created_at) as first_order_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id AND o.store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
WHERE c.store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
GROUP BY c.id, c.email, c.first_name, c.last_name, c.created_at
ORDER BY total_spent DESC NULLS LAST, last_order_date DESC
LIMIT 50;

-- ============================================================================
-- ORDER PERFORMANCE TEST
-- Tests order indexes and complex filtering
-- ============================================================================

EXPLAIN ANALYZE
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.total,
    o.created_at,
    c.email as customer_email,
    c.first_name,
    c.last_name,
    COUNT(oi.id) as item_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
    AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY o.id, o.order_number, o.status, o.payment_status, o.total, o.created_at, c.email, c.first_name, c.last_name
ORDER BY o.created_at DESC
LIMIT 100;

-- ============================================================================
-- PAGE DOCUMENTS PERFORMANCE TEST
-- Tests page builder content retrieval
-- ============================================================================

EXPLAIN ANALYZE
SELECT 
    pd.id,
    pd.title,
    pd.slug,
    pd.page_type,
    pd.status,
    pd.navigation_placement,
    pd.updated_at,
    pd.published_at,
    LENGTH(pd.content::text) as content_size
FROM page_documents pd
WHERE pd.store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
    AND pd.status = 'published'
ORDER BY pd.updated_at DESC;

-- ============================================================================
-- CART ITEMS PERFORMANCE TEST
-- Tests shopping cart performance
-- ============================================================================

EXPLAIN ANALYZE
SELECT 
    ci.id,
    ci.customer_id,
    ci.session_id,
    ci.quantity,
    ci.created_at,
    p.name as product_name,
    p.price
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
    AND ci.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ci.created_at DESC
LIMIT 50;

-- ============================================================================
-- ANALYTICS EVENTS PERFORMANCE TEST
-- Tests analytics data retrieval and aggregation
-- ============================================================================

EXPLAIN ANALYZE
SELECT 
    ae.event_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT ae.user_id) as unique_users,
    COUNT(DISTINCT ae.session_id) as unique_sessions,
    DATE_TRUNC('day', ae.timestamp) as event_date
FROM analytics_events ae
WHERE ae.store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
    AND ae.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY ae.event_name, DATE_TRUNC('day', ae.timestamp)
ORDER BY event_date DESC, event_count DESC
LIMIT 100;

-- ============================================================================
-- INDEX USAGE VERIFICATION
-- Check which indexes are being used and their effectiveness
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    ROUND((idx_tup_fetch::numeric / NULLIF(idx_tup_read, 0)) * 100, 2) as fetch_ratio
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC
LIMIT 30;

-- ============================================================================
-- TABLE STATISTICS
-- Check table sizes and row counts for Glenn's store
-- ============================================================================

SELECT 
    'products' as table_name,
    COUNT(*) as row_count
FROM products 
WHERE store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
UNION ALL
SELECT 
    'customers' as table_name,
    COUNT(*) as row_count
FROM customers 
WHERE store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as row_count
FROM orders 
WHERE store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
UNION ALL
SELECT 
    'order_items' as table_name,
    COUNT(*) as row_count
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
UNION ALL
SELECT 
    'cart_items' as table_name,
    COUNT(*) as row_count
FROM cart_items 
WHERE store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
UNION ALL
SELECT 
    'page_documents' as table_name,
    COUNT(*) as row_count
FROM page_documents 
WHERE store_id = '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4'
ORDER BY row_count DESC;

-- ============================================================================
-- PERFORMANCE BENCHMARK SUMMARY
-- Quick overview of query execution times (run each query above individually)
-- ============================================================================

/*
Expected Performance Improvements with New Indexes:

1. Multi-tenant queries (store_id filtering): 5-10x faster
2. Product listing with joins: 3-5x faster  
3. Customer analytics aggregation: 10x+ faster
4. Order history retrieval: 5-8x faster
5. Page document navigation: 2-3x faster
6. Analytics event aggregation: 10x+ faster

To measure actual improvements:
1. Run these queries and note execution times
2. Compare with pre-index performance if available
3. Monitor index usage statistics over time
4. Check for unused indexes and optimize as needed
*/