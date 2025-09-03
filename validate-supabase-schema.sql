-- ===================================================================
-- SUPABASE SCHEMA VALIDATION FOR VISUAL PAGE BUILDER SYSTEM
-- Run this in your Supabase SQL Editor to validate the database schema
-- ===================================================================

-- 1. Check if all required tables exist
SELECT 
    'TABLE CHECK' as validation_type,
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
    ('stores'),
    ('store_owners'),
    ('page_documents'),
    ('page_history'),
    ('store_page_layouts'),
    ('products'),
    ('customers'),
    ('orders')
) AS required_tables(table_name)
ORDER BY table_name;

-- 2. Check page_documents table structure
SELECT 
    'PAGE_DOCUMENTS COLUMNS' as validation_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'page_documents' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check stores table structure
SELECT 
    'STORES COLUMNS' as validation_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'stores' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Validate page_documents data for the test store
SELECT 
    'STORE PAGES DATA' as validation_type,
    id,
    name,
    page_type,
    status,
    slug,
    created_at,
    updated_at,
    CASE 
        WHEN sections IS NULL THEN '❌ NULL SECTIONS'
        WHEN jsonb_array_length(sections) = 0 THEN '⚠️ EMPTY SECTIONS'
        ELSE '✅ HAS SECTIONS (' || jsonb_array_length(sections) || ')'
    END as sections_status
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
ORDER BY 
    CASE 
        WHEN page_type = 'header' THEN 1
        WHEN page_type = 'footer' THEN 2
        WHEN name = 'Home Page' THEN 3
        ELSE 4
    END,
    name;

-- 5. Check for system pages specifically
SELECT 
    'SYSTEM PAGES CHECK' as validation_type,
    'Header Pages' as page_category,
    COUNT(*) as count,
    STRING_AGG(name || ' (' || status || ')', ', ') as pages
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND (page_type = 'header' OR name ILIKE '%header%')

UNION ALL

SELECT 
    'SYSTEM PAGES CHECK' as validation_type,
    'Footer Pages' as page_category,
    COUNT(*) as count,
    STRING_AGG(name || ' (' || status || ')', ', ') as pages
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND (page_type = 'footer' OR name ILIKE '%footer%');

-- 6. Check RLS policies on critical tables
SELECT 
    'RLS POLICIES' as validation_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('page_documents', 'stores', 'products')
ORDER BY tablename, policyname;

-- 7. Check if RLS is enabled
SELECT 
    'RLS STATUS' as validation_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('page_documents', 'stores', 'products', 'customers')
    AND schemaname = 'public';

-- 8. Test public access to published pages (simulating anonymous user)
SET LOCAL ROLE anon;

SELECT 
    'PUBLIC ACCESS TEST' as validation_type,
    'Published Pages Accessible' as test_name,
    COUNT(*) as accessible_count
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND status = 'published';

-- Reset role
RESET ROLE;

-- 9. Check store data
SELECT 
    'STORE DATA' as validation_type,
    id,
    store_name,
    store_slug,
    is_active,
    created_at
FROM stores 
WHERE id = '638ef028-7752-4996-9aae-878d896734fc';

-- 10. Check for any orphaned or problematic data
SELECT 
    'DATA INTEGRITY' as validation_type,
    'Pages without store_id' as issue_type,
    COUNT(*) as count
FROM page_documents 
WHERE store_id IS NULL

UNION ALL

SELECT 
    'DATA INTEGRITY' as validation_type,
    'Pages with invalid JSON sections' as issue_type,
    COUNT(*) as count
FROM page_documents 
WHERE sections IS NOT NULL 
    AND NOT (sections::text ~ '^[\[\{].*[\]\}]$')

UNION ALL

SELECT 
    'DATA INTEGRITY' as validation_type,
    'System pages without page_type' as issue_type,
    COUNT(*) as count
FROM page_documents 
WHERE (name ILIKE '%header%' OR name ILIKE '%footer%')
    AND page_type IS NULL;

-- 11. Check specific header/footer content structure
SELECT 
    'HEADER CONTENT CHECK' as validation_type,
    id,
    name,
    page_type,
    status,
    CASE 
        WHEN sections IS NULL THEN 'No sections'
        WHEN jsonb_array_length(sections) = 0 THEN 'Empty sections array'
        ELSE 'Has ' || jsonb_array_length(sections) || ' section(s)'
    END as sections_info,
    CASE 
        WHEN sections IS NOT NULL AND jsonb_array_length(sections) > 0 THEN
            (SELECT COUNT(*) FROM jsonb_array_elements(sections) AS section,
                                jsonb_array_elements(section->'rows') AS row,
                                jsonb_array_elements(row->'widgets') AS widget)
        ELSE 0
    END as total_widgets
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND (page_type IN ('header', 'footer') OR name IN ('Site Header', 'Site Footer'));

-- 12. Sample widget content from header (if exists)
SELECT 
    'HEADER WIDGET SAMPLE' as validation_type,
    widget->>'type' as widget_type,
    widget->'props'->>'content' as widget_content_preview
FROM page_documents,
     jsonb_array_elements(sections) AS section,
     jsonb_array_elements(section->'rows') AS row,
     jsonb_array_elements(row->'widgets') AS widget
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND (page_type = 'header' OR name = 'Site Header')
    AND status = 'published'
LIMIT 5;

-- 13. Check authentication and permissions setup
SELECT 
    'AUTH SETUP' as validation_type,
    'Current Role' as info_type,
    current_user as value

UNION ALL

SELECT 
    'AUTH SETUP' as validation_type,
    'Session User' as info_type,
    COALESCE(auth.uid()::text, 'No authenticated user') as value;

-- 14. Final summary
SELECT 
    'VALIDATION SUMMARY' as validation_type,
    'Store Pages Count' as metric,
    COUNT(*)::text as value
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'

UNION ALL

SELECT 
    'VALIDATION SUMMARY' as validation_type,
    'Published Pages' as metric,
    COUNT(*)::text as value
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND status = 'published'

UNION ALL

SELECT 
    'VALIDATION SUMMARY' as validation_type,
    'Header Pages' as metric,
    COUNT(*)::text as value
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND (page_type = 'header' OR name = 'Site Header')

UNION ALL

SELECT 
    'VALIDATION SUMMARY' as validation_type,
    'Footer Pages' as metric,
    COUNT(*)::text as value
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND (page_type = 'footer' OR name = 'Site Footer');

-- ===================================================================
-- END OF VALIDATION SCRIPT
-- ===================================================================