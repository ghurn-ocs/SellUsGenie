-- Debug script to check stores table structure and triggers

-- 1. Check current columns in stores table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'stores'
ORDER BY ordinal_position;

-- 2. Check for triggers on stores table
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'stores';

-- 3. Check for functions that might reference subscription_tier
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition ILIKE '%subscription_tier%'
AND routine_type = 'FUNCTION';

-- 4. Check RLS policies on stores table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'stores';