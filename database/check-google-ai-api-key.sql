-- Check system_api_keys table for Google AI API key
-- This will help us find the correct key_name and verify the key exists

-- First, check the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'system_api_keys' 
ORDER BY ordinal_position;

-- Check all active system API keys to see what's available
SELECT key_name, key_type, provider, is_active, description, created_at
FROM system_api_keys 
WHERE is_active = true
ORDER BY key_name;

-- Look for any Google-related API keys
SELECT key_name, key_type, provider, is_active, description, 
       CASE 
         WHEN credentials IS NOT NULL THEN 'Has credentials'
         ELSE 'No credentials'
       END as credentials_status
FROM system_api_keys 
WHERE key_name ILIKE '%google%' 
   OR key_name ILIKE '%ai%' 
   OR key_name ILIKE '%gemini%'
   OR provider ILIKE '%google%'
ORDER BY key_name;

-- Check specifically for google_ai_api key
SELECT key_name, key_type, provider, is_active, description,
       credentials,
       config,
       created_at, updated_at
FROM system_api_keys 
WHERE key_name = 'google_ai_api';

-- If no exact match, look for similar variations
SELECT key_name, key_type, provider, is_active, description,
       CASE 
         WHEN credentials ? 'key' THEN 'Has key field'
         WHEN credentials ? 'api_key' THEN 'Has api_key field'
         WHEN credentials ? 'apiKey' THEN 'Has apiKey field'
         ELSE 'No key field found'
       END as key_field_status
FROM system_api_keys 
WHERE key_name ILIKE '%google%ai%' 
   OR key_name ILIKE '%ai%api%'
   OR key_name ILIKE '%generative%'
ORDER BY key_name;