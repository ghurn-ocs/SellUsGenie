import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';

export const useFeaturedProducts = (storeId: string, limit?: number) => {
  return useQuery({
    queryKey: ['featured-products', storeId, limit],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }

      return (data as Product[]) || [];
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};