import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'wouter';
import { PublicPageRepository } from '../../lib/supabase-public';
import { CartIcon } from '../cart/CartIcon';

interface StorefrontHeaderProps {
  storeId: string;
  storeName: string;
  storeSlug?: string;
  storeData?: {
    id: string;
    store_name: string;
    store_slug: string;
    store_logo_url: string | null;
    is_active: boolean;
  };
}

interface NavigationPage {
  id: string;
  name: string;
  slug: string;
  navigation_placement: string;
}

export const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
  storeId,
  storeName,
  storeSlug,
  storeData
}) => {
  const [navigationPages, setNavigationPages] = useState<NavigationPage[]>([]);
  const navigationRan = useRef<string>('');
  
  // Memoize repository instance
  const publicRepository = useMemo(() => {
    return storeId ? new PublicPageRepository(storeId) : null;
  }, [storeId]);

  // Load navigation pages - this should only run once per store
  useEffect(() => {
    const depKey = `nav-${storeId}`;
    if (navigationRan.current === depKey || !publicRepository) return;
    navigationRan.current = depKey;
    
    const loadNavigationPages = async () => {
      try {
        const navPages = await publicRepository.getNavigationPages();
        console.log('🧭 Header: Loaded navigation pages:', navPages.length);
        setNavigationPages(navPages);
      } catch (error) {
        console.error('❌ Error loading navigation pages:', error);
        setNavigationPages([]);
      }
    };

    loadNavigationPages();
  }, [storeId, publicRepository]);

  console.log('🏠 StorefrontHeader rendered for store:', storeData?.store_name);

  return (
    <header 
      className="storefront-header w-full"
      style={{ 
        backgroundColor: '#e0b000',
        color: '#1f2937',
        padding: '16px 24px'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo and Store Name */}
        <div className="flex items-center space-x-3">
          {storeData?.store_logo_url && (
            <img 
              src={storeData.store_logo_url} 
              alt="Store Logo" 
              className="h-8 w-auto object-contain"
            />
          )}
          <div className="flex flex-col">
            <h1 className="font-bold text-xl text-black">
              {storeData?.store_name || storeName || 'Store Name'}
            </h1>
            <p className="text-sm text-black opacity-80">
              Where we come to go!
            </p>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="flex items-center space-x-4">
          {navigationPages.slice(0, 4).map((page) => {
            // Build proper store slug URL, handling root path and avoiding double slashes
            let pageUrl;
            if (storeSlug) {
              if (page.slug === '/') {
                pageUrl = `/store/${storeSlug}`;
              } else {
                // Remove leading slash from page.slug to avoid double slashes
                const cleanSlug = page.slug.startsWith('/') ? page.slug.substring(1) : page.slug;
                pageUrl = `/store/${storeSlug}/${cleanSlug}`;
              }
            } else {
              pageUrl = page.slug === '/' ? '/' : `/${page.slug}`;
            }
            
            return (
              <Link
                key={page.id}
                to={pageUrl}
                className="px-4 py-2 text-black font-medium bg-transparent border border-black rounded-md hover:bg-black hover:text-white transition-colors"
                onClick={() => console.log('🔗 Header Link clicked, navigating to:', pageUrl)}
              >
                {page.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Shopping Cart */}
        <div className="flex items-center">
          <CartIcon className="text-black hover:text-gray-700" />
        </div>
      </div>
    </header>
  );
};