-- Query to find the Testingmy store specifically and see all its fields
-- Run this in your Supabase SQL editor

-- Find the Testingmy store and show all its data
SELECT * 
FROM stores 
WHERE store_name = 'Testingmy' 
   OR store_name ILIKE '%testing%'
   OR store_slug = 'testingmy'
   OR store_slug ILIKE '%testing%';

-- Also show all stores to see what's available
SELECT 
    id,
    store_name,
    store_slug,
    created_at
FROM stores
ORDER BY created_at DESC
LIMIT 10;