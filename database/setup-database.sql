-- Sell Us Genie Database Schema Setup
-- Run this script in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('trial', 'basic', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trial', 'cancelled');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Store Owners (can own multiple stores)
CREATE TABLE store_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    apple_id VARCHAR(255) UNIQUE,
    subscription_tier subscription_tier DEFAULT 'trial',
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
    description TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    subscription_status subscription_status DEFAULT 'trial',
    trial_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store owner subscriptions (billing per store owner, not per store)
CREATE TABLE store_owner_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_owner_id UUID NOT NULL REFERENCES store_owners(id) ON DELETE CASCADE,
    subscription_tier subscription_tier NOT NULL,
    status subscription_status NOT NULL,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products (isolated per store)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    weight DECIMAL(8,2),
    dimensions JSONB,
    images JSONB,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    inventory_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, email)
);

-- Customer addresses
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type VARCHAR(50) DEFAULT 'shipping', -- shipping, billing
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
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    shipping_address JSONB,
    billing_address JSONB,
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
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items (isolated per store)
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest carts
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure either customer_id or session_id is provided, but not both
    CONSTRAINT cart_items_customer_or_session CHECK (
        (customer_id IS NOT NULL AND session_id IS NULL) OR 
        (customer_id IS NULL AND session_id IS NOT NULL)
    )
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL, -- stripe, paypal, etc.
    payment_status payment_status DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store settings (isolated per store)
CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, setting_key)
);

-- Create indexes for better performance
CREATE INDEX idx_stores_store_owner_id ON stores(store_owner_id);
CREATE INDEX idx_stores_store_slug ON stores(store_slug);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_items_store_id ON cart_items(store_id);
CREATE INDEX idx_cart_items_customer_id ON cart_items(customer_id);
CREATE INDEX idx_cart_items_session_id ON cart_items(session_id);

-- Unique constraints for cart items (using partial indexes)
CREATE UNIQUE INDEX idx_cart_items_customer_unique ON cart_items(store_id, customer_id, product_id) 
    WHERE customer_id IS NOT NULL;
CREATE UNIQUE INDEX idx_cart_items_session_unique ON cart_items(store_id, session_id, product_id) 
    WHERE session_id IS NOT NULL;
CREATE INDEX idx_payments_order_id ON payments(order_id);
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
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE store_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_owner_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Store Owners
CREATE POLICY "Store owners can view own data" ON store_owners FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Store owners can update own data" ON store_owners FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Store owners can insert own data" ON store_owners FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for Stores
CREATE POLICY "Store owners can view own stores" ON stores FOR SELECT USING (store_owner_id::text = auth.uid()::text);
CREATE POLICY "Store owners can update own stores" ON stores FOR UPDATE USING (store_owner_id::text = auth.uid()::text);
CREATE POLICY "Store owners can insert own stores" ON stores FOR INSERT WITH CHECK (store_owner_id::text = auth.uid()::text);
CREATE POLICY "Public can view active stores" ON stores FOR SELECT USING (is_active = true);

-- RLS Policies for Store Owner Subscriptions
CREATE POLICY "Store owners can view own subscriptions" ON store_owner_subscriptions FOR SELECT USING (store_owner_id::text = auth.uid()::text);
CREATE POLICY "Store owners can update own subscriptions" ON store_owner_subscriptions FOR UPDATE USING (store_owner_id::text = auth.uid()::text);
CREATE POLICY "Store owners can insert own subscriptions" ON store_owner_subscriptions FOR INSERT WITH CHECK (store_owner_id::text = auth.uid()::text);

-- RLS Policies for Categories
CREATE POLICY "Store owners can view own store categories" ON categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can manage own store categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);

-- RLS Policies for Products
CREATE POLICY "Store owners can view own store products" ON products FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can manage own store products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);

-- RLS Policies for Customers
CREATE POLICY "Store owners can view own store customers" ON customers FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can manage own store customers" ON customers FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Customers can view own data" ON customers FOR SELECT USING (id::text = auth.uid()::text);
CREATE POLICY "Customers can update own data" ON customers FOR UPDATE USING (id::text = auth.uid()::text);

