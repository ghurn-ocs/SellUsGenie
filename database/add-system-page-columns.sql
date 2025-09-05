-- Add System Page Columns to page_documents table
-- This script adds the missing columns needed for Visual Page Builder system pages

-- Add page_type column (required for system page functionality)
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

-- Add isSystemPage column
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

-- Add systemPageType column with proper constraints
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

-- Add editingRestrictions column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_documents' 
        AND column_name = 'editingRestrictions'
    ) THEN
        ALTER TABLE page_documents ADD COLUMN editingRestrictions JSONB DEFAULT '{}';
        RAISE NOTICE 'Added editingRestrictions column to page_documents table';
    ELSE
        RAISE NOTICE 'editingRestrictions column already exists in page_documents table';
    END IF;
END $$;

-- Add navigation_placement column 
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_documents' 
        AND column_name = 'navigation_placement'
    ) THEN
        ALTER TABLE page_documents ADD COLUMN navigation_placement TEXT DEFAULT 'both'
        CHECK (navigation_placement IN ('header', 'footer', 'both', 'none'));
        RAISE NOTICE 'Added navigation_placement column to page_documents table';
    ELSE
        RAISE NOTICE 'navigation_placement column already exists in page_documents table';
    END IF;
END $$;

-- Add color_palette column (Visual Page Builder feature)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_documents' 
        AND column_name = 'color_palette'
    ) THEN
        ALTER TABLE page_documents ADD COLUMN color_palette JSONB DEFAULT NULL;
        RAISE NOTICE 'Added color_palette column to page_documents table';
    ELSE
        RAISE NOTICE 'color_palette column already exists in page_documents table';
    END IF;
END $$;

-- Update existing system pages metadata
UPDATE page_documents 
SET 
    "isSystemPage" = TRUE,
    "systemPageType" = CASE 
        WHEN name = 'About Us' THEN 'about'
        WHEN name = 'Privacy Policy' THEN 'privacy'
        WHEN name = 'Terms & Conditions' OR name = 'Terms of Service' THEN 'terms'
        WHEN name = 'Contact Us' OR name = 'Contact' THEN 'contact'
        WHEN name = 'Returns' OR name = 'Return Policy' OR name = 'Returns Policy' THEN 'returns'
        WHEN name = 'Site Header' OR name = 'Header' THEN 'header'
        WHEN name = 'Site Footer' OR name = 'Footer' THEN 'footer'
        ELSE NULL
    END,
    page_type = CASE 
        WHEN name = 'Site Header' OR name = 'Header' THEN 'header'
        WHEN name = 'Site Footer' OR name = 'Footer' THEN 'footer'
        ELSE 'page'
    END
WHERE name IN ('About Us', 'Privacy Policy', 'Terms & Conditions', 'Terms of Service', 'Contact Us', 'Contact', 'Returns', 'Return Policy', 'Returns Policy', 'Site Header', 'Header', 'Site Footer', 'Footer');

-- Create index for system page queries
CREATE INDEX IF NOT EXISTS idx_page_documents_system ON page_documents("isSystemPage");
CREATE INDEX IF NOT EXISTS idx_page_documents_system_type ON page_documents("systemPageType");
CREATE INDEX IF NOT EXISTS idx_page_documents_page_type ON page_documents(page_type);

-- Add unique constraint for header and footer pages (one per store)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'unique_header_footer_per_store_idx') THEN
        -- Create partial unique index to ensure only one header and one footer per store
        CREATE UNIQUE INDEX unique_header_footer_per_store_idx 
        ON page_documents (store_id, "systemPageType") 
        WHERE "systemPageType" IN ('header', 'footer');
        
        RAISE NOTICE 'Added unique index for header/footer pages per store';
    ELSE
        RAISE NOTICE 'Unique index for header/footer pages already exists';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ System page columns added successfully!';
    RAISE NOTICE '- page_type column: Added/Verified (includes header, footer, template)';
    RAISE NOTICE '- isSystemPage column: Added/Verified';
    RAISE NOTICE '- systemPageType column: Added/Verified (includes header, footer)';  
    RAISE NOTICE '- editingRestrictions column: Added/Verified';
    RAISE NOTICE '- navigation_placement column: Added/Verified';
    RAISE NOTICE '- color_palette column: Added/Verified';
    RAISE NOTICE '- System pages metadata: Updated';
    RAISE NOTICE '- Indexes and constraints: Added';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Visual Page Builder system pages should now work correctly!';
    RAISE NOTICE 'You can now create header and footer pages in the Visual Page Builder.';
END $$;