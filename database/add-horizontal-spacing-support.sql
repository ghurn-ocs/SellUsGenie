-- Migration: Add Horizontal Spacing Support for Header and Footer
-- Date: 2025-09-02
-- Purpose: Add horizontal spacing functionality for header and footer system pages

-- ====================
-- HORIZONTAL SPACING FEATURE MIGRATION
-- ====================

-- This migration adds support for horizontal spacing customization in header and footer pages.
-- The horizontal spacing setting allows store owners to control the visual gap between items
-- and the top/bottom padding of header and footer sections.

-- Spacing Options:
-- - 'thin': Compact layout with minimal padding (py-2 px-3)
-- - 'standard': Balanced spacing for most designs (py-4 px-6) [DEFAULT]  
-- - 'expanded': Generous spacing for premium feel (py-8 px-8)

-- ====================
-- DATA STORAGE IMPLEMENTATION
-- ====================

-- The horizontal spacing setting is stored in the existing `page_documents.theme_overrides` JSONB field.
-- This approach maintains consistency with other theme settings and requires no schema changes.

-- Example storage format:
-- {
--   "backgroundColor": "#1E1E1E",
--   "textColor": "#FFFFFF",
--   "linkColor": "#9B51E0",
--   "horizontalSpacing": "standard"
-- }

-- ====================
-- VALIDATION CONSTRAINTS (OPTIONAL)
-- ====================

-- Add a check constraint to validate horizontalSpacing values in theme_overrides
-- This constraint ensures only valid spacing options are stored
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_horizontal_spacing_check'
  ) THEN
    -- Add constraint to validate horizontalSpacing values in theme_overrides JSONB
    ALTER TABLE page_documents 
    ADD CONSTRAINT valid_horizontal_spacing_check 
    CHECK (
      theme_overrides IS NULL OR
      theme_overrides->>'horizontalSpacing' IS NULL OR
      theme_overrides->>'horizontalSpacing' IN ('thin', 'standard', 'expanded')
    );
    
    RAISE NOTICE 'Added horizontal spacing validation constraint';
  ELSE
    RAISE NOTICE 'Horizontal spacing validation constraint already exists';
  END IF;
END $$;

-- ====================
-- PERFORMANCE OPTIMIZATION
-- ====================

-- Create index on theme_overrides for better performance when querying by horizontalSpacing
-- Using BTREE index for text values extracted from JSONB
CREATE INDEX IF NOT EXISTS idx_page_documents_theme_horizontal_spacing 
ON page_documents ((theme_overrides->>'horizontalSpacing'))
WHERE theme_overrides->>'horizontalSpacing' IS NOT NULL;

-- ====================
-- DATA MIGRATION (OPTIONAL)
-- ====================

-- Set default horizontal spacing for existing header and footer pages that don't have it
-- This ensures consistent behavior for existing system pages
UPDATE page_documents 
SET theme_overrides = COALESCE(theme_overrides, '{}'::jsonb) || '{"horizontalSpacing": "standard"}'::jsonb
WHERE (
  -- Target header and footer system pages
  (theme_overrides->>'pageType' = 'header' OR theme_overrides->>'pageType' = 'footer')
  OR name IN ('Site Header', 'Site Footer', 'Header', 'Footer')
) 
AND (
  -- Only update if horizontalSpacing is not already set
  theme_overrides IS NULL OR 
  theme_overrides->>'horizontalSpacing' IS NULL
);

-- ====================
-- VERIFICATION QUERIES
-- ====================

-- Query to verify horizontal spacing settings in system pages
-- Uncomment to run verification checks:

/*
-- Check all pages with horizontal spacing settings
SELECT 
  name,
  slug,
  theme_overrides->>'pageType' as page_type,
  theme_overrides->>'horizontalSpacing' as horizontal_spacing,
  status,
  updated_at
FROM page_documents 
WHERE theme_overrides->>'horizontalSpacing' IS NOT NULL
ORDER BY name;

-- Count pages by spacing type
SELECT 
  theme_overrides->>'horizontalSpacing' as spacing_type,
  COUNT(*) as page_count
FROM page_documents 
WHERE theme_overrides->>'horizontalSpacing' IS NOT NULL
GROUP BY theme_overrides->>'horizontalSpacing';
*/

-- ====================
-- ROLLBACK INSTRUCTIONS
-- ====================

-- To rollback this migration (remove horizontal spacing functionality):
-- 1. Remove horizontal spacing from all page theme_overrides:
--    UPDATE page_documents SET theme_overrides = theme_overrides - 'horizontalSpacing';
-- 2. Drop the constraint:
--    ALTER TABLE page_documents DROP CONSTRAINT IF EXISTS valid_horizontal_spacing_check;
-- 3. Drop the index:
--    DROP INDEX IF EXISTS idx_page_documents_theme_horizontal_spacing;

-- ====================
-- MIGRATION COMPLETE
-- ====================

DO $$
BEGIN
  RAISE NOTICE 'Horizontal spacing migration completed successfully';
  RAISE NOTICE 'Header and footer pages now support horizontal spacing customization';
  RAISE NOTICE 'Available options: thin (compact), standard (balanced), expanded (generous)';
END $$;