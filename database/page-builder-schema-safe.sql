-- Page Builder Schema Extension - Safe Version
-- Handles existing tables and policies gracefully

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Store owners can manage their page documents" ON page_documents;
DROP POLICY IF EXISTS "Published pages are publicly viewable" ON page_documents;
DROP POLICY IF EXISTS "Store owners can view their page history" ON page_history;
DROP POLICY IF EXISTS "Store owners can create page history" ON page_history;
DROP POLICY IF EXISTS "Public templates are viewable by all authenticated users" ON page_templates;
DROP POLICY IF EXISTS "Users can manage their own templates" ON page_templates;
DROP POLICY IF EXISTS "Store owners can manage their page layouts" ON store_page_layouts;
DROP POLICY IF EXISTS "Active page layouts are publicly viewable" ON store_page_layouts;

-- Page documents table - stores page structure and content
CREATE TABLE IF NOT EXISTS page_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    -- Page content and structure
    sections JSONB NOT NULL DEFAULT '[]',
    theme_overrides JSONB DEFAULT '{}',
    
    -- SEO settings
    seo JSONB DEFAULT '{}',
    
    -- Analytics settings
    analytics JSONB DEFAULT '{}',
    
    -- Performance settings
    performance JSONB DEFAULT '{}',
    
    -- Accessibility settings
    accessibility JSONB DEFAULT '{}',
    
    -- Custom code
    custom_code JSONB DEFAULT '{}',
    
    -- Global styles
    global_styles JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'page_documents_store_id_slug_key'
    ) THEN
        ALTER TABLE page_documents ADD CONSTRAINT page_documents_store_id_slug_key UNIQUE(store_id, slug);
    END IF;
END $$;

-- Page history table - stores version history for pages
CREATE TABLE IF NOT EXISTS page_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES page_documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page templates table - stores reusable page templates
CREATE TABLE IF NOT EXISTS page_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    category TEXT DEFAULT 'custom',
    document JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store page layouts table - links stores to their page structure
CREATE TABLE IF NOT EXISTS store_page_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    page_type TEXT NOT NULL DEFAULT 'storefront' CHECK (page_type IN ('storefront', 'landing', 'about', 'contact', 'custom')),
    page_document_id UUID NOT NULL REFERENCES page_documents(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint for store_page_layouts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'store_page_layouts_store_id_page_type_key'
    ) THEN
        ALTER TABLE store_page_layouts ADD CONSTRAINT store_page_layouts_store_id_page_type_key UNIQUE(store_id, page_type);
    END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE page_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_page_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_documents
CREATE POLICY "Store owners can manage their page documents" ON page_documents FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = page_documents.store_id AND stores.store_owner_id = auth.uid())
);

CREATE POLICY "Published pages are publicly viewable" ON page_documents FOR SELECT USING (
    status = 'published'
);

-- RLS Policies for page_history
CREATE POLICY "Store owners can view their page history" ON page_history FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM page_documents p 
        JOIN stores s ON s.id = p.store_id 
        WHERE p.id = page_history.page_id AND s.store_owner_id = auth.uid()
    )
);

CREATE POLICY "Store owners can create page history" ON page_history FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM page_documents p 
        JOIN stores s ON s.id = p.store_id 
        WHERE p.id = page_history.page_id AND s.store_owner_id = auth.uid()
    )
);

-- RLS Policies for page_templates
CREATE POLICY "Public templates are viewable by all authenticated users" ON page_templates FOR SELECT USING (
    is_public = true OR created_by = auth.uid()
);

CREATE POLICY "Users can manage their own templates" ON page_templates FOR ALL USING (
    created_by = auth.uid()
);

-- RLS Policies for store_page_layouts
CREATE POLICY "Store owners can manage their page layouts" ON store_page_layouts FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_page_layouts.store_id AND stores.store_owner_id = auth.uid())
);

CREATE POLICY "Active page layouts are publicly viewable" ON store_page_layouts FOR SELECT USING (
    is_active = true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_documents_store ON page_documents(store_id);
CREATE INDEX IF NOT EXISTS idx_page_documents_status ON page_documents(status);
CREATE INDEX IF NOT EXISTS idx_page_documents_slug ON page_documents(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_page_history_page ON page_history(page_id);
CREATE INDEX IF NOT EXISTS idx_page_templates_public ON page_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_store_page_layouts_store ON store_page_layouts(store_id);
CREATE INDEX IF NOT EXISTS idx_store_page_layouts_type ON store_page_layouts(store_id, page_type);

-- Create or replace functions
CREATE OR REPLACE FUNCTION check_page_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM page_documents WHERE store_id = NEW.store_id) >= 10 THEN
        RAISE EXCEPTION 'Store cannot have more than 10 pages. Please delete existing pages or upgrade your plan.';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers first
DROP TRIGGER IF EXISTS enforce_page_limit_trigger ON page_documents;
DROP TRIGGER IF EXISTS update_page_documents_updated_at ON page_documents;
DROP TRIGGER IF EXISTS update_page_templates_updated_at ON page_templates;
DROP TRIGGER IF EXISTS update_store_page_layouts_updated_at ON store_page_layouts;

-- Create triggers
CREATE TRIGGER enforce_page_limit_trigger
    BEFORE INSERT ON page_documents
    FOR EACH ROW EXECUTE FUNCTION check_page_limit();

CREATE TRIGGER update_page_documents_updated_at 
    BEFORE UPDATE ON page_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_templates_updated_at 
    BEFORE UPDATE ON page_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_page_layouts_updated_at 
    BEFORE UPDATE ON store_page_layouts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON page_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON page_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON page_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON store_page_layouts TO authenticated;

GRANT ALL ON page_documents TO service_role;
GRANT ALL ON page_history TO service_role;
GRANT ALL ON page_templates TO service_role;
GRANT ALL ON store_page_layouts TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Page builder schema setup complete!';
  RAISE NOTICE '- page_documents table ready';
  RAISE NOTICE '- page_history table ready';
  RAISE NOTICE '- page_templates table ready';
  RAISE NOTICE '- store_page_layouts table ready';
  RAISE NOTICE '- RLS policies configured';
  RAISE NOTICE '- Indexes created for performance';
  RAISE NOTICE '- Triggers configured';
  RAISE NOTICE '';
  RAISE NOTICE 'The 406 errors in PageBuilderRenderer should now be resolved.';
END $$;