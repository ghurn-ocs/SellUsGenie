-- =====================================================
-- SellUsGenie Promotions and Gift Cards System Migration
-- Version: 1.0
-- Date: January 2025
-- Description: Comprehensive promotion and gift card system with multi-tenant security
-- =====================================================

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS idempotency_keys CASCADE;
DROP TABLE IF EXISTS gift_card_transactions CASCADE;
DROP TABLE IF EXISTS promotion_usages CASCADE;
DROP TABLE IF EXISTS gift_cards CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Promotions/Coupons Table
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Promotion Type & Value
    type TEXT NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BOGO', 'TIERED')),
    value NUMERIC(12,2), -- percentage or fixed amount
    currency TEXT DEFAULT 'USD',
    
    -- Eligibility Rules
    min_order_amount NUMERIC(12,2) DEFAULT 0,
    max_discount_amount NUMERIC(12,2), -- cap for percentage discounts
    eligible_categories UUID[], -- array of category IDs
    eligible_products UUID[], -- array of product IDs
    excluded_categories UUID[],
    excluded_products UUID[],
    
    -- Usage Limits
    max_uses INTEGER, -- global usage limit
    max_uses_per_customer INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    
    -- Customer Restrictions
    first_order_only BOOLEAN DEFAULT FALSE,
    customer_segments TEXT[], -- array of customer tags/segments
    
    -- Scheduling
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    
    -- Stacking & Priority
    priority INTEGER DEFAULT 100,
    stackable BOOLEAN DEFAULT FALSE,
    exclusive BOOLEAN DEFAULT FALSE,
    
    -- Status & Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES store_owners(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(store_id, code)
);

-- Gift Cards Table
CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Gift Card Identity
    code TEXT NOT NULL UNIQUE, -- 16-20 character secure code
    pin TEXT, -- optional 4-6 digit PIN (hashed)
    
    -- Financial Details
    currency TEXT NOT NULL DEFAULT 'USD',
    initial_balance NUMERIC(12,2) NOT NULL CHECK (initial_balance > 0),
    current_balance NUMERIC(12,2) NOT NULL CHECK (current_balance >= 0),
    
    -- Status & Expiry
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED')),
    expires_at TIMESTAMPTZ,
    
    -- Customer Association
    issued_to_customer UUID REFERENCES customers(id),
    issued_to_email TEXT,
    
    -- Metadata
    purchase_order_id UUID, -- if purchased through the store
    created_by UUID REFERENCES store_owners(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotion Usage Tracking
CREATE TABLE promotion_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    order_id UUID, -- will reference orders table
    session_id TEXT, -- for guest checkout tracking
    
    -- Usage Details
    discount_amount NUMERIC(12,2) NOT NULL,
    order_total NUMERIC(12,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(promotion_id, order_id) -- prevent double application
);

-- Gift Card Transaction Ledger
CREATE TABLE gift_card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Transaction Details
    type TEXT NOT NULL CHECK (type IN ('LOAD', 'REDEEM', 'REFUND', 'ADJUSTMENT', 'EXPIRY')),
    amount NUMERIC(12,2) NOT NULL,
    balance_after NUMERIC(12,2) NOT NULL,
    
    -- Context
    order_id UUID, -- reference to order if applicable
    reference_id TEXT, -- external reference (payment ID, etc.)
    description TEXT,
    
    -- Metadata
    performed_by UUID, -- store owner or system
    performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotency Keys for Safe Operations
CREATE TABLE idempotency_keys (
    key TEXT PRIMARY KEY,
    scope TEXT NOT NULL, -- 'promotion_apply', 'gift_card_redeem', etc.
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Promotions indexes
CREATE INDEX idx_promotions_store_code ON promotions(store_id, code);
CREATE INDEX idx_promotions_active_dates ON promotions(store_id, is_active, starts_at, ends_at);
CREATE INDEX idx_promotions_type ON promotions(store_id, type);
CREATE INDEX idx_promotions_priority ON promotions(store_id, priority DESC, is_active);

-- Gift cards indexes
CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_store_status ON gift_cards(store_id, status);
CREATE INDEX idx_gift_cards_customer ON gift_cards(issued_to_customer);
CREATE INDEX idx_gift_cards_balance ON gift_cards(store_id, current_balance) WHERE current_balance > 0;

-- Usage tracking indexes
CREATE INDEX idx_promotion_usages_promotion ON promotion_usages(promotion_id, used_at DESC);
CREATE INDEX idx_promotion_usages_customer ON promotion_usages(customer_id, used_at DESC);
CREATE INDEX idx_promotion_usages_store ON promotion_usages(store_id, used_at DESC);

-- Gift card transactions indexes
CREATE INDEX idx_gift_card_transactions_card ON gift_card_transactions(gift_card_id, performed_at DESC);
CREATE INDEX idx_gift_card_transactions_store ON gift_card_transactions(store_id, performed_at DESC);
CREATE INDEX idx_gift_card_transactions_order ON gift_card_transactions(order_id) WHERE order_id IS NOT NULL;

-- Idempotency keys indexes
CREATE INDEX idx_idempotency_keys_store_scope ON idempotency_keys(store_id, scope);
CREATE INDEX idx_idempotency_keys_expires ON idempotency_keys(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Promotions RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their own store promotions
CREATE POLICY promotions_store_owner_full_access ON promotions
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE store_owner_id = auth.uid()
        )
    );

-- Customers and public can view active promotions (for storefront)
CREATE POLICY promotions_public_view ON promotions
    FOR SELECT USING (
        is_active = TRUE 
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (ends_at IS NULL OR ends_at >= NOW())
    );

-- Gift Cards RLS
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their own store gift cards
CREATE POLICY gift_cards_store_owner_full_access ON gift_cards
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE store_owner_id = auth.uid()
        )
    );

