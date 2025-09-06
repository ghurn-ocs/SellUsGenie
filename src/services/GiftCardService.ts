/**
 * SellUsGenie Gift Card Service
 * Comprehensive gift card management with secure operations and transaction tracking
 */

import { supabase } from '../lib/supabase';
import type {
  GiftCard,
  GiftCardStatus,
  GiftCardTransaction,
  GiftCardTransactionType,
  CreateGiftCardRequest,
  UpdateGiftCardRequest,
  GiftCardValidationResult,
  ValidationContext
} from '../types/promotions';

export class GiftCardService {
  private storeId: string;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  // =====================================================
  // GIFT CARD CREATION & MANAGEMENT
  // =====================================================

  /**
   * Creates a new gift card with secure code generation
   */
  async createGiftCard(request: CreateGiftCardRequest): Promise<GiftCard> {
    try {
      // Generate secure gift card code
      const code = await this.generateSecureCode();
      
      // Hash PIN if provided
      const hashedPin = request.pin ? await this.hashPin(request.pin) : null;

      const { data, error } = await supabase
        .from('gift_cards')
        .insert({
          store_id: this.storeId,
          code,
          pin: hashedPin,
          currency: request.currency || 'USD',
          initial_balance: request.initial_balance,
          current_balance: request.initial_balance,
          expires_at: request.expires_at || null,
          issued_to_customer: request.issued_to_customer || null,
          issued_to_email: request.issued_to_email || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      const giftCard = data as GiftCard;

      // Record initial load transaction
      await this.recordTransaction({
        gift_card_id: giftCard.id,
        type: 'LOAD',
        amount: request.initial_balance,
        balance_after: request.initial_balance,
        description: 'Initial gift card balance',
        performed_by: (await supabase.auth.getUser()).data.user?.id
      });

      return giftCard;

    } catch (error) {
      console.error('Error creating gift card:', error);
      throw new Error('Failed to create gift card');
    }
  }

  /**
   * Updates an existing gift card
   */
  async updateGiftCard(request: UpdateGiftCardRequest): Promise<GiftCard> {
    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .update({
          status: request.status,
          expires_at: request.expires_at,
          issued_to_customer: request.issued_to_customer,
          issued_to_email: request.issued_to_email,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)
        .eq('store_id', this.storeId)
        .select()
        .single();

      if (error) throw error;
      return data as GiftCard;

    } catch (error) {
      console.error('Error updating gift card:', error);
      throw new Error('Failed to update gift card');
    }
  }

  /**
   * Retrieves a gift card by ID
   */
  async getGiftCard(id: string): Promise<GiftCard | null> {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('id', id)
      .eq('store_id', this.storeId)
      .single();

    if (error || !data) return null;
    return data as GiftCard;
  }

  /**
   * Retrieves a gift card by code (for customer lookup)
   */
  async getGiftCardByCode(code: string, pin?: string): Promise<GiftCard | null> {
    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', code)
        .eq('store_id', this.storeId)
        .single();

      if (error || !data) return null;

      const giftCard = data as GiftCard;

      // Verify PIN if provided and required
      if (giftCard.pin && (!pin || !(await this.verifyPin(pin, giftCard.pin)))) {
        return null;
      }

      return giftCard;

    } catch (error) {
      console.error('Error retrieving gift card by code:', error);
      return null;
    }
  }

  /**
   * Lists gift cards with pagination and filtering
   */
  async listGiftCards(options: {
    page?: number;
    limit?: number;
    status?: GiftCardStatus;
    customer_id?: string;
    search?: string;
  } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('gift_cards')
      .select('*', { count: 'exact' })
      .eq('store_id', this.storeId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.customer_id) {
      query = query.eq('issued_to_customer', options.customer_id);
    }

    if (options.search) {
      query = query.or(`code.ilike.%${options.search}%,issued_to_email.ilike.%${options.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error listing gift cards:', error);
      throw new Error('Failed to fetch gift cards');
    }

    return {
      data: (data || []) as GiftCard[],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit
    };
  }

  // =====================================================
  // GIFT CARD VALIDATION & REDEMPTION
  // =====================================================

  /**
   * Validates a gift card for redemption
   */
  async validateGiftCard(
    code: string, 
    amount: number, 
    pin?: string
  ): Promise<GiftCardValidationResult> {
    try {
      const giftCard = await this.getGiftCardByCode(code, pin);

      if (!giftCard) {
        return {
          is_valid: false,
          errors: ['Gift card not found or invalid PIN'],
          available_balance: 0,
          redemption_amount: 0
        };
      }

      const errors: string[] = [];

      // Check status
      if (giftCard.status !== 'ACTIVE') {
        errors.push(`Gift card is ${giftCard.status.toLowerCase()}`);
      }

      // Check expiry
      if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
        errors.push('Gift card has expired');
      }

      // Check balance
      if (giftCard.current_balance <= 0) {
        errors.push('Gift card has no remaining balance');
      }

      if (amount > giftCard.current_balance) {
        errors.push(`Insufficient balance. Available: $${giftCard.current_balance.toFixed(2)}`);
      }

      const redemptionAmount = Math.min(amount, giftCard.current_balance);

      return {
        is_valid: errors.length === 0,
        errors,
        available_balance: giftCard.current_balance,
        redemption_amount: redemptionAmount
      };

    } catch (error) {
      console.error('Gift card validation error:', error);
      return {
        is_valid: false,
        errors: ['Unable to validate gift card'],
        available_balance: 0,
        redemption_amount: 0
      };
    }
  }

  /**
   * Redeems value from a gift card
   */
  async redeemGiftCard(
    code: string,
    amount: number,
    orderId?: string,
    referenceId?: string,
    pin?: string,
    idempotencyKey?: string
  ): Promise<GiftCardTransaction> {
    // Check idempotency
    if (idempotencyKey) {
      const existing = await this.checkIdempotencyKey(idempotencyKey, 'gift_card_redeem');
      if (existing) {
        return existing.response_data as GiftCardTransaction;
      }
    }

    try {
      // Validate the redemption first
      const validation = await this.validateGiftCard(code, amount, pin);
      if (!validation.is_valid) {
        throw new Error(validation.errors.join(', '));
      }

      const giftCard = await this.getGiftCardByCode(code, pin);
      if (!giftCard) {
        throw new Error('Gift card not found');
      }

      const redemptionAmount = validation.redemption_amount;
      const newBalance = giftCard.current_balance - redemptionAmount;

      // Record the redemption transaction
      const transaction = await this.recordTransaction({
        gift_card_id: giftCard.id,
        type: 'REDEEM',
        amount: -redemptionAmount, // Negative for redemption
        balance_after: newBalance,
        order_id: orderId,
        reference_id: referenceId,
        description: `Gift card redemption${orderId ? ` for order ${orderId}` : ''}`,
        performed_by: (await supabase.auth.getUser()).data.user?.id
      });

      // Store idempotency key result
      if (idempotencyKey) {
        await this.storeIdempotencyKey(idempotencyKey, 'gift_card_redeem', transaction);
      }

      return transaction;

    } catch (error) {
      console.error('Error redeeming gift card:', error);
      throw new Error(`Failed to redeem gift card: ${error.message}`);
    }
  }

  /**
   * Refunds value to a gift card
   */
  async refundToGiftCard(
    giftCardId: string,
    amount: number,
    orderId?: string,
    description?: string
  ): Promise<GiftCardTransaction> {
    try {
      const giftCard = await this.getGiftCard(giftCardId);
      if (!giftCard) {
        throw new Error('Gift card not found');
      }

      const newBalance = giftCard.current_balance + amount;

      return await this.recordTransaction({
        gift_card_id: giftCardId,
        type: 'REFUND',
        amount: amount,
        balance_after: newBalance,
        order_id: orderId,
        description: description || 'Refund to gift card',
        performed_by: (await supabase.auth.getUser()).data.user?.id
      });

    } catch (error) {
      console.error('Error refunding to gift card:', error);
      throw new Error('Failed to refund to gift card');
    }
  }

  // =====================================================
  // TRANSACTION MANAGEMENT
  // =====================================================

  /**
   * Records a gift card transaction
   */
  async recordTransaction(transaction: {
    gift_card_id: string;
    type: GiftCardTransactionType;
    amount: number;
    balance_after: number;
    order_id?: string;
    reference_id?: string;
    description?: string;
    performed_by?: string;
  }): Promise<GiftCardTransaction> {
    try {
      const { data, error } = await supabase
        .from('gift_card_transactions')
        .insert({
          ...transaction,
          store_id: this.storeId,
          performed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as GiftCardTransaction;

    } catch (error) {
      console.error('Error recording gift card transaction:', error);
      throw new Error('Failed to record transaction');
    }
  }

  /**
   * Gets transaction history for a gift card
   */
  async getTransactionHistory(
    giftCardId: string,
    options: {
      page?: number;
      limit?: number;
      type?: GiftCardTransactionType;
    } = {}
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('gift_card_transactions')
      .select('*', { count: 'exact' })
      .eq('gift_card_id', giftCardId)
      .eq('store_id', this.storeId)
      .order('performed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options.type) {
      query = query.eq('type', options.type);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }

    return {
      data: (data || []) as GiftCardTransaction[],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit
    };
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Generates a secure gift card code
   */
  private async generateSecureCode(): Promise<string> {
    // Use database function for secure code generation
    const { data, error } = await supabase.rpc('generate_gift_card_code');
    
    if (error) {
      console.error('Error generating gift card code:', error);
      // Fallback to client-side generation
      return this.generateClientSideCode();
    }
    
    return data;
  }

  /**
   * Fallback client-side code generation
   */
  private generateClientSideCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    // Generate 16 characters
    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Format as XXXX-XXXX-XXXX-XXXX
    return [
      code.substring(0, 4),
      code.substring(4, 8),
      code.substring(8, 12),
      code.substring(12, 16)
    ].join('-');
  }

  /**
   * Hashes a PIN for secure storage
   */
  private async hashPin(pin: string): Promise<string> {
    // Simple hash for demo - in production use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + this.storeId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifies a PIN against its hash
   */
  private async verifyPin(pin: string, hashedPin: string): Promise<boolean> {
    const computedHash = await this.hashPin(pin);
    return computedHash === hashedPin;
  }

  /**
   * Checks for existing idempotency key
   */
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

  /**
   * Stores idempotency key result
   */
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
  // BULK OPERATIONS
  // =====================================================

  /**
   * Creates multiple gift cards (bulk operation)
   */
  async createBulkGiftCards(requests: CreateGiftCardRequest[]): Promise<GiftCard[]> {
    const giftCards: GiftCard[] = [];
    
    for (const request of requests) {
      try {
        const giftCard = await this.createGiftCard(request);
        giftCards.push(giftCard);
      } catch (error) {
        console.error('Error creating bulk gift card:', error);
        // Continue with other cards
      }
    }
    
    return giftCards;
  }

  /**
   * Expires gift cards that are past their expiry date
   */
  async expireGiftCards(): Promise<number> {
    const { data, error } = await supabase
      .from('gift_cards')
      .update({ 
        status: 'EXPIRED',
        updated_at: new Date().toISOString()
      })
      .eq('store_id', this.storeId)
      .eq('status', 'ACTIVE')
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('Error expiring gift cards:', error);
      return 0;
    }

    // Record expiry transactions
    if (data && data.length > 0) {
      for (const giftCard of data) {
        await this.recordTransaction({
          gift_card_id: giftCard.id,
          type: 'EXPIRY',
          amount: 0,
          balance_after: 0,
          description: 'Gift card expired',
          performed_by: 'system'
        });
      }
    }

    return data?.length || 0;
  }

  // =====================================================
  // ANALYTICS & REPORTING
  // =====================================================

  /**
   * Gets gift card analytics for the store
   */
  async getGiftCardAnalytics(dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('gift_cards')
      .select('*')
      .eq('store_id', this.storeId);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data: giftCards } = await query;

    if (!giftCards) return null;

    const totalIssued = giftCards.reduce((sum, gc) => sum + gc.initial_balance, 0);
    const totalOutstanding = giftCards.reduce((sum, gc) => sum + gc.current_balance, 0);
    const totalRedeemed = totalIssued - totalOutstanding;

    return {
      total_gift_cards: giftCards.length,
      active_gift_cards: giftCards.filter(gc => gc.status === 'ACTIVE' && gc.current_balance > 0).length,
      total_value_issued: totalIssued,
      total_value_redeemed: totalRedeemed,
      total_value_outstanding: totalOutstanding,
      redemption_rate: totalIssued > 0 ? (totalRedeemed / totalIssued) * 100 : 0
    };
  }
}

// Export singleton factory
export const createGiftCardService = (storeId: string) => new GiftCardService(storeId);