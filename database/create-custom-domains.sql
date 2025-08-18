-- Custom Domains Table
-- Manages custom domain configurations for stores

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL, -- e.g., "mystore.com"
  subdomain TEXT, -- Optional subdomain, e.g., "shop" for "shop.mystore.com"
  full_domain TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN subdomain IS NOT NULL THEN subdomain || '.' || domain_name
      ELSE domain_name
    END
  ) STORED,
  
  -- Domain verification
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'failed')) DEFAULT 'pending',
  verification_token TEXT, -- DNS TXT record value for verification
  verification_method TEXT CHECK (verification_method IN ('dns_txt', 'dns_cname')) DEFAULT 'dns_txt',
  verified_at TIMESTAMPTZ,
  
  -- SSL Certificate
  ssl_status TEXT CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')) DEFAULT 'pending',
  ssl_issued_at TIMESTAMPTZ,
  ssl_expires_at TIMESTAMPTZ,
  
  -- DNS Configuration
  dns_configured BOOLEAN DEFAULT false,
  dns_target TEXT, -- The target domain/IP for DNS pointing
  dns_instructions JSONB DEFAULT '{}', -- Detailed DNS setup instructions
  
  -- Status and Metadata
  is_active BOOLEAN DEFAULT false, -- Whether domain is currently serving traffic
  is_primary BOOLEAN DEFAULT false, -- Primary domain for the store
  redirect_to_https BOOLEAN DEFAULT true,
  redirect_www BOOLEAN DEFAULT true, -- Redirect www to non-www
  
  -- Performance and Analytics
  last_checked_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(store_id, domain_name), -- Prevent duplicate domains for same store
  UNIQUE(full_domain) -- Global uniqueness across all stores
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_domains_store_id ON custom_domains(store_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_full_domain ON custom_domains(full_domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_verification_status ON custom_domains(verification_status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_is_active ON custom_domains(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_domains_is_primary ON custom_domains(is_primary);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_domains_updated_at
    BEFORE UPDATE ON custom_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_domains_updated_at();

-- Enable Row Level Security
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Store owners can manage own store domains" ON custom_domains;
DROP POLICY IF EXISTS "Service role can manage all domains" ON custom_domains;

CREATE POLICY "Store owners can manage own store domains" ON custom_domains
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = custom_domains.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all domains" ON custom_domains
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON custom_domains TO authenticated;
GRANT ALL ON custom_domains TO service_role;

-- Add custom domain columns to stores table for quick access
ALTER TABLE stores ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS custom_domain_verified BOOLEAN DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS custom_domain_ssl_enabled BOOLEAN DEFAULT false;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Custom domains table created successfully!';
END $$;