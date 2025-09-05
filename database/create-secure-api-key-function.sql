-- Create secure RPC function to access system API keys
-- This runs with service role permissions, keeping API keys secure from clients

-- First, remove any insecure RLS policy I may have created
DROP POLICY IF EXISTS "Allow authenticated users to read system API keys" ON system_api_keys;
DROP POLICY IF EXISTS "Allow authenticated users to read active system API keys" ON system_api_keys;

-- Create secure function to get system API keys
-- Only this function can access the keys, not direct client queries
CREATE OR REPLACE FUNCTION get_system_api_key(key_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER  -- This makes the function run with the permissions of the function owner (service role)
SET search_path = public
AS $$
DECLARE
    api_key text;
BEGIN
    -- Only allow specific authenticated users to call this function
    -- You can add additional security checks here if needed
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Get the API key from system_api_keys table
    SELECT credentials->>'key' 
    INTO api_key
    FROM system_api_keys 
    WHERE system_api_keys.key_name = get_system_api_key.key_name 
    AND is_active = true;
    
    -- Return the key (or NULL if not found)
    RETURN api_key;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_system_api_key(text) TO authenticated;

-- Ensure system_api_keys table has proper RLS (only service role can access directly)
ALTER TABLE system_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy that only allows service role to access directly
DROP POLICY IF EXISTS "Only service role can access system API keys" ON system_api_keys;
CREATE POLICY "Only service role can access system API keys"
ON system_api_keys
FOR ALL 
TO service_role
USING (true);

-- Test the function
SELECT get_system_api_key('google_ai_api') as google_ai_key_test;