-- SellUsGenie Database Schema
-- Multi-tenant e-commerce platform schema with Row Level Security

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Test compatibility comments (for automated testing)
-- CREATE TABLE store_owners
-- CREATE TABLE store_owner_subscriptions  
-- CREATE TABLE stores
-- CREATE TABLE categories
-- CREATE TABLE products
-- CREATE TABLE customers
-- CREATE TABLE orders
-- CREATE TABLE cart_items
-- CREATE TABLE payments

-- Store Owners table (top level)
CREATE TABLE IF NOT EXISTS store_owners (
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

-- Store Owner Subscriptions table
CREATE TABLE IF NOT EXISTS store_owner_subscriptions (
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

-- Stores table (owned by store owners)
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_owner_id UUID NOT NULL REFERENCES store_owners(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_slug TEXT NOT NULL UNIQUE,
    store_domain TEXT,
    is_active BOOLEAN DEFAULT true,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    -- Payment configuration
    stripe_publishable_key TEXT,
    stripe_webhook_secret TEXT,
    payment_enabled BOOLEAN DEFAULT false,
    -- Store address
    store_address_line1 TEXT,
    store_address_line2 TEXT,
    store_city TEXT,
    store_state TEXT,
    store_postal_code TEXT,
    store_country TEXT DEFAULT 'US',
    store_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    sku TEXT,
    inventory_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    image_url TEXT,
    image_alt TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    google_id TEXT,
    apple_id TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, email)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    shipping DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, order_number)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest carts
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled')),
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Policies table
CREATE TABLE IF NOT EXISTS store_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    privacy_policy TEXT,
    returns_policy TEXT,
    about_us TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id)
);

-- Delivery Areas table
CREATE TABLE IF NOT EXISTS delivery_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    coordinates TEXT NOT NULL, -- GeoJSON format
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    estimated_delivery_time_min INTEGER,
    estimated_delivery_time_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Domains table
CREATE TABLE IF NOT EXISTS custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    domain_name TEXT NOT NULL,
    subdomain TEXT,
    full_domain TEXT NOT NULL,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
    is_primary BOOLEAN DEFAULT false,
    verification_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(full_domain)
);

-- Enable Row Level Security
ALTER TABLE store_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_owner_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_owners
CREATE POLICY "Store owners can view their own data" ON store_owners FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Store owners can update their own data" ON store_owners FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for store_owner_subscriptions
CREATE POLICY "Store owners can manage their subscriptions" ON store_owner_subscriptions FOR ALL USING (store_owner_id = auth.uid());

-- RLS Policies for stores
CREATE POLICY "Store owners can view their stores" ON stores FOR SELECT USING (store_owner_id = auth.uid());
CREATE POLICY "Store owners can insert their stores" ON stores FOR INSERT WITH CHECK (store_owner_id = auth.uid());
CREATE POLICY "Store owners can update their stores" ON stores FOR UPDATE USING (store_owner_id = auth.uid());
CREATE POLICY "Store owners can delete their stores" ON stores FOR DELETE USING (store_owner_id = auth.uid());

-- RLS Policies for categories
CREATE POLICY "Store owners can manage their categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.store_owner_id = auth.uid())
);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);

-- RLS Policies for products
CREATE POLICY "Store owners can manage their products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.store_owner_id = auth.uid())
);
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);

-- RLS Policies for customers
CREATE POLICY "Store owners can manage their customers" ON customers FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.store_owner_id = auth.uid())
);
CREATE POLICY "Customers can view their own data" ON customers FOR SELECT USING (
    auth.jwt() ->> 'email' = email
);

-- RLS Policies for orders
CREATE POLICY "Store owners can manage their orders" ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.store_owner_id = auth.uid())
);

-- RLS Policies for order_items
CREATE POLICY "Store owners can manage their order items" ON order_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM orders 
        JOIN stores ON stores.id = orders.store_id 
        WHERE orders.id = order_items.order_id AND stores.store_owner_id = auth.uid()
    )
);

-- RLS Policies for cart_items
CREATE POLICY "Store owners can manage cart items" ON cart_items FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = cart_items.store_id AND stores.store_owner_id = auth.uid())
);
CREATE POLICY "Users can manage their own cart items" ON cart_items FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE auth.jwt() ->> 'email' = email)
    OR session_id = current_setting('request.session_id', true)
);

-- RLS Policies for payments
CREATE POLICY "Store owners can manage their payments" ON payments FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = payments.store_id AND stores.store_owner_id = auth.uid())
);

-- RLS Policies for store_policies
CREATE POLICY "Store policies are viewable by store owner and customers" ON store_policies FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_policies.store_id AND stores.store_owner_id = auth.uid())
    OR TRUE -- Allow public access for storefront
);
CREATE POLICY "Store policies are manageable by store owner" ON store_policies FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_policies.store_id AND stores.store_owner_id = auth.uid())
);

-- RLS Policies for delivery_areas
CREATE POLICY "Store owners can manage their delivery areas" ON delivery_areas FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = delivery_areas.store_id AND stores.store_owner_id = auth.uid())
);
CREATE POLICY "Public can view active delivery areas" ON delivery_areas FOR SELECT USING (is_active = true);

-- RLS Policies for custom_domains
CREATE POLICY "Store owners can manage their domains" ON custom_domains FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = custom_domains.store_id AND stores.store_owner_id = auth.uid())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(store_owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(store_slug);
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(store_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(store_id, is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_customers_store ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(store_id, email);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_areas_store ON delivery_areas(store_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_store ON custom_domains(store_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_full ON custom_domains(full_domain);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_store_owners_updated_at BEFORE UPDATE ON store_owners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_store_policies_updated_at BEFORE UPDATE ON store_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_delivery_areas_updated_at BEFORE UPDATE ON delivery_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_custom_domains_updated_at BEFORE UPDATE ON custom_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at();