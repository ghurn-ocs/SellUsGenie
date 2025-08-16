-- Sell Us Genie Force Database Purge Script
-- WARNING: This script will FORCE DELETE ALL DATA and DROP ALL TABLES
-- This is a more aggressive cleanup for stubborn tables

-- Disable all triggers and foreign key constraints
SET session_replication_role = replica;

-- Force drop all tables in public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
            RAISE NOTICE 'Dropped table: %', r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop table %: %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Force drop all sequences
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        BEGIN
            EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
            RAISE NOTICE 'Dropped sequence: %', r.sequence_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop sequence %: %', r.sequence_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Force drop all functions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT proname, oid::regprocedure as fullname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
        BEGIN
            EXECUTE 'DROP FUNCTION IF EXISTS ' || r.fullname || ' CASCADE';
            RAISE NOTICE 'Dropped function: %', r.fullname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop function %: %', r.fullname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Force drop all types
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
        BEGIN
            EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
            RAISE NOTICE 'Dropped type: %', r.typname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop type %: %', r.typname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Force drop all indexes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT indexname FROM pg_indexes WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.indexname) || ' CASCADE';
            RAISE NOTICE 'Dropped index: %', r.indexname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop index %: %', r.indexname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Force drop all policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
            RAISE NOTICE 'Dropped policy: % on %', r.policyname, r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop policy % on %: %', r.policyname, r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Force drop all triggers
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') LOOP
        BEGIN
            EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON ' || quote_ident(r.event_object_table);
            RAISE NOTICE 'Dropped trigger: % on %', r.trigger_name, r.event_object_table;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop trigger % on %: %', r.trigger_name, r.event_object_table, SQLERRM;
        END;
    END LOOP;
END $$;

-- Force drop all views
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
            RAISE NOTICE 'Dropped view: %', r.viewname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop view %: %', r.viewname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Force drop all materialized views
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT matviewname FROM pg_matviews WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS ' || quote_ident(r.matviewname) || ' CASCADE';
            RAISE NOTICE 'Dropped materialized view: %', r.matviewname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to drop materialized view %: %', r.matviewname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Reset session replication role
SET session_replication_role = DEFAULT;

-- Analyze (VACUUM FULL removed as it cannot run in transaction block)
ANALYZE;

-- Show final status
SELECT 'Force purge completed. Check results below:' as status;

-- List any remaining objects
SELECT 'Remaining Tables:' as check_type;
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT 'Remaining Functions:' as check_type;
SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') ORDER BY proname;

SELECT 'Remaining Types:' as check_type;
SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e' ORDER BY typname;

SELECT 'Remaining Sequences:' as check_type;
SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' ORDER BY sequence_name;

SELECT 'Remaining Indexes:' as check_type;
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;

SELECT 'Remaining Policies:' as check_type;
SELECT policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY policyname;

-- Final count
SELECT
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as remaining_tables,
    (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) as remaining_functions,
    (SELECT COUNT(*) FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') as remaining_types,
    (SELECT COUNT(*) FROM information_schema.sequences WHERE sequence_schema = 'public') as remaining_sequences,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as remaining_indexes,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as remaining_policies;
