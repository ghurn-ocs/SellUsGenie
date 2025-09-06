/**
 * SellUsGenie Promotion Engine
 * Core service for promotion validation, calculation, and application
 * Handles complex promotion rules with multi-tenant security
 */

import { supabase } from '../lib/supabase';
import type {
  Promotion,
  PromotionType,
  ValidationContext,
  PromotionValidationResult,
  AppliedPromotion,
  CartItem,
  Customer,
  PromotionUsage,
  PromotionError,
  PromotionErrorCode,
  PROMOTION_ERROR_CODES
} from '../types/promotions';

export class PromotionEngine {
  private storeId: string;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  // =====================================================
  // PROMOTION VALIDATION
  // =====================================================

  /**
   * Validates a promotion code against the current cart and customer context
   */
  async validatePromotion(
    code: string, 
    context: ValidationContext
  ): Promise<PromotionValidationResult> {
    try {
      // Fetch the promotion
      const promotion = await this.getPromotionByCode(code);
      if (!promotion) {
        return this.createValidationError('INVALID_CODE', 'Promotion code not found');
      }

      // Run all validation checks
      const validationErrors: PromotionError[] = [];
      const validationWarnings: string[] = [];

      // Basic validity checks
      this.validatePromotionStatus(promotion, validationErrors);
      this.validatePromotionSchedule(promotion, validationErrors);
      await this.validateUsageLimits(promotion, context.customer, validationErrors);
      this.validateMinimumOrderAmount(promotion, context.cart_subtotal, validationErrors);
      this.validateCustomerEligibility(promotion, context.customer, validationErrors);
      await this.validateProductEligibility(promotion, context.cart_items, validationErrors);

      // If there are errors, return invalid result
      if (validationErrors.length > 0) {
        return {
          is_valid: false,
          errors: validationErrors.map(e => e.message),
          warnings: validationWarnings,
          eligible_amount: 0,
          discount_amount: 0,
          final_discount: 0
        };
      }

      // Calculate discount amounts
      const eligibleAmount = await this.calculateEligibleAmount(promotion, context.cart_items);
      const discountAmount = this.calculateDiscountAmount(promotion, eligibleAmount, context.cart_subtotal);
      const finalDiscount = this.applyDiscountCaps(promotion, discountAmount);

      return {
        is_valid: true,
        errors: [],
        warnings: validationWarnings,
        eligible_amount: eligibleAmount,
        discount_amount: discountAmount,
        final_discount: finalDiscount
      };

    } catch (error) {
      console.error('Promotion validation error:', error);
      return this.createValidationError('VALIDATION_ERROR', 'Unable to validate promotion');
    }
  }

  /**
   * Validates multiple promotions for stacking
   */
  async validateMultiplePromotions(
    codes: string[],
    context: ValidationContext
  ): Promise<{ valid_promotions: AppliedPromotion[], invalid_codes: string[], total_discount: number }> {
    const validPromotions: AppliedPromotion[] = [];
    const invalidCodes: string[] = [];
    let totalDiscount = 0;

    // Check for exclusive promotions first
    const promotions = await Promise.all(
      codes.map(code => this.getPromotionByCode(code))
    );

    const exclusivePromotions = promotions.filter(p => p && p.exclusive);
    if (exclusivePromotions.length > 1) {
      return {
        valid_promotions: [],
        invalid_codes: codes,
        total_discount: 0
      };
    }

    if (exclusivePromotions.length === 1 && codes.length > 1) {
      return {
        valid_promotions: [],
        invalid_codes: codes,
        total_discount: 0
      };
    }

    // Validate each promotion
    for (const code of codes) {
      const validation = await this.validatePromotion(code, context);
      const promotion = await this.getPromotionByCode(code);

      if (validation.is_valid && promotion) {
        // Check stacking rules
        if (!promotion.stackable && validPromotions.length > 0) {
          invalidCodes.push(code);
          continue;
        }

        validPromotions.push({
          promotion,
          validation,
          applied_at: new Date().toISOString()
        });

        totalDiscount += validation.final_discount;
      } else {
        invalidCodes.push(code);
      }
    }

    return {
      valid_promotions: validPromotions,
      invalid_codes: invalidCodes,
      total_discount: totalDiscount
    };
  }

  // =====================================================
  // PROMOTION APPLICATION
  // =====================================================

