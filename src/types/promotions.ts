/**
 * SellUsGenie Promotions and Gift Cards Type Definitions
 * Comprehensive type system for coupon codes and gift card management
 */

// =====================================================
// CORE PROMOTION TYPES
// =====================================================

export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BOGO' | 'TIERED';

export type PromotionStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED';

export interface Promotion {
  id: string;
  store_id: string;
  code: string;
  name: string;
  description?: string;
  
  // Promotion Type & Value
  type: PromotionType;
  value?: number;
  currency: string;
  
  // Eligibility Rules
  min_order_amount: number;
  max_discount_amount?: number;
  eligible_categories: string[];
  eligible_products: string[];
  excluded_categories: string[];
  excluded_products: string[];
  
  // Usage Limits
  max_uses?: number;
  max_uses_per_customer: number;
  current_uses: number;
  
  // Customer Restrictions
  first_order_only: boolean;
  customer_segments: string[];
  
  // Scheduling
  starts_at: string;
  ends_at?: string;
  
  // Stacking & Priority
  priority: number;
  stackable: boolean;
  exclusive: boolean;
  
  // Status & Metadata
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Create/Update promotion request types
export interface CreatePromotionRequest {
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
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
  is_active?: boolean;
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {
  id: string;
}

// =====================================================
// GIFT CARD TYPES
// =====================================================

export type GiftCardStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED';

export type GiftCardTransactionType = 'LOAD' | 'REDEEM' | 'REFUND' | 'ADJUSTMENT' | 'EXPIRY';

export interface GiftCard {
  id: string;
  store_id: string;
  code: string;
  pin?: string;
  
  // Financial Details
  currency: string;
  initial_balance: number;
  current_balance: number;
  
  // Status & Expiry
  status: GiftCardStatus;
  expires_at?: string;
  
  // Customer Association
  issued_to_customer?: string;
  issued_to_email?: string;
  
  // Metadata
  purchase_order_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface GiftCardTransaction {
  id: string;
  gift_card_id: string;
  store_id: string;
  type: GiftCardTransactionType;
  amount: number;
  balance_after: number;
  order_id?: string;
  reference_id?: string;
  description?: string;
  performed_by?: string;
  performed_at: string;
}

// Create/Update gift card request types
export interface CreateGiftCardRequest {
  initial_balance: number;
  currency?: string;
  expires_at?: string;
  issued_to_customer?: string;
  issued_to_email?: string;
  pin?: string;
}

export interface UpdateGiftCardRequest {
  id: string;
  status?: GiftCardStatus;
  expires_at?: string;
  issued_to_customer?: string;
  issued_to_email?: string;
}

// =====================================================
// USAGE TRACKING TYPES
// =====================================================

export interface PromotionUsage {
  id: string;
  promotion_id: string;
  store_id: string;
  customer_id?: string;
  order_id?: string;
  session_id?: string;
  discount_amount: number;
  order_total: number;
  used_at: string;
}

// =====================================================
// VALIDATION & CALCULATION TYPES
// =====================================================

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category_id?: string;
}

export interface Customer {
  id?: string;
  email?: string;
  segments?: string[];
  order_count?: number;
  total_spent?: number;
}

export interface ValidationContext {
  cart_items: CartItem[];
  cart_subtotal: number;
  customer?: Customer;
  session_id?: string;
  store_id: string;
  currency: string;
}

export interface PromotionValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  eligible_amount: number; // Amount eligible for discount
  discount_amount: number; // Actual discount amount
  final_discount: number; // Final discount after caps and rules
}

export interface AppliedPromotion {
  promotion: Promotion;
  validation: PromotionValidationResult;
  applied_at: string;
}

export interface GiftCardValidationResult {
  is_valid: boolean;
  errors: string[];
  available_balance: number;
  redemption_amount: number; // Amount that can be redeemed
}

// =====================================================
// CHECKOUT INTEGRATION TYPES
// =====================================================

export interface CheckoutTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  promotion_discounts: number;
  gift_card_redemptions: number;
  final_total: number;
  currency: string;
}

export interface PromotionApplication {
  code: string;
  type: 'PROMOTION' | 'GIFT_CARD';
}

