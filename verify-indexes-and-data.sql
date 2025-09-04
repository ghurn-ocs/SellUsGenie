-- Verify Indexes and Data for Performance Testing
-- Glenn's Store UUID: 6ee170b7-9c5d-4c02-b32f-ef0c2da925d4

-- ============================================================================
-- 1. VERIFY ALL INDEXES EXIST
-- ============================================================================

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- 2. CHECK DATA DISTRIBUTION ACROSS ALL STORES
-- ============================================================================

-- Products by store
SELECT 
    s.store_name,
    s.id as store_id,
    COUNT(p.id) as product_count,
    COUNT(CASE WHEN p.is_active THEN 1 END) as active_products,
    COUNT(CASE WHEN p.is_featured THEN 1 END) as featured_products
FROM stores s
LEFT JOIN products p ON s.id = p.store_id
GROUP BY s.id, s.store_name
ORDER BY product_count DESC;

-- Customers by store
SELECT 
    s.store_name,
    s.id as store_id,
    COUNT(c.id) as customer_count
FROM stores s
LEFT JOIN customers c ON s.id = c.store_id
GROUP BY s.id, s.store_name
ORDER BY customer_count DESC;

-- Orders by store
SELECT 
    s.store_name,
    s.id as store_id,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_revenue,
    COUNT(CASE WHEN o.status = 'paid' THEN 1 END) as paid_orders
FROM stores s
LEFT JOIN orders o ON s.id = o.store_id
GROUP BY s.id, s.store_name
ORDER BY order_count DESC;

-- Page documents by store
SELECT 
    s.store_name,
    s.id as store_id,
    COUNT(pd.id) as page_count,
    COUNT(CASE WHEN pd.status = 'published' THEN 1 END) as published_pages
FROM stores s
LEFT JOIN page_documents pd ON s.id = pd.store_id
GROUP BY s.id, s.store_name
ORDER BY page_count DESC;

-- ============================================================================
-- 3. FORCE INDEX USAGE TEST (for larger datasets when available)
-- ============================================================================

-- This query forces PostgreSQL to consider using indexes
-- by adding complexity that benefits from indexed lookups

EXPLAIN ANALYZE
SELECT 
    p.id,
    p.name,
    p.price,
    p.store_id,
    COUNT(oi.id) as order_items_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.store_id IN (
    '6ee170b7-9c5d-4c02-b32f-ef0c2da925d4',
    'e11243e4-8476-4ea1-899f-b7401da5efef',
    '638ef028-7752-4996-9aae-878d896734fc'
)
AND p.is_active = true
GROUP BY p.id, p.name, p.price, p.store_id
ORDER BY p.store_id, p.name;

-- ============================================================================
-- 4. INDEX USAGE STATISTICS
-- ============================================================================

-- Check if indexes have been used at all
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE 
        WHEN idx_scan = 0 THEN 'Never used'
        WHEN idx_scan < 10 THEN 'Rarely used'
        WHEN idx_scan < 100 THEN 'Moderately used'
        ELSE 'Frequently used'
    END as usage_level
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND indexrelname LIKE 'idx_%'
ORDER BY idx_scan DESC, relname, indexrelname;

-- ============================================================================
-- 5. TABLE SIZES AND ROW COUNTS
-- ============================================================================

SELECT 
    schemaname,
    relname as tablename,
    n_tup_ins as rows_inserted,
    n_tup_upd as rows_updated,
    n_tup_del as rows_deleted,
    n_live_tup as current_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ============================================================================
-- 6. RECOMMENDATIONS FOR INDEX TESTING
-- ============================================================================

/*
INDEX TESTING RECOMMENDATIONS:

Current State:
- Small dataset (3 products total)
- PostgreSQL uses sequential scans for small tables (< ~100-1000 rows)
- Indexes will show benefits with larger datasets

To Test Index Performance:
1. Insert test data (100+ products per store)
2. Create multiple customers and orders
3. Run complex queries with joins and aggregations
4. Monitor pg_stat_user_indexes for usage statistics

Expected Index Usage Scenarios:
- Multi-tenant filtering: store_id indexes
- Product catalogs: category_id, is_active, is_featured
- Order processing: customer_id, status, created_at
- Analytics: timestamp-based queries with aggregations
- Search: email, slug, navigation_placement

Index Performance Benefits Scale With Data:
- 10 rows: Minimal benefit (seq scan faster)
- 100 rows: Some benefit for complex queries
- 1,000+ rows: Significant benefits (5-10x faster)
- 10,000+ rows: Major benefits (10-100x faster)
*/