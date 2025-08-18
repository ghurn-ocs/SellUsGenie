-- Create Stripe Configurations Table
-- This table stores Stripe API configuration for each store

CREATE TABLE IF NOT EXISTS stripe_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  stripe_publishable_key TEXT,
  stripe_secret_key TEXT, -- This should be encrypted in production
  webhook_endpoint_id TEXT,
  webhook_endpoint_url TEXT,
  webhook_secret TEXT, -- This should be encrypted in production
  is_configured BOOLEAN DEFAULT false,
  is_live_mode BOOLEAN DEFAULT false,
  test_mode_configured BOOLEAN DEFAULT false,
  live_mode_configured BOOLEAN DEFAULT false,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one configuration per store
  UNIQUE(store_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_configurations_store_id ON stripe_configurations(store_id);
CREATE INDEX IF NOT EXISTS idx_stripe_configurations_is_configured ON stripe_configurations(is_configured);

-- Enable Row Level Security
ALTER TABLE stripe_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing first)
DROP POLICY IF EXISTS "Store owners can manage own store stripe config" ON stripe_configurations;
DROP POLICY IF EXISTS "Service role can manage all stripe configs" ON stripe_configurations;

CREATE POLICY "Store owners can manage own store stripe config" ON stripe_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = stripe_configurations.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all stripe configs" ON stripe_configurations
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON stripe_configurations TO authenticated;
GRANT ALL ON stripe_configurations TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Stripe configurations table created successfully! This will fix slow loading in Settings.';
END $$;