-- RLS Policies for Customer Addresses
CREATE POLICY "Store owners can view own store customer addresses" ON customer_addresses FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers 
            JOIN stores ON stores.id = customers.store_id 
            WHERE customers.id = customer_addresses.customer_id 
            AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can manage own store customer addresses" ON customer_addresses FOR ALL USING (
    EXISTS (SELECT 1 FROM customers 
            JOIN stores ON stores.id = customers.store_id 
            WHERE customers.id = customer_addresses.customer_id 
            AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Customers can view own addresses" ON customer_addresses FOR SELECT USING (
    customer_id::text = auth.uid()::text
);
CREATE POLICY "Customers can manage own addresses" ON customer_addresses FOR ALL USING (
    customer_id::text = auth.uid()::text
);

-- RLS Policies for Orders
CREATE POLICY "Store owners can view own store orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can manage own store orders" ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (customer_id::text = auth.uid()::text);
CREATE POLICY "Customers can update own orders" ON orders FOR UPDATE USING (customer_id::text = auth.uid()::text);

-- RLS Policies for Order Items
CREATE POLICY "Store owners can view own store order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders 
            JOIN stores ON stores.id = orders.store_id 
            WHERE orders.id = order_items.order_id 
            AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can manage own store order items" ON order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM orders 
            JOIN stores ON stores.id = orders.store_id 
            WHERE orders.id = order_items.order_id 
            AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Customers can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id::text = auth.uid()::text)
);

-- RLS Policies for Cart Items
CREATE POLICY "Store owners can view own store cart items" ON cart_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = cart_items.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can manage own store cart items" ON cart_items FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = cart_items.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Customers can view own cart items" ON cart_items FOR SELECT USING (customer_id::text = auth.uid()::text);
CREATE POLICY "Customers can manage own cart items" ON cart_items FOR ALL USING (customer_id::text = auth.uid()::text);
CREATE POLICY "Public can manage session cart items" ON cart_items FOR ALL USING (session_id IS NOT NULL);

-- RLS Policies for Payments
CREATE POLICY "Store owners can view own store payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders 
            JOIN stores ON stores.id = orders.store_id 
            WHERE orders.id = payments.order_id 
            AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can manage own store payments" ON payments FOR ALL USING (
    EXISTS (SELECT 1 FROM orders 
            JOIN stores ON stores.id = orders.store_id 
            WHERE orders.id = payments.order_id 
            AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Customers can view own payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.customer_id::text = auth.uid()::text)
);

-- RLS Policies for Store Settings
CREATE POLICY "Store owners can view own store settings" ON store_settings FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_settings.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can manage own store settings" ON store_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_settings.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

-- Note: Default store settings will be created when actual stores are created
-- No default settings needed as they will be provisioned per store

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') || '-' || LPAD(NEW.id::text, 8, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply order number trigger
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Create function to check trial expiration
CREATE OR REPLACE FUNCTION check_trial_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if trial has expired
    IF NEW.trial_expires_at IS NOT NULL AND NEW.trial_expires_at < NOW() THEN
        NEW.subscription_status := 'inactive';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trial expiration triggers
CREATE TRIGGER check_trial_expiration_store_owners_trigger BEFORE UPDATE ON store_owners FOR EACH ROW EXECUTE FUNCTION check_trial_expiration();
CREATE TRIGGER check_trial_expiration_stores_trigger BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION check_trial_expiration();

-- Create function to update product inventory
CREATE OR REPLACE FUNCTION update_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease inventory when order item is created
    UPDATE products 
    SET inventory_quantity = inventory_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply inventory update trigger
CREATE TRIGGER update_product_inventory_trigger AFTER INSERT ON order_items FOR EACH ROW EXECUTE FUNCTION update_product_inventory();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Set up default policies for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;
