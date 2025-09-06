/**
 * SellUsGenie Gift Cards Hooks
 * React Query hooks for gift card management with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../contexts/StoreContext';
import { createGiftCardService } from '../services/GiftCardService';
import type {
  GiftCard,
  CreateGiftCardRequest,
  UpdateGiftCardRequest,
  GiftCardFilters,
  GiftCardValidationResult,
  GiftCardStats,
  GiftCardTransaction
} from '../types/promotions';

// =====================================================
// GIFT CARD MANAGEMENT HOOKS
// =====================================================

/**
 * Hook to fetch paginated gift cards list
 */
export const useGiftCards = (filters: GiftCardFilters = {}, page = 1, limit = 20) => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['gift-cards', currentStore?.id, filters, page, limit],
    queryFn: async () => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      
      const options = {
        page,
        limit,
        status: filters.status,
        search: filters.search
      };

      return await giftCardService.listGiftCards(options);
    },
    enabled: !!currentStore?.id
  });
};

/**
 * Hook to fetch a single gift card by ID
 */
export const useGiftCard = (giftCardId: string | undefined) => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['gift-card', giftCardId],
    queryFn: async () => {
      if (!currentStore?.id || !giftCardId) throw new Error('Store or gift card ID missing');

      const giftCardService = createGiftCardService(currentStore.id);
      const giftCard = await giftCardService.getGiftCard(giftCardId);
      
      if (!giftCard) throw new Error('Gift card not found');
      return giftCard;
    },
    enabled: !!currentStore?.id && !!giftCardId
  });
};

/**
 * Hook to fetch gift card by code (for customer lookup)
 */
export const useGiftCardByCode = (code: string | undefined, pin?: string) => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['gift-card-by-code', currentStore?.id, code, pin],
    queryFn: async () => {
      if (!currentStore?.id || !code) throw new Error('Store or gift card code missing');

      const giftCardService = createGiftCardService(currentStore.id);
      return await giftCardService.getGiftCardByCode(code, pin);
    },
    enabled: !!currentStore?.id && !!code,
    retry: false // Don't retry failed lookups
  });
};

/**
 * Hook to fetch gift card analytics
 */
export const useGiftCardStats = (dateFrom?: string, dateTo?: string) => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['gift-card-stats', currentStore?.id, dateFrom, dateTo],
    queryFn: async (): Promise<GiftCardStats> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      const stats = await giftCardService.getGiftCardAnalytics(dateFrom, dateTo);
      
      if (!stats) throw new Error('Failed to fetch gift card analytics');
      return stats;
    },
    enabled: !!currentStore?.id
  });
};

/**
 * Hook to fetch gift card transaction history
 */
export const useGiftCardTransactions = (giftCardId: string | undefined, page = 1, limit = 20) => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['gift-card-transactions', giftCardId, page, limit],
    queryFn: async () => {
      if (!currentStore?.id || !giftCardId) throw new Error('Store or gift card ID missing');

      const giftCardService = createGiftCardService(currentStore.id);
      return await giftCardService.getTransactionHistory(giftCardId, { page, limit });
    },
    enabled: !!currentStore?.id && !!giftCardId
  });
};

// =====================================================
// GIFT CARD MUTATION HOOKS
// =====================================================

/**
 * Hook to create a new gift card
 */
export const useCreateGiftCard = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async (request: CreateGiftCardRequest): Promise<GiftCard> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      return await giftCardService.createGiftCard(request);
    },
    onSuccess: () => {
      // Invalidate gift cards queries
      queryClient.invalidateQueries({ queryKey: ['gift-cards', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-stats', currentStore?.id] });
    }
  });
};

/**
 * Hook to create multiple gift cards (bulk operation)
 */
export const useCreateBulkGiftCards = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async (requests: CreateGiftCardRequest[]): Promise<GiftCard[]> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      return await giftCardService.createBulkGiftCards(requests);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-stats', currentStore?.id] });
    }
  });
};

/**
 * Hook to update an existing gift card
 */
export const useUpdateGiftCard = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async (request: UpdateGiftCardRequest): Promise<GiftCard> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      return await giftCardService.updateGiftCard(request);
    },
    onSuccess: (data) => {
      // Update specific gift card in cache
      queryClient.setQueryData(['gift-card', data.id], data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['gift-cards', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-stats', currentStore?.id] });
    }
  });
};

/**
 * Hook to refund value to a gift card
 */
