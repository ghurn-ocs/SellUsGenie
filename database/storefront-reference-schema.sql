-- Customer Storefront Development Reference Schema
-- Date: 2025-09-02
-- Purpose: Quick reference for Customer Storefront key tables and fields

-- ====================
-- CORE STOREFRONT TABLES STRUCTURE
-- ====================

/*
KEY TABLES FOR CUSTOMER STOREFRONT:

1. STORES - Store configuration and branding
   - id (uuid, primary key)
   - store_name (text) - Display name
   - slug (text, unique) - URL identifier  
   - store_owner_id (uuid) - References store_owners.id
   - store_logo_url (text) - Logo image
   - description (text) - Store description
   - contact_email (text)
   - contact_phone (text) 
   - website_url (text)
   - status (text) - active/inactive
   - created_at, updated_at (timestamptz)

2. PAGE_DOCUMENTS - Page Builder content (headers, footers, pages)
   - id (uuid, primary key)
   - store_id (uuid) - References stores.id
   - name (text) - Page name
   - slug (text) - URL slug
   - status (text) - draft/published/archived
   - navigation_placement (text) - header/footer/both/none
   - sections (jsonb) - Page content structure
   - theme_overrides (jsonb) - Custom styling including horizontalSpacing
   - seo (jsonb) - SEO metadata
   - created_at, updated_at (timestamptz)

3. PRODUCTS - Product catalog
   - id (uuid, primary key)
   - store_id (uuid) - References stores.id
   - name (text) - Product name
   - description (text) - Product description
   - price (decimal) - Product price
   - inventory_quantity (integer)
   - status (text) - active/inactive
   - category_id (uuid) - References product_categories.id
   - display_order (integer) - Sort order
   - created_at, updated_at (timestamptz)

4. PRODUCT_IMAGES - Product image gallery
   - id (uuid, primary key)
   - product_id (uuid) - References products.id
   - image_url (text) - Image URL
   - alt_text (text) - Alt text for accessibility
   - is_primary (boolean) - Main product image
   - display_order (integer)

5. CUSTOMERS - Customer accounts
   - id (uuid, primary key)
   - store_id (uuid) - References stores.id
   - email (text, unique per store)
   - first_name (text)
   - last_name (text)  
   - phone (text)
   - status (text) - active/inactive
   - created_at, updated_at (timestamptz)

6. ORDERS - Customer orders
   - id (uuid, primary key)
   - store_id (uuid) - References stores.id
   - customer_id (uuid) - References customers.id
   - order_number (text, unique)
   - status (text) - pending/processing/shipped/delivered/cancelled
   - total_amount (decimal)
   - shipping_address (jsonb)
   - billing_address (jsonb)
   - payment_status (text)
   - created_at, updated_at (timestamptz)

7. ORDER_ITEMS - Items within orders  
   - id (uuid, primary key)
   - order_id (uuid) - References orders.id
   - product_id (uuid) - References products.id
   - quantity (integer)
   - unit_price (decimal)
   - total_price (decimal)

8. DELIVERY_AREAS - Geographic delivery zones
   - id (uuid, primary key)
   - store_id (uuid) - References stores.id
   - name (text) - Area name
   - coordinates (jsonb) - Geographic boundaries
   - delivery_fee (decimal)
   - minimum_order (decimal)
   - is_active (boolean)
*/

-- ====================
-- KEY JSONB FIELD STRUCTURES
-- ====================

/*
PAGE_DOCUMENTS.theme_overrides structure:
{
  "backgroundColor": "#1E1E1E",
  "textColor": "#FFFFFF", 
  "linkColor": "#9B51E0",
  "linkHoverColor": "#8B45D0",
  "logoPosition": "left|center",
  "showLogo": true|false,
  "useStoreLogo": true|false,
  "showTagline": true|false,
  "buttonStyle": "round|square|rounded",
  "horizontalSpacing": "thin|standard|expanded", // NEW FIELD
  "tagline": "text",
  "footerText": "text",
  "showSocialLinks": true|false
}

PAGE_DOCUMENTS.sections structure:
[
  {
    "id": "section-uuid",
    "title": "Section Title",
    "background": {
      "colorToken": "#ffffff",
      "imageUrl": "url"
    },
    "padding": "py-4 px-6",
    "rows": [
      {
        "id": "row-uuid", 
        "widgets": [
          {
            "id": "widget-uuid",
            "type": "text|button|image|navigation|cart|etc",
            "colSpan": {"sm": 12, "md": 6, "lg": 4},
            "props": {
              // Widget-specific properties
            }
          }
        ]
      }
    ]
  }
]

ORDERS.shipping_address / billing_address structure:
{
  "firstName": "John",
  "lastName": "Doe", 
  "address1": "123 Main St",
  "address2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "US",
  "phone": "+1234567890"
}
*/

