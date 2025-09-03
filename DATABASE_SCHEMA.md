# SellUsGenie Database Schema Documentation

**Generated:** September 2, 2025  
**Purpose:** Complete database schema reference for Customer Storefront development  
**Features:** Multi-tenant architecture with Row Level Security (RLS) and horizontal spacing support

---

## 🏗️ Architecture Overview

SellUsGenie uses a **multi-tenant PostgreSQL database** with the following key characteristics:

- **Multi-Tenant Design**: Complete data isolation between stores using RLS policies
- **Supabase Backend**: PostgreSQL with real-time subscriptions and authentication
- **Row Level Security**: Comprehensive RLS policies ensure data security
- **Visual Page Builder**: JSONB-based content management with horizontal spacing support
- **E-commerce Ready**: Full order management, inventory, and customer systems

---

## 📋 Core Tables Structure

### **1. STORES** - Store Configuration & Branding
Primary table for multi-tenant store management.

**Key Fields:**
- `id` (uuid, PK) - Unique store identifier
- `store_owner_id` (uuid, NOT NULL) - References auth.users.id
- `store_name` (varchar, NOT NULL) - Display name for the store
- `store_slug` (varchar, NOT NULL) - URL-friendly store identifier
- `store_domain` (varchar) - Custom domain (optional)
- `description` (text) - Store description
- `logo_url` (varchar) - Legacy logo URL field
- `store_logo_url` (text) - Current logo image URL
- `is_active` (boolean, default: true) - Store status
- `subscription_status` (enum, default: 'trial') - Options: trial, active, inactive
- `trial_expires_at` (timestamptz) - Trial expiration date
- `payment_enabled` (boolean, default: false) - Payment processing status
- `stripe_publishable_key` (text) - Stripe public key
- `stripe_webhook_secret` (text) - Stripe webhook secret
- **Address Fields:**
  - `store_address_line1` (text)
  - `store_address_line2` (text)
  - `store_city` (text)
  - `store_state` (text)
  - `store_postal_code` (text)
  - `store_country` (text)
  - `store_phone` (text)
- **Financial Fields:**
  - `financial_year_start_month` (integer, default: 1)
  - `financial_year_start_day` (integer, default: 1)
- `created_at`, `updated_at` (timestamptz) - Audit fields

**RLS Policies:**
- ✅ **Public Read**: Active stores publicly viewable (`is_active = true`)
- 🔒 **Owner Management**: Store owners can manage their own stores only (`store_owner_id = auth.uid()`)
- 🔒 **Insert Policy**: Authenticated users can create stores
- 🔒 **Update/Delete Policy**: Only store owners can modify/delete their stores

---

### **2. PAGE_DOCUMENTS** - Visual Page Builder Content
Central table for all page content including headers, footers, and custom pages.

**Key Fields:**
- `id` (uuid, PK, default: gen_random_uuid()) - Unique page identifier
- `store_id` (uuid, NOT NULL) - References stores.id
- `name` (text, NOT NULL) - Page display name
- `slug` (text) - URL slug for routing
- `version` (integer, default: 1) - Page version number
- `status` (text, default: 'draft') - Options: draft, published, archived, scheduled
- `published_at` (timestamptz) - Publication timestamp
- `scheduled_for` (timestamptz) - Scheduled publication time
- `sections` (jsonb, NOT NULL, default: '[]') - **Page content structure with widgets**
- `theme_overrides` (jsonb, default: '{}') - **Custom styling including horizontalSpacing**
- `seo` (jsonb, default: '{}') - SEO metadata
- `analytics` (jsonb, default: '{}') - Analytics configuration
- `performance` (jsonb, default: '{}') - Performance settings
- `accessibility` (jsonb, default: '{}') - Accessibility settings
- `custom_code` (jsonb, default: '{}') - Custom HTML/CSS/JS
- `global_styles` (jsonb, default: '{}') - Global style overrides
- **System Page Fields:**
  - `isSystemPage` (boolean, default: false) - System page flag
  - `systemPageType` (text) - Options: header, footer, about, contact, privacy, terms, returns
  - `editingRestrictions` (jsonb) - Editing restrictions for system pages
- `navigation_placement` (text, default: 'both') - Options: header, footer, both, none
- `page_type` (text, default: 'page') - Options: page, header, footer
- `created_at`, `updated_at` (timestamptz) - Audit fields

**Theme Overrides Structure:**
```json
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
  "horizontalSpacing": "thin|standard|expanded",  // NEW FEATURE
  "tagline": "text",
  "footerText": "text",
  "showSocialLinks": true|false
}
```

**Horizontal Spacing Options:**
- `thin`: Compact layout (`py-2 px-3`)
- `standard`: Balanced spacing (`py-4 px-6`) - **Default**
- `expanded`: Generous spacing (`py-8 px-8`)

**RLS Policies:**
- ✅ **Public Read**: Published pages publicly viewable (`status = 'published'`)
- 🔒 **Owner Management**: Store owners can manage their page documents through store relationship
- 🔒 **Insert Policy**: Store owners can create pages for their stores
- 🔒 **Update/Delete Policy**: Store owners can modify/delete pages in their stores

