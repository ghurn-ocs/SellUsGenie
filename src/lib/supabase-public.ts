/**
 * Public Supabase Client
 * Used for accessing published content on storefronts without authentication
 * Uses the centralized client manager to prevent multiple instances
 */

import { getPublicClient } from './supabase-client-manager';

// Use the centralized client manager to prevent multiple instances
export const supabasePublic = getPublicClient();

/**
 * Public Page Repository
 * Accesses only published pages without authentication
 */
export class PublicPageRepository {
  constructor(private storeId: string) {}

  /**
   * Get published system pages (header/footer) for public storefront access
   * DISABLED: System pages with hardcoded content violate Visual Page Builder architecture
   */
  async getPublishedSystemPage(pageType: 'header' | 'footer'): Promise<any | null> {
    try {
      console.log(`🌍 PUBLIC: Fetching ${pageType} page for store:`, this.storeId);

      // Query for published system pages
      let { data, error } = await supabasePublic
        .from('page_documents')
        .select('*')
        .eq('store_id', this.storeId)
        .eq('page_type', pageType)
        .eq('status', 'published')
        .maybeSingle();

      // Fallback: Query by slug if page_type query doesn't find anything
      if (!data && !error) {
        console.log(`⚠️ PUBLIC: No ${pageType} found by page_type, trying by slug...`);
        const pageSlug = `/${pageType}`;
        const fallbackResult = await supabasePublic
          .from('page_documents')
          .select('*')
          .eq('store_id', this.storeId)
          .eq('slug', pageSlug)
          .eq('status', 'published')
          .maybeSingle();
        
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) {
        console.warn(`❌ PUBLIC: Error getting ${pageType} page:`, error);
        return null;
      }

      if (!data) {
        console.warn(`⚠️ PUBLIC: No published ${pageType} page found for store:`, this.storeId);
        return null;
      }

      // Accept all pages - no hardcoded content filtering

      console.log(`✅ PUBLIC: Found valid ${pageType} page:`, {
        id: data.id,
        name: data.name,
        sectionsCount: data.sections?.length || 0,
        status: data.status
      });

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        version: data.version,
        pageType: data.page_type || pageType,
        sections: data.sections || [],
        themeOverrides: data.theme_overrides || {},
        colorPalette: data.color_palette,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        status: data.status,
        publishedAt: data.published_at,
        navigationPlacement: data.navigation_placement || 'none',
        seo: data.seo || {},
        isSystemPage: true,
        systemPageType: pageType,
      };
    } catch (error) {
      console.error(`💥 PUBLIC: Error getting ${pageType} page:`, error);
      return null;
    }
  }

  /**
   * Get store information by slug for public access
   */
  async getPublicStoreBySlug(slug: string): Promise<any | null> {
    try {
      console.log('🌍 PUBLIC: Fetching store by slug:', slug);

      const { data, error } = await supabasePublic
        .from('stores')
        .select('id, store_name, store_slug, store_logo_url, is_active')
        .eq('store_slug', slug)
        .eq('is_active', true) // Only active stores
        .single();

      if (error) {
        console.warn('❌ PUBLIC: Error getting store by slug:', error);
        return null;
      }

      if (!data) {
        console.warn('⚠️ PUBLIC: No store found for slug:', slug);
        return null;
      }

      console.log('✅ PUBLIC: Found store by slug:', data?.store_name, {
        id: data?.id,
        store_name: data?.store_name,
        store_slug: data?.store_slug,
        store_logo_url: data?.store_logo_url,
        is_active: data?.is_active
      });
      return data;
    } catch (error) {
      console.error('💥 PUBLIC: Error getting store by slug:', error);
      return null;
    }
  }

  /**
   * Get store information for public access
   */
  async getPublicStoreInfo(): Promise<any | null> {
    try {
      console.log('🌍 PUBLIC: Fetching store info for:', this.storeId);

      const { data, error } = await supabasePublic
        .from('stores')
        .select('id, store_name, store_slug, store_logo_url, is_active')
        .eq('id', this.storeId)
        .single(); // Removed is_active filter for debugging

      if (error) {
        console.warn('❌ PUBLIC: Error getting store info:', error);
        return null;
      }

      console.log('✅ PUBLIC: Found store:', data?.store_name, {
        id: data?.id,
        store_name: data?.store_name,
        store_slug: data?.store_slug,
        store_logo_url: data?.store_logo_url,
        is_active: data?.is_active
      });
      return data;
    } catch (error) {
      console.error('💥 PUBLIC: Error getting store info:', error);
      return null;
    }
  }

  /**
   * Get published page by slug for public storefront routing
   */
  async getPublishedPageBySlug(slug: string): Promise<any | null> {
    try {
      console.log('🌍 PUBLIC: Fetching page by slug:', slug, 'for store:', this.storeId);

      const { data, error } = await supabasePublic
        .from('page_documents')
        .select('*')
        .eq('store_id', this.storeId)
        .eq('slug', slug)
        .eq('status', 'published') // Only published pages
        .maybeSingle();

      if (error) {
        console.warn('❌ PUBLIC: Error getting page by slug:', error);
        return null;
      }

      if (!data) {
        console.warn('⚠️ PUBLIC: No published page found for slug:', slug);
        return null;
      }

      // Debug the sections data before processing
      console.log('🔍 RAW DATABASE SECTIONS DEBUG:', {
        pageName: data.name,
        pageSlug: data.slug,
        sectionsExists: !!data.sections,
        sectionsType: typeof data.sections,
        sectionsIsArray: Array.isArray(data.sections),
        sectionsLength: data.sections?.length,
        sectionsRaw: data.sections,
        status: data.status
      });

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        version: data.version,
        pageType: data.page_type || 'page',
        sections: data.sections || [],
        themeOverrides: data.theme_overrides || {},
        colorPalette: data.color_palette,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        status: data.status,
        publishedAt: data.published_at,
        navigationPlacement: data.navigation_placement,
        seo: data.seo || {},
      };
    } catch (error) {
      console.error('💥 PUBLIC: Error getting page by slug:', error);
      return null;
    }
  }

  /**
   * Get published pages that should appear in navigation
   */
  async getNavigationPages(): Promise<any[]> {
    try {
      console.log('🌍 PUBLIC: Fetching navigation pages for store:', this.storeId);

      const { data, error } = await supabasePublic
        .from('page_documents')
        .select('id, name, slug, navigation_placement')
        .eq('store_id', this.storeId)
        .eq('status', 'published')
        .in('navigation_placement', ['header', 'footer', 'both'])
        .order('name');

      if (error) {
        console.warn('❌ PUBLIC: Error getting navigation pages:', error);
        return [];
      }

      console.log('✅ PUBLIC: Found navigation pages:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('💥 PUBLIC: Error getting navigation pages:', error);
      return [];
    }
  }

  /**
   * Get all published pages for a store (including those not in navigation)
   * CRITICAL: This fixes the storefront rendering issue where home pages
   * with navigation_placement='none' were excluded from getNavigationPages()
   */
  async getAllPublishedPages(): Promise<any[]> {
    try {
      console.log('🌍 PUBLIC: Fetching ALL published pages for store:', this.storeId);

      const { data, error } = await supabasePublic
        .from('page_documents')
        .select('id, name, slug, navigation_placement, sections')
        .eq('store_id', this.storeId)
        .eq('status', 'published')
        .order('name');

      if (error) {
        console.warn('❌ PUBLIC: Error getting all published pages:', error);
        return [];
      }

      console.log('✅ PUBLIC: Found all published pages:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('💥 PUBLIC: Error getting all published pages:', error);
      return [];
    }
  }
}