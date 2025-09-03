-- ===================================================================
-- FIX SYSTEM PAGE TYPES - Update header/footer pages to correct page_type
-- Run this in Supabase SQL Editor to fix the page_type values
-- ===================================================================

-- Update Site Header pages to have correct page_type
UPDATE page_documents 
SET page_type = 'header'
WHERE name = 'Site Header' 
  AND (page_type IS NULL OR page_type = 'page');

-- Update Site Footer pages to have correct page_type  
UPDATE page_documents
SET page_type = 'footer'
WHERE name = 'Site Footer'
  AND (page_type IS NULL OR page_type = 'page');

-- Verify the updates
SELECT 
    'SYSTEM PAGES AFTER UPDATE' as info_type,
    id,
    name,
    page_type,
    status,
    store_id,
    created_at::date as created_date
FROM page_documents 
WHERE name IN ('Site Header', 'Site Footer')
ORDER BY name, store_id;

-- Test the queries that the public client will use
SELECT 
    'HEADER QUERY TEST' as info_type,
    COUNT(*) as found_count
FROM page_documents 
WHERE page_type = 'header'
  AND status = 'published';

SELECT 
    'FOOTER QUERY TEST' as info_type,
    COUNT(*) as found_count
FROM page_documents 
WHERE page_type = 'footer'
  AND status = 'published';