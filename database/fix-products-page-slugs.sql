-- Fix Products & Services pages that have incorrect slug "/"
-- This updates existing pages to use the proper "/products" slug

-- Update Products & Services pages that currently have slug "/" 
-- (excluding actual home pages)
UPDATE page_documents 
SET slug = '/products'
WHERE name = 'Products & Services' 
  AND slug = '/'
  AND name != 'Home Page'
  AND name != 'Home';

-- Also handle variations of the name
UPDATE page_documents 
SET slug = '/products'
WHERE (name ILIKE '%Products%Services%' OR name ILIKE '%Product%Service%')
  AND slug = '/'
  AND name != 'Home Page' 
  AND name != 'Home';

-- Show results
SELECT 
  name,
  slug,
  store_id,
  updated_at
FROM page_documents 
WHERE slug = '/products'
ORDER BY updated_at DESC;

-- Verify no duplicate home pages
SELECT 
  store_id,
  COUNT(*) as home_pages
FROM page_documents 
WHERE slug = '/'
GROUP BY store_id
HAVING COUNT(*) > 1;