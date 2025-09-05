-- Check RLS policies on system_api_keys table
-- This might be blocking access to the Google AI API key

-- Check if RLS is enabled on the table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'system_api_keys';

-- Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'system_api_keys'
ORDER BY policyname;

-- Test if we can actually access the key directly
SELECT key_name, is_active, provider,
       CASE 
           WHEN credentials IS NOT NULL THEN 'Has credentials'
           ELSE 'No credentials'
       END as credentials_status
FROM system_api_keys 
WHERE key_name = 'google_ai_api';

-- Check what user context the query runs under
SELECT current_user, session_user;