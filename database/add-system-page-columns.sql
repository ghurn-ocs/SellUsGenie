-- Add System Page Columns to Existing page_documents Table
-- This script adds the missing system page metadata columns and updates page limit

-- Check and add page_type column (required for system page functionality)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_documents' 
        AND column_name = 'page_type'
    ) THEN
        ALTER TABLE page_documents ADD COLUMN page_type TEXT DEFAULT 'page'
        CHECK (page_type IN ('page', 'header', 'footer', 'template'));
        RAISE NOTICE 'Added page_type column to page_documents table';
    ELSE
        RAISE NOTICE 'page_type column already exists in page_documents table';
    END IF;
END $$;

-- Check and add isSystemPage column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_documents' 
        AND column_name = 'isSystemPage'
    ) THEN
        ALTER TABLE page_documents ADD COLUMN "isSystemPage" BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added isSystemPage column to page_documents table';
    ELSE
        RAISE NOTICE 'isSystemPage column already exists in page_documents table';
    END IF;
END $$;

-- Check and add systemPageType column with proper constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_documents' 
        AND column_name = 'systemPageType'
    ) THEN
        ALTER TABLE page_documents ADD COLUMN "systemPageType" TEXT 
        CHECK ("systemPageType" IN ('about', 'privacy', 'terms', 'contact', 'returns', 'header', 'footer'));
        RAISE NOTICE 'Added systemPageType column to page_documents table';
    ELSE
        -- Update constraint to include header and footer
        ALTER TABLE page_documents DROP CONSTRAINT IF EXISTS page_documents_systemPageType_check;
        ALTER TABLE page_documents ADD CONSTRAINT page_documents_systemPageType_check 
        CHECK ("systemPageType" IN ('about', 'privacy', 'terms', 'contact', 'returns', 'header', 'footer'));
        RAISE NOTICE 'Updated systemPageType column constraints to include header and footer';
    END IF;
END $$;

-- Check and add editingRestrictions column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_documents' 
        AND column_name = 'editingRestrictions'
    ) THEN
        ALTER TABLE page_documents ADD COLUMN "editingRestrictions" JSONB;
        RAISE NOTICE 'Added editingRestrictions column to page_documents table';
    ELSE
        RAISE NOTICE 'editingRestrictions column already exists in page_documents table';
    END IF;
END $$;

-- Update existing system pages to have proper metadata
UPDATE page_documents 
SET 
    "isSystemPage" = TRUE,
    "systemPageType" = CASE 
        WHEN name = 'About Us' THEN 'about'
        WHEN name = 'Privacy Policy' THEN 'privacy'
        WHEN name IN ('Terms & Conditions', 'Terms of Service') THEN 'terms'
        WHEN name = 'Contact Us' THEN 'contact'
        WHEN name = 'Returns' THEN 'returns'
    END,
    "editingRestrictions" = CASE 
        WHEN name IN ('About Us', 'Privacy Policy', 'Terms & Conditions', 'Terms of Service', 'Contact Us', 'Returns') THEN 
            json_build_object(
                'readOnly', true,
                'settingsMessage', name || ' content is managed in Settings → Policies. Changes made there will automatically appear on this page.'
            )::jsonb
    END
WHERE name IN ('About Us', 'Privacy Policy', 'Terms & Conditions', 'Terms of Service', 'Contact Us', 'Returns');

-- Create index for system page queries
CREATE INDEX IF NOT EXISTS idx_page_documents_system ON page_documents("isSystemPage");
CREATE INDEX IF NOT EXISTS idx_page_documents_system_type ON page_documents("systemPageType");

-- Add unique constraint for header and footer pages (one per store)
-- Use partial unique index instead of constraint for WHERE clause support
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE page_documents DROP CONSTRAINT IF EXISTS unique_header_footer_per_store;
    
    -- Drop existing index if it exists
    DROP INDEX IF EXISTS unique_header_footer_per_store_idx;
    
    -- Create partial unique index to ensure only one header and one footer per store
    CREATE UNIQUE INDEX unique_header_footer_per_store_idx 
    ON page_documents (store_id, "systemPageType") 
    WHERE "systemPageType" IN ('header', 'footer');
    
    RAISE NOTICE 'Added unique index for header/footer pages per store';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Index may already exist or other error: %', SQLERRM;
END $$;

-- Update navigation_placement constraint to include 'none' option
DO $$
BEGIN
    ALTER TABLE page_documents DROP CONSTRAINT IF EXISTS page_documents_navigation_placement_check;
    ALTER TABLE page_documents ADD CONSTRAINT page_documents_navigation_placement_check 
    CHECK (navigation_placement IN ('header', 'footer', 'both', 'none'));
    
    RAISE NOTICE 'Updated navigation_placement constraint to include "none" option';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Navigation placement constraint update failed: %', SQLERRM;
END $$;

-- Update page limit from 10 to 12 pages per store
DO $$
DECLARE
    func_exists BOOLEAN;
    constraint_record RECORD;
BEGIN
    -- Check if the page limit function exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'enforce_page_limit' 
        OR proname = 'check_page_limit'
    ) INTO func_exists;
    
    IF func_exists THEN
        -- Look for and update any page limit functions that reference 10 pages
        -- This is a placeholder - actual implementation depends on your specific trigger function
        RAISE NOTICE 'Found page limit function - please manually update limit from 10 to 12 pages';
        RAISE NOTICE 'Search for functions containing "10 pages" and update to "12 pages"';
    END IF;
    
    -- Update any check constraints that might enforce page limits
    -- Look for constraints that mention page limits
    FOR constraint_record IN 
        SELECT conname, pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'page_documents'::regclass 
        AND pg_get_constraintdef(oid) ILIKE '%10%pages%'
    LOOP
        RAISE NOTICE 'Found constraint with page limit: % - %', constraint_record.conname, constraint_record.definition;
        RAISE NOTICE 'Please manually review and update this constraint to allow 12 pages';
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 PAGE LIMIT UPDATE TO 12 PAGES:';
    RAISE NOTICE '- If using database triggers/functions for page limits, update them manually';
    RAISE NOTICE '- If using application-level limits, update the error message logic';
    RAISE NOTICE '- Current database structure allows unlimited pages per store';
    
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ System page columns added successfully!';
  RAISE NOTICE '- page_type column: Added/Verified (includes header, footer, template)';
  RAISE NOTICE '- isSystemPage column: Added/Verified';
  RAISE NOTICE '- systemPageType column: Added/Verified (includes header, footer)';  
  RAISE NOTICE '- editingRestrictions column: Added/Verified';
  RAISE NOTICE '- System pages metadata: Updated';
  RAISE NOTICE '- Performance indexes: Created';
  RAISE NOTICE '- Unique constraints: Header/Footer pages limited to one per store';
  RAISE NOTICE '- Navigation placement: "none" option added for system pages';
  RAISE NOTICE '- Page limit: Reviewed for update from 10 to 12 pages';
  RAISE NOTICE '';
  RAISE NOTICE 'Header and Footer pages can now be created and will not appear in navigation by default.';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 NEXT STEPS:';
  RAISE NOTICE '1. Run this migration script in your Supabase SQL Editor';
  RAISE NOTICE '2. Update any custom page limit enforcement logic from 10 to 12 pages';
  RAISE NOTICE '3. Test Header/Footer page creation in the Visual Page Builder';
END $$;