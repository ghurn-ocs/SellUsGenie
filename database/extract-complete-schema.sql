-- Complete Database Schema Extraction for DATABASE_SCHEMA.md Documentation
-- This query extracts all tables, columns, indexes, constraints, and RLS policies

-- 1. Get all tables in public schema
SELECT 
    'TABLE_LIST' as query_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Get all columns for all tables with detailed information
SELECT 
    'COLUMN_DETAILS' as query_type,
    table_name,
    column_name,
    ordinal_position,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    CASE 
        WHEN data_type = 'USER-DEFINED' THEN udt_name 
        ELSE data_type 
    END as full_data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Get primary key constraints
SELECT 
    'PRIMARY_KEYS' as query_type,
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. Get foreign key constraints
SELECT 
    'FOREIGN_KEYS' as query_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name as foreign_table_name,
    ccu.column_name as foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 5. Get unique constraints
SELECT 
    'UNIQUE_CONSTRAINTS' as query_type,
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 6. Get check constraints
SELECT 
    'CHECK_CONSTRAINTS' as query_type,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 7. Get indexes
SELECT 
    'INDEXES' as query_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 8. Get Row Level Security policies
SELECT 
    'RLS_POLICIES' as query_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. Get table comments/descriptions
SELECT 
    'TABLE_COMMENTS' as query_type,
    t.table_name,
    obj_description(c.oid) as table_comment
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- 10. Get column comments
SELECT 
    'COLUMN_COMMENTS' as query_type,
    t.table_name,
    c.column_name,
    col_description(pgc.oid, c.ordinal_position) as column_comment
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
JOIN pg_class pgc ON pgc.relname = t.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND col_description(pgc.oid, c.ordinal_position) IS NOT NULL
ORDER BY t.table_name, c.ordinal_position;

-- 11. Get enum types (for check constraints and custom types)
SELECT 
    'ENUM_TYPES' as query_type,
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;

-- 12. Get triggers
SELECT 
    'TRIGGERS' as query_type,
    event_object_table as table_name,
    trigger_name,
    event_manipulation as trigger_event,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 13. Get functions/stored procedures
SELECT 
    'FUNCTIONS' as query_type,
    routine_name as function_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 14. Get table sizes (useful for documentation)
SELECT 
    'TABLE_SIZES' as query_type,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;