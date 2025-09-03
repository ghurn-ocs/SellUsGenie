-- SellUsGenie Database Fix Script
-- Fixes 400/403/404 errors for missing tables and columns
-- Run this script in your Supabase SQL Editor

-- 1. Create customer_favorites table (missing - causes 404 error)
CREATE TABLE IF NOT EXISTS customer_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique favorites per customer per product
  UNIQUE(customer_id, product_id, store_id)
);

-- 2. Add category column to products table (missing - causes 400 error)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE products ADD COLUMN category TEXT;
  END IF;
END $$;

-- 3. Add missing columns to store_policies table (causes 400 error)
DO $$
BEGIN
  -- Add contact_us column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'store_policies' AND column_name = 'contact_us'
  ) THEN
    ALTER TABLE store_policies ADD COLUMN contact_us TEXT;
  END IF;
  
  -- Add about_us column if missing  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'store_policies' AND column_name = 'about_us'
  ) THEN
    ALTER TABLE store_policies ADD COLUMN about_us TEXT;
  END IF;
END $$;

-- 4. Create indexes for customer_favorites
CREATE INDEX IF NOT EXISTS idx_customer_favorites_store_id ON customer_favorites(store_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer_id ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_product_id ON customer_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_created_at ON customer_favorites(created_at);

-- 5. Enable Row Level Security for customer_favorites
ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for customer_favorites
DROP POLICY IF EXISTS "Customers can manage own favorites" ON customer_favorites;
DROP POLICY IF EXISTS "Store owners can view store favorites" ON customer_favorites;
DROP POLICY IF EXISTS "Service role can manage all favorites" ON customer_favorites;

-- Customers can manage their own favorites
CREATE POLICY "Customers can manage own favorites" ON customer_favorites
  FOR ALL USING (customer_id = auth.uid());

-- Store owners can view favorites for their stores
CREATE POLICY "Store owners can view store favorites" ON customer_favorites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = customer_favorites.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

-- Service role can manage all favorites
CREATE POLICY "Service role can manage all favorites" ON customer_favorites
  FOR ALL USING (auth.role() = 'service_role');

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_favorites TO authenticated;
GRANT ALL ON customer_favorites TO service_role;

-- 8. Fix page_views table permissions (403 error)
-- Grant INSERT permission for analytics tracking
GRANT SELECT, INSERT ON page_views TO authenticated;

-- 9. Add missing RLS policy for page_views INSERT operations
DROP POLICY IF EXISTS "Authenticated users can insert page views" ON page_views;
CREATE POLICY "Authenticated users can insert page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database fixes applied successfully!';
  RAISE NOTICE '- customer_favorites table created with RLS policies';
  RAISE NOTICE '- products.category column added';
  RAISE NOTICE '- store_policies missing columns added';
  RAISE NOTICE '- page_views permissions fixed';
  RAISE NOTICE '';
  RAISE NOTICE 'The 400/403/404 database errors should now be resolved.';
END $$;