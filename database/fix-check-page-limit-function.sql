-- Fix the check_page_limit function to allow 12 pages instead of 10
-- This updates the exact function that's blocking page saves

-- First, let's see the full current function
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'check_page_limit';

-- Update the function to allow 12 pages instead of 10
CREATE OR REPLACE FUNCTION check_page_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM page_documents WHERE store_id = NEW.store_id) >= 12 THEN
        RAISE EXCEPTION 'Store cannot have more than 12 pages. Please delete existing pages or upgrade your plan.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify the function was updated
DO $$
DECLARE
    updated_source TEXT;
BEGIN
    SELECT prosrc INTO updated_source 
    FROM pg_proc 
    WHERE proname = 'check_page_limit';
    
    IF updated_source LIKE '%>= 12%' THEN
        RAISE NOTICE '✅ SUCCESS: check_page_limit function updated to allow 12 pages';
    ELSE
        RAISE NOTICE '❌ ERROR: Function may not have been updated correctly';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 Updated function source:';
    RAISE NOTICE '%', updated_source;
END $$;