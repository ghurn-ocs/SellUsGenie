-- Query to see all columns and data for the Testingmy store
-- This will show us exactly what fields exist and their current values

SELECT * 
FROM stores 
WHERE id = '638ef028-7752-4996-9aae-878d896734fc';

-- Also show the table structure to see all available columns
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