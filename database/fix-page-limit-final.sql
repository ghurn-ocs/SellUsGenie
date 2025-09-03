-- Fix the check_page_limit function to allow 12 pages instead of 10
-- Uses the correct trigger name: enforce_page_limit_trigger

-- Drop the trigger first (it depends on the function)
DROP TRIGGER IF EXISTS enforce_page_limit_trigger ON page_documents;

-- Now drop the function
DROP FUNCTION IF EXISTS check_page_limit();

-- Create new function with 12-page limit
CREATE OR REPLACE FUNCTION check_page_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF (SELECT COUNT(*) FROM page_documents WHERE store_id = NEW.store_id) >= 12 THEN
            RAISE EXCEPTION 'Store cannot have more than 12 pages. Please delete existing pages or upgrade your plan.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger with the correct name
CREATE TRIGGER enforce_page_limit_trigger
    BEFORE INSERT OR UPDATE ON page_documents
    FOR EACH ROW
    EXECUTE FUNCTION check_page_limit();

-- Verify the fix
DO $$
DECLARE
    updated_source TEXT;
BEGIN
    SELECT prosrc INTO updated_source 
    FROM pg_proc 
    WHERE proname = 'check_page_limit';
    
    IF updated_source LIKE '%>= 12%' THEN
        RAISE NOTICE '✅ SUCCESS: Function now allows 12 pages instead of 10';
    ELSE
        RAISE NOTICE '❌ ERROR: Function may not have been updated correctly';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Updated function source:';
    RAISE NOTICE '%', updated_source;
    RAISE NOTICE '';
    
    -- Check trigger exists
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'enforce_page_limit_trigger') THEN
        RAISE NOTICE '✅ Trigger recreated successfully: enforce_page_limit_trigger';
    ELSE
        RAISE NOTICE '❌ WARNING: Trigger not found';
    END IF;
END $$;