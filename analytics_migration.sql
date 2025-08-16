-- Analytics tracking tables migration
-- This should be run in your Supabase SQL editor

-- Page views tracking
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')) NOT NULL,
  browser TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product views tracking
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  referrer TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')) NOT NULL,
  view_duration INTEGER, -- seconds spent on product page
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart events tracking
CREATE TABLE IF NOT EXISTS cart_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('add_to_cart', 'remove_from_cart', 'view_cart', 'start_checkout', 'abandon_cart', 'complete_purchase')) NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER,
  cart_value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer sessions tracking
CREATE TABLE IF NOT EXISTS customer_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL UNIQUE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  page_views INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0, -- total session duration in seconds
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')) NOT NULL,
  browser TEXT,
  country TEXT,
  converted BOOLEAN DEFAULT FALSE, -- did they make a purchase
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product performance aggregated data
CREATE TABLE IF NOT EXISTS product_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  add_to_carts INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  return_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, product_id, date)
);

-- Store analytics aggregated data
CREATE TABLE IF NOT EXISTS store_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_visitors INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  average_session_duration DECIMAL(8,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  mobile_visitors INTEGER DEFAULT 0,
  desktop_visitors INTEGER DEFAULT 0,
  tablet_visitors INTEGER DEFAULT 0,
  top_pages JSONB DEFAULT '{}',
  traffic_sources JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, date)
);

-- Customer behavior tracking
CREATE TABLE IF NOT EXISTS customer_behavior (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  days_since_first_order INTEGER,
  days_since_last_order INTEGER,
  favorite_categories TEXT[],
  preferred_device TEXT CHECK (preferred_device IN ('mobile', 'desktop', 'tablet')),
  customer_segment TEXT CHECK (customer_segment IN ('new', 'returning', 'loyal', 'at_risk', 'churned')),
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, customer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_views_store_date ON page_views(store_id, created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_product_views_store_product ON product_views(store_id, product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_session ON product_views(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_store_type ON cart_events(store_id, event_type);
CREATE INDEX IF NOT EXISTS idx_cart_events_session ON cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_store ON customer_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_performance_store_date ON product_performance(store_id, date);
CREATE INDEX IF NOT EXISTS idx_store_analytics_store_date ON store_analytics(store_id, date);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_store ON customer_behavior(store_id);

-- Create triggers to update page_views count in sessions
CREATE OR REPLACE FUNCTION update_session_page_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_sessions 
  SET page_views = page_views + 1,
      updated_at = NOW()
  WHERE session_id = NEW.session_id;
  
  -- Create session if it doesn't exist
  INSERT INTO customer_sessions (store_id, customer_id, session_id, device_type, browser, page_views)
  VALUES (NEW.store_id, NEW.customer_id, NEW.session_id, NEW.device_type, NEW.browser, 1)
  ON CONFLICT (session_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_page_views
  AFTER INSERT ON page_views
  FOR EACH ROW
  EXECUTE FUNCTION update_session_page_views();

-- Enable Row Level Security
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_behavior ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (assuming you have a stores table with proper relationships)
CREATE POLICY "Users can view their own store analytics" ON page_views
  FOR ALL USING (store_id IN (SELECT id FROM stores WHERE store_owner_id = auth.uid()));

CREATE POLICY "Users can view their own store analytics" ON product_views
  FOR ALL USING (store_id IN (SELECT id FROM stores WHERE store_owner_id = auth.uid()));

CREATE POLICY "Users can view their own store analytics" ON cart_events
  FOR ALL USING (store_id IN (SELECT id FROM stores WHERE store_owner_id = auth.uid()));

CREATE POLICY "Users can view their own store analytics" ON customer_sessions
  FOR ALL USING (store_id IN (SELECT id FROM stores WHERE store_owner_id = auth.uid()));

CREATE POLICY "Users can view their own store analytics" ON product_performance
  FOR ALL USING (store_id IN (SELECT id FROM stores WHERE store_owner_id = auth.uid()));

CREATE POLICY "Users can view their own store analytics" ON store_analytics
  FOR ALL USING (store_id IN (SELECT id FROM stores WHERE store_owner_id = auth.uid()));

CREATE POLICY "Users can view their own store analytics" ON customer_behavior
  FOR ALL USING (store_id IN (SELECT id FROM stores WHERE store_owner_id = auth.uid()));