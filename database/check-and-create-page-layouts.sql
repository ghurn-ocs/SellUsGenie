-- Check and Create Missing Page Builder Tables
-- This addresses the persistent 406 error

-- Check if store_page_layouts table exists, if not create it
DO $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'store_page_layouts'
  ) THEN
    RAISE NOTICE 'store_page_layouts table does not exist - creating it now';
    
    -- Create page_documents table first if it doesn't exist
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
    
    -- Then create store_page_layouts table
    CREATE TABLE store_page_layouts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      page_type TEXT NOT NULL DEFAULT 'storefront' CHECK (page_type IN ('storefront', 'landing', 'about', 'contact', 'custom')),
      page_document_id UUID NOT NULL REFERENCES page_documents(id) ON DELETE CASCADE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      UNIQUE(store_id, page_type)
    );
    
    RAISE NOTICE 'Tables created successfully';
  ELSE
    RAISE NOTICE 'store_page_layouts table already exists';
  END IF;
END $$;

-- Enable RLS and create policies regardless
ALTER TABLE page_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_page_layouts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they are correct
DROP POLICY IF EXISTS "Store owners can manage their page documents" ON page_documents;
DROP POLICY IF EXISTS "Published pages are publicly viewable" ON page_documents;
DROP POLICY IF EXISTS "Store owners can manage their page layouts" ON store_page_layouts;
DROP POLICY IF EXISTS "Active page layouts are publicly viewable" ON store_page_layouts;

-- Page documents policies
CREATE POLICY "Store owners can manage their page documents" ON page_documents FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = page_documents.store_id AND stores.store_owner_id = auth.uid())
);

CREATE POLICY "Published pages are publicly viewable" ON page_documents FOR SELECT USING (
    status = 'published'
);

-- Store page layouts policies  
CREATE POLICY "Store owners can manage their page layouts" ON store_page_layouts FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_page_layouts.store_id AND stores.store_owner_id = auth.uid())
);

CREATE POLICY "Active page layouts are publicly viewable" ON store_page_layouts FOR SELECT USING (
    is_active = true
);

-- Grant permissions
GRANT ALL ON page_documents TO authenticated;
GRANT ALL ON store_page_layouts TO authenticated;
GRANT ALL ON page_documents TO service_role;
GRANT ALL ON store_page_layouts TO service_role;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_page_documents_store ON page_documents(store_id);
CREATE INDEX IF NOT EXISTS idx_page_documents_status ON page_documents(status);
CREATE INDEX IF NOT EXISTS idx_store_page_layouts_store ON store_page_layouts(store_id);
CREATE INDEX IF NOT EXISTS idx_store_page_layouts_type ON store_page_layouts(store_id, page_type);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Page builder tables and permissions configured successfully';
  RAISE NOTICE 'The 406 error should now be resolved';
END $$;