# Supabase Database Schema Documentation
Generated: 2025-09-03T10:12:28.933Z
Database: https://jizobmpcyrzprrwsyedv.supabase.co
Last Updated: 2025-09-03 - Added performance indexes documentation

## Executive Summary

This document contains the complete database schema for the SellUsGenie multi-tenant e-commerce platform. The database is hosted on Supabase (PostgreSQL) and includes comprehensive Row Level Security (RLS) policies to ensure complete data isolation between tenants.

## Database Statistics

- **Total Tables:** 29
- **Core Tables:** 13 (store management, products, orders)
- **Analytics Tables:** 8 (customer analytics, product analytics, attribution)
- **Page Builder Tables:** 3 (page documents, history, layouts)
- **Lead Management Tables:** 5 (leads, activities, notes, tasks, conversions)
- **Active Stores:** 3
- **Total Products:** 3
- **Total Page Documents:** 9

## Table of Contents

1. [Core Commerce Tables](#core-commerce-tables)
2. [Analytics and Marketing Tables](#analytics-and-marketing-tables)
3. [Page Builder Tables](#page-builder-tables)
4. [Lead Management Tables](#lead-management-tables)
5. [Table Relationships](#table-relationships)
6. [Row Level Security Policies](#row-level-security-policies)
7. [Schema Issues and Recommendations](#schema-issues-and-recommendations)

---

## Core Commerce Tables

### store_owners
Primary table for multi-tenant store owners who can manage multiple stores.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | auth.uid() | References auth.users |
| email | TEXT | NO | - | Unique email address |
| google_id | TEXT | YES | NULL | Google OAuth identifier |
| apple_id | TEXT | YES | NULL | Apple OAuth identifier |
| subscription_tier | TEXT | NO | 'trial' | Options: trial, starter, professional, enterprise |
| trial_expires_at | TIMESTAMP | YES | NULL | Trial expiration date |
| stripe_customer_id | TEXT | YES | NULL | Stripe customer identifier |
| created_at | TIMESTAMP | NO | NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Last update timestamp |

### stores
Individual e-commerce stores owned by store owners.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_owner_id | UUID | NO | - | FK to store_owners |
| store_name | VARCHAR(255) | NO | - | Display name |
| store_slug | VARCHAR(255) | NO | - | URL-friendly identifier |
| store_domain | VARCHAR(255) | YES | NULL | Custom domain |
| description | TEXT | YES | NULL | Store description |
| logo_url | TEXT | YES | NULL | Logo image URL (deprecated) |
| store_logo_url | TEXT | YES | NULL | Logo image URL (active) |
| is_active | BOOLEAN | NO | true | Store active status |
| subscription_status | TEXT | NO | 'trial' | Options: active, inactive, trial |
| trial_expires_at | TIMESTAMP | YES | NULL | Trial expiration |
| payment_enabled | BOOLEAN | NO | false | Payment processing enabled |
| stripe_publishable_key | TEXT | YES | NULL | Stripe public key |
| stripe_webhook_secret | TEXT | YES | NULL | Stripe webhook secret |
| store_address_line1 | VARCHAR(255) | YES | NULL | Address line 1 |
| store_address_line2 | VARCHAR(255) | YES | NULL | Address line 2 |
| store_city | VARCHAR(100) | YES | NULL | City |
| store_state | VARCHAR(100) | YES | NULL | State/Province |
| store_postal_code | VARCHAR(20) | YES | NULL | ZIP/Postal code |
| store_country | VARCHAR(2) | YES | NULL | Country code |
| store_phone | VARCHAR(20) | YES | NULL | Contact phone |
| financial_year_start_month | INTEGER | YES | 1 | Fiscal year start month |
| financial_year_start_day | INTEGER | YES | 1 | Fiscal year start day |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Update timestamp |

**Current Data:** 3 stores active

### products
Product catalog for each store.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| category_id | UUID | YES | NULL | FK to categories |
| name | VARCHAR(255) | NO | - | Product name |
| description | TEXT | YES | NULL | Product description |
| price | DECIMAL(10,2) | NO | - | Current price |
| compare_price | DECIMAL(10,2) | YES | NULL | Original price (deprecated) |
| compare_at_price | DECIMAL(10,2) | YES | NULL | Original price (active) |
| sku | VARCHAR(100) | YES | NULL | Stock keeping unit |
| barcode | VARCHAR(100) | YES | NULL | Barcode |
| weight | DECIMAL(10,2) | YES | NULL | Product weight |
| dimensions | JSONB | YES | NULL | Product dimensions |
| images | JSONB | YES | NULL | Product images array |
| image_url | TEXT | YES | NULL | Primary image URL |
| image_alt | TEXT | YES | NULL | Image alt text |
| gallery_images | JSONB | YES | NULL | Additional images |
| is_active | BOOLEAN | NO | true | Product active status |
| is_featured | BOOLEAN | NO | false | Featured product flag |
| inventory_quantity | INTEGER | NO | 0 | Current stock |
| low_stock_threshold | INTEGER | YES | 10 | Low stock alert level |
| cost_price | DECIMAL(10,2) | YES | NULL | Cost of goods |
| reorder_point | INTEGER | YES | NULL | Reorder trigger point |
| max_stock | INTEGER | YES | NULL | Maximum stock level |
| inventory_tracking | BOOLEAN | NO | true | Track inventory |
| reserved_quantity | INTEGER | NO | 0 | Reserved stock |
| last_restocked_at | TIMESTAMP | YES | NULL | Last restock date |
| average_cost | DECIMAL(10,2) | YES | NULL | Average cost |
| category | VARCHAR(100) | YES | NULL | Category name |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Update timestamp |

**Current Data:** 3 products

### customers
Customer records for each store.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| email | VARCHAR(255) | NO | - | Customer email |
| google_id | TEXT | YES | NULL | Google OAuth ID |
| apple_id | TEXT | YES | NULL | Apple OAuth ID |
| first_name | VARCHAR(100) | YES | NULL | First name |
| last_name | VARCHAR(100) | YES | NULL | Last name |
| phone | VARCHAR(20) | YES | NULL | Phone number |
| shipping_address_line1 | VARCHAR(255) | YES | NULL | Shipping address |
| shipping_address_line2 | VARCHAR(255) | YES | NULL | Shipping address 2 |
| shipping_city | VARCHAR(100) | YES | NULL | Shipping city |
| shipping_state | VARCHAR(100) | YES | NULL | Shipping state |
| shipping_postal_code | VARCHAR(20) | YES | NULL | Shipping ZIP |
| shipping_country | VARCHAR(2) | YES | NULL | Shipping country |
| billing_different_from_shipping | BOOLEAN | NO | false | Billing differs |
| billing_address_line1 | VARCHAR(255) | YES | NULL | Billing address |
| billing_address_line2 | VARCHAR(255) | YES | NULL | Billing address 2 |
| billing_city | VARCHAR(100) | YES | NULL | Billing city |
| billing_state | VARCHAR(100) | YES | NULL | Billing state |
| billing_postal_code | VARCHAR(20) | YES | NULL | Billing ZIP |
| billing_country | VARCHAR(2) | YES | NULL | Billing country |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Update timestamp |

**Current Data:** 0 customers

### orders
Order records with multi-tenant isolation.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| customer_id | UUID | NO | - | FK to customers |
| order_number | VARCHAR(50) | NO | - | Unique order number |
| status | TEXT | NO | 'pending' | Options: pending, processing, shipped, delivered, cancelled |
| subtotal | DECIMAL(10,2) | NO | 0 | Order subtotal |
| tax | DECIMAL(10,2) | NO | 0 | Tax amount |
| shipping | DECIMAL(10,2) | NO | 0 | Shipping cost |
| total | DECIMAL(10,2) | NO | - | Order total |
| created_at | TIMESTAMP | NO | NOW() | Order date |
| updated_at | TIMESTAMP | NO | NOW() | Last update |

**Current Data:** 0 orders

### order_items
Line items for each order.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| order_id | UUID | NO | - | FK to orders |
| product_id | UUID | NO | - | FK to products |
| quantity | INTEGER | NO | 1 | Item quantity |
| unit_price | DECIMAL(10,2) | NO | - | Price per unit |
| total_price | DECIMAL(10,2) | NO | - | Line total |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |

**Current Data:** 0 order items

### cart_items
Shopping cart items (persistent).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| customer_id | UUID | YES | NULL | FK to customers (null for guests) |
| session_id | VARCHAR(255) | YES | NULL | Guest session ID |
| product_id | UUID | NO | - | FK to products |
| quantity | INTEGER | NO | 1 | Item quantity |
| created_at | TIMESTAMP | NO | NOW() | Added to cart timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Last update |

**Current Data:** 1 cart item

### store_policies
Legal and policy documents for each store.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| privacy_policy | TEXT | YES | NULL | Privacy policy content |
| returns_policy | TEXT | YES | NULL | Returns policy content |
| terms_of_service | TEXT | YES | NULL | Terms of service |
| about_us | TEXT | YES | NULL | About us content |
| contact_us | TEXT | YES | NULL | Contact information |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Update timestamp |

**Current Data:** 1 store policy set

---

## Analytics and Marketing Tables

### analytics_events
Central event tracking for all store activities.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| event_name | VARCHAR(100) | NO | - | Event identifier |
| event_category | VARCHAR(50) | YES | NULL | Event category |
| parameters | JSONB | YES | {} | Event parameters |
| user_id | UUID | YES | NULL | FK to customers |
| session_id | VARCHAR(100) | YES | NULL | Session identifier |
| visitor_id | VARCHAR(100) | YES | NULL | Visitor identifier |
| timestamp | TIMESTAMP | NO | NOW() | Event timestamp |
| source | VARCHAR(20) | NO | - | Event source |
| ip_address | INET | YES | NULL | IP address |
| user_agent | TEXT | YES | NULL | User agent string |
| referrer | TEXT | YES | NULL | Referrer URL |
| utm_source | VARCHAR(100) | YES | NULL | UTM source |
| utm_medium | VARCHAR(100) | YES | NULL | UTM medium |
| utm_campaign | VARCHAR(100) | YES | NULL | UTM campaign |
| utm_term | VARCHAR(100) | YES | NULL | UTM term |
| utm_content | VARCHAR(100) | YES | NULL | UTM content |
| page_url | TEXT | YES | NULL | Page URL |
| page_title | TEXT | YES | NULL | Page title |
| device_type | VARCHAR(20) | YES | NULL | Device type |
| browser | VARCHAR(50) | YES | NULL | Browser name |
| os | VARCHAR(50) | YES | NULL | Operating system |
| country | VARCHAR(2) | YES | NULL | Country code |
| region | VARCHAR(100) | YES | NULL | Region/State |
| city | VARCHAR(100) | YES | NULL | City |

**Current Data:** 0 events (table exists but empty)

### customer_analytics
Extended customer insights and RFM analysis.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| customer_id | UUID | NO | - | FK to customers |
| store_id | UUID | NO | - | FK to stores |
| recency_score | INTEGER | YES | NULL | RFM recency (1-5) |
| frequency_score | INTEGER | YES | NULL | RFM frequency (1-5) |
| monetary_score | INTEGER | YES | NULL | RFM monetary (1-5) |
| rfm_segment | VARCHAR(20) | YES | NULL | RFM segment name |
| total_sessions | INTEGER | NO | 0 | Session count |
| avg_session_duration | DECIMAL(10,2) | NO | 0 | Avg session length |
| bounce_rate | DECIMAL(5,2) | NO | 0 | Bounce rate % |
| pages_per_session | DECIMAL(5,2) | NO | 0 | Pages per session |
| email_engagement_score | DECIMAL(5,2) | NO | 0 | Email engagement (0-100) |
| sms_engagement_score | DECIMAL(5,2) | NO | 0 | SMS engagement (0-100) |
| social_engagement_score | DECIMAL(5,2) | NO | 0 | Social engagement (0-100) |
| churn_probability | DECIMAL(5,2) | NO | 0 | Churn risk (0-100) |
| lifetime_value_prediction | DECIMAL(10,2) | NO | 0 | Predicted CLV |
| next_purchase_probability | DECIMAL(5,2) | NO | 0 | Purchase probability (0-100) |
| avg_order_value | DECIMAL(10,2) | NO | 0 | Average order value |
| total_orders | INTEGER | NO | 0 | Total order count |
| total_spent | DECIMAL(10,2) | NO | 0 | Total spent |
| days_since_last_order | INTEGER | YES | NULL | Days since last order |
| preferred_category | VARCHAR(100) | YES | NULL | Preferred category |
| preferred_payment_method | VARCHAR(50) | YES | NULL | Preferred payment |
| first_purchase_date | TIMESTAMP | YES | NULL | First purchase |
| last_purchase_date | TIMESTAMP | YES | NULL | Last purchase |
| calculated_at | TIMESTAMP | NO | NOW() | Calculation timestamp |

**Current Data:** 0 customer analytics records (table exists but empty)

### product_analytics
Advanced product performance insights.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| product_id | UUID | NO | - | FK to products |
| store_id | UUID | NO | - | FK to stores |
| total_views | INTEGER | NO | 0 | View count |
| unique_views | INTEGER | NO | 0 | Unique viewers |
| views_to_cart_rate | DECIMAL(5,2) | NO | 0 | Add to cart rate % |
| cart_to_purchase_rate | DECIMAL(5,2) | NO | 0 | Conversion rate % |
| total_sales | INTEGER | NO | 0 | Units sold |
| total_revenue | DECIMAL(10,2) | NO | 0 | Total revenue |
| avg_selling_price | DECIMAL(10,2) | NO | 0 | Average price |
| inventory_turnover | DECIMAL(5,2) | NO | 0 | Turnover rate |
| conversion_rate | DECIMAL(5,2) | NO | 0 | Overall conversion % |
| return_rate | DECIMAL(5,2) | NO | 0 | Return rate % |
| profit_margin | DECIMAL(5,2) | NO | 0 | Profit margin % |
| trend_direction | VARCHAR(10) | YES | NULL | up, down, stable |
| trend_percentage | DECIMAL(5,2) | NO | 0 | Trend change % |
| seasonality_score | DECIMAL(5,2) | NO | 0 | Seasonality impact |
| period_start | TIMESTAMP | YES | NULL | Analysis period start |
| period_end | TIMESTAMP | YES | NULL | Analysis period end |
| calculated_at | TIMESTAMP | NO | NOW() | Calculation timestamp |

**Current Data:** 0 product analytics records (table exists but empty)

### attribution_touchpoints
Multi-touch attribution tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| customer_id | UUID | YES | NULL | FK to customers |
| session_id | VARCHAR(100) | YES | NULL | Session ID |
| channel | VARCHAR(50) | NO | - | Traffic channel |
| source | VARCHAR(100) | YES | NULL | Traffic source |
| medium | VARCHAR(50) | YES | NULL | Traffic medium |
| campaign | VARCHAR(100) | YES | NULL | Campaign name |
| content | VARCHAR(100) | YES | NULL | Content variant |
| term | VARCHAR(100) | YES | NULL | Search term |
| position_in_journey | INTEGER | YES | NULL | Touch position |
| time_to_conversion | INTEGER | YES | NULL | Minutes to conversion |
| value_contribution | DECIMAL(10,2) | NO | 0 | Attributed value |
| attribution_model | VARCHAR(20) | YES | NULL | Attribution model |
| converted | BOOLEAN | NO | false | Conversion flag |
| order_id | UUID | YES | NULL | FK to orders |
| conversion_value | DECIMAL(10,2) | NO | 0 | Conversion value |
| touched_at | TIMESTAMP | NO | NOW() | Touchpoint timestamp |

**Current Data:** 0 attribution records (table exists but empty)

---

## Page Builder Tables

### page_documents
Visual page builder documents with versioning.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| name | VARCHAR(255) | NO | - | Page name |
| slug | VARCHAR(255) | NO | - | URL slug |
| version | INTEGER | NO | 1 | Version number |
| status | TEXT | NO | 'draft' | draft, published |
| published_at | TIMESTAMP | YES | NULL | Publication date |
| scheduled_for | TIMESTAMP | YES | NULL | Scheduled publication |
| sections | JSONB | NO | [] | Page sections |
| theme_overrides | JSONB | YES | {} | Theme customizations |
| seo | JSONB | YES | {} | SEO metadata |
| analytics | JSONB | YES | {} | Analytics config |
| performance | JSONB | YES | {} | Performance settings |
| accessibility | JSONB | YES | {} | Accessibility settings |
| custom_code | JSONB | YES | {} | Custom code injection |
| global_styles | JSONB | YES | {} | Global CSS styles |
| isSystemPage | BOOLEAN | NO | false | System page flag |
| systemPageType | TEXT | YES | NULL | header, footer |
| editingRestrictions | JSONB | YES | {} | Edit restrictions |
| navigation_placement | TEXT | YES | 'both' | none, header, footer, both |
| page_type | TEXT | YES | NULL | Page type identifier |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Update timestamp |

**Current Data:** 9 page documents

### page_history
Version history for page documents.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| page_id | UUID | NO | - | FK to page_documents |
| version | INTEGER | NO | - | Version number |
| sections | JSONB | NO | - | Page sections snapshot |
| theme_overrides | JSONB | YES | NULL | Theme snapshot |
| seo | JSONB | YES | NULL | SEO snapshot |
| author_id | UUID | YES | NULL | Author user ID |
| note | TEXT | YES | NULL | Version note |
| created_at | TIMESTAMP | NO | NOW() | Version timestamp |

**Current Data:** 0 history records

### store_page_layouts
Store-specific page layout configurations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| layout_name | VARCHAR(100) | NO | - | Layout identifier |
| layout_config | JSONB | NO | {} | Layout configuration |
| is_active | BOOLEAN | NO | true | Active status |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Update timestamp |

**Current Data:** 0 layout configurations

---

## Lead Management Tables

### leads (if exists)
Lead tracking and management.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| store_id | UUID | NO | - | FK to stores |
| email | VARCHAR(255) | NO | - | Lead email |
| first_name | VARCHAR(100) | YES | NULL | First name |
| last_name | VARCHAR(100) | YES | NULL | Last name |
| phone | VARCHAR(20) | YES | NULL | Phone number |
| source | VARCHAR(50) | YES | NULL | Lead source |
| status | VARCHAR(20) | NO | 'new' | Lead status |
| score | INTEGER | YES | 0 | Lead score |
| assigned_to | UUID | YES | NULL | Assigned user |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Update timestamp |

**Current Data:** Unknown (table may not exist)

---

## Table Relationships

### Primary Relationships
```
store_owners (1) ──→ (N) stores
stores (1) ──→ (N) products
stores (1) ──→ (N) customers
stores (1) ──→ (N) orders
stores (1) ──→ (N) page_documents
customers (1) ──→ (N) orders
orders (1) ──→ (N) order_items
products (1) ←── (N) order_items
customers (1) ──→ (N) cart_items
products (1) ←── (N) cart_items
```

### Analytics Relationships
```
customers (1) ──→ (1) customer_analytics
products (1) ──→ (N) product_analytics
customers (1) ──→ (N) attribution_touchpoints
orders (1) ←── (N) attribution_touchpoints
stores (1) ──→ (N) analytics_events
```

---

## Row Level Security Policies

All tables implement RLS policies to ensure complete data isolation between tenants:

### Store Owner Policies
- Store owners can only access their own profile
- Store owners can only manage their own subscriptions
- Store owners can only view/edit their own stores

### Store Data Policies
- All store data (products, customers, orders) is filtered by store_id
- Users can only access data from stores they own
- JOIN operations verify store ownership through store_owner_id

### Example RLS Policy
```sql
CREATE POLICY "Store owners can view their products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = products.store_id 
      AND stores.store_owner_id = auth.uid()
    )
  );
```

---

## Schema Issues and Recommendations

### Critical Issues

1. **Analytics Tables Schema Mismatch**
   - Issue: Analytics tables use `owner_id` but main schema uses `store_owner_id`
   - Impact: RLS policies fail, preventing data access
   - Fix: Update `database/world-class-analytics-schema.sql` to use `store_owner_id`

2. **Missing Columns in Orders Table**
   - Issue: Analytics queries reference `payment_method` column that doesn't exist
   - Impact: Analytics dashboard queries fail
   - Fix: Either add column or update queries to remove reference

### Recommendations

1. **Apply Missing Indexes**
   - Add indexes on foreign key columns for better query performance
   - Create composite indexes for common query patterns

2. **Data Type Consistency**
   - Standardize VARCHAR lengths across similar fields
   - Use consistent decimal precision for monetary values

3. **Add Missing Constraints**
   - Add CHECK constraints for enum-like fields
   - Add UNIQUE constraints where appropriate

4. **Analytics Table Population**
   - Run initial population scripts for analytics tables
   - Set up triggers or scheduled jobs for ongoing updates

5. **Column Naming Consistency**
   - Deprecate `logo_url` in favor of `store_logo_url`
   - Deprecate `compare_price` in favor of `compare_at_price`

---

## Migration Scripts Needed

1. **Fix Analytics RLS Policies**
```sql
-- Update all analytics table policies to use store_owner_id
UPDATE pg_policies 
SET qual = REPLACE(qual, 'owner_id', 'store_owner_id')
WHERE schemaname IN ('public') 
AND tablename LIKE '%analytics%';
```

2. **Add Missing Columns**
```sql
-- Add payment_method to orders if needed
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
```

3. **Create Performance Indexes** (APPLIED - September 3, 2025)
```sql
-- Full index creation script available in:
-- database/add-performance-indexes-corrected.sql
-- This includes 40+ indexes for improved query performance
-- Add foreign key indexes
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
```

---

## Database Access Information

- **Host:** jizobmpcyrzprrwsyedv.supabase.co
- **Database:** postgres
- **Port:** 5432 (direct), 6543 (pooler)
- **SSL:** Required
- **Connection Pooler:** PgBouncer
- **Max Connections:** Varies by plan

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Authentication handled through Supabase Auth (auth.users)
- API access requires valid JWT tokens
- Database password should be rotated regularly
- Webhook secrets should be stored securely

---

*Last Updated: September 3, 2025*
*Generated using Supabase client queries and schema analysis*