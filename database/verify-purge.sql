-- Sell Us Genie Database Purge Verification Script
-- Run this script after the purge to verify all legacy data has been removed

-- Check remaining tables
SELECT 'Remaining Tables:' as check_type;
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check remaining functions
SELECT 'Remaining Functions:' as check_type;
SELECT proname 
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Check remaining types
SELECT 'Remaining Types:' as check_type;
SELECT typname 
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') 
AND typtype = 'e'
ORDER BY typname;

-- Check remaining sequences
SELECT 'Remaining Sequences:' as check_type;
SELECT sequence_name 
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- Check remaining indexes
SELECT 'Remaining Indexes:' as check_type;
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check remaining policies
SELECT 'Remaining Policies:' as check_type;
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Summary
SELECT 
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as remaining_tables,
    (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) as remaining_functions,
    (SELECT COUNT(*) FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') as remaining_types,
    (SELECT COUNT(*) FROM information_schema.sequences WHERE sequence_schema = 'public') as remaining_sequences,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as remaining_indexes,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as remaining_policies;
