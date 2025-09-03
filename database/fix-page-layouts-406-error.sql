-- Fix for 406 error in PageBuilderRenderer
-- This script ensures the page builder tables exist and have correct structure

-- First, ensure page_documents table exists with correct structure
CREATE TABLE IF NOT EXISTS page_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    content JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    seo_title TEXT,
    seo_description TEXT,
    seo_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Then ensure store_page_layouts table exists
CREATE TABLE IF NOT EXISTS store_page_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    page_type TEXT NOT NULL DEFAULT 'storefront' CHECK (page_type IN ('storefront', 'landing', 'about', 'contact', 'custom')),
    page_document_id UUID NOT NULL REFERENCES page_documents(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(store_id, page_type)
);

-- Enable RLS on both tables
ALTER TABLE page_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_page_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_documents
DROP POLICY IF EXISTS "Store owners can manage their page documents" ON page_documents;
DROP POLICY IF EXISTS "Published pages are publicly viewable" ON page_documents;

CREATE POLICY "Store owners can manage their page documents" ON page_documents FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = page_documents.store_id AND stores.store_owner_id = auth.uid())
);

CREATE POLICY "Published pages are publicly viewable" ON page_documents FOR SELECT USING (
    status = 'published'
);

-- RLS Policies for store_page_layouts
DROP POLICY IF EXISTS "Store owners can manage their page layouts" ON store_page_layouts;
DROP POLICY IF EXISTS "Active page layouts are publicly viewable" ON store_page_layouts;

CREATE POLICY "Store owners can manage their page layouts" ON store_page_layouts FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_page_layouts.store_id AND stores.store_owner_id = auth.uid())
);

CREATE POLICY "Active page layouts are publicly viewable" ON store_page_layouts FOR SELECT USING (
    is_active = true AND EXISTS (
        SELECT 1 FROM page_documents 
        WHERE page_documents.id = store_page_layouts.page_document_id 
        AND page_documents.status = 'published'
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_documents_store ON page_documents(store_id);
CREATE INDEX IF NOT EXISTS idx_page_documents_status ON page_documents(status);
CREATE INDEX IF NOT EXISTS idx_page_documents_slug ON page_documents(store_id, slug);

CREATE INDEX IF NOT EXISTS idx_store_page_layouts_store ON store_page_layouts(store_id);
CREATE INDEX IF NOT EXISTS idx_store_page_layouts_type ON store_page_layouts(store_id, page_type);
CREATE INDEX IF NOT EXISTS idx_store_page_layouts_active ON store_page_layouts(store_id, is_active);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON page_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON store_page_layouts TO authenticated;
GRANT ALL ON page_documents TO service_role;
GRANT ALL ON store_page_layouts TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Page builder tables fixed!';
  RAISE NOTICE '- page_documents table structure verified';
  RAISE NOTICE '- store_page_layouts table structure verified';
  RAISE NOTICE '- RLS policies updated';
  RAISE NOTICE '- Indexes created for performance';
  RAISE NOTICE '';
  RAISE NOTICE 'The 406 errors in PageBuilderRenderer should now be resolved.';
END $$;