---

### **3. PRODUCTS** - Product Catalog
Product inventory and catalog management.

**Key Fields:**
- `id` (uuid, PK) - Unique product identifier
- `store_id` (uuid) - References stores.id
- `name` (text) - Product name
- `description` (text) - Product description
- `price` (numeric) - Product price
- `inventory_quantity` (integer) - Stock level
- `is_active` (boolean) - Product status
- `category_id` (uuid) - References product_categories.id
- `display_order` (integer) - Sort order
- `created_at`, `updated_at` (timestamptz) - Audit fields

**RLS Policies:**
- ✅ **Public Read**: Active products publicly viewable (`is_active = true`)
- 🔒 **Owner Management**: Store owners can manage their products

---

### **4. CUSTOMERS** - Customer Accounts
Customer account and profile management.

**Key Fields:**
- `id` (uuid, PK) - Unique customer identifier (auth.uid())
- `store_id` (uuid) - References stores.id
- `email` (text) - Customer email (unique per store)
- `first_name`, `last_name` (text) - Customer name
- `phone` (text) - Contact phone
- `created_at`, `updated_at` (timestamptz) - Audit fields

**RLS Policies:**
- 🔒 **Self Access**: Customers can view/update own data (`id = auth.uid()`)
- 🔒 **Owner Management**: Store owners can manage their store customers

---

### **5. ORDERS & ORDER_ITEMS** - Order Management
Complete order processing and item tracking.

**ORDERS Fields:**
- `id` (uuid, PK) - Unique order identifier
- `store_id` (uuid) - References stores.id
- `customer_id` (uuid) - References customers.id
- `order_number` (text, unique) - Human-readable order number
- `status` (text) - Order status
- `total_amount` (numeric) - Order total
- `shipping_address`, `billing_address` (jsonb) - Address information
- `payment_status` (text) - Payment status
- `created_at`, `updated_at` (timestamptz) - Audit fields

**ORDER_ITEMS Fields:**
- `id` (uuid, PK) - Unique item identifier
- `order_id` (uuid) - References orders.id
- `product_id` (uuid) - References products.id
- `quantity` (integer) - Item quantity
- `unit_price`, `total_price` (numeric) - Pricing

**Address Structure:**
```json
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
```

**RLS Policies:**
- 🔒 **Customer Access**: Customers can view/update own orders
- 🔒 **Owner Management**: Store owners can manage their store orders

---

## 🔐 Row Level Security (RLS) Comprehensive Summary

### **Public Access (No Authentication Required):**
- ✅ **stores** - Active stores (`is_active = true`)
- ✅ **products** - Active products (`is_active = true`)  
- ✅ **categories** - Active categories (`is_active = true`)
- ✅ **page_documents** - Published pages (`status = 'published'`)
- ✅ **store_page_layouts** - Active layouts (`is_active = true`)
- ✅ **store_templates** - Active templates not in preview mode
- ✅ **storefront_pages** - Published pages (`is_published = true`)
- ✅ **storefront_navigation_menus** - Active navigation (`is_active = true`)
- ✅ **customer_testimonials** - Active testimonials (`is_active = true`)
- ✅ **cart_items** - Session-based cart items (no auth required)

### **Customer Access (Customer Authentication):**
- 🔒 **customers** - Own profile data only (`id = auth.uid()`)
- 🔒 **orders** - Own orders only (`customer_id = auth.uid()`)
- 🔒 **order_items** - Through orders relationship
- 🔒 **customer_addresses** - Own addresses only
- 🔒 **cart_items** - Own cart items (`customer_id = auth.uid()`)
- 🔒 **customer_favorites** - Own favorites (`customer_id = auth.uid()`)
- 🔒 **payments** - Own payments through orders relationship

### **Store Owner Access (Store Owner Authentication):**
- 🔒 **All store-related data** through `store_owner_id = auth.uid()` relationship
- 🔒 **Complete CRUD operations** on owned store data
- 🔒 **Customer data access** for their stores only
- 🔒 **Advanced features**: Analytics, campaigns, segments, inventory, suppliers

### **Service Role Access (System Level):**
- 🔧 **cart_events** - System-level cart tracking
- 🔧 **customer_sessions** - Session management
- 🔧 **page_views** - Analytics tracking
- 🔧 **product_views** - Product analytics
- 🔧 **user_subscriptions** - Subscription management
- 🔧 **stripe_configurations** - Payment processing

## 📊 Extended Tables Summary

### **Analytics & Tracking:**
- `analytics_events` - Store analytics data
- `attribution_touchpoints` - Marketing attribution
- `cart_events` - Cart interaction tracking
- `customer_sessions` - Session tracking
- `page_views` - Page view analytics
- `product_views` - Product view tracking
- `customer_analytics` - Customer behavior data
- `product_analytics` - Product performance data

### **E-commerce & Inventory:**
- `categories` - Product categorization
- `cart_items` - Shopping cart management
- `payments` - Payment processing
- `inventory_alerts` - Stock alerts
- `inventory_history` - Stock movement history
- `inventory_locations` - Multi-location inventory
- `inventory_settings` - Inventory configuration
- `suppliers` - Supplier management
- `reorder_suggestions` - Automated reorder recommendations

