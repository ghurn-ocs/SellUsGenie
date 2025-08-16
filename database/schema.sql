-- StreamSell Multi-Tenant E-commerce Platform Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Store Owners (can own multiple stores)
CREATE TABLE store_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    apple_id VARCHAR(255) UNIQUE,
    subscription_tier VARCHAR(50) DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'basic', 'pro', 'enterprise')),
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual stores owned by store owners
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES store_owners(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    store_slug VARCHAR(100) UNIQUE NOT NULL,
    store_domain VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscription_status VARCHAR(50) DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store owner subscriptions (billing per store owner, not per store)
CREATE TABLE store_owner_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES store_owners(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('basic', 'pro', 'enterprise')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products (isolated per store)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
    sku VARCHAR(100),
    inventory_quantity INTEGER DEFAULT 0 CHECK (inventory_quantity >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories (isolated per store)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product-category relationships
CREATE TABLE product_categories (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Customers (isolated per store)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    google_id VARCHAR(255),
    apple_id VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, email)
);

-- Customer addresses
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type VARCHAR(50) DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders (isolated per store)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax DECIMAL(10,2) DEFAULT 0 CHECK (tax >= 0),
    shipping DECIMAL(10,2) DEFAULT 0 CHECK (shipping >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping cart (session-based)
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, session_id, product_id)
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store settings
CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, setting_key)
);

-- Create indexes for performance
CREATE INDEX idx_stores_owner_id ON stores(store_owner_id);
CREATE INDEX idx_stores_slug ON stores(store_slug);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_categories_store_id ON categories(store_id);
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_cart_items_store_session ON cart_items(store_id, session_id);
CREATE INDEX idx_store_settings_store_id ON store_settings(store_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_store_owners_updated_at BEFORE UPDATE ON store_owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_owner_subscriptions_updated_at BEFORE UPDATE ON store_owner_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE store_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_owner_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Store owners can only access their own data
CREATE POLICY "Store owners can view own data" ON store_owners FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Store owners can update own data" ON store_owners FOR UPDATE USING (auth.uid()::text = id::text);

-- Store owners can only access their own stores
CREATE POLICY "Store owners can view own stores" ON stores FOR SELECT USING (store_owner_id::text = auth.uid()::text);
CREATE POLICY "Store owners can insert own stores" ON stores FOR INSERT WITH CHECK (store_owner_id::text = auth.uid()::text);
CREATE POLICY "Store owners can update own stores" ON stores FOR UPDATE USING (store_owner_id::text = auth.uid()::text);

-- Store owners can only access their own subscriptions
CREATE POLICY "Store owners can view own subscriptions" ON store_owner_subscriptions FOR SELECT USING (store_owner_id::text = auth.uid()::text);
CREATE POLICY "Store owners can insert own subscriptions" ON store_owner_subscriptions FOR INSERT WITH CHECK (store_owner_id::text = auth.uid()::text);
CREATE POLICY "Store owners can update own subscriptions" ON store_owner_subscriptions FOR UPDATE USING (store_owner_id::text = auth.uid()::text);

-- Store owners can only access products in their stores
CREATE POLICY "Store owners can view own store products" ON products FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can insert own store products" ON products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can update own store products" ON products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

-- Similar policies for other tables...
-- (Additional RLS policies would be added for categories, customers, orders, etc.)

-- Insert some default store settings
INSERT INTO store_settings (store_id, setting_key, setting_value) VALUES
(uuid_generate_v4(), 'currency', 'USD'),
(uuid_generate_v4(), 'tax_rate', '0.08'),
(uuid_generate_v4(), 'shipping_cost', '5.99');
