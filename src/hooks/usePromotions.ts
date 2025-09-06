/**
 * SellUsGenie Promotions Hooks
 * React Query hooks for promotion management with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../contexts/StoreContext';
import { createPromotionEngine } from '../services/PromotionEngine';
import { supabase } from '../lib/supabase';
import type {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionFilters,
  PromotionValidationResult,
  ValidationContext,
  PromotionStats,
  AppliedPromotion
} from '../types/promotions';

// =====================================================
// PROMOTION MANAGEMENT HOOKS
// =====================================================

/**
 * Hook to fetch paginated promotions list
 */
export const usePromotions = (filters: PromotionFilters = {}, page = 1, limit = 20) => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['promotions', currentStore?.id, filters, page, limit],
    queryFn: async () => {
      if (!currentStore?.id) throw new Error('No store selected');

      let query = supabase
        .from('promotions')
        .select('*', { count: 'exact' })
        .eq('store_id', currentStore.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (filters.search) {
        query = query.or(`code.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.status) {
        const now = new Date().toISOString();
        switch (filters.status) {
          case 'active':
            query = query
              .eq('is_active', true)
              .lte('starts_at', now)
              .or('ends_at.is.null,ends_at.gte.' + now);
            break;
          case 'inactive':
            query = query.eq('is_active', false);
            break;
          case 'expired':
            query = query.lt('ends_at', now);
            break;
          case 'upcoming':
            query = query.gt('starts_at', now);
            break;
        }
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;

      return {
        data: data as Promotion[],
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > page * limit
      };
    },
    enabled: !!currentStore?.id
  });
};

/**
 * Hook to fetch a single promotion by ID
 */
export const usePromotion = (promotionId: string | undefined) => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['promotion', promotionId],
    queryFn: async () => {
      if (!currentStore?.id || !promotionId) throw new Error('Store or promotion ID missing');

      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', promotionId)
        .eq('store_id', currentStore.id)
        .single();

      if (error) throw error;
      return data as Promotion;
    },
    enabled: !!currentStore?.id && !!promotionId
  });
};

/**
 * Hook to fetch promotion analytics
 */
export const usePromotionStats = (dateFrom?: string, dateTo?: string) => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['promotion-stats', currentStore?.id, dateFrom, dateTo],
    queryFn: async (): Promise<PromotionStats> => {
      if (!currentStore?.id) throw new Error('No store selected');

      // Fetch promotions with usage data
      let promotionsQuery = supabase
        .from('promotions')
        .select(`
          *,
          promotion_usages(
            id,
            discount_amount,
            used_at
          )
        `)
        .eq('store_id', currentStore.id);

      if (dateFrom) {
        promotionsQuery = promotionsQuery.gte('created_at', dateFrom);
      }

      if (dateTo) {
        promotionsQuery = promotionsQuery.lte('created_at', dateTo);
      }

      const { data: promotionsData, error } = await promotionsQuery;
      
      if (error) throw error;

      const promotions = promotionsData as (Promotion & { promotion_usages: any[] })[];
      
      // Calculate stats
      const totalPromotions = promotions.length;
      const activePromotions = promotions.filter(p => {
        const now = new Date();
        const startsAt = new Date(p.starts_at);
        const endsAt = p.ends_at ? new Date(p.ends_at) : null;
        return p.is_active && startsAt <= now && (!endsAt || endsAt >= now);
      }).length;

      const totalUses = promotions.reduce((sum, p) => sum + (p.promotion_usages?.length || 0), 0);
      const totalDiscountAmount = promotions.reduce((sum, p) => 
        sum + (p.promotion_usages?.reduce((usageSum, usage) => usageSum + usage.discount_amount, 0) || 0), 0
      );

      // Top promotions by usage
      const topPromotions = promotions
        .map(p => ({
          promotion: p,
          usage_count: p.promotion_usages?.length || 0,
          total_discount: p.promotion_usages?.reduce((sum, usage) => sum + usage.discount_amount, 0) || 0
        }))
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 5);

      return {
        total_promotions: totalPromotions,
        active_promotions: activePromotions,
        total_uses: totalUses,
        total_discount_amount: totalDiscountAmount,
        top_promotions: topPromotions
      };
    },
    enabled: !!currentStore?.id
  });
};

// =====================================================
// PROMOTION MUTATION HOOKS
// =====================================================

/**
 * Hook to create a new promotion
 */
export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async (request: CreatePromotionRequest): Promise<Promotion> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const { data, error } = await supabase
        .from('promotions')
        .insert({
          ...request,
          store_id: currentStore.id,
          code: request.code.toUpperCase(),
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as Promotion;
    },
    onSuccess: () => {
      // Invalidate promotions queries
      queryClient.invalidateQueries({ queryKey: ['promotions', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['promotion-stats', currentStore?.id] });
    }
  });
};

/**
 * Hook to update an existing promotion
 */
export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async (request: UpdatePromotionRequest): Promise<Promotion> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const { data, error } = await supabase
        .from('promotions')
        .update({
          ...request,
          code: request.code ? request.code.toUpperCase() : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)
        .eq('store_id', currentStore.id)
        .select()
        .single();

      if (error) throw error;
      return data as Promotion;
    },
    onSuccess: (data) => {
      // Update specific promotion in cache
      queryClient.setQueryData(['promotion', data.id], data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['promotions', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['promotion-stats', currentStore?.id] });
    }
  });
};

/**
 * Hook to delete a promotion
 */
export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async (promotionId: string): Promise<void> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', promotionId)
        .eq('store_id', currentStore.id);

      if (error) throw error;
    },
    onSuccess: (_, promotionId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['promotion', promotionId] });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['promotions', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['promotion-stats', currentStore?.id] });
    }
  });
};

/**
 * Hook to toggle promotion active status
 */
export const useTogglePromotionStatus = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async ({ promotionId, isActive }: { promotionId: string; isActive: boolean }): Promise<Promotion> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const { data, error } = await supabase
        .from('promotions')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', promotionId)
        .eq('store_id', currentStore.id)
        .select()
        .single();

      if (error) throw error;
      return data as Promotion;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['promotion', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['promotions', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['promotion-stats', currentStore?.id] });
    }
  });
};

// =====================================================
// PROMOTION VALIDATION HOOKS
// =====================================================

/**
 * Hook to validate a promotion code
 */
export const useValidatePromotion = () => {
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async ({ code, context }: { code: string; context: ValidationContext }): Promise<PromotionValidationResult> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const promotionEngine = createPromotionEngine(currentStore.id);
      return await promotionEngine.validatePromotion(code, context);
    }
  });
};

/**
 * Hook to validate multiple promotions for stacking
 */
export const useValidateMultiplePromotions = () => {
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async ({ codes, context }: { codes: string[]; context: ValidationContext }) => {
      if (!currentStore?.id) throw new Error('No store selected');

      const promotionEngine = createPromotionEngine(currentStore.id);
      return await promotionEngine.validateMultiplePromotions(codes, context);
    }
  });
};

/**
 * Hook to apply a promotion to an order
 */
export const useApplyPromotion = () => {
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async ({
      promotionId,
      orderId,
      customerId,
      sessionId,
      discountAmount,
      orderTotal,
      idempotencyKey
    }: {
      promotionId: string;
      orderId: string;
      customerId?: string;
      sessionId?: string;
      discountAmount: number;
      orderTotal: number;
      idempotencyKey?: string;
    }) => {
      if (!currentStore?.id) throw new Error('No store selected');

      const promotionEngine = createPromotionEngine(currentStore.id);
      return await promotionEngine.applyPromotion(
        promotionId,
        orderId,
        customerId,
        sessionId,
        discountAmount,
        orderTotal,
        idempotencyKey
      );
    }
  });
};

// =====================================================
// PROMOTION ANALYTICS HOOKS
// =====================================================

/**
 * Hook to get promotion analytics
 */
export const usePromotionAnalytics = (promotionId: string, dateFrom?: string, dateTo?: string) => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['promotion-analytics', promotionId, dateFrom, dateTo],
    queryFn: async () => {
      if (!currentStore?.id) throw new Error('No store selected');

      const promotionEngine = createPromotionEngine(currentStore.id);
      return await promotionEngine.getPromotionAnalytics(promotionId, dateFrom, dateTo);
    },
    enabled: !!currentStore?.id && !!promotionId
  });
};

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Hook to generate promotion codes
 */
export const useGeneratePromotionCode = () => {
  return useMutation({
    mutationFn: async (options: { prefix?: string; length?: number } = {}): Promise<string> => {
      const { prefix = '', length = 8 } = options;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = prefix;
      
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      return code;
    }
  });
};

/**
 * Hook to duplicate a promotion
 */
export const useDuplicatePromotion = () => {
  const createPromotion = useCreatePromotion();
  const generateCode = useGeneratePromotionCode();

  return useMutation({
    mutationFn: async (promotion: Promotion): Promise<Promotion> => {
      const newCode = await generateCode.mutateAsync({ prefix: 'COPY_' });
      
      const duplicateRequest: CreatePromotionRequest = {
        code: newCode,
        name: `${promotion.name} (Copy)`,
        description: promotion.description,
        type: promotion.type,
        value: promotion.value,
        min_order_amount: promotion.min_order_amount,
        max_discount_amount: promotion.max_discount_amount,
        eligible_categories: promotion.eligible_categories,
        eligible_products: promotion.eligible_products,
        excluded_categories: promotion.excluded_categories,
        excluded_products: promotion.excluded_products,
        max_uses: promotion.max_uses,
        max_uses_per_customer: promotion.max_uses_per_customer,
        first_order_only: promotion.first_order_only,
        customer_segments: promotion.customer_segments,
        starts_at: new Date().toISOString(),
        priority: promotion.priority,
        stackable: promotion.stackable,
        exclusive: promotion.exclusive,
        is_active: false // Start as inactive
      };

      return await createPromotion.mutateAsync(duplicateRequest);
    }
  });
};