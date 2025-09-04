-- Fix Testingmy Store Content with Proper Store ID
-- Run this AFTER executing add-system-page-columns.sql
-- This creates content for the existing store ID: 638ef028-7752-4996-9aae-878d896734fc

-- Update existing header page for testingmy store
UPDATE page_documents 
SET 
    page_type = 'header',
    system_page_type = 'header',
    navigation_placement = 'none'
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc' 
AND name = 'Site Header';

-- Update existing footer page for testingmy store
UPDATE page_documents 
SET 
    page_type = 'footer',
    system_page_type = 'footer',
    navigation_placement = 'none'
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc' 
AND name = 'Site Footer';

-- Create or update the Home page with actual content
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
    'home-testingmy-' || gen_random_uuid(),
    '638ef028-7752-4996-9aae-878d896734fc',
    'Home Page',
    '/home',
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
                                "content": "<div class=\"text-center\"><h1 class=\"text-4xl font-bold mb-6 text-blue-600\">Welcome to Testingmy Store</h1><p class=\"text-xl text-gray-600 mb-8\">Your premier online shopping destination</p><div class=\"space-x-4\"><a href=\"#products\" class=\"bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block\">Shop Now</a><a href=\"/about\" class=\"border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors inline-block\">Learn More</a></div></div>",
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
        },
        {
            "id": "home-section-2",
            "backgroundColor": "#f9fafb",
            "padding": "py-16 px-6",
            "rows": [
                {
                    "id": "home-row-2",
                    "widgets": [
                        {
                            "id": "home-features-1",
                            "type": "text",
                            "colSpan": {"sm": 12, "md": 12, "lg": 12},
                            "props": {
                                "content": "<div class=\"max-w-4xl mx-auto\"><h2 class=\"text-3xl font-bold text-center mb-12 text-gray-900\">Why Choose Testingmy?</h2><div class=\"grid md:grid-cols-3 gap-8\"><div class=\"text-center\"><div class=\"bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4\"><svg class=\"w-8 h-8 text-blue-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"></path></svg></div><h3 class=\"text-xl font-semibold mb-2\">Quality Products</h3><p class=\"text-gray-600\">Carefully curated selection of high-quality items</p></div><div class=\"text-center\"><div class=\"bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4\"><svg class=\"w-8 h-8 text-green-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1\"></path></svg></div><h3 class=\"text-xl font-semibold mb-2\">Best Prices</h3><p class=\"text-gray-600\">Competitive pricing with regular deals and discounts</p></div><div class=\"text-center\"><div class=\"bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4\"><svg class=\"w-8 h-8 text-purple-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M13 10V3L4 14h7v7l9-11h-7z\"></path></svg></div><h3 class=\"text-xl font-semibold mb-2\">Fast Delivery</h3><p class=\"text-gray-600\">Quick and reliable shipping to your doorstep</p></div></div></div>",
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
) 
ON CONFLICT (id) DO UPDATE SET
    sections = EXCLUDED.sections,
    updated_at = NOW();

-- Create an About page for navigation testing
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
    'about-testingmy-' || gen_random_uuid(),
    '638ef028-7752-4996-9aae-878d896734fc',
    'About Us',
    '/about',
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
                                "content": "<div class=\"max-w-3xl mx-auto\"><h1 class=\"text-3xl font-bold mb-6 text-gray-900\">About Testingmy Store</h1><p class=\"text-lg text-gray-600 mb-6\">Welcome to Testingmy Store, your premier destination for quality products and exceptional service. We are committed to providing an outstanding online shopping experience.</p><h2 class=\"text-2xl font-semibold mb-4 text-gray-800\">Our Mission</h2><p class=\"text-gray-600 mb-6\">To make online shopping simple, secure, and enjoyable while offering the best selection of products at competitive prices.</p><h2 class=\"text-2xl font-semibold mb-4 text-gray-800\">Why Shop With Us?</h2><ul class=\"text-gray-600 space-y-2\"><li>• Curated selection of high-quality products</li><li>• Secure and easy checkout process</li><li>• Fast and reliable shipping</li><li>• Excellent customer service</li><li>• Easy returns and exchanges</li></ul></div>",
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
)
ON CONFLICT (id) DO UPDATE SET
    sections = EXCLUDED.sections,
    updated_at = NOW();

-- Verification queries
SELECT 'Testingmy Store Content Updated!' as status;

SELECT 'Store Pages:' as info, name, slug, page_type, 
       CASE WHEN sections IS NOT NULL 
            THEN jsonb_array_length(sections) 
            ELSE 0 
       END as section_count,
       status
FROM page_documents 
WHERE store_id = '638ef028-7752-4996-9aae-878d896734fc'
ORDER BY name;