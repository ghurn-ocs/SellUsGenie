-- World-Class Analytics and Marketing Schema
-- Database schema for advanced analytics tracking and integrations

-- Store Integrations Table
CREATE TABLE IF NOT EXISTS store_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL, -- ga4, meta_pixel, tiktok_pixel, google_ads, etc.
  integration_name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL, -- Google, Meta, TikTok, etc.
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}', -- Integration-specific configuration
  credentials JSONB DEFAULT '{}', -- Encrypted credentials
  status VARCHAR(20) DEFAULT 'pending', -- active, error, disabled, pending
  last_synced TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(store_id, integration_type)
);

-- Analytics Events Table - Central event tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50), -- ecommerce, engagement, conversion, etc.
  parameters JSONB DEFAULT '{}',
  user_id UUID REFERENCES customers(id),
  session_id VARCHAR(100),
  visitor_id VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(20) NOT NULL, -- ga4, meta_pixel, tiktok_pixel, internal
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  page_url TEXT,
  page_title TEXT,
  device_type VARCHAR(20), -- desktop, mobile, tablet
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Indexes for performance
  INDEX idx_analytics_events_store_timestamp (store_id, timestamp DESC),
  INDEX idx_analytics_events_event_name (event_name),
  INDEX idx_analytics_events_user_id (user_id),
  INDEX idx_analytics_events_session_id (session_id),
  INDEX idx_analytics_events_source (source)
);

-- Customer Segments Table - Advanced segmentation
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  segment_type VARCHAR(20) NOT NULL, -- behavioral, demographic, rfm, custom
  conditions JSONB NOT NULL, -- Segment criteria
  is_dynamic BOOLEAN DEFAULT true, -- Auto-update vs static
  customer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_calculated TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(store_id, name)
);

-- Customer Segment Memberships
CREATE TABLE IF NOT EXISTS customer_segment_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score DECIMAL(5,2), -- For scored segments (0-100)
  
  UNIQUE(segment_id, customer_id),
  INDEX idx_customer_segments_customer (customer_id),
  INDEX idx_customer_segments_segment (segment_id)
);

-- Customer Analytics - Extended customer insights
CREATE TABLE IF NOT EXISTS customer_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- RFM Analysis
  recency_score INTEGER, -- 1-5, higher = more recent
  frequency_score INTEGER, -- 1-5, higher = more frequent
  monetary_score INTEGER, -- 1-5, higher = more valuable
  rfm_segment VARCHAR(20), -- Champions, Loyal, At Risk, etc.
  
  -- Behavioral Metrics
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration DECIMAL(10,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  pages_per_session DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement Metrics
  email_engagement_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  sms_engagement_score DECIMAL(5,2) DEFAULT 0,
  social_engagement_score DECIMAL(5,2) DEFAULT 0,
  
  -- Predictive Metrics
  churn_probability DECIMAL(5,2) DEFAULT 0, -- 0-100
  lifetime_value_prediction DECIMAL(10,2) DEFAULT 0,
  next_purchase_probability DECIMAL(5,2) DEFAULT 0,
  
  -- Purchase Behavior
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  days_since_last_order INTEGER,
  preferred_category VARCHAR(100),
  preferred_payment_method VARCHAR(50),
  
  -- Dates
  first_purchase_date TIMESTAMP WITH TIME ZONE,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(customer_id, store_id),
  INDEX idx_customer_analytics_store (store_id),
  INDEX idx_customer_analytics_rfm (rfm_segment),
  INDEX idx_customer_analytics_churn (churn_probability DESC)
);

-- Product Analytics - Advanced product insights
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- View Metrics
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  views_to_cart_rate DECIMAL(5,2) DEFAULT 0,
  cart_to_purchase_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Sales Metrics
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  avg_selling_price DECIMAL(10,2) DEFAULT 0,
  inventory_turnover DECIMAL(5,2) DEFAULT 0,
  
  -- Performance Metrics
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  return_rate DECIMAL(5,2) DEFAULT 0,
  profit_margin DECIMAL(5,2) DEFAULT 0,
  
  -- Trends
  trend_direction VARCHAR(10), -- up, down, stable
  trend_percentage DECIMAL(5,2) DEFAULT 0,
  seasonality_score DECIMAL(5,2) DEFAULT 0,
  
  -- Period
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(product_id, store_id, period_start),
  INDEX idx_product_analytics_store (store_id),
  INDEX idx_product_analytics_revenue (total_revenue DESC),
  INDEX idx_product_analytics_conversion (conversion_rate DESC)
);

-- Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL, -- email, sms, social, paid_ads, etc.
  channel VARCHAR(50) NOT NULL, -- google_ads, facebook_ads, tiktok_ads, email, etc.
  status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, active, paused, completed
  
  -- Targeting
  target_segment_ids UUID[], -- Array of segment IDs
  target_criteria JSONB, -- Additional targeting criteria
  
  -- Campaign Settings
  budget DECIMAL(10,2),
  budget_type VARCHAR(20), -- daily, total, unlimited
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Content
  subject_line VARCHAR(200),
  content_template_id UUID,
  content_data JSONB, -- Template variables
  
  -- Tracking
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  
  -- Results
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  cost_spent DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_marketing_campaigns_store (store_id),
  INDEX idx_marketing_campaigns_status (status),
  INDEX idx_marketing_campaigns_type (campaign_type)
);

-- Attribution Models - Multi-touch attribution
CREATE TABLE IF NOT EXISTS attribution_touchpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  session_id VARCHAR(100),
  
  -- Touchpoint Details
  channel VARCHAR(50) NOT NULL, -- organic, paid_search, social, email, etc.
  source VARCHAR(100), -- google, facebook, tiktok, email_campaign_123, etc.
  medium VARCHAR(50), -- cpc, organic, email, social, etc.
  campaign VARCHAR(100),
  content VARCHAR(100),
  term VARCHAR(100),
  
  -- Attribution Data
  position_in_journey INTEGER, -- 1st touch, 2nd touch, etc.
  time_to_conversion INTEGER, -- Minutes to conversion (if applicable)
  value_contribution DECIMAL(10,2) DEFAULT 0, -- Attributed value
  attribution_model VARCHAR(20), -- first_touch, last_touch, linear, time_decay
  
  -- Conversion Info (if this was converting touchpoint)
  converted BOOLEAN DEFAULT false,
  order_id UUID REFERENCES orders(id),
  conversion_value DECIMAL(10,2) DEFAULT 0,
  
  touched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_attribution_store_customer (store_id, customer_id),
  INDEX idx_attribution_channel (channel),
  INDEX idx_attribution_conversion (converted, touched_at)
);

-- Enable Row Level Security
ALTER TABLE store_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_touchpoints ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Store owners can only access their own data
CREATE POLICY "Store owners can manage their integrations" ON store_integrations
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can access their analytics events" ON analytics_events
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can manage their segments" ON customer_segments
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can access segment memberships" ON customer_segment_memberships
  FOR ALL USING (
    segment_id IN (
      SELECT id FROM customer_segments WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Store owners can access customer analytics" ON customer_analytics
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can access product analytics" ON product_analytics
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can manage their campaigns" ON marketing_campaigns
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can access their attribution data" ON attribution_touchpoints
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );