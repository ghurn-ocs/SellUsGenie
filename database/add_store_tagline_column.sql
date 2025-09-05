-- Add store_tagline column to stores table
-- This creates a proper semantic field for store taglines

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS store_tagline TEXT;