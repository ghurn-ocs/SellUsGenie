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