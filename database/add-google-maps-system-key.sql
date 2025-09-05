-- Add Google Maps API key to system_api_keys table
-- Key: AIzaSyBwEqllmtwJEmjvYdazL9PX6yqlkfPEwSk

-- Insert the Google Maps API key
INSERT INTO system_api_keys (
    key_name,
    key_type,
    provider,
    credentials,
    config,
    is_active,
    description
) VALUES (
    'system_google_maps_key',
    'api_key',
    'google',
    '{"key": "AIzaSyBwEqllmtwJEmjvYdazL9PX6yqlkfPEwSk"}',
    '{}',
    true,
    'System-wide Google Maps API key for delivery areas and location services'
) ON CONFLICT (key_name) DO UPDATE SET
    credentials = EXCLUDED.credentials,
    updated_at = now(),
    is_active = true;

-- Test that the key was added correctly
SELECT key_name, key_type, provider, is_active, description,
       credentials->>'key' as stored_key
FROM system_api_keys 
WHERE key_name = 'system_google_maps_key';

-- Test the secure RPC function
SELECT get_system_api_key('system_google_maps_key') as google_maps_key_test;