-- Customers can view their own gift cards
CREATE POLICY gift_cards_customer_view ON gift_cards
    FOR SELECT USING (
        issued_to_customer = auth.uid()
        OR issued_to_email = auth.email()
    );

-- Promotion Usage RLS
ALTER TABLE promotion_usages ENABLE ROW LEVEL SECURITY;

-- Store owners can view usage for their promotions
CREATE POLICY promotion_usages_store_owner_access ON promotion_usages
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE store_owner_id = auth.uid()
        )
    );

-- Customers can view their own usage
CREATE POLICY promotion_usages_customer_view ON promotion_usages
    FOR SELECT USING (customer_id = auth.uid());

-- Gift Card Transactions RLS
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- Store owners can view transactions for their gift cards
CREATE POLICY gift_card_transactions_store_owner_access ON gift_card_transactions
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE store_owner_id = auth.uid()
        )
    );

-- Customers can view transactions for their gift cards
CREATE POLICY gift_card_transactions_customer_view ON gift_card_transactions
    FOR SELECT USING (
        gift_card_id IN (
            SELECT id FROM gift_cards 
            WHERE issued_to_customer = auth.uid()
        )
    );

-- Idempotency Keys RLS
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Store owners can manage idempotency keys for their stores
CREATE POLICY idempotency_keys_store_access ON idempotency_keys
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores 
            WHERE store_owner_id = auth.uid()
        )
    );

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update promotion current_uses when usage is added
CREATE OR REPLACE FUNCTION update_promotion_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE promotions 
        SET current_uses = current_uses + 1,
            updated_at = NOW()
        WHERE id = NEW.promotion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE promotions 
        SET current_uses = GREATEST(current_uses - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.promotion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_promotion_usage_count
    AFTER INSERT OR DELETE ON promotion_usages
    FOR EACH ROW EXECUTE FUNCTION update_promotion_usage_count();

-- Update gift card balance when transaction is added
CREATE OR REPLACE FUNCTION update_gift_card_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the gift card balance
    UPDATE gift_cards 
    SET current_balance = NEW.balance_after,
        updated_at = NOW()
    WHERE id = NEW.gift_card_id;
    
    -- Auto-expire gift cards with zero balance and expiry date
    UPDATE gift_cards
    SET status = 'EXPIRED',
        updated_at = NOW()
    WHERE id = NEW.gift_card_id 
        AND current_balance = 0 
        AND expires_at IS NOT NULL 
        AND expires_at < NOW()
        AND status = 'ACTIVE';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_gift_card_balance
    AFTER INSERT ON gift_card_transactions
    FOR EACH ROW EXECUTE FUNCTION update_gift_card_balance();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_gift_cards_updated_at
    BEFORE UPDATE ON gift_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Generate secure gift card code
CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    i INTEGER;
    exists_check INTEGER;
BEGIN
    LOOP
        code := '';
        -- Generate 16 character code
        FOR i IN 1..16 LOOP
            code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- Format as XXXX-XXXX-XXXX-XXXX
        code := substr(code, 1, 4) || '-' || substr(code, 5, 4) || '-' || 
                substr(code, 9, 4) || '-' || substr(code, 13, 4);
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_check FROM gift_cards WHERE gift_cards.code = generate_gift_card_code.code;
        EXIT WHEN exists_check = 0;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM idempotency_keys WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA AND CONSTRAINTS
-- =====================================================

-- Add constraint to ensure promotion codes are uppercase and alphanumeric
ALTER TABLE promotions ADD CONSTRAINT promotions_code_format 
    CHECK (code ~ '^[A-Z0-9]+$' AND length(code) >= 3 AND length(code) <= 50);

-- Add constraint to ensure gift card balance consistency
ALTER TABLE gift_cards ADD CONSTRAINT gift_cards_balance_consistency
    CHECK (current_balance <= initial_balance);

-- Add constraint to ensure promotion values are positive
ALTER TABLE promotions ADD CONSTRAINT promotions_value_positive
    CHECK (
        (type = 'PERCENTAGE' AND value > 0 AND value <= 100) OR
        (type = 'FIXED_AMOUNT' AND value > 0) OR
        (type IN ('FREE_SHIPPING', 'BOGO') AND value IS NULL) OR
        (type = 'TIERED')
    );

COMMENT ON TABLE promotions IS 'Store-specific promotional codes and discount rules with comprehensive validation';
COMMENT ON TABLE gift_cards IS 'Gift card management with secure codes and transaction tracking';
COMMENT ON TABLE promotion_usages IS 'Tracks promotion usage for analytics and limit enforcement';
COMMENT ON TABLE gift_card_transactions IS 'Complete audit trail for all gift card balance changes';
COMMENT ON TABLE idempotency_keys IS 'Prevents duplicate operations in distributed systems';

-- Migration completed successfully
-- Schema version: 007
-- Feature: Promotions and Gift Cards System