-- Verify the Google AI API key stored in database
-- Check if it matches: AIzaSyDDeMbqeQW9mi8GeaapaExmGYugsAnrme8

SELECT 
    key_name,
    is_active,
    credentials->>'key' AS stored_api_key,
    CASE 
        WHEN credentials->>'key' = 'AIzaSyDDeMbqeQW9mi8GeaapaExmGYugsAnrme8' 
        THEN '✅ MATCHES PROVIDED KEY'
        ELSE '❌ DOES NOT MATCH - Key: ' || COALESCE(credentials->>'key', 'NULL')
    END AS key_verification,
    created_at,
    updated_at
FROM system_api_keys 
WHERE key_name = 'google_ai_api' 
AND is_active = true;

-- Also check all possible credential field variations
SELECT 
    key_name,
    credentials->>'key' AS key_field,
    credentials->>'api_key' AS api_key_field,
    credentials->>'apiKey' AS apiKey_field,
    credentials AS full_credentials
FROM system_api_keys 
WHERE key_name = 'google_ai_api';