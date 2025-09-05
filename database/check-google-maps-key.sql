-- Check what Google Maps API key exists in system_api_keys table

-- Look for Google Maps related keys
SELECT key_name, key_type, provider, is_active, description
FROM system_api_keys 
WHERE key_name ILIKE '%google%maps%' 
   OR key_name ILIKE '%maps%'
   OR provider ILIKE '%google%'
ORDER BY key_name;

-- Test the function with different possible names
SELECT 
    'system_google_maps_key' as key_name_tested,
    get_system_api_key('system_google_maps_key') as result;
    
SELECT 
    'google_maps_api_key' as key_name_tested,
    get_system_api_key('google_maps_api_key') as result;