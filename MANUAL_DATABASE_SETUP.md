# Manual Database Setup Instructions

The application is currently experiencing database errors because some required tables and columns are missing. Follow these steps to fix the issues:

## 🚨 Required Actions

### 1. Add Missing Columns to `stores` Table
Execute this SQL in your **Supabase SQL Editor**:

```sql
-- Add payment configuration fields to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS payment_enabled BOOLEAN DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_publishable_key TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_webhook_secret TEXT;

-- Add store address fields if they don't exist
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_address_line1 TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_address_line2 TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_city TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_state TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_postal_code TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_country TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_phone TEXT;

-- Update existing stores to have payment disabled by default
UPDATE stores SET payment_enabled = false WHERE payment_enabled IS NULL;
```

### 2. Create Analytics Tables
Execute this SQL in your **Supabase SQL Editor**:

```sql
-- Create page_views table for analytics tracking
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  browser TEXT,
  ip_address INET,
  country_code TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cart_events table for cart analytics
CREATE TABLE IF NOT EXISTS cart_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('add_to_cart', 'remove_from_cart', 'update_quantity', 'clear_cart', 'checkout_start', 'checkout_complete')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_store_id ON page_views(store_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_cart_events_store_id ON cart_events(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_customer_id ON cart_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_session_id ON cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_event_type ON cart_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cart_events_created_at ON cart_events(created_at);

-- Enable RLS for analytics tables
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_views
CREATE POLICY "Store owners can view own store page views" ON page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = page_views.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

-- Service role can manage all page views (for analytics collection)
CREATE POLICY "Service role can manage page views" ON page_views
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for cart_events
CREATE POLICY "Store owners can view own store cart events" ON cart_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = cart_events.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

-- Service role can manage all cart events (for analytics collection)
CREATE POLICY "Service role can manage cart events" ON cart_events
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT ON page_views TO authenticated;
GRANT SELECT, INSERT ON cart_events TO authenticated;
GRANT ALL ON page_views TO service_role;
GRANT ALL ON cart_events TO service_role;
```

## 📋 Steps to Execute

1. **Open your Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your `jizobmpcyrzprrwsyedv` project

2. **Go to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Store Columns SQL**
   - Copy and paste the first SQL block (stores table modifications)
   - Click "Run" or press Ctrl+Enter

4. **Run the Analytics Tables SQL**
   - Copy and paste the second SQL block (analytics tables)
   - Click "Run" or press Ctrl+Enter

5. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

## ✅ Expected Results

After running these migrations:
- ✅ The 400 Bad Request errors for stores table will be resolved
- ✅ The 404 errors for page_views table will be resolved
- ✅ Payment configuration will work properly
- ✅ Analytics tracking will function without errors
- ✅ Store address fields will be available

## 🔍 Verification

After running the migrations, check your browser console. You should see:
- No more 400/404 database errors
- "Payment configuration query failed" warnings should disappear
- Analytics tracking should work silently (no error messages)

The application has been made resilient to handle missing tables gracefully, but running the migrations will enable full functionality.