  /**
   * Applies a promotion to an order (records usage)
   */
  async applyPromotion(
    promotionId: string,
    orderId: string,
    customerId: string | undefined,
    sessionId: string | undefined,
    discountAmount: number,
    orderTotal: number,
    idempotencyKey?: string
  ): Promise<PromotionUsage> {
    // Check idempotency
    if (idempotencyKey) {
      const existing = await this.checkIdempotencyKey(idempotencyKey, 'promotion_apply');
      if (existing) {
        return existing.response_data as PromotionUsage;
      }
    }

    try {
      const { data, error } = await supabase
        .from('promotion_usages')
        .insert({
          promotion_id: promotionId,
          store_id: this.storeId,
          customer_id: customerId,
          order_id: orderId,
          session_id: sessionId,
          discount_amount: discountAmount,
          order_total: orderTotal
        })
        .select()
        .single();

      if (error) throw error;

      // Store idempotency key result
      if (idempotencyKey) {
        await this.storeIdempotencyKey(idempotencyKey, 'promotion_apply', data);
      }

      return data as PromotionUsage;

    } catch (error) {
      console.error('Error applying promotion:', error);
      throw new Error('Failed to apply promotion');
    }
  }

  // =====================================================
  // PRIVATE VALIDATION METHODS
  // =====================================================

  private validatePromotionStatus(promotion: Promotion, errors: PromotionError[]): void {
    if (!promotion.is_active) {
      errors.push({
        code: PROMOTION_ERROR_CODES.CODE_NOT_ACTIVE,
        message: 'This promotion code is not currently active'
      });
    }
  }

  private validatePromotionSchedule(promotion: Promotion, errors: PromotionError[]): void {
    const now = new Date();
    const startsAt = new Date(promotion.starts_at);
    const endsAt = promotion.ends_at ? new Date(promotion.ends_at) : null;

    if (startsAt > now) {
      errors.push({
        code: PROMOTION_ERROR_CODES.CODE_NOT_ACTIVE,
        message: 'This promotion code is not yet active'
      });
    }

    if (endsAt && endsAt < now) {
      errors.push({
        code: PROMOTION_ERROR_CODES.CODE_EXPIRED,
        message: 'This promotion code has expired'
      });
    }
  }

  private async validateUsageLimits(
    promotion: Promotion, 
    customer: Customer | undefined, 
    errors: PromotionError[]
  ): Promise<void> {
    // Check global usage limit
    if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
      errors.push({
        code: PROMOTION_ERROR_CODES.USAGE_LIMIT_EXCEEDED,
        message: 'This promotion code has reached its usage limit'
      });
      return;
    }

