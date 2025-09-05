import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useStore } from '../contexts/StoreContext';

export interface FooterColumnConfig {
  id: number;
  store_id: string;
  column_number: 1 | 2 | 3 | 4;
  column_title: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useFooterColumnConfig = () => {
  const { selectedStore } = useStore();
  
  return useQuery({
    queryKey: ['footerColumnConfig', selectedStore?.id],
    queryFn: async (): Promise<FooterColumnConfig[]> => {
      if (!selectedStore?.id) {
        throw new Error('No store selected');
      }

      const { data, error } = await supabase
        .from('footer_column_config')
        .select('*')
        .eq('store_id', selectedStore.id)
        .order('column_number');

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!selectedStore?.id,
  });
};

export const useUpdateFooterColumnConfig = () => {
  const queryClient = useQueryClient();
  const { selectedStore } = useStore();

  return useMutation({
    mutationFn: async ({ 
      column_number, 
      column_title, 
      is_enabled 
    }: { 
      column_number: 1 | 2 | 3 | 4;
      column_title: string;
      is_enabled: boolean;
    }) => {
      if (!selectedStore?.id) {
        throw new Error('No store selected');
      }

      const { data, error } = await supabase
        .from('footer_column_config')
        .upsert({
          store_id: selectedStore.id,
          column_number,
          column_title,
          is_enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'store_id, column_number'
        })
        .select();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['footerColumnConfig', selectedStore?.id]
      });
    },
  });
};

// Helper hook to get column headers as a simple object
export const useFooterColumnHeaders = () => {
  const { data: columnConfig, isLoading, error } = useFooterColumnConfig();

  const columnHeaders = columnConfig?.reduce((acc, config) => {
    acc[config.column_number] = config.column_title;
    return acc;
  }, {} as Record<1 | 2 | 3 | 4, string>) || {
    1: 'Company',
    2: 'General', 
    3: 'Support',
    4: 'Legal'
  };

  return {
    columnHeaders,
    isLoading,
    error,
    hasCustomConfig: !!columnConfig?.length
  };
};