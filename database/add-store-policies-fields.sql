-- Add terms_policy field to store_policies table
-- This script adds the Terms & Conditions policy field to store policies

-- Add the terms_policy column to store_policies table
ALTER TABLE store_policies 
ADD COLUMN IF NOT EXISTS terms_policy TEXT;

-- Update the updated_at column to track when this change was made
UPDATE store_policies 
SET updated_at = NOW() 
WHERE terms_policy IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN store_policies.terms_policy IS 'Terms and conditions policy content for the store';