-- Fix for subscription_tier error when updating stores table
-- This checks for problematic triggers and provides fixes

-- 1. First, let's see what triggers exist on stores table
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE 'Checking triggers on stores table...';
    
    FOR trigger_record IN 
        SELECT trigger_name, event_manipulation, action_timing
        FROM information_schema.triggers
        WHERE event_object_table = 'stores'
    LOOP
        RAISE NOTICE 'Found trigger: % (% %) on stores table', 
            trigger_record.trigger_name, 
            trigger_record.action_timing, 
            trigger_record.event_manipulation;
    END LOOP;
END $$;

-- 2. Check if store_logo_url column exists and is properly typed
DO $$
DECLARE
    column_exists BOOLEAN;
    column_type TEXT;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name = 'store_logo_url'
    ) INTO column_exists;
    
    IF column_exists THEN
        SELECT data_type INTO column_type 
        FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name = 'store_logo_url';
        
        RAISE NOTICE '✅ store_logo_url column exists with type: %', column_type;
    ELSE
        RAISE NOTICE '❌ store_logo_url column does not exist';
        ALTER TABLE stores ADD COLUMN store_logo_url TEXT;
        RAISE NOTICE '✅ Added store_logo_url column';
    END IF;
END $$;

-- 3. Test a simple update to see if it works
DO $$
DECLARE
    test_store_id UUID;
BEGIN
    -- Get any existing store ID for testing
    SELECT id INTO test_store_id FROM stores LIMIT 1;
    
    IF test_store_id IS NOT NULL THEN
        RAISE NOTICE 'Testing update on store: %', test_store_id;
        
        -- Try to update with a test value
        UPDATE stores 
        SET store_logo_url = 'test-logo-url.jpg' 
        WHERE id = test_store_id;
        
        RAISE NOTICE '✅ Update test successful';
        
        -- Reset to NULL
        UPDATE stores 
        SET store_logo_url = NULL 
        WHERE id = test_store_id;
        
    ELSE
        RAISE NOTICE 'No stores found to test with';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Update test failed: %', SQLERRM;
END $$;

-- 4. Check for any functions that might reference subscription_tier incorrectly
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT routine_name, routine_definition
        FROM information_schema.routines
        WHERE routine_definition ILIKE '%subscription_tier%'
        AND routine_type = 'FUNCTION'
        AND routine_schema = 'public'
    LOOP
        RAISE NOTICE 'Found function referencing subscription_tier: %', func_record.routine_name;
    END LOOP;
END $$;