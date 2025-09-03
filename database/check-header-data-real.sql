-- Check Header Data for Client UID - Based on Real Schema
-- Run the schema extraction first to get actual column names

-- 1. Get your user ID first
SELECT 
    'Your User ID' as info_type,
    id as user_id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Get stores table structure (to see what columns exist)
SELECT 
    'STORES_COLUMNS' as info_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'stores'
ORDER BY ordinal_position;

-- 3. Get page_documents table structure (to see what columns exist)  
SELECT 
    'PAGE_DOCUMENTS_COLUMNS' as info_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'page_documents'
ORDER BY ordinal_position;

-- 4. Get actual stores data (replace USER_ID_HERE with your actual ID from query 1)
SELECT 
    'STORE_DATA' as info_type,
    *
FROM stores
WHERE store_owner_id = 'USER_ID_HERE'
LIMIT 10;

-- 5. Get actual page_documents data that might be headers
SELECT 
    'PAGE_DOCUMENTS_DATA' as info_type,
    *
FROM page_documents
WHERE store_id IN (
    SELECT id FROM stores WHERE store_owner_id = 'USER_ID_HERE'
)
LIMIT 10;

-- 6. Search for header-related pages (different approaches)
SELECT 
    'HEADER_SEARCH' as info_type,
    *
FROM page_documents
WHERE store_id IN (
    SELECT id FROM stores WHERE store_owner_id = 'USER_ID_HERE'
)
AND (
    name ILIKE '%header%' 
    OR page_type = 'header'
    OR name = 'Site Header'
);

-- Instructions:
-- 1. Run query 1 to get your user ID
-- 2. Copy your user ID from the results  
-- 3. Replace 'USER_ID_HERE' in queries 4, 5, and 6 with your actual user ID
-- 4. Run queries 2 and 3 to see what columns actually exist
-- 5. Run queries 4, 5, and 6 to see your actual data