### **Marketing & Campaigns:**
- `email_campaigns` - Email marketing campaigns
- `email_templates` - Email template library
- `email_segments` - Customer segmentation for email
- `nurture_campaigns` - Automated nurture sequences
- `marketing_campaigns` - General marketing campaigns
- `campaign_enrollments` - Customer campaign enrollment
- `customer_segments` - Customer segmentation
- `customer_leads` - Lead management
- `lead_sources` - Lead attribution

### **Customer Experience:**
- `customer_favorites` - Wishlist/favorites functionality
- `customer_testimonials` - Customer reviews/testimonials
- `incomplete_orders` - Abandoned cart recovery
- `storefront_pages` - Custom storefront pages
- `storefront_navigation_menus` - Navigation management

### **Business Management:**
- `store_integrations` - Third-party integrations
- `store_policies` - Legal policies (privacy, terms, etc.)
- `store_templates` - Store design templates
- `stripe_configurations` - Payment gateway settings
- `user_subscriptions` - SaaS subscription management
- `delivery_areas` - Geographic delivery zones
- `delivery_exclusions` - Delivery restrictions
- `delivery_time_slots` - Delivery scheduling

---

## 🌐 Customer Storefront URL Routing

### **Public Routes (No Authentication):**
```
/store/{store_slug}                    → Homepage
/store/{store_slug}/products           → Product catalog  
/store/{store_slug}/product/{slug}     → Individual product
/store/{store_slug}/{page_slug}        → Custom pages
```

### **Customer Routes (Authentication Required):**
```
/store/{store_slug}/cart              → Shopping cart
/store/{store_slug}/checkout          → Checkout flow
/store/{store_slug}/account           → Customer profile
/store/{store_slug}/orders            → Order history
```

### **System Pages (Rendered on All Routes):**
- **Header**: Auto-rendered with horizontal spacing support
- **Footer**: Auto-rendered with horizontal spacing support
- **Navigation**: Dynamic from published pages with `navigation_placement`

---

## 📊 Performance Optimizations

### **Database Indexes:**
- `stores(slug)` - Fast store lookup by URL
- `page_documents(store_id, status)` - Published page queries
- `page_documents(theme_overrides->>'horizontalSpacing')` - **New spacing index**
- `products(store_id, is_active)` - Active product queries
- `orders(customer_id)` - Customer order history
- `orders(store_id, status)` - Store order management

### **Query Optimization:**
- **Multi-table JOINs** for single-query data loading
- **JSONB indexing** for theme_overrides and address fields
- **Selective loading** with WHERE clauses on status fields

---

## 🔧 Development Quick Reference

### **Common Storefront Queries:**

**Get Store with Header/Footer:**
```sql
SELECT 
  s.*, 
  h.sections as header_sections,
  h.theme_overrides as header_theme,
  f.sections as footer_sections,
  f.theme_overrides as footer_theme
FROM stores s
LEFT JOIN page_documents h ON s.id = h.store_id 
  AND h.page_type = 'header' AND h.status = 'published'
LEFT JOIN page_documents f ON s.id = f.store_id 
  AND f.page_type = 'footer' AND f.status = 'published'  
WHERE s.store_slug = $1 AND s.is_active = true;
```

**Get Products with Images:**
```sql
SELECT 
  p.*, pi.image_url, pi.alt_text
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.store_id = $1 AND p.is_active = true
ORDER BY p.display_order, p.created_at DESC;
```

**Get Navigation Pages:**
```sql
SELECT id, name, slug, navigation_placement, sections
FROM page_documents
WHERE store_id = $1 AND status = 'published' 
  AND navigation_placement IN ('header', 'footer', 'both')
ORDER BY name;
```

---

## 🎨 Visual Page Builder Integration

### **Header/Footer Specifications:**
- **Storage**: `page_documents` with `name = 'Site Header'` or `'Site Footer'`
- **Rendering**: `PageBuilderRenderer` with `isSystemPage = true`
- **Horizontal Spacing**: Controlled via `theme_overrides.horizontalSpacing`
- **Widget System**: Full widget registry support (text, image, navigation, cart, etc.)

### **Content Management:**
- **Sections**: Responsive layout containers
- **Rows**: Widget groupings within sections  
- **Widgets**: Individual content blocks with props and styling
- **Theme System**: Page-specific overrides with inheritance

---

## ✅ Feature Status

- ✅ **Multi-tenant Architecture** - Complete with RLS
- ✅ **Visual Page Builder** - Full widget system
- ✅ **Header/Footer System** - With horizontal spacing support
- ✅ **E-commerce Features** - Products, orders, customers
- ✅ **Authentication** - Store owners and customers
- ✅ **Performance** - Optimized indexes and queries
- ✅ **Security** - Comprehensive RLS policies

---

*This schema supports the complete SellUsGenie Customer Storefront with proper multi-tenant isolation, visual page building capabilities, and modern e-commerce features.*