export const useRefundToGiftCard = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async ({
      giftCardId,
      amount,
      orderId,
      description
    }: {
      giftCardId: string;
      amount: number;
      orderId?: string;
      description?: string;
    }): Promise<GiftCardTransaction> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      return await giftCardService.refundToGiftCard(giftCardId, amount, orderId, description);
    },
    onSuccess: (_, variables) => {
      // Invalidate gift card data
      queryClient.invalidateQueries({ queryKey: ['gift-card', variables.giftCardId] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-transactions', variables.giftCardId] });
      queryClient.invalidateQueries({ queryKey: ['gift-cards', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-stats', currentStore?.id] });
    }
  });
};

/**
 * Hook to expire gift cards manually
 */
export const useExpireGiftCards = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async (): Promise<number> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      return await giftCardService.expireGiftCards();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-stats', currentStore?.id] });
    }
  });
};

// =====================================================
// GIFT CARD VALIDATION & REDEMPTION HOOKS
// =====================================================

/**
 * Hook to validate a gift card for redemption
 */
export const useValidateGiftCard = () => {
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async ({
      code,
      amount,
      pin
    }: {
      code: string;
      amount: number;
      pin?: string;
    }): Promise<GiftCardValidationResult> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      return await giftCardService.validateGiftCard(code, amount, pin);
    }
  });
};

/**
 * Hook to redeem value from a gift card
 */
export const useRedeemGiftCard = () => {
  const queryClient = useQueryClient();
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async ({
      code,
      amount,
      orderId,
      referenceId,
      pin,
      idempotencyKey
    }: {
      code: string;
      amount: number;
      orderId?: string;
      referenceId?: string;
      pin?: string;
      idempotencyKey?: string;
    }): Promise<GiftCardTransaction> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      return await giftCardService.redeemGiftCard(
        code,
        amount,
        orderId,
        referenceId,
        pin,
        idempotencyKey
      );
    },
    onSuccess: (transaction) => {
      // Invalidate gift card related queries
      queryClient.invalidateQueries({ queryKey: ['gift-card', transaction.gift_card_id] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-transactions', transaction.gift_card_id] });
      queryClient.invalidateQueries({ queryKey: ['gift-cards', currentStore?.id] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-stats', currentStore?.id] });
    }
  });
};

// =====================================================
// CUSTOMER-FACING HOOKS
// =====================================================

/**
 * Hook for customers to check gift card balance
 */
export const useCheckGiftCardBalance = () => {
  return useMutation({
    mutationFn: async ({
      code,
      pin,
      storeId
    }: {
      code: string;
      pin?: string;
      storeId: string;
    }): Promise<{ balance: number; currency: string; expires_at?: string } | null> => {
      const giftCardService = createGiftCardService(storeId);
      const giftCard = await giftCardService.getGiftCardByCode(code, pin);
      
      if (!giftCard || giftCard.status !== 'ACTIVE') {
        return null;
      }

      return {
        balance: giftCard.current_balance,
        currency: giftCard.currency,
        expires_at: giftCard.expires_at
      };
    },
    retry: false
  });
};

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Hook to generate a secure gift card code
 */
export const useGenerateGiftCardCode = () => {
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async (): Promise<string> => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      // Use the service's private method through a temporary instance
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
  });
};

/**
 * Hook to get gift card summary for dashboard
 */
export const useGiftCardSummary = () => {
  const { currentStore } = useStore();
  
  return useQuery({
    queryKey: ['gift-card-summary', currentStore?.id],
    queryFn: async () => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      
      // Get current month stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      
      const [allTimeStats, monthlyStats] = await Promise.all([
        giftCardService.getGiftCardAnalytics(),
        giftCardService.getGiftCardAnalytics(startOfMonth, endOfMonth)
      ]);

      return {
        all_time: allTimeStats,
        this_month: monthlyStats
      };
    },
    enabled: !!currentStore?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to search gift cards (for customer support)
 */
export const useSearchGiftCards = () => {
  const { currentStore } = useStore();

  return useMutation({
    mutationFn: async ({ 
      query, 
      searchBy = 'code' 
    }: { 
      query: string; 
      searchBy?: 'code' | 'email' | 'customer_id' 
    }) => {
      if (!currentStore?.id) throw new Error('No store selected');

      const giftCardService = createGiftCardService(currentStore.id);
      
      const options: any = { limit: 50 };
      
      switch (searchBy) {
        case 'code':
          options.search = query;
          break;
        case 'email':
          options.search = query;
          break;
        case 'customer_id':
          options.customer_id = query;
          break;
      }

      return await giftCardService.listGiftCards(options);
    }
  });
};