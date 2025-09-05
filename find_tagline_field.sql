-- Query to find the correct field for store tagline
-- Run this in your Supabase SQL editor to identify the field

-- 1. First, let's see all columns in the stores table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns 
WHERE 
    table_name = 'stores' 
    AND table_schema = 'public'
ORDER BY 
    ordinal_position;

-- 2. Let's look for any columns that might store tagline data
SELECT 
    column_name 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'stores' 
    AND table_schema = 'public'
    AND (
        lower(column_name) LIKE '%tagline%' 
        OR lower(column_name) LIKE '%description%' 
        OR lower(column_name) LIKE '%slogan%'
        OR lower(column_name) LIKE '%subtitle%'
        OR lower(column_name) LIKE '%tag%'
        OR lower(column_name) LIKE '%brand%'
    );

-- 3. Let's examine a sample store record to see what fields exist
SELECT * FROM stores LIMIT 1;