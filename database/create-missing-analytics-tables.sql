-- SellUsGenie Analytics Tables Migration
-- Run this script in your Supabase SQL Editor to fix 404 errors

-- 1. Create customer_sessions table
CREATE TABLE IF NOT EXISTS customer_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT UNIQUE NOT NULL,
  device_type TEXT CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  browser TEXT,
  page_views INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT false,
  referrer TEXT,
  utm_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create page_views table
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

-- 3. Create product_views table (also needed by analytics)
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  referrer TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  view_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create cart_events table
CREATE TABLE IF NOT EXISTS cart_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('add_to_cart', 'remove_from_cart', 'update_quantity', 'clear_cart', 'checkout_start', 'checkout_complete')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2),
  cart_value DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create user_subscriptions table (for subscription management)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  plan_id TEXT,
  plan_name TEXT,
  plan_amount INTEGER,
  plan_currency TEXT DEFAULT 'usd',
  quantity INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_sessions_store_id ON customer_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_session_id ON customer_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_created_at ON customer_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_page_views_store_id ON page_views(store_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);

CREATE INDEX IF NOT EXISTS idx_product_views_store_id ON product_views(store_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_session_id ON product_views(session_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);

CREATE INDEX IF NOT EXISTS idx_cart_events_store_id ON cart_events(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_session_id ON cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_event_type ON cart_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cart_events_created_at ON cart_events(created_at);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);

-- 7. Enable Row Level Security
ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for customer_sessions (drop existing first)
DROP POLICY IF EXISTS "Store owners can view own store sessions" ON customer_sessions;
DROP POLICY IF EXISTS "Service role can manage all sessions" ON customer_sessions;

CREATE POLICY "Store owners can view own store sessions" ON customer_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = customer_sessions.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all sessions" ON customer_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- 8. Create RLS policies for page_views (drop existing first)
DROP POLICY IF EXISTS "Store owners can view own store page views" ON page_views;
DROP POLICY IF EXISTS "Service role can manage all page views" ON page_views;
DROP POLICY IF EXISTS "Service role can manage page views" ON page_views;

CREATE POLICY "Store owners can view own store page views" ON page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = page_views.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all page views" ON page_views
  FOR ALL USING (auth.role() = 'service_role');

-- 9. Create RLS policies for product_views (drop existing first)
DROP POLICY IF EXISTS "Store owners can view own store product views" ON product_views;
DROP POLICY IF EXISTS "Service role can manage all product views" ON product_views;

CREATE POLICY "Store owners can view own store product views" ON product_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = product_views.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all product views" ON product_views
  FOR ALL USING (auth.role() = 'service_role');

-- 10. Create RLS policies for cart_events (drop existing first)
DROP POLICY IF EXISTS "Store owners can view own store cart events" ON cart_events;
DROP POLICY IF EXISTS "Service role can manage all cart events" ON cart_events;
DROP POLICY IF EXISTS "Service role can manage cart events" ON cart_events;

CREATE POLICY "Store owners can view own store cart events" ON cart_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = cart_events.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all cart events" ON cart_events
  FOR ALL USING (auth.role() = 'service_role');

-- 11. Create RLS policies for user_subscriptions (drop existing first)
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON user_subscriptions;

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- 12. Grant permissions
GRANT SELECT, INSERT ON customer_sessions TO authenticated;
GRANT SELECT, INSERT ON page_views TO authenticated;
GRANT SELECT, INSERT ON product_views TO authenticated;
GRANT SELECT, INSERT ON cart_events TO authenticated;
GRANT SELECT ON user_subscriptions TO authenticated;

GRANT ALL ON customer_sessions TO service_role;
GRANT ALL ON page_views TO service_role;
GRANT ALL ON product_views TO service_role;
GRANT ALL ON cart_events TO service_role;
GRANT ALL ON user_subscriptions TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Analytics tables created successfully! The 404 errors should now be resolved.';
END $$;