-- SIMPLE FIX: Add only the missing columns to products table
-- This script ONLY adds columns, nothing else

-- Add image_alt column
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt TEXT;

-- Add gallery_images column 
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';

-- Add is_featured column
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Show confirmation
SELECT 'SUCCESS: Missing columns have been added to products table' as result;