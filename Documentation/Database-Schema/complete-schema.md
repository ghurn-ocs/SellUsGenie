# Complete Database Schema

**Version:** 2.0  
**Last Updated:** January 2025  
**Database:** PostgreSQL (Supabase)  
**Status:** Production Schema  

---

## 📋 Schema Overview

This document contains the complete SellUsGenie database schema including all tables, relationships, constraints, and Row Level Security policies. The schema is designed for multi-tenant operations with complete data isolation between stores.

## 🏗️ Multi-Tenant Architecture

### Tenant Hierarchy
```
auth.users (Supabase Auth)
    ↓ 1:1
store_owners (Top-level tenants)
    ↓ 1:Many  
stores (Individual store instances)
    ↓ 1:Many (All business data)
├── categories
├── products  
├── customers
├── orders
├── cart_items
├── payments
└── [other business tables]
```

## 🗄️ Core Tables

### Authentication & User Management

#### store_owners
**Purpose**: Top-level tenant table for store owners
```sql
CREATE TABLE store_owners (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    google_id TEXT,
    apple_id TEXT,
    subscription_tier TEXT DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'starter', 'professional', 'enterprise')),
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### store_owner_subscriptions  
**Purpose**: Subscription and billing management
```sql
CREATE TABLE store_owner_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_owner_id UUID NOT NULL REFERENCES store_owners(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('trial', 'starter', 'professional', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Store Management

#### stores
**Purpose**: Individual store instances within multi-tenant system
```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_owner_id UUID NOT NULL REFERENCES store_owners(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_slug TEXT NOT NULL UNIQUE,
    store_domain TEXT,
    store_tagline TEXT,
    is_active BOOLEAN DEFAULT true,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment Configuration
    stripe_publishable_key TEXT,
    stripe_webhook_secret TEXT,
    payment_enabled BOOLEAN DEFAULT false,
    
    -- Store Contact Information
    store_address_line1 TEXT,
    store_address_line2 TEXT,
    store_city TEXT,
    store_state TEXT,
    store_postal_code TEXT,
    store_country TEXT DEFAULT 'US',
    store_phone TEXT,
    
    -- Branding
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🛍️ E-commerce Tables

### Product Catalog

#### categories
**Purpose**: Product categorization and organization
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, slug)
);
```

#### products
**Purpose**: Product catalog with variants and inventory
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    sku TEXT,
    barcode TEXT,
    inventory_quantity INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT true,
    low_stock_threshold INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    weight DECIMAL(8,2),
    
    -- Images
    image_url TEXT,
    image_alt TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    search_keywords TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(store_id, sku) WHERE sku IS NOT NULL
);
```

### Customer Management

#### customers
**Purpose**: Store customer profiles and contact information
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional link to auth
    email TEXT NOT NULL,
    google_id TEXT,
    apple_id TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    
    -- Shipping Address
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT DEFAULT 'US',
    
    -- Billing Address
    billing_different_from_shipping BOOLEAN DEFAULT false,
    billing_address_line1 TEXT,
    billing_address_line2 TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_postal_code TEXT,
    billing_country TEXT DEFAULT 'US',
    
    -- Customer Status
    is_active BOOLEAN DEFAULT true,
    accepts_marketing BOOLEAN DEFAULT false,
    total_spent DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(store_id, email)
);
```

### Order Management

#### orders
**Purpose**: Order processing and fulfillment tracking
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    
    -- Order Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'voided')),
    
    -- Financial Information
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Shipping Information
    shipping_address JSONB,
    billing_address JSONB,
    shipping_method TEXT,
    tracking_number TEXT,
    
    -- Order Notes
    notes TEXT,
    customer_notes TEXT,
    
    -- Important Dates
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(store_id, order_number)
);
```

#### order_items
**Purpose**: Individual items within orders
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID, -- Future: product variants
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Product snapshot at time of order
    product_name TEXT NOT NULL,
    product_sku TEXT,
    product_image TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Shopping Cart

#### cart_items
**Purpose**: Shopping cart functionality for customers and guests
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest carts
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID, -- Future: product variants
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Either customer_id or session_id must be present
    CHECK (
        (customer_id IS NOT NULL AND session_id IS NULL) OR
        (customer_id IS NULL AND session_id IS NOT NULL)
    ),
    
    -- Prevent duplicate items in same cart
    UNIQUE(store_id, customer_id, product_id, variant_id),
    UNIQUE(store_id, session_id, product_id, variant_id)
);
```

