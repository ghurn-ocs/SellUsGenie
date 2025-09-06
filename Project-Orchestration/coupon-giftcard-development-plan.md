# SellUsGenie Coupon Code and Gift Card System - Development Plan

**Version:** 1.0  
**Date:** January 2025  
**Document Owner:** Development Team  
**Status:** Planning Phase  

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Development Stages](#development-stages)
4. [Stage 1: Database Schema & Foundation](#stage-1-database-schema--foundation)
5. [Stage 2: Backend Services & API](#stage-2-backend-services--api)
6. [Stage 3: Frontend Components & Integration](#stage-3-frontend-components--integration)
7. [Stage 4: Testing & Quality Assurance](#stage-4-testing--quality-assurance)
8. [Stage 5: Security & Production Readiness](#stage-5-security--production-readiness)
9. [Success Metrics & KPIs](#success-metrics--kpis)
10. [Implementation Timeline](#implementation-timeline)
11. [Risk Mitigation](#risk-mitigation)
12. [Appendices](#appendices)

---

## 🎯 Executive Summary

This document outlines the comprehensive development plan for implementing a coupon code and gift card system for SellUsGenie StoreFront owners. The system will provide store owners with powerful promotional tools while maintaining the platform's multi-tenant architecture, security standards, and user experience principles.

### Key Deliverables
- **Flexible Promotion System**: Support for percentage discounts, fixed amounts, free shipping, BOGO offers, and tiered promotions
- **Secure Gift Card Management**: Complete gift card lifecycle with partial redemption and transaction auditing
- **Multi-Tenant Security**: Full integration with existing RLS policies and data isolation
- **Rich Admin Experience**: Comprehensive management interfaces for store owners
- **Seamless Customer Experience**: Intuitive checkout integration with real-time validation

### Timeline Overview
- **Total Duration**: 8 weeks
- **Development Team**: Full-stack developers, QA engineers, DevOps
- **Launch Target**: End of Q1 2025

---

## 🏗️ System Overview

### Architecture Principles
1. **Multi-Tenant by Design**: Every table and API respects store-level data isolation
2. **Security First**: Bank-grade security for financial transactions
3. **Performance Optimized**: Sub-200ms API responses for promotion validation
4. **Extensible Framework**: Designed for future promotional features
5. **User Experience Focused**: Intuitive interfaces for both admins and customers

### Technology Stack Integration
- **Database**: PostgreSQL with Supabase (extends existing schema)
- **Backend**: TypeScript with Supabase Edge Functions
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Radix UI
- **State Management**: TanStack Query + React Context
- **Testing**: Vitest + Playwright for E2E testing
- **Deployment**: Supabase platform with CDN distribution

---

## 📅 Development Stages

### Stage Overview
| Stage | Duration | Focus Area | Key Deliverables |
|-------|----------|------------|------------------|
| 1 | Week 1-2 | Database Foundation | Schema, RLS policies, migrations |
| 2 | Week 3-4 | Backend Services | Promotion engine, APIs, validation |
| 3 | Week 5-6 | Frontend Integration | Admin UI, checkout components |
| 4 | Week 7 | Quality Assurance | Testing, optimization, security |
| 5 | Week 8 | Production Ready | Deployment, monitoring, docs |

---

## 🗄️ Stage 1: Database Schema & Foundation

### 1.1 Core Database Tables

#### Promotions Table
```sql
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

-- Add indexes for performance
CREATE INDEX idx_promotions_store_code ON promotions(store_id, code);
CREATE INDEX idx_promotions_active_dates ON promotions(store_id, is_active, starts_at, ends_at);
CREATE INDEX idx_promotions_type ON promotions(store_id, type);
```

#### Gift Cards Table
```sql
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

-- Add indexes for performance
CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_store_status ON gift_cards(store_id, status);
CREATE INDEX idx_gift_cards_customer ON gift_cards(issued_to_customer);
```

#### Supporting Tables
```sql
-- Promotion Usage Tracking
CREATE TABLE promotion_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    order_id UUID, -- will reference orders table
    
    -- Usage Details
    discount_amount NUMERIC(12,2) NOT NULL,
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
```

### 1.2 Row Level Security (RLS) Policies

```sql
-- Promotions RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their own store promotions
CREATE POLICY promotions_store_owner_full_access ON promotions 
    FOR ALL 
    USING (store_id IN (
        SELECT id FROM stores WHERE store_owner_id = auth.uid()
    ))
    WITH CHECK (store_id IN (
        SELECT id FROM stores WHERE store_owner_id = auth.uid()
    ));

-- Public read access for storefront (customers can view active promotions)
CREATE POLICY promotions_public_read ON promotions 
    FOR SELECT 
    USING (is_active = true AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at >= NOW()));

-- Gift Cards RLS
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their store's gift cards
CREATE POLICY gift_cards_store_owner_access ON gift_cards 
    FOR ALL 
    USING (store_id IN (
        SELECT id FROM stores WHERE store_owner_id = auth.uid()
    ))
    WITH CHECK (store_id IN (
        SELECT id FROM stores WHERE store_owner_id = auth.uid()
    ));

-- Customers can view their own gift cards
CREATE POLICY gift_cards_customer_read ON gift_cards 
    FOR SELECT 
    USING (issued_to_customer = auth.uid() OR issued_to_email = auth.email());

-- Similar RLS policies for supporting tables
ALTER TABLE promotion_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY promotion_usages_store_access ON promotion_usages 
    FOR ALL 
    USING (store_id IN (
        SELECT id FROM stores WHERE store_owner_id = auth.uid()
    ));

ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY gift_card_transactions_store_access ON gift_card_transactions 
    FOR ALL 
    USING (store_id IN (
        SELECT id FROM stores WHERE store_owner_id = auth.uid()
    ));

ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY idempotency_keys_store_access ON idempotency_keys 
    FOR ALL 
    USING (store_id IN (
        SELECT id FROM stores WHERE store_owner_id = auth.uid()
    ));
```

### 1.3 TypeScript Interfaces

```typescript
// src/types/promotions.ts
export interface Promotion {
  id: string;
  store_id: string;
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BOGO' | 'TIERED';
  value?: number;
  currency: string;
  min_order_amount: number;
  max_discount_amount?: number;
  eligible_categories: string[];
  eligible_products: string[];
  excluded_categories: string[];
  excluded_products: string[];
  max_uses?: number;
  max_uses_per_customer: number;
  current_uses: number;
  first_order_only: boolean;
  customer_segments: string[];
  starts_at: string;
  ends_at?: string;
  priority: number;
  stackable: boolean;
  exclusive: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePromotionRequest {
  code: string;
  name: string;
  description?: string;
  type: Promotion['type'];
  value?: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  eligible_categories?: string[];
  eligible_products?: string[];
  excluded_categories?: string[];
  excluded_products?: string[];
  max_uses?: number;
  max_uses_per_customer?: number;
  first_order_only?: boolean;
  customer_segments?: string[];
  starts_at: string;
  ends_at?: string;
  priority?: number;
  stackable?: boolean;
  exclusive?: boolean;
}

export interface GiftCard {
  id: string;
  store_id: string;
  code: string;
  pin?: string;
  currency: string;
  initial_balance: number;
  current_balance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED';
  expires_at?: string;
  issued_to_customer?: string;
  issued_to_email?: string;
  purchase_order_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PromotionUsage {
  id: string;
  promotion_id: string;
  store_id: string;
  customer_id?: string;
  order_id?: string;
  discount_amount: number;
  used_at: string;
}

export interface GiftCardTransaction {
  id: string;
  gift_card_id: string;
  store_id: string;
  type: 'LOAD' | 'REDEEM' | 'REFUND' | 'ADJUSTMENT' | 'EXPIRY';
  amount: number;
  balance_after: number;
  order_id?: string;
  reference_id?: string;
  description?: string;
  performed_by?: string;
  performed_at: string;
}
```

### 1.4 Database Migration Scripts

```sql
-- Migration: 001_create_promotions_system.sql
-- This migration creates the core promotions and gift cards system

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create promotions table
-- [Full table creation SQL from above]

-- Create gift cards table  
-- [Full table creation SQL from above]

-- Create supporting tables
-- [Full supporting tables SQL from above]

-- Create RLS policies
-- [Full RLS policies SQL from above]

-- Create indexes for performance
-- [Full indexes SQL from above]

-- Insert sample data for development/testing
INSERT INTO promotions (store_id, code, name, description, type, value, starts_at, is_active, created_by)
SELECT 
    s.id,
    'WELCOME10',
    'Welcome 10% Off',
    'Get 10% off your first order',
    'PERCENTAGE',
    10,
    NOW(),
    true,
    s.store_owner_id
FROM stores s
LIMIT 5; -- Add to first 5 stores for testing
```

---

## 🔧 Stage 2: Backend Services & API

### 2.1 Promotion Engine Architecture

#### Core Promotion Engine Service
```typescript
// src/services/PromotionEngine.ts
import { supabase } from '../lib/supabase';
import type { Promotion, CartContext, PromotionValidationResult, PromotionApplicationResult } from '../types/promotions';

export class PromotionEngine {
  /**
   * Validates a single promotion code against cart context
   */
  async validatePromotion(
    promotionCode: string,
    cart: CartContext,
    customer?: Customer
  ): Promise<PromotionValidationResult> {
    try {
      // 1. Find active promotion by code and store
      const { data: promotion, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', promotionCode.toUpperCase())
        .eq('store_id', cart.store_id)
        .eq('is_active', true)
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .single();

      if (error || !promotion) {
        return {
          valid: false,
          error_code: 'PROMOTION_NOT_FOUND',
          error_message: 'Promotion code not found or expired'
        };
      }

      // 2. Check usage limits
      const usageLimitCheck = await this.checkUsageLimits(promotion, customer?.id);
      if (!usageLimitCheck.valid) {
        return usageLimitCheck;
      }

      // 3. Check customer eligibility
      const eligibilityCheck = await this.checkCustomerEligibility(promotion, customer, cart);
      if (!eligibilityCheck.valid) {
        return eligibilityCheck;
      }

      // 4. Validate cart requirements
      const cartValidation = await this.validateCartRequirements(promotion, cart);
      if (!cartValidation.valid) {
        return cartValidation;
      }

      // 5. Calculate potential discount
      const discountAmount = await this.calculateDiscount(promotion, cart);

      return {
        valid: true,
        promotion,
        discount_amount: discountAmount
      };
    } catch (error) {
      console.error('Promotion validation error:', error);
      return {
        valid: false,
        error_code: 'VALIDATION_ERROR',
        error_message: 'Unable to validate promotion code'
      };
    }
  }

  /**
   * Applies multiple promotions to a cart with stacking rules
   */
  async applyPromotions(
    promotions: Promotion[],
    cart: CartContext
  ): Promise<PromotionApplicationResult> {
    // 1. Sort promotions by priority (highest first)
    const sortedPromotions = promotions.sort((a, b) => b.priority - a.priority);
    
    let appliedPromotions: Promotion[] = [];
    let totalDiscount = 0;
    let freeShipping = false;
    
    // 2. Apply promotions according to stacking rules
    for (const promotion of sortedPromotions) {
      // Check if exclusive promotion blocks others
      if (promotion.exclusive && appliedPromotions.length > 0) {
        continue;
      }
      
      // Check if current applied promotions block this one
      if (appliedPromotions.some(p => p.exclusive)) {
        continue;
      }
      
      // Check if promotion can stack
      if (!promotion.stackable && appliedPromotions.length > 0) {
        continue;
      }
      
      const discountAmount = await this.calculateDiscount(promotion, cart);
      if (discountAmount > 0) {
        appliedPromotions.push(promotion);
        totalDiscount += discountAmount;
        
        if (promotion.type === 'FREE_SHIPPING') {
          freeShipping = true;
        }
      }
    }
    
    return {
      applied_promotions: appliedPromotions,
      total_discount: totalDiscount,
      free_shipping: freeShipping,
      final_total: Math.max(0, cart.subtotal - totalDiscount)
    };
  }

  private async checkUsageLimits(
    promotion: Promotion, 
    customerId?: string
  ): Promise<PromotionValidationResult> {
    // Check global usage limit
    if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
      return {
        valid: false,
        error_code: 'USAGE_LIMIT_EXCEEDED',
        error_message: 'This promotion has reached its usage limit'
      };
    }

    // Check per-customer usage limit
    if (customerId && promotion.max_uses_per_customer) {
      const { count } = await supabase
        .from('promotion_usages')
        .select('id', { count: 'exact' })
        .eq('promotion_id', promotion.id)
        .eq('customer_id', customerId);

      if (count && count >= promotion.max_uses_per_customer) {
        return {
          valid: false,
          error_code: 'CUSTOMER_USAGE_LIMIT_EXCEEDED',
          error_message: 'You have already used this promotion the maximum number of times'
        };
      }
    }

    return { valid: true };
  }

  private async checkCustomerEligibility(
    promotion: Promotion,
    customer?: Customer,
    cart?: CartContext
  ): Promise<PromotionValidationResult> {
    // Check first order requirement
    if (promotion.first_order_only && customer) {
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('customer_id', customer.id)
        .eq('store_id', cart?.store_id);

      if (count && count > 0) {
        return {
          valid: false,
          error_code: 'NOT_FIRST_ORDER',
          error_message: 'This promotion is only valid for first-time customers'
        };
      }
    }

    // Check customer segments (if needed)
    if (promotion.customer_segments.length > 0 && customer) {
      // Implementation depends on how customer segments are stored
      // This would check customer tags/attributes
    }

    return { valid: true };
  }

  private async validateCartRequirements(
    promotion: Promotion,
    cart: CartContext
  ): Promise<PromotionValidationResult> {
    // Check minimum order amount
    if (cart.subtotal < promotion.min_order_amount) {
      return {
        valid: false,
        error_code: 'MIN_ORDER_NOT_MET',
        error_message: `Minimum order amount of $${promotion.min_order_amount} required`
      };
    }

    // Check product/category eligibility
    if (promotion.eligible_products.length > 0) {
      const eligibleItems = cart.items.filter(item => 
        promotion.eligible_products.includes(item.product_id)
      );
      if (eligibleItems.length === 0) {
        return {
          valid: false,
          error_code: 'NO_ELIGIBLE_PRODUCTS',
          error_message: 'No eligible products in cart for this promotion'
        };
      }
    }

    if (promotion.eligible_categories.length > 0) {
      const eligibleItems = cart.items.filter(item => 
        promotion.eligible_categories.includes(item.category_id)
      );
      if (eligibleItems.length === 0) {
        return {
          valid: false,
          error_code: 'NO_ELIGIBLE_CATEGORIES',
          error_message: 'No eligible product categories in cart for this promotion'
        };
      }
    }

    // Check excluded products/categories
    if (promotion.excluded_products.length > 0) {
      const excludedItems = cart.items.filter(item => 
        promotion.excluded_products.includes(item.product_id)
      );
      if (excludedItems.length === cart.items.length) {
        return {
          valid: false,
          error_code: 'ALL_PRODUCTS_EXCLUDED',
          error_message: 'All cart items are excluded from this promotion'
        };
      }
    }

    return { valid: true };
  }

  private async calculateDiscount(
    promotion: Promotion,
    cart: CartContext
  ): Promise<number> {
    let discountAmount = 0;
    let eligibleTotal = cart.subtotal;

    // Calculate eligible total if product/category restrictions exist
    if (promotion.eligible_products.length > 0 || promotion.eligible_categories.length > 0) {
      eligibleTotal = this.calculateEligibleTotal(promotion, cart);
    }

    switch (promotion.type) {
      case 'PERCENTAGE':
        discountAmount = (eligibleTotal * (promotion.value || 0)) / 100;
        if (promotion.max_discount_amount) {
          discountAmount = Math.min(discountAmount, promotion.max_discount_amount);
        }
        break;

      case 'FIXED_AMOUNT':
        discountAmount = Math.min(promotion.value || 0, eligibleTotal);
        break;

      case 'FREE_SHIPPING':
        // Free shipping discount would be calculated based on shipping cost
        // This would be integrated with the shipping calculation system
        discountAmount = 0; // Handled separately in shipping calculation
        break;

      case 'BOGO':
        // Buy One Get One logic
        discountAmount = this.calculateBOGODiscount(promotion, cart);
        break;

      case 'TIERED':
        // Tiered discount based on order amount
        discountAmount = this.calculateTieredDiscount(promotion, cart);
        break;
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
  }

  private calculateEligibleTotal(promotion: Promotion, cart: CartContext): number {
    return cart.items
      .filter(item => {
        // Include if in eligible products/categories
        const isEligibleProduct = promotion.eligible_products.length === 0 || 
          promotion.eligible_products.includes(item.product_id);
        const isEligibleCategory = promotion.eligible_categories.length === 0 || 
          promotion.eligible_categories.includes(item.category_id);
        
        // Exclude if in excluded products/categories
        const isExcludedProduct = promotion.excluded_products.includes(item.product_id);
        const isExcludedCategory = promotion.excluded_categories.includes(item.category_id);
        
        return (isEligibleProduct && isEligibleCategory) && (!isExcludedProduct && !isExcludedCategory);
      })
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  private calculateBOGODiscount(promotion: Promotion, cart: CartContext): number {
    // Implementation would depend on specific BOGO rules
    // This is a simplified version
    return 0;
  }

  private calculateTieredDiscount(promotion: Promotion, cart: CartContext): number {
    // Implementation would depend on tiered discount rules
    // This is a simplified version
    return 0;
  }
}

// Supporting interfaces
interface CartContext {
  items: CartItem[];
  subtotal: number;
  customer_id?: string;
  store_id: string;
  currency: string;
}

interface CartItem {
  product_id: string;
  category_id: string;
  price: number;
  quantity: number;
}

interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface PromotionValidationResult {
  valid: boolean;
  promotion?: Promotion;
  discount_amount?: number;
  error_code?: string;
  error_message?: string;
}

interface PromotionApplicationResult {
  applied_promotions: Promotion[];
  total_discount: number;
  free_shipping: boolean;
  final_total: number;
}
```

#### Gift Card Service
```typescript
// src/services/GiftCardService.ts
import { supabase } from '../lib/supabase';
import { createHash } from 'crypto';
import { nanoid, customAlphabet } from 'nanoid';
import type { GiftCard, GiftCardTransaction } from '../types/promotions';

// Use base32 alphabet for gift card codes (no confusing characters)
const generateCode = customAlphabet('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 16);

export class GiftCardService {
  /**
   * Generates a new gift card with secure code
   */
  async generateGiftCard(params: {
    store_id: string;
    initial_balance: number;
    currency: string;
    expires_at?: string;
    issued_to_email?: string;
    issued_to_customer?: string;
    created_by: string;
    pin?: string;
  }): Promise<GiftCard> {
    const code = generateCode(); // Generate secure 16-character code
    const hashedPin = params.pin ? this.hashPin(params.pin) : undefined;

    const { data, error } = await supabase
      .from('gift_cards')
      .insert({
        store_id: params.store_id,
        code,
        pin: hashedPin,
        currency: params.currency,
        initial_balance: params.initial_balance,
        current_balance: params.initial_balance,
        expires_at: params.expires_at,
        issued_to_customer: params.issued_to_customer,
        issued_to_email: params.issued_to_email,
        created_by: params.created_by,
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create gift card: ${error.message}`);
    }

    // Record initial load transaction
    await this.recordTransaction({
      gift_card_id: data.id,
      store_id: params.store_id,
      type: 'LOAD',
      amount: params.initial_balance,
      balance_after: params.initial_balance,
      description: 'Initial gift card load',
      performed_by: params.created_by
    });

    return data;
  }

  /**
   * Validates gift card code and PIN (if required)
   */
  async validateGiftCard(
    code: string,
    pin?: string,
    store_id?: string
  ): Promise<GiftCardValidationResult> {
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'ACTIVE')
      .single();

    if (error || !giftCard) {
      return {
        valid: false,
        error_code: 'GIFT_CARD_NOT_FOUND',
        error_message: 'Gift card not found or inactive'
      };
    }

    // Check store context if provided (for store-specific validation)
    if (store_id && giftCard.store_id !== store_id) {
      return {
        valid: false,
        error_code: 'INVALID_STORE',
        error_message: 'Gift card not valid for this store'
      };
    }

    // Check expiry
    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return {
        valid: false,
        error_code: 'GIFT_CARD_EXPIRED',
        error_message: 'Gift card has expired'
      };
    }

    // Check PIN if required
    if (giftCard.pin && pin) {
      const hashedProvidedPin = this.hashPin(pin);
      if (hashedProvidedPin !== giftCard.pin) {
        return {
          valid: false,
          error_code: 'INVALID_PIN',
          error_message: 'Invalid PIN provided'
        };
      }
    } else if (giftCard.pin && !pin) {
      return {
        valid: false,
        error_code: 'PIN_REQUIRED',
        error_message: 'PIN is required for this gift card'
      };
    }

    // Check balance
    if (giftCard.current_balance <= 0) {
      return {
        valid: false,
        error_code: 'INSUFFICIENT_BALANCE',
        error_message: 'Gift card has no remaining balance'
      };
    }

    return {
      valid: true,
      gift_card: {
        ...giftCard,
        code: `****${giftCard.code.slice(-4)}` // Mask code for security
      },
      available_balance: giftCard.current_balance
    };
  }

  /**
   * Redeems amount from gift card with transaction safety
   */
  async redeemGiftCard(
    code: string,
    amount: number,
    order_context: {
      order_id?: string;
      store_id: string;
      customer_id?: string;
    },
    idempotency_key: string,
    pin?: string
  ): Promise<GiftCardRedemptionResult> {
    // Check idempotency
    const existingOperation = await this.checkIdempotency(idempotency_key, 'gift_card_redeem');
    if (existingOperation) {
      return existingOperation.response_data as GiftCardRedemptionResult;
    }

    // Validate gift card first
    const validation = await this.validateGiftCard(code, pin, order_context.store_id);
    if (!validation.valid || !validation.gift_card) {
      return {
        success: false,
        error_code: validation.error_code,
        error_message: validation.error_message
      };
    }

    const giftCard = validation.gift_card;

    // Check if requested amount is available
    if (amount > (validation.available_balance || 0)) {
      return {
        success: false,
        error_code: 'INSUFFICIENT_BALANCE',
        error_message: `Insufficient balance. Available: $${validation.available_balance}`
      };
    }

    try {
      // Begin transaction
      const { data, error } = await supabase.rpc('redeem_gift_card', {
        p_gift_card_id: giftCard.id,
        p_redeem_amount: amount,
        p_order_id: order_context.order_id,
        p_performed_by: order_context.customer_id
      });

      if (error) {
        throw error;
      }

      const result: GiftCardRedemptionResult = {
        success: true,
        redeemed_amount: amount,
        remaining_balance: data.remaining_balance,
        transaction_id: data.transaction_id
      };

      // Store idempotency result
      await this.storeIdempotencyResult(idempotency_key, 'gift_card_redeem', order_context.store_id, result);

      return result;
    } catch (error) {
      console.error('Gift card redemption error:', error);
      return {
        success: false,
        error_code: 'REDEMPTION_FAILED',
        error_message: 'Failed to process gift card redemption'
      };
    }
  }

  /**
   * Processes refund back to gift card
   */
  async refundToGiftCard(
    gift_card_id: string,
    amount: number,
    context: {
      order_id: string;
      store_id: string;
      reason: string;
      performed_by: string;
    },
    idempotency_key: string
  ): Promise<GiftCardRefundResult> {
    // Check idempotency
    const existingOperation = await this.checkIdempotency(idempotency_key, 'gift_card_refund');
    if (existingOperation) {
      return existingOperation.response_data as GiftCardRefundResult;
    }

    try {
      const { data, error } = await supabase.rpc('refund_to_gift_card', {
        p_gift_card_id: gift_card_id,
        p_refund_amount: amount,
        p_order_id: context.order_id,
        p_reason: context.reason,
        p_performed_by: context.performed_by
      });

      if (error) {
        throw error;
      }

      const result: GiftCardRefundResult = {
        success: true,
        refunded_amount: amount,
        new_balance: data.new_balance,
        transaction_id: data.transaction_id
      };

      // Store idempotency result
      await this.storeIdempotencyResult(idempotency_key, 'gift_card_refund', context.store_id, result);

      return result;
    } catch (error) {
      console.error('Gift card refund error:', error);
      return {
        success: false,
        error_code: 'REFUND_FAILED',
        error_message: 'Failed to process gift card refund'
      };
    }
  }

  private hashPin(pin: string): string {
    return createHash('sha256').update(pin).digest('hex');
  }

  private async recordTransaction(transaction: Omit<GiftCardTransaction, 'id' | 'performed_at'>) {
    const { error } = await supabase
      .from('gift_card_transactions')
      .insert(transaction);

    if (error) {
      throw new Error(`Failed to record gift card transaction: ${error.message}`);
    }
  }

  private async checkIdempotency(key: string, scope: string): Promise<any | null> {
    const { data } = await supabase
      .from('idempotency_keys')
      .select('response_data')
      .eq('key', key)
      .eq('scope', scope)
      .gt('expires_at', new Date().toISOString())
      .single();

    return data;
  }

  private async storeIdempotencyResult(key: string, scope: string, store_id: string, result: any) {
    await supabase
      .from('idempotency_keys')
      .insert({
        key,
        scope,
        store_id,
        response_data: result
      });
  }
}

// Supporting interfaces
interface GiftCardValidationResult {
  valid: boolean;
  gift_card?: GiftCard;
  available_balance?: number;
  error_code?: string;
  error_message?: string;
}

interface GiftCardRedemptionResult {
  success: boolean;
  redeemed_amount?: number;
  remaining_balance?: number;
  transaction_id?: string;
  error_code?: string;
  error_message?: string;
}

interface GiftCardRefundResult {
  success: boolean;
  refunded_amount?: number;
  new_balance?: number;
  transaction_id?: string;
  error_code?: string;
  error_message?: string;
}
```

### 2.2 Database Functions for Transaction Safety

```sql
-- Database function for atomic gift card redemption
CREATE OR REPLACE FUNCTION redeem_gift_card(
    p_gift_card_id UUID,
    p_redeem_amount NUMERIC,
    p_order_id UUID DEFAULT NULL,
    p_performed_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_gift_card gift_cards;
    v_new_balance NUMERIC;
    v_transaction_id UUID;
BEGIN
    -- Lock the gift card row
    SELECT * INTO v_gift_card 
    FROM gift_cards 
    WHERE id = p_gift_card_id 
    FOR UPDATE;
    
    -- Verify gift card exists and is active
    IF v_gift_card.id IS NULL THEN
        RAISE EXCEPTION 'Gift card not found';
    END IF;
    
    IF v_gift_card.status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Gift card is not active';
    END IF;
    
    -- Check sufficient balance
    IF v_gift_card.current_balance < p_redeem_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_gift_card.current_balance - p_redeem_amount;
    
    -- Update gift card balance
    UPDATE gift_cards 
    SET 
        current_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_gift_card_id;
    
    -- Record transaction
    INSERT INTO gift_card_transactions (
        gift_card_id,
        store_id,
        type,
        amount,
        balance_after,
        order_id,
        description,
        performed_by
    ) VALUES (
        p_gift_card_id,
        v_gift_card.store_id,
        'REDEEM',
        p_redeem_amount,
        v_new_balance,
        p_order_id,
        'Gift card redemption',
        p_performed_by
    )
    RETURNING id INTO v_transaction_id;
    
    -- Return result
    RETURN json_build_object(
        'remaining_balance', v_new_balance,
        'transaction_id', v_transaction_id
    );
END;
$$ LANGUAGE plpgsql;

-- Similar function for refunds
CREATE OR REPLACE FUNCTION refund_to_gift_card(
    p_gift_card_id UUID,
    p_refund_amount NUMERIC,
    p_order_id UUID,
    p_reason TEXT,
    p_performed_by UUID
)
RETURNS JSON AS $$
DECLARE
    v_gift_card gift_cards;
    v_new_balance NUMERIC;
    v_transaction_id UUID;
BEGIN
    -- Lock the gift card row
    SELECT * INTO v_gift_card 
    FROM gift_cards 
    WHERE id = p_gift_card_id 
    FOR UPDATE;
    
    -- Verify gift card exists
    IF v_gift_card.id IS NULL THEN
        RAISE EXCEPTION 'Gift card not found';
    END IF;
    
    -- Calculate new balance (ensure it doesn't exceed initial balance)
    v_new_balance := LEAST(
        v_gift_card.current_balance + p_refund_amount,
        v_gift_card.initial_balance
    );
    
    -- Update gift card balance
    UPDATE gift_cards 
    SET 
        current_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_gift_card_id;
    
    -- Record transaction
    INSERT INTO gift_card_transactions (
        gift_card_id,
        store_id,
        type,
        amount,
        balance_after,
        order_id,
        description,
        performed_by
    ) VALUES (
        p_gift_card_id,
        v_gift_card.store_id,
        'REFUND',
        p_refund_amount,
        v_new_balance,
        p_order_id,
        p_reason,
        p_performed_by
    )
    RETURNING id INTO v_transaction_id;
    
    -- Return result
    RETURN json_build_object(
        'new_balance', v_new_balance,
        'transaction_id', v_transaction_id
    );
END;
$$ LANGUAGE plpgsql;
```

### 2.3 API Endpoints Implementation

```typescript
// src/api/promotions.ts
import { PromotionEngine } from '../services/PromotionEngine';
import { supabase } from '../lib/supabase';

const promotionEngine = new PromotionEngine();

/**
 * POST /api/stores/:storeId/promotions/validate
 * Validates a promotion code against cart context
 */
export async function validatePromotionCode(
  request: {
    code: string;
    cart: CartContext;
    customer?: Customer;
  },
  storeId: string
) {
  try {
    const result = await promotionEngine.validatePromotion(
      request.code,
      { ...request.cart, store_id: storeId },
      request.customer
    );

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * POST /api/stores/:storeId/promotions/apply
 * Applies promotions to cart and returns final pricing
 */
export async function applyPromotionsToCart(
  request: {
    promotion_codes: string[];
    cart: CartContext;
    customer?: Customer;
    idempotency_key: string;
  },
  storeId: string
) {
  try {
    // Validate all promotion codes
    const validPromotions: Promotion[] = [];
    
    for (const code of request.promotion_codes) {
      const validation = await promotionEngine.validatePromotion(
        code,
        { ...request.cart, store_id: storeId },
        request.customer
      );
      
      if (validation.valid && validation.promotion) {
        validPromotions.push(validation.promotion);
      }
    }

    // Apply promotions with stacking rules
    const result = await promotionEngine.applyPromotions(
      validPromotions,
      { ...request.cart, store_id: storeId }
    );

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * GET /api/stores/:storeId/promotions
 * Lists all promotions for a store (admin only)
 */
export async function listPromotions(
  storeId: string,
  filters?: {
    status?: 'active' | 'inactive' | 'expired';
    type?: string;
    limit?: number;
    offset?: number;
  }
) {
  let query = supabase
    .from('promotions')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    switch (filters.status) {
      case 'active':
        query = query
          .eq('is_active', true)
          .lte('starts_at', new Date().toISOString())
          .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`);
        break;
      case 'inactive':
        query = query.eq('is_active', false);
        break;
      case 'expired':
        query = query.lt('ends_at', new Date().toISOString());
        break;
    }
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch promotions: ${error.message}`);
  }

  return {
    promotions: data,
    total: count
  };
}

/**
 * POST /api/stores/:storeId/promotions
 * Creates a new promotion
 */
export async function createPromotion(
  promotionData: CreatePromotionRequest,
  storeId: string,
  createdBy: string
) {
  const { data, error } = await supabase
    .from('promotions')
    .insert({
      ...promotionData,
      store_id: storeId,
      created_by: createdBy,
      code: promotionData.code.toUpperCase()
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('A promotion with this code already exists');
    }
    throw new Error(`Failed to create promotion: ${error.message}`);
  }

  return data;
}

/**
 * PUT /api/stores/:storeId/promotions/:promotionId
 * Updates an existing promotion
 */
export async function updatePromotion(
  promotionId: string,
  updates: Partial<CreatePromotionRequest>,
  storeId: string
) {
  const { data, error } = await supabase
    .from('promotions')
    .update({
      ...updates,
      code: updates.code?.toUpperCase(),
      updated_at: new Date().toISOString()
    })
    .eq('id', promotionId)
    .eq('store_id', storeId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update promotion: ${error.message}`);
  }

  return data;
}

/**
 * DELETE /api/stores/:storeId/promotions/:promotionId
 * Soft deletes a promotion (sets inactive)
 */
export async function deletePromotion(promotionId: string, storeId: string) {
  const { data, error } = await supabase
    .from('promotions')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString() 
    })
    .eq('id', promotionId)
    .eq('store_id', storeId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to delete promotion: ${error.message}`);
  }

  return data;
}
```

```typescript
// src/api/gift-cards.ts
import { GiftCardService } from '../services/GiftCardService';
import { supabase } from '../lib/supabase';

const giftCardService = new GiftCardService();

/**
 * POST /api/stores/:storeId/gift-cards/validate
 * Validates gift card code and returns available balance
 */
export async function validateGiftCardCode(
  request: {
    code: string;
    pin?: string;
  },
  storeId: string
) {
  const result = await giftCardService.validateGiftCard(
    request.code,
    request.pin,
    storeId
  );

  return {
    success: result.valid,
    data: result.valid ? {
      masked_code: result.gift_card?.code,
      available_balance: result.available_balance,
      currency: result.gift_card?.currency
    } : null,
    error: result.valid ? null : {
      code: result.error_code,
      message: result.error_message
    }
  };
}

/**
 * POST /api/stores/:storeId/gift-cards/redeem
 * Redeems amount from gift card
 */
export async function redeemGiftCard(
  request: {
    code: string;
    pin?: string;
    amount: number;
    order_id?: string;
    customer_id?: string;
    idempotency_key: string;
  },
  storeId: string
) {
  const result = await giftCardService.redeemGiftCard(
    request.code,
    request.amount,
    {
      order_id: request.order_id,
      store_id: storeId,
      customer_id: request.customer_id
    },
    request.idempotency_key,
    request.pin
  );

  return result;
}

/**
 * GET /api/stores/:storeId/gift-cards
 * Lists gift cards for a store (admin only)
 */
export async function listGiftCards(
  storeId: string,
  filters?: {
    status?: string;
    customer_email?: string;
    limit?: number;
    offset?: number;
  }
) {
  let query = supabase
    .from('gift_cards')
    .select(`
      id,
      code,
      currency,
      initial_balance,
      current_balance,
      status,
      expires_at,
      issued_to_email,
      created_at,
      customers!issued_to_customer(first_name, last_name, email)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.customer_email) {
    query = query.ilike('issued_to_email', `%${filters.customer_email}%`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch gift cards: ${error.message}`);
  }

  // Mask gift card codes for security
  const maskedData = data?.map(gc => ({
    ...gc,
    code: `****${gc.code.slice(-4)}`
  }));

  return {
    gift_cards: maskedData,
    total: count
  };
}

/**
 * POST /api/stores/:storeId/gift-cards
 * Creates new gift cards (bulk or single)
 */
export async function createGiftCards(
  request: {
    cards: Array<{
      initial_balance: number;
      expires_at?: string;
      issued_to_email?: string;
      issued_to_customer?: string;
      pin?: string;
    }>;
    currency: string;
  },
  storeId: string,
  createdBy: string
) {
  const createdCards: GiftCard[] = [];
  
  for (const cardData of request.cards) {
    const card = await giftCardService.generateGiftCard({
      store_id: storeId,
      initial_balance: cardData.initial_balance,
      currency: request.currency,
      expires_at: cardData.expires_at,
      issued_to_email: cardData.issued_to_email,
      issued_to_customer: cardData.issued_to_customer,
      created_by: createdBy,
      pin: cardData.pin
    });
    
    createdCards.push(card);
  }

  return {
    success: true,
    gift_cards: createdCards,
    count: createdCards.length
  };
}

/**
 * GET /api/stores/:storeId/gift-cards/:giftCardId/transactions
 * Gets transaction history for a gift card
 */
export async function getGiftCardTransactions(
  giftCardId: string,
  storeId: string,
  limit?: number
) {
  const { data, error } = await supabase
    .from('gift_card_transactions')
    .select('*')
    .eq('gift_card_id', giftCardId)
    .eq('store_id', storeId)
    .order('performed_at', { ascending: false })
    .limit(limit || 50);

  if (error) {
    throw new Error(`Failed to fetch gift card transactions: ${error.message}`);
  }

  return data;
}
```

---

## 🖥️ Stage 3: Frontend Components & Integration

### 3.1 Admin Dashboard Components

#### Promotions Management Interface
```typescript
// src/components/promotions/PromotionManager.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Plus, Search, Edit, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../contexts/StoreContext';
import { PromotionEditor } from './PromotionEditor';
import { PromotionAnalytics } from './PromotionAnalytics';
import type { Promotion } from '../../types/promotions';

export const PromotionManager: React.FC = () => {
  const { currentStore } = useStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Fetch promotions
  const { data: promotions, isLoading } = useQuery({
    queryKey: ['promotions', currentStore?.id, statusFilter, searchTerm],
    queryFn: () => fetchPromotions(currentStore?.id!, {
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchTerm || undefined
    }),
    enabled: !!currentStore?.id
  });

  // Delete promotion mutation
  const deletePromotionMutation = useMutation({
    mutationFn: (promotionId: string) => deletePromotion(promotionId, currentStore?.id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', currentStore?.id] });
      toast.success('Promotion deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete promotion: ${error.message}`);
    }
  });

  // Duplicate promotion mutation
  const duplicatePromotionMutation = useMutation({
    mutationFn: (promotion: Promotion) => {
      const duplicateData = {
        ...promotion,
        code: `${promotion.code}_COPY_${Date.now()}`,
        name: `${promotion.name} (Copy)`,
        current_uses: 0,
        is_active: false
      };
      return createPromotion(duplicateData, currentStore?.id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', currentStore?.id] });
      toast.success('Promotion duplicated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to duplicate promotion: ${error.message}`);
    }
  });

  const handleCreatePromotion = () => {
    setSelectedPromotion(null);
    setIsEditorOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsEditorOpen(true);
  };

  const handleDeletePromotion = (promotionId: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      deletePromotionMutation.mutate(promotionId);
    }
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const startsAt = new Date(promotion.starts_at);
    const endsAt = promotion.ends_at ? new Date(promotion.ends_at) : null;

    if (!promotion.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (startsAt > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (endsAt && endsAt < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
      return <Badge variant="destructive">Usage Limit Reached</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'Percentage Off';
      case 'FIXED_AMOUNT':
        return 'Fixed Amount Off';
      case 'FREE_SHIPPING':
        return 'Free Shipping';
      case 'BOGO':
        return 'Buy One Get One';
      case 'TIERED':
        return 'Tiered Discount';
      default:
        return type;
    }
  };

  if (!currentStore) {
    return <div>Please select a store to manage promotions.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promotions</h2>
          <p className="text-muted-foreground">
            Create and manage discount codes and promotions for your store
          </p>
        </div>
        <Button onClick={handleCreatePromotion}>
          <Plus className="mr-2 h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      {/* Analytics Overview */}
      <PromotionAnalytics storeId={currentStore.id} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>
            Manage your store's promotion codes and discount offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search promotions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Promotions Table */}
          {isLoading ? (
            <div className="text-center py-8">Loading promotions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions?.promotions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">No promotions found</p>
                        <Button variant="outline" onClick={handleCreatePromotion}>
                          Create your first promotion
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  promotions?.promotions?.map((promotion: Promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell className="font-mono font-medium">
                        {promotion.code}
                      </TableCell>
                      <TableCell>{promotion.name}</TableCell>
                      <TableCell>{getTypeDisplay(promotion.type)}</TableCell>
                      <TableCell>
                        {promotion.type === 'PERCENTAGE' && `${promotion.value}%`}
                        {promotion.type === 'FIXED_AMOUNT' && `$${promotion.value}`}
                        {promotion.type === 'FREE_SHIPPING' && 'Free Shipping'}
                        {promotion.type === 'BOGO' && 'BOGO'}
                        {promotion.type === 'TIERED' && 'Tiered'}
                      </TableCell>
                      <TableCell>{getStatusBadge(promotion)}</TableCell>
                      <TableCell>
                        {promotion.current_uses}
                        {promotion.max_uses && ` / ${promotion.max_uses}`}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(promotion.starts_at).toLocaleDateString()}</div>
                          {promotion.ends_at && (
                            <div className="text-muted-foreground">
                              to {new Date(promotion.ends_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPromotion(promotion)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicatePromotionMutation.mutate(promotion)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePromotion(promotion.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Promotion Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPromotion ? 'Edit Promotion' : 'Create New Promotion'}
            </DialogTitle>
            <DialogDescription>
              {selectedPromotion 
                ? 'Update the details of your promotion'
                : 'Set up a new discount code or promotion for your customers'
              }
            </DialogDescription>
          </DialogHeader>
          <PromotionEditor
            promotion={selectedPromotion}
            onSave={() => {
              setIsEditorOpen(false);
              queryClient.invalidateQueries({ queryKey: ['promotions', currentStore?.id] });
            }}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

#### Promotion Editor Component
```typescript
// src/components/promotions/PromotionEditor.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useStore } from '../../contexts/StoreContext';
import type { Promotion, CreatePromotionRequest } from '../../types/promotions';

const promotionSchema = z.object({
  code: z.string().min(1, 'Promotion code is required').max(50),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BOGO', 'TIERED']),
  value: z.number().min(0).optional(),
  min_order_amount: z.number().min(0).default(0),
  max_discount_amount: z.number().min(0).optional(),
  max_uses: z.number().min(1).optional(),
  max_uses_per_customer: z.number().min(1).default(1),
  first_order_only: z.boolean().default(false),
  starts_at: z.date(),
  ends_at: z.date().optional(),
  stackable: z.boolean().default(false),
  exclusive: z.boolean().default(false),
  priority: z.number().min(1).max(1000).default(100),
  eligible_categories: z.array(z.string()).default([]),
  eligible_products: z.array(z.string()).default([]),
  excluded_categories: z.array(z.string()).default([]),
  excluded_products: z.array(z.string()).default([])
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromotionEditorProps {
  promotion?: Promotion | null;
  onSave: () => void;
  onCancel: () => void;
}

export const PromotionEditor: React.FC<PromotionEditorProps> = ({
  promotion,
  onSave,
  onCancel
}) => {
  const { currentStore } = useStore();
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      min_order_amount: 0,
      max_uses_per_customer: 1,
      first_order_only: false,
      starts_at: new Date(),
      stackable: false,
      exclusive: false,
      priority: 100,
      eligible_categories: [],
      eligible_products: [],
      excluded_categories: [],
      excluded_products: []
    }
  });

  // Populate form if editing existing promotion
  useEffect(() => {
    if (promotion) {
      form.reset({
        code: promotion.code,
        name: promotion.name,
        description: promotion.description || '',
        type: promotion.type,
        value: promotion.value || 0,
        min_order_amount: promotion.min_order_amount,
        max_discount_amount: promotion.max_discount_amount,
        max_uses: promotion.max_uses,
        max_uses_per_customer: promotion.max_uses_per_customer,
        first_order_only: promotion.first_order_only,
        starts_at: new Date(promotion.starts_at),
        ends_at: promotion.ends_at ? new Date(promotion.ends_at) : undefined,
        stackable: promotion.stackable,
        exclusive: promotion.exclusive,
        priority: promotion.priority,
        eligible_categories: promotion.eligible_categories,
        eligible_products: promotion.eligible_products,
        excluded_categories: promotion.excluded_categories,
        excluded_products: promotion.excluded_products
      });
    }
  }, [promotion, form]);

  // Fetch categories and products for selection
  const { data: categories } = useQuery({
    queryKey: ['categories', currentStore?.id],
    queryFn: () => fetchCategories(currentStore?.id!),
    enabled: !!currentStore?.id
  });

  const { data: products } = useQuery({
    queryKey: ['products', currentStore?.id],
    queryFn: () => fetchProducts(currentStore?.id!),
    enabled: !!currentStore?.id
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: PromotionFormData) => {
      const promotionData: CreatePromotionRequest = {
        ...data,
        starts_at: data.starts_at.toISOString(),
        ends_at: data.ends_at?.toISOString()
      };

      if (promotion) {
        return updatePromotion(promotion.id, promotionData, currentStore?.id!);
      } else {
        return createPromotion(promotionData, currentStore?.id!);
      }
    },
    onSuccess: () => {
      toast.success(promotion ? 'Promotion updated successfully' : 'Promotion created successfully');
      onSave();
    },
    onError: (error) => {
      toast.error(`Failed to save promotion: ${error.message}`);
    }
  });

  const onSubmit = (data: PromotionFormData) => {
    saveMutation.mutate(data);
  };

  const watchedType = form.watch('type');
  const watchedExclusive = form.watch('exclusive');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="rules">Rules & Limits</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promotion Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="SAVE10"
                            className="font-mono"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormDescription>
                          Unique code customers will enter at checkout
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="10% Off Everything" />
                        </FormControl>
                        <FormDescription>
                          Friendly name shown to customers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Get 10% off your entire order when you spend $50 or more"
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description for internal use and customer display
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          >
                            <option value="PERCENTAGE">Percentage Off</option>
                            <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                            <option value="FREE_SHIPPING">Free Shipping</option>
                            <option value="BOGO">Buy One Get One</option>
                            <option value="TIERED">Tiered Discount</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(watchedType === 'PERCENTAGE' || watchedType === 'FIXED_AMOUNT') && (
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {watchedType === 'PERCENTAGE' ? 'Percentage' : 'Amount'}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step={watchedType === 'PERCENTAGE' ? '1' : '0.01'}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                                {watchedType === 'PERCENTAGE' ? '%' : '$'}
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="starts_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ends_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>No end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Leave empty for no end date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="max_uses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Usage Limit</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            placeholder="Unlimited"
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum times this promotion can be used across all customers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_uses_per_customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Per Customer Limit</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum times one customer can use this promotion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_order_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                              $
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Minimum order total required to use this promotion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {watchedType === 'PERCENTAGE' && (
                  <FormField
                    control={form.control}
                    name="max_discount_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="No limit"
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                              $
                            </span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Cap the maximum discount amount for percentage-based promotions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Restrictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="first_order_only"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">First Order Only</FormLabel>
                        <FormDescription>
                          Restrict this promotion to first-time customers only
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eligibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product & Category Eligibility</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Leave empty to apply to all products, or select specific items/categories
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">Eligible Categories</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Promotion will only apply to products in these categories
                    </p>
                    {/* Category selection component would go here */}
                    <div className="border rounded-md p-3 min-h-[100px]">
                      <p className="text-sm text-muted-foreground">Category selector placeholder</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Excluded Categories</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Promotion will not apply to products in these categories
                    </p>
                    <div className="border rounded-md p-3 min-h-[100px]">
                      <p className="text-sm text-muted-foreground">Category selector placeholder</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">Eligible Products</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Promotion will only apply to these specific products
                    </p>
                    <div className="border rounded-md p-3 min-h-[100px]">
                      <p className="text-sm text-muted-foreground">Product selector placeholder</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Excluded Products</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Promotion will not apply to these specific products
                    </p>
                    <div className="border rounded-md p-3 min-h-[100px]">
                      <p className="text-sm text-muted-foreground">Product selector placeholder</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stacking & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="exclusive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Exclusive Promotion</FormLabel>
                        <FormDescription>
                          When active, this promotion cannot be combined with others
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!watchedExclusive && (
                  <FormField
                    control={form.control}
                    name="stackable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Stackable</FormLabel>
                          <FormDescription>
                            Allow this promotion to be combined with other stackable promotions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="1000"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                        />
                      </FormControl>
                      <FormDescription>
                        Higher numbers have higher priority (1-1000). Used when stacking promotions.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : (promotion ? 'Update Promotion' : 'Create Promotion')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
```

### 3.2 Checkout Integration Components

#### Promotion Code Input Component
```typescript
// src/components/checkout/PromotionCodeInput.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { AlertCircle, Check, X, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';
import { validatePromotionCode } from '../../api/promotions';
import type { Promotion } from '../../types/promotions';

interface AppliedPromotion extends Promotion {
  discount_amount: number;
}

export const PromotionCodeInput: React.FC = () => {
  const { cart, appliedPromotions, addAppliedPromotion, removeAppliedPromotion } = useCart();
  const { currentStore } = useStore();
  const [promoCode, setPromoCode] = useState('');
  const [validationState, setValidationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validatePromoMutation = useMutation({
    mutationFn: (code: string) => validatePromotionCode({
      code,
      cart: {
        items: cart.items,
        subtotal: cart.subtotal,
        store_id: currentStore?.id!,
        currency: 'USD'
      }
    }, currentStore?.id!),
    onSuccess: (result) => {
      if (result.success && result.data.valid) {
        const appliedPromotion: AppliedPromotion = {
          ...result.data.promotion!,
          discount_amount: result.data.discount_amount!
        };
        
        // Check if already applied
        if (appliedPromotions.some(p => p.id === appliedPromotion.id)) {
          setValidationState('error');
          setErrorMessage('This promotion is already applied');
          return;
        }

        addAppliedPromotion(appliedPromotion);
        setPromoCode('');
        setValidationState('success');
        toast.success(`Promotion applied! Save $${result.data.discount_amount?.toFixed(2)}`);
        
        // Reset state after success animation
        setTimeout(() => setValidationState('idle'), 2000);
      } else {
        setValidationState('error');
        setErrorMessage(result.data?.error_message || 'Invalid promotion code');
        setTimeout(() => setValidationState('idle'), 3000);
      }
    },
    onError: (error) => {
      setValidationState('error');
      setErrorMessage('Unable to validate promotion code');
      setTimeout(() => setValidationState('idle'), 3000);
    }
  });

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    
    setValidationState('loading');
    setErrorMessage('');
    validatePromoMutation.mutate(promoCode.trim().toUpperCase());
  };

  const handleRemovePromotion = (promotionId: string) => {
    removeAppliedPromotion(promotionId);
    toast.success('Promotion removed');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyPromo();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="promo-code" className="text-base font-medium">
              Promotion Code
            </Label>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="promo-code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter promotion code"
                disabled={validationState === 'loading'}
                className={`font-mono ${
                  validationState === 'error' ? 'border-red-500' :
                  validationState === 'success' ? 'border-green-500' : ''
                }`}
              />
              {errorMessage && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errorMessage}
                </div>
              )}
            </div>
            <Button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || validationState === 'loading'}
              className="shrink-0"
            >
              {validationState === 'loading' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              {validationState === 'success' && (
                <Check className="h-4 w-4 mr-2" />
              )}
              Apply
            </Button>
          </div>

          {appliedPromotions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Applied Promotions
              </Label>
              {appliedPromotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {promotion.code}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">{promotion.name}</div>
                      <div className="text-xs text-green-600">
                        Save ${promotion.discount_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePromotion(promotion.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

#### Gift Card Input Component
```typescript
// src/components/checkout/GiftCardInput.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, Check, X, CreditCard, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';
import { validateGiftCardCode } from '../../api/gift-cards';
import type { GiftCard } from '../../types/promotions';

interface AppliedGiftCard extends GiftCard {
  applied_amount: number;
  masked_code: string;
}

export const GiftCardInput: React.FC = () => {
  const { cart, appliedGiftCards, addAppliedGiftCard, removeAppliedGiftCard } = useCart();
  const { currentStore } = useStore();
  const [giftCardCode, setGiftCardCode] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [requiresPin, setRequiresPin] = useState(false);
  const [validatedCard, setValidatedCard] = useState<any>(null);

  const validateGiftCardMutation = useMutation({
    mutationFn: (data: { code: string; pin?: string }) => 
      validateGiftCardCode(data, currentStore?.id!),
    onSuccess: (result) => {
      if (result.success && result.data) {
        const { masked_code, available_balance, currency } = result.data;
        
        // Check if already applied
        if (appliedGiftCards.some(gc => gc.masked_code === masked_code)) {
          setValidationState('error');
          setErrorMessage('This gift card is already applied');
          return;
        }

        // Calculate how much to apply (remaining cart total or available balance, whichever is less)
        const remainingTotal = cart.total - appliedGiftCards.reduce((sum, gc) => sum + gc.applied_amount, 0);
        const appliedAmount = Math.min(available_balance, remainingTotal);

        if (appliedAmount <= 0) {
          setValidationState('error');
          setErrorMessage('Gift card cannot be applied - order total is already covered');
          return;
        }

        const appliedGiftCard: AppliedGiftCard = {
          id: `gc_${Date.now()}`, // Temporary ID
          store_id: currentStore?.id!,
          code: giftCardCode,
          masked_code,
          currency,
          initial_balance: available_balance,
          current_balance: available_balance,
          applied_amount: appliedAmount,
          status: 'ACTIVE' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: ''
        };

        addAppliedGiftCard(appliedGiftCard);
        setGiftCardCode('');
        setPin('');
        setRequiresPin(false);
        setValidationState('success');
        toast.success(`Gift card applied! $${appliedAmount.toFixed(2)} credited`);
        
        // Reset state after success animation
        setTimeout(() => setValidationState('idle'), 2000);
      } else {
        const error = result.error;
        if (error?.code === 'PIN_REQUIRED') {
          setRequiresPin(true);
          setValidatedCard({ code: giftCardCode });
          setValidationState('idle');
        } else {
          setValidationState('error');
          setErrorMessage(error?.message || 'Invalid gift card');
          setTimeout(() => setValidationState('idle'), 3000);
        }
      }
    },
    onError: (error) => {
      setValidationState('error');
      setErrorMessage('Unable to validate gift card');
      setTimeout(() => setValidationState('idle'), 3000);
    }
  });

  const handleApplyGiftCard = () => {
    if (!giftCardCode.trim()) return;
    
    setValidationState('loading');
    setErrorMessage('');
    validateGiftCardMutation.mutate({ 
      code: giftCardCode.trim().toUpperCase(),
      pin: pin.trim() || undefined
    });
  };

  const handleRemoveGiftCard = (giftCardId: string) => {
    removeAppliedGiftCard(giftCardId);
    toast.success('Gift card removed');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyGiftCard();
    }
  };

  const totalAppliedAmount = appliedGiftCards.reduce((sum, gc) => sum + gc.applied_amount, 0);
  const remainingBalance = Math.max(0, cart.total - totalAppliedAmount);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Gift Card</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="gift-card-code">Gift Card Code</Label>
            <Input
              id="gift-card-code"
              value={giftCardCode}
              onChange={(e) => setGiftCardCode(e.target.value.replace(/\s/g, '').toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter gift card code"
              disabled={validationState === 'loading'}
              className={`font-mono ${
                validationState === 'error' ? 'border-red-500' :
                validationState === 'success' ? 'border-green-500' : ''
              }`}
            />
          </div>

          {requiresPin && (
            <div>
              <Label htmlFor="gift-card-pin">PIN</Label>
              <div className="relative">
                <Input
                  id="gift-card-pin"
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter PIN"
                  disabled={validationState === 'loading'}
                  className="pr-10"
                  maxLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3 w-3" />
              {errorMessage}
            </div>
          )}

          <Button
            onClick={handleApplyGiftCard}
            disabled={!giftCardCode.trim() || validationState === 'loading' || (requiresPin && !pin.trim())}
            className="w-full"
          >
            {validationState === 'loading' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            )}
            {validationState === 'success' && (
              <Check className="h-4 w-4 mr-2" />
            )}
            Apply Gift Card
          </Button>
        </div>

        {appliedGiftCards.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Applied Gift Cards
            </Label>
            {appliedGiftCards.map((giftCard) => (
              <div
                key={giftCard.id}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm font-mono">
                      {giftCard.masked_code}
                    </div>
                    <div className="text-xs text-blue-600">
                      Applied: ${giftCard.applied_amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveGiftCard(giftCard.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {remainingBalance > 0 && (
              <div className="text-xs text-muted-foreground">
                Remaining balance: ${remainingBalance.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### Enhanced Order Summary Component
```typescript
// src/components/checkout/OrderSummary.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ShoppingCart, Tag, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export const OrderSummary: React.FC = () => {
  const { 
    cart, 
    appliedPromotions, 
    appliedGiftCards,
    subtotal,
    totalDiscounts,
    totalGiftCardCredits,
    shippingCost,
    tax,
    finalTotal
  } = useCart();

  const freeShippingApplied = appliedPromotions.some(p => p.type === 'FREE_SHIPPING');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Cart Items */}
        <div className="space-y-2">
          {cart.items.map((item) => (
            <div key={`${item.product_id}_${item.variant_id || 'default'}`} className="flex justify-between text-sm">
              <div className="flex-1">
                <div className="font-medium">{item.product_name}</div>
                {item.variant_name && (
                  <div className="text-muted-foreground text-xs">{item.variant_name}</div>
                )}
                <div className="text-muted-foreground text-xs">Qty: {item.quantity}</div>
              </div>
              <div className="text-right">
                <div>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {/* Applied Promotions */}
        {appliedPromotions.map((promotion) => (
          <div key={promotion.id} className="flex justify-between items-center text-green-600">
            <div className="flex items-center gap-2">
              <Tag className="h-3 w-3" />
              <span className="text-sm">{promotion.name}</span>
              <Badge variant="secondary" className="text-xs font-mono">
                {promotion.code}
              </Badge>
            </div>
            <span>-${promotion.discount_amount.toFixed(2)}</span>
          </div>
        ))}

        {/* Applied Gift Cards */}
        {appliedGiftCards.map((giftCard) => (
          <div key={giftCard.id} className="flex justify-between items-center text-blue-600">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3" />
              <span className="text-sm">Gift Card</span>
              <Badge variant="secondary" className="text-xs font-mono">
                {giftCard.masked_code}
              </Badge>
            </div>
            <span>-${giftCard.applied_amount.toFixed(2)}</span>
          </div>
        ))}

        {/* Shipping */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck className="h-3 w-3 text-muted-foreground" />
            <span>Shipping</span>
          </div>
          <span>
            {freeShippingApplied ? (
              <div className="flex items-center gap-1">
                <span className="line-through text-muted-foreground text-sm">
                  ${shippingCost.toFixed(2)}
                </span>
                <Badge variant="secondary" className="text-xs">FREE</Badge>
              </div>
            ) : (
              `$${shippingCost.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <Separator />

        {/* Total Savings Display */}
        {(totalDiscounts > 0 || totalGiftCardCredits > 0) && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="text-sm font-medium text-green-800 mb-1">
              Your Savings
            </div>
            {totalDiscounts > 0 && (
              <div className="text-sm text-green-600">
                Promotions: -${totalDiscounts.toFixed(2)}
              </div>
            )}
            {totalGiftCardCredits > 0 && (
              <div className="text-sm text-green-600">
                Gift Cards: -${totalGiftCardCredits.toFixed(2)}
              </div>
            )}
            <div className="text-sm font-medium text-green-800">
              Total Saved: ${(totalDiscounts + totalGiftCardCredits).toFixed(2)}
            </div>
          </div>
        )}

        {/* Final Total */}
        <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
          <span>Total</span>
          <span>${finalTotal.toFixed(2)}</span>
        </div>

        {/* Payment Note */}
        {finalTotal === 0 && (
          <div className="text-center p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-medium">
              🎉 Your order is fully covered by gift cards!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## 📈 Success Metrics & KPIs

### Technical Performance Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| API Response Time | < 200ms | Application monitoring |
| Database Query Performance | < 50ms average | Query logging |
| System Availability | > 99.9% | Uptime monitoring |
| RLS Policy Test Coverage | 100% | Automated testing |
| Multi-tenant Isolation | 100% verified | Security testing |

### Business Impact Metrics
| Metric | Target | Tracking Method |
|--------|--------|----------------|
| Promotion Adoption Rate | > 30% of orders | Analytics dashboard |
| Gift Card Utilization | > 80% within 12 months | Transaction reports |
| Average Order Value with Promotions | +25% increase | Comparative analysis |
| Customer Retention (promotions) | +15% repeat rate | Cohort analysis |
| Revenue Impact | Positive ROI within 3 months | Financial reporting |

### User Experience Metrics
| Metric | Target | Collection Method |
|--------|--------|-------------------|
| Checkout Completion Rate | > 85% | Funnel analysis |
| Promotion Code Success Rate | > 95% | Error tracking |
| Gift Card Redemption Success | > 98% | Transaction logs |
| Admin Task Completion Time | < 2 minutes average | User testing |
| Customer Support Tickets | < 1% of transactions | Support system |

---

## 🚀 Implementation Timeline

### Week 1-2: Foundation Phase
**Deliverables:**
- [ ] Complete database schema design and migration scripts
- [ ] Implement RLS policies and security framework
- [ ] Set up TypeScript interfaces and type definitions
- [ ] Create database functions for atomic operations
- [ ] Initial unit tests for data layer

**Success Criteria:**
- All database tables created and indexed
- RLS policies tested and verified
- Migration scripts successfully executed
- Unit tests achieving 90%+ coverage

### Week 3-4: Backend Services Phase
**Deliverables:**
- [ ] Implement PromotionEngine service with validation logic
- [ ] Build GiftCardService with transaction safety
- [ ] Create comprehensive API endpoints
- [ ] Implement idempotency and rate limiting
- [ ] Integration tests for all services

**Success Criteria:**
- All API endpoints functional and documented
- Promotion validation logic handles all scenarios
- Gift card operations are atomic and secure
- Performance targets met for all operations

### Week 5-6: Frontend Integration Phase
**Deliverables:**
- [ ] Build admin promotion management interface
- [ ] Create gift card management dashboard
- [ ] Implement checkout integration components
- [ ] Design customer-facing redemption flow
- [ ] End-to-end testing suite

**Success Criteria:**
- Admin interface fully functional
- Checkout flow seamlessly integrated
- All components responsive and accessible
- E2E tests covering critical user journeys

### Week 7: Quality Assurance Phase
**Deliverables:**
- [ ] Comprehensive security audit
- [ ] Performance optimization and load testing
- [ ] Cross-browser compatibility testing
- [ ] Accessibility compliance verification
- [ ] Documentation completion

**Success Criteria:**
- Security vulnerabilities addressed
- Performance benchmarks exceeded
- WCAG 2.1 AA compliance achieved
- All documentation complete and reviewed

### Week 8: Production Readiness Phase
**Deliverables:**
- [ ] Production deployment configuration
- [ ] Monitoring and alerting setup
- [ ] Backup and recovery procedures
- [ ] Staff training materials
- [ ] Go-live checklist completion

**Success Criteria:**
- Production environment fully configured
- Monitoring dashboards operational
- Team trained on new features
- Launch readiness confirmed

---

## 🛡️ Risk Mitigation

### Technical Risks
| Risk | Impact | Probability | Mitigation Strategy |
|------|---------|------------|-------------------|
| Database performance degradation | High | Medium | Implement proper indexing, query optimization, and caching |
| Security vulnerabilities | High | Low | Regular security audits, penetration testing, code reviews |
| Multi-tenant data leakage | Critical | Low | Comprehensive RLS testing, automated security checks |
| API rate limiting bypass | Medium | Medium | Multiple layers of rate limiting, monitoring, and alerts |

### Business Risks
| Risk | Impact | Probability | Mitigation Strategy |
|------|---------|------------|-------------------|
| Promotion abuse/fraud | High | Medium | Usage limits, monitoring patterns, manual review workflows |
| Gift card fraud | High | Medium | Strong authentication, transaction limits, audit trails |
| Customer confusion | Medium | Medium | Clear UI/UX design, comprehensive documentation, support training |
| Revenue impact calculation errors | High | Low | Thorough testing, financial reconciliation processes |

### Operational Risks
| Risk | Impact | Probability | Mitigation Strategy |
|------|---------|------------|-------------------|
| Deployment failures | Medium | Low | Staged deployments, rollback procedures, comprehensive testing |
| Data migration issues | High | Low | Extensive migration testing, backup procedures, rollback plans |
| Staff training gaps | Medium | Medium | Comprehensive training program, documentation, ongoing support |
| Third-party service dependencies | Medium | Low | Fallback mechanisms, service monitoring, alternative providers |

---

## 📚 Appendices

### Appendix A: Database Schema Reference
[Complete SQL schema with all tables, indexes, and constraints]

### Appendix B: API Documentation
[Comprehensive API endpoint documentation with request/response examples]

### Appendix C: Security Guidelines
[Detailed security requirements and implementation guidelines]

### Appendix D: Testing Strategy
[Complete testing approach including unit, integration, and E2E tests]

### Appendix E: Deployment Procedures
[Step-by-step deployment and rollback procedures]

### Appendix F: Monitoring and Alerting
[Monitoring setup, alert configurations, and troubleshooting guides]

---

**Document Control:**
- **Last Updated:** January 9, 2025
- **Next Review:** February 9, 2025
- **Version History:** v1.0 (Initial Release)
- **Approvals Required:** Technical Lead, Product Manager, Security Review

---

*This document serves as the comprehensive guide for implementing the SellUsGenie coupon code and gift card system. All development work should align with the specifications and standards outlined in this plan.*