export interface CheckoutSession {
  cart_items: CartItem[];
  applied_promotions: AppliedPromotion[];
  applied_gift_cards: { gift_card_id: string; amount: number }[];
  totals: CheckoutTotals;
  customer?: Customer;
  session_id?: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Specific API response types
export type PromotionListResponse = ApiResponse<PaginatedResponse<Promotion>>;
export type PromotionResponse = ApiResponse<Promotion>;
export type GiftCardListResponse = ApiResponse<PaginatedResponse<GiftCard>>;
export type GiftCardResponse = ApiResponse<GiftCard>;
export type ValidationResponse = ApiResponse<PromotionValidationResult>;
export type GiftCardValidationResponse = ApiResponse<GiftCardValidationResult>;

// =====================================================
// ADMIN UI TYPES
// =====================================================

export interface PromotionFilters {
  search?: string;
  type?: PromotionType;
  status?: 'active' | 'inactive' | 'expired' | 'upcoming';
  date_from?: string;
  date_to?: string;
}

export interface GiftCardFilters {
  search?: string;
  status?: GiftCardStatus;
  balance_min?: number;
  balance_max?: number;
  date_from?: string;
  date_to?: string;
}

export interface PromotionStats {
  total_promotions: number;
  active_promotions: number;
  total_uses: number;
  total_discount_amount: number;
  top_promotions: Array<{
    promotion: Promotion;
    usage_count: number;
    total_discount: number;
  }>;
}

export interface GiftCardStats {
  total_gift_cards: number;
  active_gift_cards: number;
  total_value_issued: number;
  total_value_redeemed: number;
  total_value_outstanding: number;
}

// =====================================================
// BULK OPERATIONS TYPES
// =====================================================

export interface BulkPromotionOperation {
  promotion_ids: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'extend';
  parameters?: {
    new_end_date?: string;
    status?: boolean;
  };
}

export interface BulkGiftCardOperation {
  gift_card_ids: string[];
  action: 'activate' | 'deactivate' | 'expire' | 'extend';
  parameters?: {
    new_expiry_date?: string;
    status?: GiftCardStatus;
  };
}

// =====================================================
// ERROR TYPES
// =====================================================

export interface PromotionError {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, any>;
}

export const PROMOTION_ERROR_CODES = {
  INVALID_CODE: 'INVALID_CODE',
  CODE_EXPIRED: 'CODE_EXPIRED',
  CODE_NOT_ACTIVE: 'CODE_NOT_ACTIVE',
  USAGE_LIMIT_EXCEEDED: 'USAGE_LIMIT_EXCEEDED',
  CUSTOMER_LIMIT_EXCEEDED: 'CUSTOMER_LIMIT_EXCEEDED',
  MIN_ORDER_NOT_MET: 'MIN_ORDER_NOT_MET',
  PRODUCT_NOT_ELIGIBLE: 'PRODUCT_NOT_ELIGIBLE',
  CATEGORY_EXCLUDED: 'CATEGORY_EXCLUDED',
  FIRST_ORDER_ONLY: 'FIRST_ORDER_ONLY',
  GIFT_CARD_INSUFFICIENT_BALANCE: 'GIFT_CARD_INSUFFICIENT_BALANCE',
  GIFT_CARD_EXPIRED: 'GIFT_CARD_EXPIRED',
  GIFT_CARD_INACTIVE: 'GIFT_CARD_INACTIVE',
  PROMOTION_NOT_STACKABLE: 'PROMOTION_NOT_STACKABLE',
  EXCLUSIVE_PROMOTION_CONFLICT: 'EXCLUSIVE_PROMOTION_CONFLICT'
} as const;

export type PromotionErrorCode = typeof PROMOTION_ERROR_CODES[keyof typeof PROMOTION_ERROR_CODES];

// =====================================================
// UTILITY TYPES
// =====================================================

export interface IdempotencyKey {
  key: string;
  scope: string;
  store_id: string;
  response_data?: any;
  created_at: string;
  expires_at: string;
}

export interface PromotionCodeGenerator {
  prefix?: string;
  length?: number;
  pattern?: 'ALPHA' | 'NUMERIC' | 'ALPHANUMERIC';
  exclude_ambiguous?: boolean;
}

// Type guards
export const isPercentagePromotion = (promotion: Promotion): boolean => {
  return promotion.type === 'PERCENTAGE';
};

export const isFixedAmountPromotion = (promotion: Promotion): boolean => {
  return promotion.type === 'FIXED_AMOUNT';
};

export const isFreeShippingPromotion = (promotion: Promotion): boolean => {
  return promotion.type === 'FREE_SHIPPING';
};

export const isActivePromotion = (promotion: Promotion): boolean => {
  const now = new Date();
  const startsAt = new Date(promotion.starts_at);
  const endsAt = promotion.ends_at ? new Date(promotion.ends_at) : null;
  
  return promotion.is_active && 
         startsAt <= now && 
         (!endsAt || endsAt >= now);
};

export const hasUsageRemaining = (promotion: Promotion): boolean => {
  return !promotion.max_uses || promotion.current_uses < promotion.max_uses;
};

export const isGiftCardActive = (giftCard: GiftCard): boolean => {
  const now = new Date();
  const expiresAt = giftCard.expires_at ? new Date(giftCard.expires_at) : null;
  
  return giftCard.status === 'ACTIVE' && 
         giftCard.current_balance > 0 && 
         (!expiresAt || expiresAt >= now);
};