### Payment Processing

#### payments
**Purpose**: Payment transaction tracking and reconciliation
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Payment Provider Information
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    stripe_refund_id TEXT,
    
    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
    payment_method TEXT, -- 'card', 'paypal', 'apple_pay', etc.
    payment_method_details JSONB, -- Detailed payment method info
    
    -- Transaction Information
    transaction_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2),
    failure_code TEXT,
    failure_message TEXT,
    
    -- Important Timestamps
    authorized_at TIMESTAMP WITH TIME ZONE,
    captured_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📄 Content Management

### Page Builder System

#### pages
**Purpose**: Visual page builder content storage
```sql
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    page_type TEXT DEFAULT 'page' CHECK (page_type IN ('page', 'homepage', 'product', 'collection', 'blog', 'system')),
    
    -- Page Content (JSON document)
    content JSONB NOT NULL DEFAULT '{"sections": []}',
    
    -- SEO & Metadata
    meta_title TEXT,
    meta_description TEXT,
    og_image TEXT,
    
    -- Publishing
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- System Pages
    is_system_page BOOLEAN DEFAULT false,
    system_page_type TEXT, -- 'header', 'footer', etc.
    
    -- Template
    template_name TEXT DEFAULT 'default',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(store_id, slug),
    -- Only one homepage per store
    EXCLUDE (store_id WITH =) WHERE (page_type = 'homepage' AND is_published = true)
);
```

#### page_revisions
**Purpose**: Version history for page builder content
```sql
CREATE TABLE page_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    
    -- Change Information
    changed_by UUID REFERENCES store_owners(id),
    change_summary TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(page_id, revision_number)
);
```

## 📊 Analytics & Reporting

### analytics_events
**Purpose**: Custom event tracking for business intelligence
```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Event Information
    event_type TEXT NOT NULL, -- 'page_view', 'purchase', 'cart_add', etc.
    event_name TEXT NOT NULL,
    
    -- Event Data
    properties JSONB DEFAULT '{}',
    user_id UUID,
    session_id TEXT,
    
    -- Context
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    page_url TEXT,
    
    -- Geographic Data
    country TEXT,
    region TEXT,
    city TEXT,
    
    -- Timestamp
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partition by month for performance
ALTER TABLE analytics_events PARTITION BY RANGE (occurred_at);
```

### analytics_summary
**Purpose**: Pre-aggregated analytics data for fast dashboard queries
```sql
CREATE TABLE analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Time Dimension
    date DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('day', 'week', 'month')),
    
    -- Metrics
    total_sessions INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,4) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0, -- seconds
    
    -- E-commerce Metrics
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(store_id, date, period_type)
);
```

## 🔧 System Configuration

### system_api_keys
**Purpose**: Encrypted storage of API keys and secrets
```sql
CREATE TABLE system_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Key Identification
    service_name TEXT NOT NULL, -- 'google_maps', 'stripe', 'sendgrid', etc.
    key_type TEXT NOT NULL, -- 'api_key', 'secret_key', 'webhook_secret', etc.
    
    -- Encrypted Key Storage
    encrypted_key TEXT NOT NULL, -- Encrypted using pg_crypto
    key_hint TEXT, -- Last 4 characters for identification
    
    -- Key Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage Tracking
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(store_id, service_name, key_type)
);
```

### email_configurations
**Purpose**: Email service provider configuration
```sql
CREATE TABLE email_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Provider Configuration
    provider TEXT NOT NULL CHECK (provider IN ('sendgrid', 'resend', 'mailgun', 'ses')),
    api_key_encrypted TEXT NOT NULL,
    
    -- Email Settings
    from_email TEXT NOT NULL,
    from_name TEXT NOT NULL,
    reply_to_email TEXT,
    
    -- Template Settings
    welcome_template_id TEXT,
    order_confirmation_template_id TEXT,
    shipping_notification_template_id TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_tested_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(store_id)
);
```

### analytics_configurations
**Purpose**: Analytics service integration configuration
```sql
CREATE TABLE analytics_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Google Analytics 4
    ga4_measurement_id TEXT,
    ga4_api_secret TEXT, -- Encrypted
    ga4_enabled BOOLEAN DEFAULT false,
    
    -- Meta Pixel
    meta_pixel_id TEXT,
    meta_access_token TEXT, -- Encrypted
    meta_enabled BOOLEAN DEFAULT false,
    
    -- Custom Analytics
    custom_tracking_code TEXT,
    
    -- Configuration Status
    is_active BOOLEAN DEFAULT true,
    last_tested_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(store_id)
);
```