-- ====================
-- STOREFRONT ROUTING PATTERNS  
-- ====================

/*
URL PATTERNS FOR CUSTOMER STOREFRONT:

/store/{store_slug}                    - Homepage (uses page with slug 'home' or first published page)
/store/{store_slug}/products           - Product catalog
/store/{store_slug}/product/{slug}     - Individual product page  
/store/{store_slug}/cart              - Shopping cart
/store/{store_slug}/checkout          - Checkout flow
/store/{store_slug}/account           - Customer account (login/register)
/store/{store_slug}/orders            - Order history
/store/{store_slug}/{page_slug}       - Custom pages from page_documents

SYSTEM PAGE ROUTING:
- Header: Rendered on all pages via VisualPageBuilderStoreFront
- Footer: Rendered on all pages via VisualPageBuilderStoreFront  
- Navigation: Generated from published pages with navigation_placement
*/

-- ====================
-- ROW LEVEL SECURITY PATTERNS
-- ====================

/*
RLS POLICIES FOR CUSTOMER STOREFRONT:

1. STORES: Publicly readable for active stores
2. PAGE_DOCUMENTS: Publicly readable for published pages
3. PRODUCTS: Publicly readable for active products  
4. PRODUCT_IMAGES: Publicly readable
5. CUSTOMERS: Own records only (customer_id = auth.uid())
6. ORDERS: Own records only (customer_id = auth.uid())
7. ORDER_ITEMS: Through orders relationship
8. DELIVERY_AREAS: Publicly readable for active areas

PUBLIC ACCESS QUERIES:
- No authentication required for browsing products and pages
- Authentication required for cart/checkout/orders
- Customer registration creates authenticated user
*/

-- ====================
-- COMMON STOREFRONT QUERIES
-- ====================

-- Get store with header/footer for routing
SELECT 
  s.id, s.store_name, s.slug, s.store_logo_url, s.description,
  s.contact_email, s.contact_phone, s.website_url,
  h.id as header_id, h.sections as header_sections, 
  h.theme_overrides as header_theme,
  f.id as footer_id, f.sections as footer_sections,
  f.theme_overrides as footer_theme
FROM stores s
LEFT JOIN page_documents h ON s.id = h.store_id 
  AND h.name = 'Site Header' AND h.status = 'published'
LEFT JOIN page_documents f ON s.id = f.store_id 
  AND f.name = 'Site Footer' AND f.status = 'published'  
WHERE s.slug = $1 AND s.status = 'active';

-- Get navigation pages for header/footer
SELECT id, name, slug, navigation_placement, sections
FROM page_documents
WHERE store_id = $1 AND status = 'published' 
  AND navigation_placement IN ('header', 'footer', 'both')
ORDER BY name;

-- Get products for catalog with primary images
SELECT 
  p.id, p.name, p.description, p.price, p.inventory_quantity,
  p.display_order, pc.name as category_name,
  pi.image_url, pi.alt_text
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.store_id = $1 AND p.status = 'active' 
  AND p.inventory_quantity > 0
ORDER BY p.display_order NULLS LAST, p.created_at DESC;

-- Get single product with all images  
SELECT 
  p.*, pc.name as category_name,
  COALESCE(
    json_agg(
      json_build_object(
        'id', pi.id,
        'image_url', pi.image_url, 
        'alt_text', pi.alt_text,
        'is_primary', pi.is_primary
      ) ORDER BY pi.display_order, pi.is_primary DESC
    ) FILTER (WHERE pi.id IS NOT NULL), 
    '[]'::json
  ) as images
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id  
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.store_id = $1 AND p.id = $2 AND p.status = 'active'
GROUP BY p.id, pc.name;