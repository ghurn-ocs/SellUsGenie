-- System Settings Table for Secure API Key Storage
-- Run this in your Supabase SQL Editor

-- Create system_settings table for secure key storage
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy (only service role can access)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows service role and authenticated users to read
CREATE POLICY "Service role full access" ON system_settings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read system settings (for API keys)
CREATE POLICY "Authenticated users read access" ON system_settings
  FOR SELECT TO authenticated
  USING (true);

-- Insert Google Cloud API key
INSERT INTO system_settings (key, value, description) 
VALUES (
  'google_cloud_api_key',
  'AIzaSyBwEqllmtwJEmjvYdazL9PX6yqlkfPEwSk',
  'Google Cloud AI API key for policy generation'
) ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Create index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON system_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
SELECT key, description, created_at FROM system_settings WHERE key = 'google_cloud_api_key';