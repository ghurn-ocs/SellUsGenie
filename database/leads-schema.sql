-- Leads Management Schema
-- Stores newsletter subscribers and potential customers

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  source VARCHAR(50) DEFAULT 'newsletter_widget', -- newsletter_widget, contact_form, manual, import, etc.
  status VARCHAR(20) DEFAULT 'subscribed', -- subscribed, unsubscribed, bounced, complained
  subscribed_to_newsletter BOOLEAN DEFAULT true,
  tags TEXT[], -- Array of tags for segmentation
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  -- Tracking fields
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  -- Consent and privacy
  consent_given BOOLEAN DEFAULT true,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  double_opt_in BOOLEAN DEFAULT false,
  double_opt_in_date TIMESTAMP WITH TIME ZONE,
  -- Unsubscribe
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  unsubscribe_reason TEXT,
  
  UNIQUE(store_id, email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_store_id ON leads(store_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_subscribed ON leads(subscribed_to_newsletter);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_last_activity ON leads(last_activity_at);

-- Create composite indexes
CREATE INDEX IF NOT EXISTS idx_leads_store_status ON leads(store_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_store_subscribed ON leads(store_id, subscribed_to_newsletter);

-- RLS Policies for leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their own leads
CREATE POLICY "Store owners can view their leads"
  ON leads
  FOR SELECT
  USING (
    store_id IN (
      SELECT s.id FROM stores s 
      WHERE s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can insert their leads"
  ON leads
  FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT s.id FROM stores s 
      WHERE s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their leads"
  ON leads
  FOR UPDATE
  USING (
    store_id IN (
      SELECT s.id FROM stores s 
      WHERE s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete their leads"
  ON leads
  FOR DELETE
  USING (
    store_id IN (
      SELECT s.id FROM stores s 
      WHERE s.owner_id = auth.uid()
    )
  );

-- Allow public access for subscription (storefront widgets)
-- This policy allows anyone to insert leads for newsletter subscription
CREATE POLICY "Public can subscribe to newsletters"
  ON leads
  FOR INSERT
  WITH CHECK (
    source = 'newsletter_widget'
    AND status = 'subscribed'
    AND subscribed_to_newsletter = true
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Create lead activity tracking function
CREATE OR REPLACE FUNCTION update_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity_at when lead is modified
  IF TG_OP = 'UPDATE' AND (
    OLD.email != NEW.email OR
    OLD.subscribed_to_newsletter != NEW.subscribed_to_newsletter OR
    OLD.status != NEW.status
  ) THEN
    NEW.last_activity_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_activity
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_activity();

-- Create lead statistics view for store owners
CREATE OR REPLACE VIEW lead_statistics AS
SELECT 
  store_id,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE subscribed_to_newsletter = true) as subscribed_leads,
  COUNT(*) FILTER (WHERE status = 'subscribed') as active_leads,
  COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_leads,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as leads_last_30_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as leads_last_7_days,
  MAX(created_at) as latest_lead_date,
  -- Source breakdown
  COUNT(*) FILTER (WHERE source = 'newsletter_widget') as newsletter_widget_leads,
  COUNT(*) FILTER (WHERE source = 'contact_form') as contact_form_leads,
  COUNT(*) FILTER (WHERE source = 'manual') as manual_leads
FROM leads
GROUP BY store_id;

-- Grant permissions on the view
GRANT SELECT ON lead_statistics TO authenticated;

-- RLS for the view
ALTER VIEW lead_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view their lead statistics"
  ON lead_statistics
  FOR SELECT
  USING (
    store_id IN (
      SELECT s.id FROM stores s 
      WHERE s.owner_id = auth.uid()
    )
  );