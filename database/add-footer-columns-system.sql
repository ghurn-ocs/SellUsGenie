-- Add Footer Columns System to page_documents table
-- This script adds the new footer_column field to replace hardcoded footer logic
-- Supports the new 4-column footer system: Company, General, Support, Legal

-- Add footer_column column with numbered system (1, 2, 3, 4)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_documents' 
        AND column_name = 'footer_column'
    ) THEN
        ALTER TABLE page_documents ADD COLUMN footer_column INTEGER 
        CHECK (footer_column IN (1, 2, 3, 4));
        RAISE NOTICE 'Added footer_column column to page_documents table';
    ELSE
        -- Update constraint to include all column numbers
        ALTER TABLE page_documents DROP CONSTRAINT IF EXISTS page_documents_footer_column_check;
        ALTER TABLE page_documents ADD CONSTRAINT page_documents_footer_column_check 
        CHECK (footer_column IN (1, 2, 3, 4));
        RAISE NOTICE 'Updated footer_column column constraints';
    END IF;
END $$;

-- Migrate existing pages to new footer column system based on current hardcoded logic
-- Column 1: Company info (handled by component - logo/name/tagline)
-- Column 2: General (About, Team, Mission, etc.)
-- Column 3: Support (Contact, Help, FAQ, etc.)  
-- Column 4: Legal (Privacy, Terms, Returns, etc.)

UPDATE page_documents 
SET footer_column = CASE 
    -- Legal pages -> Column 4 (Legal)
    WHEN "systemPageType" IN ('privacy', 'terms', 'returns') THEN 4
    WHEN LOWER(name) LIKE '%privacy%' OR LOWER(name) LIKE '%terms%' OR LOWER(name) LIKE '%return%' THEN 4
    WHEN LOWER(slug) LIKE '%privacy%' OR LOWER(slug) LIKE '%terms%' OR LOWER(slug) LIKE '%return%' THEN 4
    
    -- Contact and support pages -> Column 3 (Support)
    WHEN "systemPageType" = 'contact' THEN 3
    WHEN LOWER(name) LIKE '%contact%' OR LOWER(name) LIKE '%support%' OR LOWER(name) LIKE '%help%' OR LOWER(name) LIKE '%faq%' THEN 3
    WHEN LOWER(slug) LIKE '%contact%' OR LOWER(slug) LIKE '%support%' OR LOWER(slug) LIKE '%help%' OR LOWER(slug) LIKE '%faq%' THEN 3
    
    -- Company/About pages -> Column 2 (General) - Column 1 has logo/name/tagline
    WHEN "systemPageType" = 'about' THEN 2
    WHEN LOWER(name) LIKE '%about%' OR LOWER(name) LIKE '%team%' OR LOWER(name) LIKE '%mission%' OR LOWER(name) LIKE '%history%' THEN 2
    WHEN LOWER(slug) LIKE '%about%' OR LOWER(slug) LIKE '%team%' OR LOWER(slug) LIKE '%mission%' OR LOWER(slug) LIKE '%history%' THEN 2
    
    -- Everything else -> Column 2 (General) - default
    ELSE 2
END
WHERE navigation_placement IN ('footer', 'both') AND footer_column IS NULL;

-- Create index for footer column queries
CREATE INDEX IF NOT EXISTS idx_page_documents_footer_column ON page_documents(footer_column);

-- Create footer column configuration table for customizable headers
CREATE TABLE IF NOT EXISTS footer_column_config (
    id SERIAL PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    column_number INTEGER NOT NULL CHECK (column_number IN (1, 2, 3, 4)),
    column_title TEXT NOT NULL DEFAULT '',
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one config per column per store
    UNIQUE(store_id, column_number)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_footer_column_config_store ON footer_column_config(store_id);

-- Insert default column headers for all existing stores
INSERT INTO footer_column_config (store_id, column_number, column_title, is_enabled)
SELECT 
    s.id as store_id,
    cols.column_number,
    cols.default_title,
    cols.is_enabled
FROM stores s
CROSS JOIN (
    VALUES 
        (1, 'Company', true),      -- Column 1: Company logo/name/tagline
        (2, 'General', true),      -- Column 2: About, Team, Mission, etc.
        (3, 'Support', true),      -- Column 3: Contact, Help, FAQ, etc.
        (4, 'Legal', true)         -- Column 4: Privacy, Terms, Returns, etc.
) AS cols(column_number, default_title, is_enabled)
WHERE NOT EXISTS (
    SELECT 1 FROM footer_column_config fcc 
    WHERE fcc.store_id = s.id AND fcc.column_number = cols.column_number
);

-- Add RLS policy for footer column config
ALTER TABLE footer_column_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage footer column config for their stores" ON footer_column_config
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE store_owner_id = auth.uid()
        )
    );

-- Create a view to see the new footer column assignments
CREATE OR REPLACE VIEW footer_navigation_preview AS
SELECT 
    id,
    name,
    slug,
    navigation_placement,
    footer_column,
    "isSystemPage",
    "systemPageType",
    status,
    store_id
FROM page_documents 
WHERE navigation_placement IN ('footer', 'both')
ORDER BY footer_column, name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Footer columns system added successfully!';
    RAISE NOTICE '- footer_column column: Added/Verified (INTEGER: 1, 2, 3, 4)';
    RAISE NOTICE '- footer_column_config table: Created for customizable headers';
    RAISE NOTICE '- Existing pages: Migrated to numbered column system';
    RAISE NOTICE '- Default headers: Inserted for all stores';
    RAISE NOTICE '- RLS policies: Applied for data security';
    RAISE NOTICE '- Indexes: Created for efficient queries';
    RAISE NOTICE '- View: Created footer_navigation_preview for testing';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 New 4-Column Footer Structure:';
    RAISE NOTICE '   Column 1: "Company" - Logo, Name, Tagline (component handles)';
    RAISE NOTICE '   Column 2: "General" - About, Team, Mission, etc.';
    RAISE NOTICE '   Column 3: "Support" - Contact, Help, FAQ, etc.';
    RAISE NOTICE '   Column 4: "Legal" - Privacy, Terms, Returns, etc.';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Column headers are customizable per store in footer_column_config table';
    RAISE NOTICE '📝 To test: SELECT * FROM footer_navigation_preview;';
    RAISE NOTICE '📝 To customize: UPDATE footer_column_config SET column_title = ''New Name'' WHERE store_id = ''xxx'' AND column_number = 2;';
END $$;