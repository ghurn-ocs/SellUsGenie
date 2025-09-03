/**
 * StoreFront Layout
 * World-class website rendering system with proper HTML component rendering
 * and adaptive styling based on page-specific themes
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ShoppingCartSystem, CartIcon } from '../cart/ShoppingCartSystem';
import { VisualPageBuilderStoreFront } from '../website/VisualPageBuilderStoreFront';
import { useStore } from '../../contexts/StoreContext';
import { PublicPageRepository } from '../../lib/supabase-public';

interface StoreFrontLayoutProps {
  children: React.ReactNode;
  className?: string;
  theme?: Record<string, string>;
}

/**
 * Modern StoreFront Layout with World-Class Rendering
 */
export const StoreFrontLayout: React.FC<StoreFrontLayoutProps> = ({ 
  children, 
  className = '',
  theme 
}) => {
  const [location] = useLocation();
  const { currentStore } = useStore();
  const [publicStore, setPublicStore] = useState<any>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Extract store ID from URL if available
  const storeMatch = location.match(/^\/store\/([^\/]+)/);
  const storeSlugFromUrl = storeMatch ? storeMatch[1] : null;

  // Debug URL parsing
  console.log('🔍 StoreFrontLayout URL Debug:', {
    location,
    storeMatch,
    storeSlugFromUrl,
    currentStore: currentStore?.store_name || 'none'
  });

  // Try to load store information if no currentStore but we have a URL slug
  useEffect(() => {
    const loadPublicStore = async () => {
      if (currentStore) {
        setPublicStore(currentStore);
        setStoreLoading(false);
        return;
      }

      // For admin/page builder interface, try to get from current store context first
      // If not available, look for store slug in URL
      const storeSlug = storeSlugFromUrl;
      
      // If no URL slug but we're in admin interface, we might need to handle differently
      if (!storeSlug) {
        // In page builder/admin context, the store might be available through other means
        // For now, show error to avoid hardcoding
        setStoreError('No store context available. Please ensure you are viewing from a valid store URL.');
        setStoreLoading(false);
        return;
      }

      try {
        console.log('🌍 Loading public store info for slug:', storeSlug);
        
        // Use a temporary repository to look up store by slug
        const tempRepo = new PublicPageRepository('temp');
        const storeInfo = await tempRepo.getPublicStoreBySlug(storeSlug);
        
        if (storeInfo) {
          setPublicStore({
            id: storeInfo.id,
            store_name: storeInfo.store_name,
            store_slug: storeInfo.store_slug,
            store_logo_url: storeInfo.store_logo_url
          });
          console.log('✅ Loaded public store by slug:', storeInfo.store_name, 'ID:', storeInfo.id);
        } else {
          setStoreError('Store not found or inactive');
        }
      } catch (error) {
        console.error('❌ Error loading public store:', error);
        setStoreError('Failed to load store');
      }
      
      setStoreLoading(false);
    };

    loadPublicStore();
  }, [currentStore, storeSlugFromUrl, location]);

  // Loading state
  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (storeError || (!currentStore && !publicStore)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600">{storeError || 'Please select a valid store to continue.'}</p>
          {storeSlugFromUrl && (
            <p className="text-gray-500 text-sm mt-2">Looking for store: {storeSlugFromUrl}</p>
          )}
        </div>
      </div>
    );
  }

  const activeStore = currentStore || publicStore;

  // Extract theme from store customization if available
  const storeTheme = {
    ...theme,
    '--color-primary': activeStore.primary_color || '#2563eb',
    '--color-bg-primary': '#ffffff',
    '--color-text-primary': '#111827',
    ...(activeStore.theme_settings || {})
  };

  console.log('🌟 StoreFrontLayout rendering with Visual Page Builder:', {
    storeId: activeStore.id,
    storeName: activeStore.store_name,
    location,
    hasTheme: !!storeTheme,
    isPublicAccess: !currentStore && !!publicStore,
    themeKeys: Object.keys(storeTheme)
  });

  return (
    <div className={`storefront-layout ${className}`}>
      {/* Visual Page Builder Header and Footer System */}
      <VisualPageBuilderStoreFront
        storeId={activeStore.id}
        storeName={activeStore.store_name}
      >
        {/* Main Content Area */}
        <div className="storefront-content">
          {children}
        </div>
        
        {/* Shopping Cart System */}
        <ShoppingCartSystem />
        
        {/* Floating Cart Icon */}
        <div className="fixed bottom-4 right-4 z-40">
          <CartIcon />
        </div>
      </VisualPageBuilderStoreFront>
    </div>
  );
};

export default StoreFrontLayout;