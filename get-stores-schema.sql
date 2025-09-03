-- Get complete stores table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'stores'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Get sample data to verify field names
SELECT 
    id,
    store_name,
    store_slug,
    logo_url,
    store_logo_url,
    is_active
FROM stores 
WHERE store_name = 'Testingmy'
LIMIT 1;