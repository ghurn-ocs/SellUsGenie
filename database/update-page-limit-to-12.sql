-- Update Page Limit from 10 to 12 Pages
-- This script finds and updates the page limit enforcement

-- First, let's find any functions that might be enforcing the 10-page limit
DO $$
DECLARE
    func_record RECORD;
    func_source TEXT;
BEGIN
    RAISE NOTICE '🔍 Searching for page limit enforcement...';
    RAISE NOTICE '';
    
    -- Check for functions that might enforce page limits
    FOR func_record IN 
        SELECT proname, prosrc, proargnames 
        FROM pg_proc 
        WHERE prosrc ILIKE '%10%page%' 
        OR prosrc ILIKE '%page%limit%'
        OR proname ILIKE '%page%limit%'
        OR proname ILIKE '%enforce%page%'
    LOOP
        RAISE NOTICE '📋 Found function: %', func_record.proname;
        RAISE NOTICE 'Function source contains page limit logic';
        RAISE NOTICE 'Arguments: %', func_record.proargnames;
        RAISE NOTICE '';
    END LOOP;
    
    -- Check for triggers that might enforce limits
    FOR func_record IN
        SELECT 
            t.trigger_name, 
            t.table_name,
            p.prosrc
        FROM information_schema.triggers t
        JOIN pg_proc p ON p.proname = replace(t.trigger_name, '_trigger', '')
        WHERE t.table_name = 'page_documents'
        AND (p.prosrc ILIKE '%10%' OR p.prosrc ILIKE '%limit%')
    LOOP
        RAISE NOTICE '🎯 Found trigger: % on table %', func_record.trigger_name, func_record.table_name;
        RAISE NOTICE 'Trigger function contains limit logic';
        RAISE NOTICE '';
    END LOOP;
    
    -- Check for RLS policies that might have limits
    FOR func_record IN
        SELECT 
            schemaname,
            tablename, 
            policyname,
            qual,
            with_check
        FROM pg_policies 
        WHERE tablename = 'page_documents'
        AND (qual ILIKE '%10%' OR with_check ILIKE '%10%' OR qual ILIKE '%limit%' OR with_check ILIKE '%limit%')
    LOOP
        RAISE NOTICE '🔒 Found RLS policy: % on %', func_record.policyname, func_record.tablename;
        RAISE NOTICE 'Policy qual: %', func_record.qual;
        RAISE NOTICE 'Policy with_check: %', func_record.with_check;
        RAISE NOTICE '';
    END LOOP;
END $$;

-- Try to find and update the specific page limit function
-- This is a common pattern for page limit enforcement
DO $$
DECLARE
    func_exists BOOLEAN;
BEGIN
    -- Check for common page limit function names
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname IN ('check_page_limit', 'enforce_page_limit', 'validate_page_count')
        AND prosrc ILIKE '%10%'
    ) INTO func_exists;
    
    IF func_exists THEN
        RAISE NOTICE '✅ Found page limit function(s)';
        RAISE NOTICE '⚠️ MANUAL ACTION REQUIRED:';
        RAISE NOTICE '1. Find the function that contains "10 pages" or similar';
        RAISE NOTICE '2. Update it to allow 12 pages instead of 10';
        RAISE NOTICE '3. The function might be named check_page_limit, enforce_page_limit, or similar';
        RAISE NOTICE '';
        
        -- Try to show the function source for manual updating
        FOR func_record IN
            SELECT proname, prosrc 
            FROM pg_proc 
            WHERE proname IN ('check_page_limit', 'enforce_page_limit', 'validate_page_count')
            AND prosrc ILIKE '%10%'
        LOOP
            RAISE NOTICE '📝 Function: %', func_record.proname;
            RAISE NOTICE 'Current source (update this manually):';
            RAISE NOTICE '%', func_record.prosrc;
            RAISE NOTICE '';
        END LOOP;
    ELSE
        RAISE NOTICE '❓ Page limit might be enforced in application code or different function name';
    END IF;
END $$;

-- Create a temporary function to check current page counts by store
CREATE OR REPLACE FUNCTION get_page_counts_by_store()
RETURNS TABLE(store_id UUID, page_count BIGINT) 
LANGUAGE SQL
AS $$
    SELECT store_id, COUNT(*) as page_count
    FROM page_documents 
    GROUP BY store_id 
    ORDER BY page_count DESC;
$$;

-- Show current page counts
DO $$
DECLARE
    store_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 CURRENT PAGE COUNTS BY STORE:';
    RAISE NOTICE '';
    
    FOR store_record IN
        SELECT * FROM get_page_counts_by_store()
    LOOP
        RAISE NOTICE 'Store ID: % | Pages: %', store_record.store_id, store_record.page_count;
        
        IF store_record.page_count >= 10 THEN
            RAISE NOTICE '  ⚠️ This store has reached/exceeded the 10-page limit';
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- Clean up temporary function
DROP FUNCTION get_page_counts_by_store();

-- Final instructions
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🚀 NEXT STEPS TO INCREASE PAGE LIMIT TO 12:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Look for any function above that contains "10 pages" text';
    RAISE NOTICE '2. Edit that function to change "10" to "12"';
    RAISE NOTICE '3. If no function found, the limit might be in application code';
    RAISE NOTICE '4. Check your application''s page creation logic for hardcoded limits';
    RAISE NOTICE '';
    RAISE NOTICE 'Example function update:';
    RAISE NOTICE 'OLD: IF page_count >= 10 THEN';
    RAISE NOTICE '     RAISE EXCEPTION ''Store cannot have more than 10 pages''';
    RAISE NOTICE 'NEW: IF page_count >= 12 THEN'; 
    RAISE NOTICE '     RAISE EXCEPTION ''Store cannot have more than 12 pages''';
    RAISE NOTICE '';
END $$;