-- Create store_templates table for StoreFront customization
CREATE TABLE IF NOT EXISTS store_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  layout_id TEXT NOT NULL,
  color_scheme_id TEXT NOT NULL,
  customizations JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  preview_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE store_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Store owners can manage their own store templates
DROP POLICY IF EXISTS "Store owners can manage store templates" ON store_templates;
CREATE POLICY "Store owners can manage store templates" ON store_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_templates.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

-- Policy: Public can view active non-preview templates (for public storefronts)
DROP POLICY IF EXISTS "Public can view active store templates" ON store_templates;
CREATE POLICY "Public can view active store templates" ON store_templates
  FOR SELECT USING (
    is_active = true AND preview_mode = false
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_store_templates_store_id ON store_templates(store_id);
CREATE INDEX IF NOT EXISTS idx_store_templates_active ON store_templates(store_id, is_active);

-- Insert default templates for existing stores
INSERT INTO store_templates (store_id, layout_id, color_scheme_id, customizations, is_active, preview_mode)
SELECT 
  s.id as store_id,
  'fashion-modern' as layout_id,
  'neutral-modern' as color_scheme_id,
  ('{"hero": {"title": "Welcome to ' || s.store_name || '", "subtitle": "Discover amazing products"}, "branding": {"storeName": "' || s.store_name || '"}}')::jsonb,
  true as is_active,
  false as preview_mode
FROM stores s
WHERE NOT EXISTS (
  SELECT 1 FROM store_templates st 
  WHERE st.store_id = s.id
);