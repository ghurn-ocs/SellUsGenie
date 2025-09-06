-- Analytics Configurations Table
-- Stores Google Analytics 4 and other analytics platform settings for each store

-- Create analytics_configurations table
CREATE TABLE IF NOT EXISTS analytics_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'google_analytics_4', 'meta_pixel', 'google_ads', 'tiktok_pixel'
  tracking_id VARCHAR(255) NOT NULL, -- GA4 Measurement ID (G-XXXXXXXXXX), Pixel ID, etc.
  configuration JSONB, -- Platform-specific settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  test_result VARCHAR(50), -- 'success', 'failed', or error message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active configuration per platform per store
  CONSTRAINT unique_active_platform_per_store UNIQUE(store_id, platform)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_configurations_store_id ON analytics_configurations(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_configurations_platform ON analytics_configurations(store_id, platform);
CREATE INDEX IF NOT EXISTS idx_analytics_configurations_active ON analytics_configurations(store_id, platform, is_active) WHERE is_active = true;

-- Row Level Security (RLS)
ALTER TABLE analytics_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access configurations for stores they own
CREATE POLICY analytics_configurations_isolation_policy ON analytics_configurations
  USING (
    store_id IN (
      SELECT id FROM stores 
      WHERE store_owner_id = auth.uid()
    )
  )
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores 
      WHERE store_owner_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON analytics_configurations TO authenticated;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_analytics_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS analytics_configurations_updated_at_trigger ON analytics_configurations;
CREATE TRIGGER analytics_configurations_updated_at_trigger
  BEFORE UPDATE ON analytics_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_configurations_updated_at();

-- Comments for documentation
COMMENT ON TABLE analytics_configurations IS 'Stores analytics platform configuration settings for each store';
COMMENT ON COLUMN analytics_configurations.platform IS 'Analytics platform type: google_analytics_4, meta_pixel, google_ads, tiktok_pixel';
COMMENT ON COLUMN analytics_configurations.tracking_id IS 'Platform-specific tracking ID (GA4 Measurement ID, Pixel ID, etc.)';
COMMENT ON COLUMN analytics_configurations.configuration IS 'Platform-specific settings as JSON (conversion tracking, enhanced ecommerce, etc.)';
COMMENT ON COLUMN analytics_configurations.test_result IS 'Result of the last integration test: success, failed, or error message';