-- Migration: Add currency column to stores table
-- File: 009_add_currency_column.sql
-- Description: Add currency field to stores table for international support

-- Add currency column to stores table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' 
        AND column_name = 'currency'
    ) THEN
        ALTER TABLE public.stores ADD COLUMN currency TEXT DEFAULT 'USD';
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.stores.currency IS 'ISO 4217 currency code for the store (e.g., USD, EUR, GBP)';
        
        RAISE NOTICE 'Currency column added to stores table';
    ELSE
        RAISE NOTICE 'Currency column already exists in stores table';
    END IF;
END $$;

-- Update RLS policy for stores table to include currency column
-- (The existing RLS policies should automatically handle the new column)

-- Create index for currency lookups (optional, for performance)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'stores' 
        AND indexname = 'idx_stores_currency'
    ) THEN
        CREATE INDEX idx_stores_currency ON public.stores(currency);
        RAISE NOTICE 'Index created for stores.currency';
    ELSE
        RAISE NOTICE 'Index already exists for stores.currency';
    END IF;
END $$;