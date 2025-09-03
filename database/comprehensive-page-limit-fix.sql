-- Comprehensive Page Limit Fix - Find and Update ALL Limit Enforcement
-- This script will find and fix every instance of the 10-page limit

-- Step 1: Find ALL functions with page limits
DO $$
DECLARE
    func_record RECORD;
    func_source TEXT;
BEGIN
    RAISE NOTICE '🔍 SEARCHING FOR ALL PAGE LIMIT ENFORCEMENT...';
    RAISE NOTICE '';
    
    -- Find all functions mentioning pages and 10
    FOR func_record IN
        SELECT proname, prosrc, prorettype, proargtypes
        FROM pg_proc 
        WHERE prosrc ILIKE '%page%' 
        AND (prosrc ILIKE '%10%' OR prosrc ILIKE '%>= 10%' OR prosrc ILIKE '%> 9%')
    LOOP
        RAISE NOTICE '📋 Function: %', func_record.proname;
        RAISE NOTICE 'Source: %', substring(func_record.prosrc from 1 for 300);
        RAISE NOTICE '';
    END LOOP;
END $$;

-- Step 2: Check for triggers that might call page limit functions
SELECT 
    t.trigger_name,
    t.table_name,
    t.action_timing,
    t.event_manipulation,
    t.trigger_schema,
    p.prosrc as function_source
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON p.proname = replace(t.trigger_name, '_trigger', '')
WHERE t.table_name = 'page_documents'
ORDER BY t.trigger_name;

-- Step 3: Update the check_page_limit function (if it exists)
DO $$
DECLARE
    func_exists BOOLEAN;
    current_source TEXT;
BEGIN
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'check_page_limit'
    ) INTO func_exists;
    
    IF func_exists THEN
        -- Get current source
        SELECT prosrc INTO current_source FROM pg_proc WHERE proname = 'check_page_limit';
        
        RAISE NOTICE '✅ Found check_page_limit function';
        RAISE NOTICE 'Current source: %', current_source;
        RAISE NOTICE '';
        
        -- Update the function
        EXECUTE '
        CREATE OR REPLACE FUNCTION check_page_limit()
        RETURNS TRIGGER AS $func$
        BEGIN
            IF (SELECT COUNT(*) FROM page_documents WHERE store_id = NEW.store_id) >= 12 THEN
                RAISE EXCEPTION ''Store cannot have more than 12 pages. Please delete existing pages or upgrade your plan.'';
            END IF;
            
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;';
        
        RAISE NOTICE '✅ Updated check_page_limit function to allow 12 pages';
        
    ELSE
        RAISE NOTICE '❌ check_page_limit function not found';
    END IF;
END $$;

-- Step 4: Look for other common function names
DO $$
DECLARE
    func_names TEXT[] := ARRAY['enforce_page_limit', 'validate_page_count', 'page_limit_check', 'check_store_page_limit'];
    func_name TEXT;
    func_exists BOOLEAN;
BEGIN
    FOREACH func_name IN ARRAY func_names
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM pg_proc WHERE proname = func_name
        ) INTO func_exists;
        
        IF func_exists THEN
            RAISE NOTICE '📋 Found additional function: %', func_name;
            -- You would need to update this manually based on its structure
        END IF;
    END LOOP;
END $$;

-- Step 5: Check for any RLS policies with limits
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'page_documents'
AND (qual ILIKE '%10%' OR with_check ILIKE '%10%');

-- Step 6: Force recreation of the trigger function from scratch
DROP TRIGGER IF EXISTS page_limit_trigger ON page_documents;
DROP FUNCTION IF EXISTS check_page_limit();

-- Create new function with 12-page limit
CREATE OR REPLACE FUNCTION check_page_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF (SELECT COUNT(*) FROM page_documents WHERE store_id = NEW.store_id) >= 12 THEN
            RAISE EXCEPTION 'Store cannot have more than 12 pages. Please delete existing pages or upgrade your plan.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER page_limit_trigger
    BEFORE INSERT ON page_documents
    FOR EACH ROW
    EXECUTE FUNCTION check_page_limit();

-- Step 7: Verify the fix
DO $$
DECLARE
    updated_source TEXT;
BEGIN
    SELECT prosrc INTO updated_source 
    FROM pg_proc 
    WHERE proname = 'check_page_limit';
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 VERIFICATION:';
    
    IF updated_source LIKE '%>= 12%' THEN
        RAISE NOTICE '✅ SUCCESS: Function now allows 12 pages';
    ELSE
        RAISE NOTICE '❌ WARNING: Function may not be updated correctly';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 Current function source:';
    RAISE NOTICE '%', updated_source;
    RAISE NOTICE '';
    
    -- Show trigger info
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'page_limit_trigger') THEN
        RAISE NOTICE '✅ Trigger recreated successfully';
    ELSE
        RAISE NOTICE '❌ WARNING: Trigger not found';
    END IF;
END $$;