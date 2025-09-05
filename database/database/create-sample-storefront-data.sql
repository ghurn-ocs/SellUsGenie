-- Create Sample Storefront Data for Testing
-- This script creates minimal test data needed to verify storefront functionality

-- First, let's check if we have any existing stores
-- If running in production, don't run this - only for development/testing

-- 1. Create a sample store owner if none exists
INSERT INTO store_owners (id, email, full_name, created_at) 
VALUES (
  'sample-owner-123e4567-e89b-12d3-a456-426614174000', 
  'test@sellusgenie.dev', 
  'Test Store Owner', 
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create sample store for testing
INSERT INTO stores (
  id, 
  store_name, 
  store_slug, 
  store_owner_id, 
  is_active, 
  subscription_status,
  store_logo_url,
  created_at
) VALUES (
  'sample-store-123e4567-e89b-12d3-a456-426614174001', 
  'Testing My Store', 
  'testingmy', 
  'sample-owner-123e4567-e89b-12d3-a456-426614174000',
  true,
  'active',
  NULL,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Create sample header page with basic content
INSERT INTO page_documents (
  id,
  store_id,
  name,
  slug,
  page_type,
  system_page_type,
  status,
  sections,
  theme_overrides,
  navigation_placement,
  created_at,
  updated_at,
  published_at
) VALUES (
  'header-123e4567-e89b-12d3-a456-426614174002',
  'sample-store-123e4567-e89b-12d3-a456-426614174001',
  'Site Header',
  'header',
  'header',
  'header',
  'published',
  '[
    {
      "id": "header-section-1",
      "backgroundColor": "#ffffff",
      "padding": "py-4 px-6",
      "rows": [
        {
          "id": "header-row-1",
          "widgets": [
            {
              "id": "header-text-1",
              "type": "text",
              "colSpan": {"sm": 12, "md": 12, "lg": 12},
              "props": {
                "content": "<h1>{{store_name}}</h1>",
                "allowHtml": true,
                "fontSize": "2xl",
                "fontWeight": "bold",
                "color": "text-gray-900",
                "textAlign": "center"
              }
            }
          ]
        }
      ]
    }
  ]'::jsonb,
  '{
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937",
    "linkColor": "#6b7280",
    "linkHoverColor": "#1f2937",
    "navLinkStyle": "text",
    "buttonStyle": "rounded",
    "horizontalSpacing": "standard"
  }'::jsonb,
  'none',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Create sample footer page
INSERT INTO page_documents (
  id,
  store_id,
  name,
  slug,
  page_type,
  system_page_type,
  status,
  sections,
  theme_overrides,
  navigation_placement,
  created_at,
  updated_at,
  published_at
) VALUES (
  'footer-123e4567-e89b-12d3-a456-426614174003',
  'sample-store-123e4567-e89b-12d3-a456-426614174001',
  'Site Footer',
  'footer',
  'footer',
  'footer',
  'published',
  '[
    {
      "id": "footer-section-1",
      "backgroundColor": "#f9fafb",
      "padding": "py-8 px-6",
      "rows": [
        {
          "id": "footer-row-1",
          "widgets": [
            {
              "id": "footer-text-1",
              "type": "text",
              "colSpan": {"sm": 12, "md": 12, "lg": 12},
              "props": {
                "content": "<p>&copy; 2024 {{store_name}}. All rights reserved.</p>",
                "allowHtml": true,
                "fontSize": "sm",
                "fontWeight": "normal",
                "color": "text-gray-600",
                "textAlign": "center"
              }
            }
          ]
        }
      ]
    }
  ]'::jsonb,
  '{
    "backgroundColor": "#f9fafb",
    "textColor": "#6b7280",
    "linkColor": "#9ca3af",
    "linkHoverColor": "#4b5563",
    "horizontalSpacing": "standard"
  }'::jsonb,
  'none',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Create sample home page
INSERT INTO page_documents (
  id,
  store_id,
  name,
  slug,
  page_type,
  status,
  sections,
  theme_overrides,
  navigation_placement,
  created_at,
  updated_at,
  published_at
) VALUES (
  'home-123e4567-e89b-12d3-a456-426614174004',
  'sample-store-123e4567-e89b-12d3-a456-426614174001',
  'Home',
  '/',
  'page',
  'published',
  '[
    {
      "id": "home-section-1",
      "backgroundColor": "#ffffff",
      "padding": "py-16 px-6",
      "rows": [
        {
          "id": "home-row-1",
          "widgets": [
            {
              "id": "home-hero-1",
              "type": "text",
              "colSpan": {"sm": 12, "md": 12, "lg": 12},
              "props": {
                "content": "<div class=\"text-center\"><h1 class=\"text-4xl font-bold mb-6\">Welcome to {{store_name}}</h1><p class=\"text-xl text-gray-600 mb-8\">Your premier online shopping destination</p><a href=\"#products\" class=\"bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors\">Shop Now</a></div>",
                "allowHtml": true,
                "fontSize": "base",
                "fontWeight": "normal",
                "color": "text-gray-900",
                "textAlign": "left"
              }
            }
          ]
        }
      ]
    }
  ]'::jsonb,
  '{}'::jsonb,
  'header',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. Create sample about page for navigation testing
INSERT INTO page_documents (
  id,
  store_id,
  name,
  slug,
  page_type,
  status,
  sections,
  theme_overrides,
  navigation_placement,
  created_at,
  updated_at,
  published_at
) VALUES (
  'about-123e4567-e89b-12d3-a456-426614174005',
  'sample-store-123e4567-e89b-12d3-a456-426614174001',
  'About Us',
  'about',
  'page',
  'published',
  '[
    {
      "id": "about-section-1",
      "backgroundColor": "#ffffff",
      "padding": "py-16 px-6",
      "rows": [
        {
          "id": "about-row-1",
          "widgets": [
            {
              "id": "about-text-1",
              "type": "text",
              "colSpan": {"sm": 12, "md": 12, "lg": 12},
              "props": {
                "content": "<div class=\"max-w-3xl mx-auto\"><h1 class=\"text-3xl font-bold mb-6\">About {{store_name}}</h1><p class=\"text-lg text-gray-600 mb-4\">We are a premier e-commerce store dedicated to providing high-quality products and exceptional customer service.</p><p class=\"text-lg text-gray-600\">Our mission is to make online shopping simple, secure, and enjoyable for everyone.</p></div>",
                "allowHtml": true,
                "fontSize": "base",
                "fontWeight": "normal",
                "color": "text-gray-900",
                "textAlign": "left"
              }
            }
          ]
        }
      ]
    }
  ]'::jsonb,
  '{}'::jsonb,
  'both',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verification queries
SELECT 'Sample data created successfully!' as status;

SELECT 'Store Info:' as info, store_name, store_slug, is_active 
FROM stores 
WHERE store_slug = 'testingmy';

SELECT 'Page Count:' as info, COUNT(*) as page_count, 
       string_agg(name, ', ') as page_names
FROM page_documents 
WHERE store_id = 'sample-store-123e4567-e89b-12d3-a456-426614174001';