-- Update the store slug for LuxePetFood store
-- Run this in your Supabase SQL Editor

-- First, let's see the current state of stores with the name "LuxePetFood"
SELECT id, store_name, store_slug, created_at 
FROM stores 
WHERE store_name = 'LuxePetFood';

-- Update the slug to match the store name
UPDATE stores 
SET 
  store_slug = 'luxepetfood',
  updated_at = NOW()
WHERE 
  store_name = 'LuxePetFood' 
  AND (store_slug IS NULL OR store_slug = 'testingmy' OR store_slug != 'luxepetfood');

-- Verify the update
SELECT id, store_name, store_slug, updated_at
FROM stores 
WHERE store_name = 'LuxePetFood';

-- If there are any conflicts with the slug, this will show them
SELECT id, store_name, store_slug
FROM stores 
WHERE store_slug = 'luxepetfood';