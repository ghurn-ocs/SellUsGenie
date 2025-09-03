-- Update empty header and footer pages with content
-- Run this in your Supabase SQL Editor

-- Update Site Header with actual content
UPDATE page_documents 
SET sections = '[{
  "id": "header-section-1", 
  "title": "Header Section",
  "padding": "py-0 px-0",
  "rows": [{
    "id": "header-row-1",
    "widgets": [{
      "id": "header-widget-1",
      "type": "text",
      "version": 1,
      "colSpan": {"sm": 12, "md": 12, "lg": 12},
      "props": {
        "content": "<div class=\"bg-white shadow-sm border-b border-gray-200\"><div class=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\"><div class=\"flex justify-between items-center py-4\"><div class=\"flex items-center\"><h1 class=\"text-2xl font-bold text-gray-900\">Testing My Store</h1></div><nav class=\"hidden md:flex space-x-8\"><a href=\"/home\" class=\"text-gray-600 hover:text-gray-900 px-3 py-2\">Home</a><a href=\"/about\" class=\"text-gray-600 hover:text-gray-900 px-3 py-2\">About</a><a href=\"/contact\" class=\"text-gray-600 hover:text-gray-900 px-3 py-2\">Contact</a></nav><div class=\"flex items-center space-x-4\"><button class=\"bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700\">Shop Now</button></div></div></div></div>"
      }
    }]
  }]
}]'::jsonb,
updated_at = now()
WHERE name = 'Site Header' 
AND store_id = '638ef028-7752-4996-9aae-878d896734fc';

-- Update Site Footer with actual content  
UPDATE page_documents 
SET sections = '[{
  "id": "footer-section-1",
  "title": "Footer Section", 
  "padding": "py-0 px-0",
  "rows": [{
    "id": "footer-row-1",
    "widgets": [{
      "id": "footer-widget-1", 
      "type": "text",
      "version": 1,
      "colSpan": {"sm": 12, "md": 12, "lg": 12},
      "props": {
        "content": "<div class=\"bg-gray-800 text-white\"><div class=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\"><div class=\"grid grid-cols-1 md:grid-cols-3 gap-8\"><div><h3 class=\"text-lg font-semibold mb-4\">Testing My Store</h3><p class=\"text-gray-300\">Quality products and exceptional service.</p></div><div><h4 class=\"text-lg font-semibold mb-4\">Quick Links</h4><ul class=\"space-y-2\"><li><a href=\"/about\" class=\"text-gray-300 hover:text-white\">About Us</a></li><li><a href=\"/contact\" class=\"text-gray-300 hover:text-white\">Contact</a></li><li><a href=\"/privacy\" class=\"text-gray-300 hover:text-white\">Privacy Policy</a></li><li><a href=\"/terms\" class=\"text-gray-300 hover:text-white\">Terms & Conditions</a></li></ul></div><div><h4 class=\"text-lg font-semibold mb-4\">Contact Info</h4><p class=\"text-gray-300\">Get in touch with us today!</p></div></div><div class=\"border-t border-gray-700 pt-6 mt-6 text-center\"><p class=\"text-gray-300\">&copy; 2024 Testing My Store. All rights reserved.</p></div></div></div>"
      }
    }]
  }]
}]'::jsonb,
updated_at = now()
WHERE name = 'Site Footer' 
AND store_id = '638ef028-7752-4996-9aae-878d896734fc';

-- Verify the updates
SELECT name, jsonb_array_length(sections) as section_count,
       jsonb_array_length(sections->0->'rows') as row_count,
       jsonb_array_length(sections->0->'rows'->0->'widgets') as widget_count
FROM page_documents 
WHERE name IN ('Site Header', 'Site Footer') 
AND store_id = '638ef028-7752-4996-9aae-878d896734fc';
