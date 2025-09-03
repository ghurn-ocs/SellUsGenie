-- Add store_logo_url column to stores table for centralized logo management
-- This enables header/footer pages to reuse the same store logo

DO $$
BEGIN
    -- Check if column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' 
        AND column_name = 'store_logo_url'
    ) THEN
        ALTER TABLE stores ADD COLUMN store_logo_url TEXT;
        RAISE NOTICE '✅ Added store_logo_url column to stores table';
    ELSE
        RAISE NOTICE '⚠️  store_logo_url column already exists in stores table';
    END IF;
END $$;

-- Verify the column was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' 
        AND column_name = 'store_logo_url'
    ) THEN
        RAISE NOTICE '✅ SUCCESS: store_logo_url column is available in stores table';
    ELSE
        RAISE NOTICE '❌ ERROR: store_logo_url column was not added';
    END IF;
END $$;