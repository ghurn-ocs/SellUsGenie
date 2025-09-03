-- Quick Fix: Update Page Limit from 10 to 12
-- Run this first, then run the diagnostic script if needed

-- Common page limit function patterns - update them all
DO $$
DECLARE
    func_name TEXT;
    func_source TEXT;
    new_source TEXT;
BEGIN
    -- Find functions with page limit logic
    FOR func_name IN
        SELECT proname 
        FROM pg_proc 
        WHERE prosrc ILIKE '%10 pages%' 
        OR prosrc ILIKE '%more than 10%'
        OR prosrc ILIKE '%>= 10%'
        OR prosrc ILIKE '%> 9%'
    LOOP
        -- Get the current function source
        SELECT prosrc INTO func_source 
        FROM pg_proc 
        WHERE proname = func_name;
        
        -- Replace 10 with 12 in various formats
        new_source := func_source;
        new_source := replace(new_source, '10 pages', '12 pages');
        new_source := replace(new_source, 'more than 10', 'more than 12'); 
        new_source := replace(new_source, '>= 10', '>= 12');
        new_source := replace(new_source, '> 9', '> 11');
        
        -- If source changed, report it
        IF new_source != func_source THEN
            RAISE NOTICE 'Found function with page limit: %', func_name;
            RAISE NOTICE 'You need to manually recreate this function with the updated limit.';
            RAISE NOTICE 'OLD source contains: %', substring(func_source from 1 for 100) || '...';
            RAISE NOTICE '';
        END IF;
    END LOOP;
    
    -- If no functions found, try common function names and update them manually
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE prosrc ILIKE '%page%' 
        AND prosrc ILIKE '%10%'
    ) THEN
        RAISE NOTICE 'No obvious page limit functions found.';
        RAISE NOTICE 'The limit might be enforced in:';
        RAISE NOTICE '1. Application code (not in database)';  
        RAISE NOTICE '2. RLS policies';
        RAISE NOTICE '3. Check constraints';
        RAISE NOTICE '4. Different function naming pattern';
    END IF;
END $$;

-- Try to find and display common function patterns
SELECT 
    proname as function_name,
    substring(prosrc from 1 for 200) as source_preview
FROM pg_proc 
WHERE (prosrc ILIKE '%page%' AND prosrc ILIKE '%10%')
OR proname ILIKE '%page%limit%'
OR proname ILIKE '%enforce%page%'
ORDER BY proname;