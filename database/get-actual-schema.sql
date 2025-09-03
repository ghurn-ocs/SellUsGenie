-- Get actual database schema from Supabase
-- Run this first to understand the real table structure

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

-- 4. Get current stores (to see what data exists)
SELECT *
FROM stores
LIMIT 5;

-- 5. Get current header page documents (to see what exists)
SELECT id, name, page_type, system_page_type, status, store_id, 
       theme_overrides, created_at
FROM page_documents 
WHERE page_type = 'header' 
   OR name LIKE '%Header%'
   OR name LIKE '%header%'
LIMIT 10;