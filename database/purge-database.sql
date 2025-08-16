-- Sell Us Genie Database Purge Script
-- WARNING: This script will DELETE ALL DATA and DROP ALL TABLES
-- Run this script in your Supabase SQL Editor to clean up legacy data

-- Disable triggers temporarily to avoid conflicts
SET session_replication_role = replica;

-- Drop all existing tables (including legacy ones)
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS store_owner_subscriptions CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS store_owners CASCADE;

-- Drop any other potential legacy tables
DROP TABLE IF EXISTS auth.users CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;
DROP TABLE IF EXISTS schema_migrations CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS check_trial_expiration() CASCADE;
DROP FUNCTION IF EXISTS update_product_inventory() CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS stores_id_seq CASCADE;
DROP SEQUENCE IF EXISTS products_id_seq CASCADE;
DROP SEQUENCE IF EXISTS orders_id_seq CASCADE;
DROP SEQUENCE IF EXISTS customers_id_seq CASCADE;

-- Clean up any remaining objects
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all remaining tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all remaining functions
    FOR r IN (SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || ' CASCADE';
    END LOOP;
    
    -- Drop all remaining types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

-- Reset sequences
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
END $$;

-- Clean up any remaining policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own data" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can update own data" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can insert own data" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own stores" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can update own stores" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can insert own stores" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can view active stores" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own subscriptions" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can update own subscriptions" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can insert own subscriptions" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own store categories" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can manage own store categories" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can view active categories" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own store products" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can manage own store products" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can view active products" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own store customers" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can manage own store customers" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can view own data" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can update own data" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own store customer addresses" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can manage own store customer addresses" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can view own addresses" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can manage own addresses" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own store orders" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can manage own store orders" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can view own orders" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can update own orders" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own store order items" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can manage own store order items" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can view own order items" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own store cart items" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can manage own store cart items" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can view own cart items" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can manage own cart items" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can manage session cart items" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own store payments" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can manage own store payments" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Customers can view own payments" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can view own store settings" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Store owners can manage own store settings" ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Clean up any remaining indexes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.schemaname) || '.' || quote_ident(r.indexname) || ' CASCADE';
    END LOOP;
END $$;

-- Reset the database to a clean state
VACUUM FULL;
ANALYZE;

-- Verify cleanup
SELECT 'Database purge completed successfully. All legacy tables and data have been removed.' as status;
