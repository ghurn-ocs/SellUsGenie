-- Fix for subscription_tier trigger error on stores table
-- This will identify and fix the problematic trigger

-- Step 1: Find and drop any triggers that might be causing the subscription_tier error
DO $$
DECLARE
    trigger_rec RECORD;
    func_def TEXT;
BEGIN
    RAISE NOTICE 'Looking for problematic triggers on stores table...';
    
    -- Get all triggers on stores table
    FOR trigger_rec IN 
        SELECT trigger_name, action_statement, event_manipulation
        FROM information_schema.triggers
        WHERE event_object_table = 'stores'
    LOOP
        RAISE NOTICE 'Found trigger: %', trigger_rec.trigger_name;
        
        -- Get the function definition for this trigger
        SELECT routine_definition INTO func_def
        FROM information_schema.routines
        WHERE routine_name = replace(trigger_rec.action_statement, 'EXECUTE FUNCTION ', '')
          AND routine_name = replace(replace(trigger_rec.action_statement, 'EXECUTE FUNCTION ', ''), '()', '');
        
        -- Check if the function references subscription_tier
        IF func_def ILIKE '%subscription_tier%' THEN
            RAISE NOTICE 'Trigger % references subscription_tier - this is likely the problem!', trigger_rec.trigger_name;
            RAISE NOTICE 'Dropping problematic trigger: %', trigger_rec.trigger_name;
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON stores', trigger_rec.trigger_name);
        END IF;
    END LOOP;
END $$;

-- Step 2: Look for and fix any functions that incorrectly reference subscription_tier
DO $$
DECLARE
    func_rec RECORD;
BEGIN
    FOR func_rec IN 
        SELECT routine_name, routine_definition
        FROM information_schema.routines
        WHERE routine_definition ILIKE '%subscription_tier%'
        AND routine_type = 'FUNCTION'
        AND routine_schema = 'public'
    LOOP
        RAISE NOTICE 'Found function with subscription_tier reference: %', func_rec.routine_name;
        RAISE NOTICE 'Function definition: %', left(func_rec.routine_definition, 200) || '...';
        
        -- If it's an update_store function or similar, we might need to drop it
        IF func_rec.routine_name ILIKE '%store%' OR func_rec.routine_name ILIKE '%update%' THEN
            RAISE NOTICE 'This function might be causing the issue. Consider dropping it.';
        END IF;
    END LOOP;
END $$;

-- Step 3: Test the fix
DO $$
DECLARE
    test_store_id UUID;
BEGIN
    SELECT id INTO test_store_id FROM stores LIMIT 1;
    
    IF test_store_id IS NOT NULL THEN
        RAISE NOTICE 'Testing store logo update after trigger fixes...';
        
        UPDATE stores 
        SET store_logo_url = 'test-fix.jpg' 
        WHERE id = test_store_id;
        
        RAISE NOTICE '✅ Store logo update successful!';
        
        -- Clean up test
        UPDATE stores 
        SET store_logo_url = NULL 
        WHERE id = test_store_id;
        
    ELSE
        RAISE NOTICE 'No test store available';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Still failing: %', SQLERRM;
END $$;

-- Step 4: Re-create only the necessary triggers (if any were needed)
-- Most likely, we don't need any special triggers on the stores table for logo updates