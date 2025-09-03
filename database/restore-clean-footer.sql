-- Restore Clean Footer for Testingmy Store
-- Creates a new footer without hardcoded colors and with proper dynamic content

INSERT INTO page_documents (
  store_id,
  name,
  slug,
  status,
  sections,
  theme_overrides,
  created_at,
  updated_at
) VALUES (
  '638ef028-7752-4996-9aae-878d896734fc',
  'Site Footer',
  'site-footer',
  'published',
  '[{
    "id": "19d1b26a-6454-44df-a811-1a0b0e49e62c",
    "title": "Footer Section",
    "padding": "py-0 px-0",
    "rows": [{
      "id": "3fada28b-2f88-4757-82c6-2ba929e09224",
      "widgets": [{
        "id": "e9276049-2797-4a39-b29b-be99533f02d5",
        "type": "text",
        "version": 1,
        "colSpan": {"sm": 12, "md": 12, "lg": 12},
        "props": {
          "content": "<div class=\"py-8\"><div class=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\"><div class=\"grid grid-cols-1 md:grid-cols-3 gap-8\"><div><h3 class=\"text-lg font-semibold mb-4\">Testingmy</h3><p class=\"opacity-75\">{{store_description}}</p></div><div><h4 class=\"text-lg font-semibold mb-4\">Quick Links</h4><ul class=\"space-y-2\"><li><a href=\"/about\" class=\"opacity-75 hover:opacity-100\">About Us</a></li><li><a href=\"/contact\" class=\"opacity-75 hover:opacity-100\">Contact</a></li><li><a href=\"/privacy\" class=\"opacity-75 hover:opacity-100\">Privacy Policy</a></li><li><a href=\"/terms\" class=\"opacity-75 hover:opacity-100\">Terms & Conditions</a></li></ul></div><div><h4 class=\"text-lg font-semibold mb-4\">Contact Info</h4><p class=\"opacity-75\">{{contact_info}}</p></div></div><div class=\"border-t pt-6 mt-6 text-center border-opacity-25\"><p class=\"opacity-75\">© {{current_year}} All rights reserved.</p></div></div></div>",
          "allowHtml": true,
          "textAlign": "left",
          "fontSize": "base",
          "fontWeight": "normal",
          "lineHeight": "normal",
          "maxWidth": ""
        }
      }]
    }]
  }]',
  '{"useStoreLogo": true, "showLogo": true}',
  NOW(),
  NOW()
);