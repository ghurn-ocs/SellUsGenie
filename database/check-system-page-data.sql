-- Check System Page Data
-- Query to see what system page metadata is actually stored

SELECT 
    name,
    "isSystemPage",
    "systemPageType", 
    "editingRestrictions",
    status,
    created_at
FROM page_documents 
WHERE name IN ('About Us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Returns')
ORDER BY name;

-- Also check if the columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'page_documents' 
AND column_name IN ('isSystemPage', 'systemPageType', 'editingRestrictions')
ORDER BY column_name;