## 📋 Store Policies

### store_policies
**Purpose**: Legal and policy content for stores
```sql
CREATE TABLE store_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Policy Content
    privacy_policy TEXT,
    terms_of_service TEXT,
    returns_policy TEXT,
    shipping_policy TEXT,
    about_us TEXT,
    
    -- Policy Status
    policies_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(store_id)
);
```

## 🔍 Indexes for Performance

### Primary Indexes
```sql
-- Multi-tenant query optimization
CREATE INDEX idx_stores_owner_active ON stores(store_owner_id, is_active);
CREATE INDEX idx_products_store_active ON products(store_id, is_active);
CREATE INDEX idx_orders_store_status ON orders(store_id, status, created_at DESC);
CREATE INDEX idx_customers_store_email ON customers(store_id, email);

-- E-commerce Performance
CREATE INDEX idx_products_category ON products(category_id) WHERE is_active = true;
CREATE INDEX idx_products_featured ON products(store_id) WHERE is_featured = true AND is_active = true;
CREATE INDEX idx_cart_items_customer ON cart_items(customer_id, store_id);
CREATE INDEX idx_cart_items_session ON cart_items(session_id, store_id);

-- Analytics Performance
CREATE INDEX idx_analytics_events_store_date ON analytics_events(store_id, occurred_at DESC);
CREATE INDEX idx_analytics_summary_store_date ON analytics_summary(store_id, date DESC);

-- Search Optimization
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_customers_name ON customers USING gin(to_tsvector('english', first_name || ' ' || last_name));
```

## 🔒 Row Level Security (RLS) Policies

### Multi-Tenant Security Pattern
```sql
-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ... (all other tables)

-- Standard tenant isolation policy
CREATE POLICY tenant_isolation ON stores FOR ALL USING (
    store_owner_id = auth.uid()
);

-- Store-level data access policy  
CREATE POLICY store_data_access ON products FOR ALL USING (
    store_id IN (
        SELECT id FROM stores WHERE store_owner_id = auth.uid()
    )
);

-- Customer privacy policy
CREATE POLICY customer_privacy ON customers FOR ALL USING (
    -- Store owners can access customers in their stores
    store_id IN (
        SELECT id FROM stores WHERE store_owner_id = auth.uid()
    )
    OR
    -- Customers can access their own data
    user_id = auth.uid()
);
```

## 🗃️ Extensions and Functions

### Required Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Text similarity search
CREATE EXTENSION IF NOT EXISTS "unaccent";     -- Accent removal for search
```

### Utility Functions
```sql
-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number(store_id UUID)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    sequence_num INTEGER;
    order_number TEXT;
BEGIN
    -- Get store prefix (first 3 chars of store name, uppercase)
    SELECT UPPER(LEFT(REGEXP_REPLACE(store_name, '[^a-zA-Z0-9]', '', 'g'), 3))
    INTO prefix
    FROM stores
    WHERE id = store_id;
    
    -- Get next sequence number for this store
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE orders.store_id = generate_order_number.store_id;
    
    -- Format: ABC1001, ABC1002, etc.
    order_number := prefix || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Update total_spent for customers
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer total_spent and total_orders
    UPDATE customers
    SET 
        total_spent = (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE customer_id = NEW.customer_id
              AND payment_status = 'paid'
        ),
        total_orders = (
            SELECT COUNT(*)
            FROM orders
            WHERE customer_id = NEW.customer_id
        ),
        updated_at = NOW()
    WHERE id = NEW.customer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer stats when order changes
CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();
```

## 📈 Performance Considerations

### Query Optimization
- All queries use indexes optimized for multi-tenant access patterns
- Composite indexes cover common query combinations
- Partial indexes for boolean columns with frequent filtering

### Scaling Strategy
- Table partitioning for time-series data (analytics_events)
- Read replicas for analytics queries
- Connection pooling for high concurrency

### Monitoring
- Query performance monitoring via pg_stat_statements
- Index usage tracking and optimization
- Regular VACUUM and ANALYZE scheduling

---

## 🔗 Related Documentation

- [RLS Policies Detailed](./rls-policies.md)
- [Performance Tuning](./indexes-performance.md)
- [Migration Scripts](./migrations/README.md)

---

*This schema documentation is maintained by the database team. For questions or changes, please refer to the database migration process.*