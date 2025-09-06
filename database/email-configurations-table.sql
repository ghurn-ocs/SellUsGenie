-- Email Configurations Table
-- Stores SMTP settings for each store to enable email functionality

-- Create email_configurations table
CREATE TABLE IF NOT EXISTS email_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  smtp_host VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com',
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_secure BOOLEAN NOT NULL DEFAULT false,
  smtp_username VARCHAR(255) NOT NULL,
  smtp_password TEXT NOT NULL, -- Encrypted password/app password
  from_name VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  test_result VARCHAR(50), -- 'success', 'failed', or error message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_configurations_store_id ON email_configurations(store_id);
CREATE INDEX IF NOT EXISTS idx_email_configurations_active ON email_configurations(store_id, is_active) WHERE is_active = true;

-- Row Level Security (RLS)
ALTER TABLE email_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access configurations for stores they own
CREATE POLICY email_configurations_isolation_policy ON email_configurations
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
GRANT ALL ON email_configurations TO authenticated;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS email_configurations_updated_at_trigger ON email_configurations;
CREATE TRIGGER email_configurations_updated_at_trigger
  BEFORE UPDATE ON email_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_email_configurations_updated_at();

-- Comments for documentation
COMMENT ON TABLE email_configurations IS 'Stores SMTP configuration settings for each store to enable email functionality';
COMMENT ON COLUMN email_configurations.smtp_password IS 'Encrypted SMTP password or Gmail app password';
COMMENT ON COLUMN email_configurations.test_result IS 'Result of the last connection test: success, failed, or error message';
COMMENT ON COLUMN email_configurations.is_active IS 'Whether this configuration is currently active and should be used for sending emails';