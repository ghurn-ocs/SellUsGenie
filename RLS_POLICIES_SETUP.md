# 🚨 CRITICAL: Missing RLS Policies Fix

## Problem Identified
The "Failed to create order" error is caused by missing Row Level Security (RLS) policies for the `orders`, `customers`, and other tables. These tables have RLS enabled but no policies defined, which prevents all access.

## Quick Fix Required

### Option 1: Manual Setup via Supabase Dashboard (Recommended)

1. **Open your Supabase project dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `jizobmpcyrzprrwsyedv`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Create a new query

3. **Copy and paste the following SQL** (this is the complete policy setup):

```sql
-- Missing RLS Policies for SellUsGenie Database

-- Customers RLS Policies
CREATE POLICY "Store owners can view own store customers" ON customers FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can insert own store customers" ON customers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can update own store customers" ON customers FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can delete own store customers" ON customers FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = customers.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

-- Orders RLS Policies
CREATE POLICY "Store owners can view own store orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can insert own store orders" ON orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can update own store orders" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can delete own store orders" ON orders FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

-- Order Items RLS Policies
CREATE POLICY "Store owners can view own store order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        JOIN stores ON stores.id = orders.store_id 
        WHERE orders.id = order_items.order_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

CREATE POLICY "Store owners can insert own store order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        JOIN stores ON stores.id = orders.store_id 
        WHERE orders.id = order_items.order_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

CREATE POLICY "Store owners can update own store order items" ON order_items FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM orders 
        JOIN stores ON stores.id = orders.store_id 
        WHERE orders.id = order_items.order_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

CREATE POLICY "Store owners can delete own store order items" ON order_items FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM orders 
        JOIN stores ON stores.id = orders.store_id 
        WHERE orders.id = order_items.order_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

-- Customer Addresses RLS Policies
CREATE POLICY "Store owners can view own store customer addresses" ON customer_addresses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM customers 
        JOIN stores ON stores.id = customers.store_id 
        WHERE customers.id = customer_addresses.customer_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

CREATE POLICY "Store owners can insert own store customer addresses" ON customer_addresses FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM customers 
        JOIN stores ON stores.id = customers.store_id 
        WHERE customers.id = customer_addresses.customer_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

CREATE POLICY "Store owners can update own store customer addresses" ON customer_addresses FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM customers 
        JOIN stores ON stores.id = customers.store_id 
        WHERE customers.id = customer_addresses.customer_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

CREATE POLICY "Store owners can delete own store customer addresses" ON customer_addresses FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM customers 
        JOIN stores ON stores.id = customers.store_id 
        WHERE customers.id = customer_addresses.customer_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

-- Cart Items RLS Policies
CREATE POLICY "Store owners can view own store cart items" ON cart_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = cart_items.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can insert own store cart items" ON cart_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = cart_items.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can update own store cart items" ON cart_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = cart_items.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can delete own store cart items" ON cart_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = cart_items.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

-- Payments RLS Policies
CREATE POLICY "Store owners can view own store payments" ON payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        JOIN stores ON stores.id = orders.store_id 
        WHERE orders.id = payments.order_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

CREATE POLICY "Store owners can insert own store payments" ON payments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        JOIN stores ON stores.id = orders.store_id 
        WHERE orders.id = payments.order_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

CREATE POLICY "Store owners can update own store payments" ON payments FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM orders 
        JOIN stores ON stores.id = orders.store_id 
        WHERE orders.id = payments.order_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

CREATE POLICY "Store owners can delete own store payments" ON payments FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM orders 
        JOIN stores ON stores.id = orders.store_id 
        WHERE orders.id = payments.order_id 
        AND stores.store_owner_id::text = auth.uid()::text
    )
);

-- Categories RLS Policies
CREATE POLICY "Store owners can view own store categories" ON categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can insert own store categories" ON categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can update own store categories" ON categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can delete own store categories" ON categories FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

-- Store Settings RLS Policies
CREATE POLICY "Store owners can view own store settings" ON store_settings FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_settings.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can insert own store settings" ON store_settings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_settings.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can update own store settings" ON store_settings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_settings.store_id AND stores.store_owner_id::text = auth.uid()::text)
);

CREATE POLICY "Store owners can delete own store settings" ON store_settings FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = store_settings.store_id AND stores.store_owner_id::text = auth.uid()::text)
);
```

4. **Run the SQL**
   - Click "Run" to execute all the policies
   - You should see success messages for each policy created

5. **Test the fix**
   - Go back to your application
   - Try creating an order again
   - It should now work!

## What This Fixes

✅ **Order Creation** - Users can now create orders  
✅ **Customer Management** - Customer CRUD operations will work  
✅ **Data Security** - Proper multi-tenant isolation is enforced  
✅ **Store Isolation** - Store owners can only access their own data  

## Alternative: Copy the SQL file

If you prefer, you can copy the SQL from `database/rls-policies.sql` and paste it directly into the Supabase SQL editor.

## Root Cause

The original database schema had this comment:
```sql
-- (Additional RLS policies would be added for categories, customers, orders, etc.)
```

But the policies were never actually implemented, leaving these tables inaccessible even though RLS was enabled.

This is a **critical fix** that will resolve the order creation issue immediately.