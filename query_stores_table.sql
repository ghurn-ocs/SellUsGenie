-- Query to find all columns in the stores table
-- Run this in Supabase SQL Editor to see the actual database structure

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