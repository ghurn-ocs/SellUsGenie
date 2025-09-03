-- ===================================================================
-- GET EXACT SCHEMA DETAILS FOR VALIDATION
-- Run this in Supabase SQL Editor to get precise table/field information
-- ===================================================================

-- 1. Get complete page_documents table structure
SELECT 
    'PAGE_DOCUMENTS_SCHEMA' as info_type,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'page_documents' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Get stores table structure  
SELECT 
    'STORES_SCHEMA' as info_type,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'stores' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Get exact values from your header/footer pages
SELECT 
    'HEADER_FOOTER_DATA' as info_type,
    id,
    name,
    page_type,
    status,
    slug,
    store_id,
    created_at::date as created_date,
    updated_at::date as updated_date,
    CASE 
        WHEN sections IS NULL THEN 0
        ELSE jsonb_array_length(sections)
    END as sections_count
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND (name ILIKE '%header%' OR name ILIKE '%footer%' OR page_type IN ('header', 'footer'))
ORDER BY name;

-- 4. Check ALL possible page_type values in the database
SELECT 
    'ALL_PAGE_TYPES' as info_type,
    page_type,
    COUNT(*) as count,
    STRING_AGG(DISTINCT name, ', ') as example_names
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
GROUP BY page_type
ORDER BY page_type;

-- 5. Check ALL possible status values
SELECT 
    'ALL_STATUS_VALUES' as info_type,
    status,
    COUNT(*) as count,
    STRING_AGG(DISTINCT name, ', ' ORDER BY name) as page_names
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
GROUP BY status
ORDER BY status;

-- 6. Test the exact query our public client is using
SELECT 
    'PUBLIC_CLIENT_QUERY_TEST' as info_type,
    'Header Query' as query_type,
    COUNT(*) as result_count
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND page_type = 'header'
    AND status = 'published'

UNION ALL

SELECT 
    'PUBLIC_CLIENT_QUERY_TEST' as info_type,
    'Footer Query' as query_type,
    COUNT(*) as result_count
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND page_type = 'footer' 
    AND status = 'published';

-- 7. Test alternative queries by name
SELECT 
    'FALLBACK_QUERY_TEST' as info_type,
    'Site Header by Name' as query_type,
    COUNT(*) as result_count
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND name = 'Site Header'
    AND status = 'published'

UNION ALL

SELECT 
    'FALLBACK_QUERY_TEST' as info_type,
    'Site Footer by Name' as query_type,
    COUNT(*) as result_count
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND name = 'Site Footer'
    AND status = 'published';

-- 8. Check RLS policies specifically for page_documents
SELECT 
    'RLS_POLICIES' as info_type,
    policyname as policy_name,
    cmd as command,
    roles,
    qual as condition
FROM pg_policies 
WHERE tablename = 'page_documents'
ORDER BY policyname;

-- 9. Test anonymous access (what our public client sees)
SET LOCAL ROLE anon;

SELECT 
    'ANONYMOUS_ACCESS_TEST' as info_type,
    'Can Read Published Pages' as test_description,
    COUNT(*) as accessible_pages
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND status = 'published';

-- Test specific header/footer access as anonymous user
SELECT 
    'ANONYMOUS_HEADER_TEST' as info_type,
    id,
    name,
    page_type,
    status
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND page_type = 'header'
    AND status = 'published'
LIMIT 1;

SELECT 
    'ANONYMOUS_FOOTER_TEST' as info_type,
    id,
    name,
    page_type,
    status
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND page_type = 'footer'
    AND status = 'published'
LIMIT 1;

-- Reset role
RESET ROLE;

-- 10. Check for any data type mismatches
SELECT 
    'DATA_VALIDATION' as info_type,
    name,
    page_type,
    pg_typeof(page_type) as page_type_data_type,
    status,
    pg_typeof(status) as status_data_type,
    store_id,
    pg_typeof(store_id) as store_id_data_type
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
    AND (name ILIKE '%header%' OR name ILIKE '%footer%')
LIMIT 2;