    // Check per-customer usage limit
    if (customer?.id && promotion.max_uses_per_customer > 0) {
      const { data: customerUsages } = await supabase
        .from('promotion_usages')
        .select('id')
        .eq('promotion_id', promotion.id)
        .eq('customer_id', customer.id);

      const usageCount = customerUsages?.length || 0;
      if (usageCount >= promotion.max_uses_per_customer) {
        errors.push({
          code: PROMOTION_ERROR_CODES.CUSTOMER_LIMIT_EXCEEDED,
          message: 'You have already used this promotion code the maximum number of times'
        });
      }
    }
  }

  private validateMinimumOrderAmount(
    promotion: Promotion, 
    cartSubtotal: number, 
    errors: PromotionError[]
  ): void {
    if (promotion.min_order_amount > 0 && cartSubtotal < promotion.min_order_amount) {
      errors.push({
        code: PROMOTION_ERROR_CODES.MIN_ORDER_NOT_MET,
        message: `Minimum order amount of $${promotion.min_order_amount.toFixed(2)} required`
      });
    }
  }

  private validateCustomerEligibility(
    promotion: Promotion, 
    customer: Customer | undefined, 
    errors: PromotionError[]
  ): void {
    // First order only check
    if (promotion.first_order_only) {
      if (!customer?.id) {
        // Guest checkout - assume not first order for safety
        errors.push({
          code: PROMOTION_ERROR_CODES.FIRST_ORDER_ONLY,
          message: 'This promotion is only valid for first-time customers'
        });
        return;
      }

      if (customer.order_count && customer.order_count > 0) {
        errors.push({
          code: PROMOTION_ERROR_CODES.FIRST_ORDER_ONLY,
          message: 'This promotion is only valid for your first order'
        });
      }
    }

    // Customer segment validation
    if (promotion.customer_segments.length > 0 && customer?.segments) {
      const hasMatchingSegment = promotion.customer_segments.some(segment =>
        customer.segments?.includes(segment)
      );

      if (!hasMatchingSegment) {
        errors.push({
          code: PROMOTION_ERROR_CODES.PRODUCT_NOT_ELIGIBLE,
          message: 'This promotion is not available for your customer profile'
        });
      }
    }
  }

  private async validateProductEligibility(
    promotion: Promotion, 
    cartItems: CartItem[], 
    errors: PromotionError[]
  ): Promise<void> {
    // Skip validation if no product restrictions
    if (
      promotion.eligible_products.length === 0 &&
      promotion.eligible_categories.length === 0 &&
      promotion.excluded_products.length === 0 &&
      promotion.excluded_categories.length === 0
    ) {
      return;
    }

    const eligibleItems = await this.getEligibleItems(promotion, cartItems);
    
    if (eligibleItems.length === 0) {
      errors.push({
        code: PROMOTION_ERROR_CODES.PRODUCT_NOT_ELIGIBLE,
        message: 'No items in your cart are eligible for this promotion'
      });
    }
  }

  // =====================================================
  // CALCULATION METHODS
  // =====================================================

  private async calculateEligibleAmount(promotion: Promotion, cartItems: CartItem[]): Promise<number> {
    const eligibleItems = await this.getEligibleItems(promotion, cartItems);
    return eligibleItems.reduce((total, item) => total + item.total_price, 0);
  }

  private calculateDiscountAmount(
    promotion: Promotion, 
    eligibleAmount: number, 
    cartSubtotal: number
  ): number {
    switch (promotion.type) {
      case 'PERCENTAGE':
        return eligibleAmount * ((promotion.value || 0) / 100);
      
      case 'FIXED_AMOUNT':
        return Math.min(promotion.value || 0, eligibleAmount);
      
      case 'FREE_SHIPPING':
        return 0; // Shipping discount handled separately
      
      case 'BOGO':
        return this.calculateBOGODiscount(promotion, eligibleAmount);
      
      case 'TIERED':
        return this.calculateTieredDiscount(promotion, cartSubtotal);
      
      default:
        return 0;
    }
  }

  private calculateBOGODiscount(promotion: Promotion, eligibleAmount: number): number {
    // Simplified BOGO - 50% off eligible amount
    return eligibleAmount * 0.5;
  }

  private calculateTieredDiscount(promotion: Promotion, cartSubtotal: number): number {
    // Simplified tiered discount - would need more complex logic for real tiers
    return Math.min(promotion.value || 0, cartSubtotal * 0.1);
  }

  private applyDiscountCaps(promotion: Promotion, discountAmount: number): number {
    if (promotion.max_discount_amount && discountAmount > promotion.max_discount_amount) {
      return promotion.max_discount_amount;
    }
    return discountAmount;
  }

  private async getEligibleItems(promotion: Promotion, cartItems: CartItem[]): Promise<CartItem[]> {
    return cartItems.filter(item => {
      // Check excluded products first
      if (promotion.excluded_products.includes(item.product_id)) {
        return false;
      }

      // Check excluded categories
      if (item.category_id && promotion.excluded_categories.includes(item.category_id)) {
        return false;
      }

      // If there are eligible products specified, item must be in the list
      if (promotion.eligible_products.length > 0) {
        return promotion.eligible_products.includes(item.product_id);
      }

      // If there are eligible categories specified, item must be in one of them
      if (promotion.eligible_categories.length > 0) {
        return item.category_id ? promotion.eligible_categories.includes(item.category_id) : false;
      }

      // No restrictions - all items are eligible
      return true;
    });
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private async getPromotionByCode(code: string): Promise<Promotion | null> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('store_id', this.storeId)
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) return null;
    return data as Promotion;
  }

  private createValidationError(
    code: PromotionErrorCode, 
    message: string
  ): PromotionValidationResult {
    return {
      is_valid: false,
      errors: [message],
      warnings: [],
      eligible_amount: 0,
      discount_amount: 0,
      final_discount: 0
    };
  }

  private async checkIdempotencyKey(key: string, scope: string): Promise<any> {
    const { data } = await supabase
      .from('idempotency_keys')
      .select('response_data')
      .eq('key', key)
      .eq('scope', scope)
      .eq('store_id', this.storeId)
      .gt('expires_at', new Date().toISOString())
      .single();

    return data;
  }

  private async storeIdempotencyKey(key: string, scope: string, responseData: any): Promise<void> {
    await supabase
      .from('idempotency_keys')
      .upsert({
        key,
        scope,
        store_id: this.storeId,
        response_data: responseData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
  }

  // =====================================================
  // ANALYTICS METHODS
  // =====================================================

  /**
   * Gets promotion usage analytics
   */
  async getPromotionAnalytics(promotionId: string, dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('promotion_usages')
      .select('*')
      .eq('promotion_id', promotionId)
      .eq('store_id', this.storeId);

    if (dateFrom) {
      query = query.gte('used_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('used_at', dateTo);
    }

    const { data: usages } = await query;

    if (!usages) return null;

    return {
      total_uses: usages.length,
      total_discount: usages.reduce((sum, usage) => sum + usage.discount_amount, 0),
      unique_customers: new Set(usages.filter(u => u.customer_id).map(u => u.customer_id)).size,
      average_order_value: usages.length > 0 
        ? usages.reduce((sum, usage) => sum + usage.order_total, 0) / usages.length 
        : 0
    };
  }
}

// Export singleton factory
export const createPromotionEngine = (storeId: string) => new PromotionEngine(storeId);