-- Query to check the actual structure of the stores table
-- This will show us what fields exist and can be used for the tagline

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_name = 'stores' 
    AND table_schema = 'public'
ORDER BY 
    ordinal_position;

-- Check if there are any stores and what tagline-related fields they have
SELECT 
    id,
    store_name,
    store_tagline,
    description,
    created_at
FROM 
    stores 
LIMIT 5;

-- Check for any columns that might contain tagline data
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
    );