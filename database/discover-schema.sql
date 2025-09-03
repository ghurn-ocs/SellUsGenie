-- Discover actual database schema - no assumptions

-- 1. Get actual columns in stores table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'stores' 
ORDER BY ordinal_position;

-- 2. Get actual columns in page_documents table  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'page_documents' 
ORDER BY ordinal_position;

-- 3. Get current users (to find your UID)
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Get current stores (see what data exists)
SELECT *
FROM stores
LIMIT 3;

-- 5. Get page_documents structure (see actual data)
SELECT *
FROM page_documents 
LIMIT 3;