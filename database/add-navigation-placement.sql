-- Add navigation placement control to page documents
-- Migration to add navigation_placement column to existing page_documents table

-- Add the navigation_placement column with default value
ALTER TABLE page_documents 
ADD COLUMN IF NOT EXISTS navigation_placement TEXT DEFAULT 'both' 
CHECK (navigation_placement IN ('header', 'footer', 'both', 'none'));

-- Update existing pages to use 'both' as default (which is the current behavior)
UPDATE page_documents 
SET navigation_placement = 'both' 
WHERE navigation_placement IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN page_documents.navigation_placement IS 'Controls where the page link appears in navigation: header, footer, both, or none';