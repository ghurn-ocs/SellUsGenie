-- Migration to fix header and footer pages to use proper layout widgets
-- This replaces regular widgets (text, navigation) with specialized layout widgets (header-layout, footer-layout)
-- that dynamically render content based on Supabase store settings

-- Fix Header Pages: Replace regular widgets with header-layout widget
UPDATE page_documents 
SET sections = '[
  {
    "id": "header-section-1",
    "backgroundColor": "#ffffff",
    "padding": "py-0 px-0",
    "rows": [
      {
        "id": "header-row-1",
        "widgets": [
          {
            "id": "header-layout-widget",
            "type": "header-layout",
            "colSpan": {
              "sm": 12,
              "md": 12,
              "lg": 12
            },
            "props": {
              "layout": "logo-left",
              "height": "standard",
              "logo": {
                "type": "text",
                "text": null,
                "position": "left",
                "size": "medium"
              },
              "navigation": {
                "enabled": true,
                "position": "center",
                "style": "horizontal",
                "links": [
                  {
                    "id": "1",
                    "label": "Home",
                    "href": "/",
                    "type": "internal"
                  },
                  {
                    "id": "2",
                    "label": "Shop",
                    "href": "/products",
                    "type": "internal"
                  },
                  {
                    "id": "3",
                    "label": "About",
                    "href": "/about",
                    "type": "internal"
                  },
                  {
                    "id": "4",
                    "label": "Contact",
                    "href": "/contact",
                    "type": "internal"
                  }
                ],
                "autoDetectPages": false
              },
              "cart": {
                "enabled": true,
                "position": "right",
                "style": "icon",
                "showCount": true,
                "behavior": "sidebar"
              },
              "styling": {
                "backgroundColor": "#ffffff",
                "textColor": "#1f2937",
                "linkColor": "#0066cc",
                "linkHoverColor": "#004499",
                "borderBottom": true,
                "sticky": false,
                "shadow": "sm"
              },
              "responsive": {
                "mobile": {
                  "showLogo": true,
                  "showNavigation": true,
                  "navigationStyle": "hamburger",
                  "showCart": true
                },
                "tablet": {
                  "showLogo": true,
                  "showNavigation": true,
                  "showCart": true
                }
              }
            }
          }
        ]
      }
    ]
  }
]'::jsonb,
updated_at = now()
WHERE page_type = 'header' 
  AND system_page_type = 'header';

-- Fix Footer Pages: Replace regular widgets with footer-layout widget
UPDATE page_documents 
SET sections = '[
  {
    "id": "footer-section-1",
    "backgroundColor": "#f8f9fa",
    "padding": "py-12 px-4",
    "rows": [
      {
        "id": "footer-row-1",
        "widgets": [
          {
            "id": "footer-layout-widget",
            "type": "footer-layout",
            "colSpan": {
              "sm": 12,
              "md": 12,
              "lg": 12
            },
            "props": {
              "layout": "three-column",
              "company": {
                "name": null,
                "description": null,
                "logo": {
                  "showText": true
                }
              },
              "contact": {
                "enabled": false,
                "email": null,
                "phone": null,
                "address": null,
                "showIcons": true
              },
              "navigation": {
                "enabled": true,
                "useColumnSystem": true,
                "columns": [
                  {
                    "id": "1",
                    "title": "Shop",
                    "links": [
                      {
                        "id": "1",
                        "label": "All Products",
                        "href": "/products",
                        "type": "internal"
                      },
                      {
                        "id": "2",
                        "label": "Featured",
                        "href": "/featured",
                        "type": "internal"
                      },
                      {
                        "id": "3",
                        "label": "Sale Items",
                        "href": "/sale",
                        "type": "internal"
                      }
                    ]
                  },
                  {
                    "id": "2",
                    "title": "Company",
                    "links": [
                      {
                        "id": "1",
                        "label": "About Us",
                        "href": "/about",
                        "type": "internal"
                      },
                      {
                        "id": "2",
                        "label": "Contact",
                        "href": "/contact",
                        "type": "internal"
                      },
                      {
                        "id": "3",
                        "label": "Careers",
                        "href": "/careers",
                        "type": "internal"
                      }
                    ]
                  }
                ],
                "autoDetectPages": false
              },
              "social": {
                "enabled": false,
                "platforms": [],
                "showLabels": false,
                "position": "bottom"
              },
              "newsletter": {
                "enabled": false,
                "title": null,
                "description": null,
                "placeholder": "Enter your email",
                "buttonText": "Subscribe"
              },
              "legal": {
                "enabled": true,
                "links": [
                  {
                    "id": "1",
                    "label": "Privacy Policy",
                    "href": "/privacy"
                  },
                  {
                    "id": "2",
                    "label": "Terms of Service",
                    "href": "/terms"
                  },
                  {
                    "id": "3",
                    "label": "Cookie Policy",
                    "href": "/cookies"
                  }
                ],
                "showYear": true
              },
              "styling": {
                "backgroundColor": "#f8f9fa",
                "textColor": "#000000",
                "linkColor": "#0066cc",
                "linkHoverColor": "#004499",
                "borderTop": true,
                "padding": "standard"
              },
              "responsive": {
                "mobile": {
                  "layout": "stacked",
                  "showAllSections": true
                }
              }
            }
          }
        ]
      }
    ]
  }
]'::jsonb,
updated_at = now()
WHERE page_type = 'footer' 
  AND system_page_type = 'footer';

-- Log the migration results
SELECT 
  'Header pages updated: ' || count(*) as migration_result
FROM page_documents 
WHERE page_type = 'header' 
  AND system_page_type = 'header'
  AND sections::text LIKE '%header-layout%';

SELECT 
  'Footer pages updated: ' || count(*) as migration_result  
FROM page_documents 
WHERE page_type = 'footer' 
  AND system_page_type = 'footer'
  AND sections::text LIKE '%footer-layout%';

-- Verify the migration worked by checking widget types
SELECT 
  pd.store_id,
  pd.page_type,
  pd.system_page_type,
  jsonb_path_query_array(sections, '$[*].rows[*].widgets[*].type') as widget_types
FROM page_documents pd
WHERE system_page_type IN ('header', 'footer')
ORDER BY pd.store_id, pd.page_type;