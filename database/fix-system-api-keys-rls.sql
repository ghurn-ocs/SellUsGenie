-- Fix RLS policy for system_api_keys table
-- Allow authenticated users to read system API keys

-- First check current policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'system_api_keys';

-- Create policy to allow authenticated users to read system API keys
-- This is safe because these are platform-wide API keys needed by the application
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read system API keys"
ON system_api_keys
FOR SELECT 
TO authenticated
USING (true);

-- Alternative: More restrictive policy that only allows reading active keys
-- DROP POLICY IF EXISTS "Allow authenticated users to read system API keys" ON system_api_keys;
-- CREATE POLICY "Allow authenticated users to read active system API keys"
-- ON system_api_keys
-- FOR SELECT 
-- TO authenticated
-- USING (is_active = true);

-- Verify the policy was created
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'system_api_keys';

-- Test access after policy creation
SELECT key_name, is_active, 
       CASE WHEN credentials IS NOT NULL THEN 'Accessible' ELSE 'No access' END
FROM system_api_keys 
WHERE key_name = 'google_ai_api';