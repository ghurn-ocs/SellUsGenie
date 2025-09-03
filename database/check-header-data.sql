-- Check Header Data for Client UID
-- This SQL file queries Supabase to show all header-related data stored for a specific client

-- Replace 'YOUR_CLIENT_UID_HERE' with the actual client UID you want to check
-- You can find your client UID in the browser console or from the auth.users table

SET search_path TO public;

-- 1. Get Store Information for the Client
SELECT 
    'Store Information' as data_type,
    s.id as store_id,
    s.store_name,
    s.store_slug,
    s.store_owner_id,
    s.store_domain,
    s.is_active,
    s.subscription_status,
    s.store_address_line1,
    s.store_city,
    s.store_state,
    s.store_country,
    s.store_phone
FROM stores s
WHERE s.store_owner_id = 'YOUR_CLIENT_UID_HERE'
ORDER BY s.created_at DESC;

-- 2. Get Header Page Document from Visual Page Builder
SELECT 
    'Header Page Document' as data_type,
    pd.id as page_id,
    pd.name as page_name,
    pd.page_type,
    pd.system_page_type,
    pd.status,
    pd.store_id,
    pd.theme_overrides::text as theme_overrides_json,
    pd.sections::text as sections_json,
    pd.created_at,
    pd.updated_at
FROM page_documents pd
JOIN stores s ON pd.store_id = s.id
WHERE s.store_owner_id = 'YOUR_CLIENT_UID_HERE' 
    AND pd.page_type = 'header'
    AND pd.system_page_type = 'header'
ORDER BY pd.updated_at DESC;

-- 3. Extract Theme Overrides for Header (Pretty JSON format)
SELECT 
    'Header Theme Overrides' as data_type,
    pd.name as page_name,
    jsonb_pretty(pd.theme_overrides) as theme_overrides_formatted
FROM page_documents pd
JOIN stores s ON pd.store_id = s.id
WHERE s.store_owner_id = 'YOUR_CLIENT_UID_HERE' 
    AND pd.page_type = 'header'
    AND pd.system_page_type = 'header'
ORDER BY pd.updated_at DESC
LIMIT 1;

-- 4. Check Navigation Link Style Specifically
SELECT 
    'Navigation Link Style Check' as data_type,
    pd.name as page_name,
    pd.theme_overrides->>'navLinkStyle' as nav_link_style,
    pd.theme_overrides->>'buttonStyle' as button_style,
    pd.theme_overrides->>'linkColor' as link_color,
    pd.theme_overrides->>'linkHoverColor' as link_hover_color,
    pd.theme_overrides->>'horizontalSpacing' as horizontal_spacing,
    pd.theme_overrides->>'backgroundColor' as background_color,
    pd.theme_overrides->>'textColor' as text_color
FROM page_documents pd
JOIN stores s ON pd.store_id = s.id
WHERE s.store_owner_id = 'YOUR_CLIENT_UID_HERE' 
    AND pd.page_type = 'header'
    AND pd.system_page_type = 'header'
ORDER BY pd.updated_at DESC
LIMIT 1;

-- 5. Get Published Pages for Navigation (what should appear in header navigation)
SELECT 
    'Published Navigation Pages' as data_type,
    pd.id as page_id,
    pd.name as page_name,
    pd.slug,
    pd.page_type,
    pd.status,
    pd.navigation_placement,
    pd.created_at,
    pd.updated_at
FROM page_documents pd
JOIN stores s ON pd.store_id = s.id
WHERE s.store_owner_id = 'YOUR_CLIENT_UID_HERE' 
    AND pd.status = 'published'
    AND pd.page_type != 'header'
    AND pd.page_type != 'footer'
    AND (pd.navigation_placement = 'header' OR pd.navigation_placement = 'both')
ORDER BY pd.created_at ASC;

-- 6. Check if there are any Header Widgets (Navigation widgets specifically)
SELECT 
    'Header Navigation Widgets' as data_type,
    pd.name as page_name,
    section_data.section_id,
    row_data.row_id,
    widget_data.widget_type,
    widget_data.widget_props::text as widget_props_json
FROM page_documents pd
JOIN stores s ON pd.store_id = s.id
CROSS JOIN LATERAL (
    SELECT 
        section_idx,
        section_value->>'id' as section_id,
        section_value
    FROM jsonb_array_elements(pd.sections) WITH ORDINALITY as t(section_value, section_idx)
) as section_data
CROSS JOIN LATERAL (
    SELECT 
        row_idx,
        row_value->>'id' as row_id,
        row_value
    FROM jsonb_array_elements(section_data.section_value->'rows') WITH ORDINALITY as r(row_value, row_idx)
) as row_data
CROSS JOIN LATERAL (
    SELECT 
        widget_idx,
        widget_value->>'id' as widget_id,
        widget_value->>'type' as widget_type,
        widget_value->'props' as widget_props
    FROM jsonb_array_elements(row_data.row_value->'widgets') WITH ORDINALITY as w(widget_value, widget_idx)
) as widget_data
WHERE s.store_owner_id = 'YOUR_CLIENT_UID_HERE' 
    AND pd.page_type = 'header'
    AND pd.system_page_type = 'header'
    AND widget_data.widget_type = 'navigation'
ORDER BY section_data.section_idx, row_data.row_idx, widget_data.widget_idx;

-- 7. Summary Query - All Key Header Data
SELECT 
    'Header Summary' as data_type,
    s.store_name,
    s.store_slug,
    pd.name as header_page_name,
    pd.status as header_status,
    pd.theme_overrides->>'navLinkStyle' as nav_link_style,
    pd.theme_overrides->>'buttonStyle' as button_style,
    pd.theme_overrides->>'linkColor' as link_color,
    pd.theme_overrides->>'backgroundColor' as bg_color,
    pd.theme_overrides->>'textColor' as text_color,
    pd.theme_overrides->>'horizontalSpacing' as horizontal_spacing,
    (
        SELECT COUNT(*) 
        FROM page_documents nav_pages 
        WHERE nav_pages.store_id = s.id 
            AND nav_pages.status = 'published'
            AND nav_pages.page_type NOT IN ('header', 'footer')
            AND (nav_pages.navigation_placement = 'header' OR nav_pages.navigation_placement = 'both')
    ) as published_nav_pages_count
FROM stores s
LEFT JOIN page_documents pd ON s.id = pd.store_id 
    AND pd.page_type = 'header' 
    AND pd.system_page_type = 'header'
WHERE s.store_owner_id = 'YOUR_CLIENT_UID_HERE'
ORDER BY s.created_at DESC;

-- Instructions:
-- 1. Replace 'YOUR_CLIENT_UID_HERE' with your actual client UID
-- 2. Run each query section to see different aspects of your header data
-- 3. The "Header Summary" query at the bottom gives you a quick overview
-- 4. Look for navLinkStyle - it should show 'bordered' or 'text', not NULL
-- 5. Check that published_nav_pages_count > 0 for navigation to appear