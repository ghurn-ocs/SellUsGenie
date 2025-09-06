/**
 * Visual Page Builder StoreFront
 * Properly respects Visual Page Builder architecture:
 * - Each page has individual content, widgets, and styling
 * - Standard pages are widget-based
 * - Header/Footer have specialized editing
 * - Dynamic navigation based on page visibility settings
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { PublicPageRepository } from '../../lib/supabase-public';
import { PageBuilderRenderer } from './PageBuilderRenderer';
import type { PageDocument } from '../../pageBuilder/types';
import { useAnalyticsIntegrations } from '../../hooks/useAnalyticsConfig';
import { googleAnalytics } from '../../lib/googleAnalytics';
import { CartIcon } from '../cart/CartIcon';
import { CartSidebar } from '../cart/CartSidebar';
import { SmartLink } from '../ui/SmartLink';
import { useDelegatedLinkNavigation } from '../../hooks/useDelegatedLinkNavigation';

interface VisualPageBuilderStoreFrontProps {
  storeId: string;
  storeName: string;
  children?: React.ReactNode;
  pagePath?: string;
  storeSlug?: string;
}

interface SystemPages {
  header: PageDocument | null;
  footer: PageDocument | null;
  loading: boolean;
  error: string | null;
}

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  store_logo_url: string | null;
  is_active: boolean;
}

interface NavigationPage {
  id: string;
  name: string;
  slug: string;
  navigation_placement: string;
}


/**
 * Helper function to safely check if a page has valid content to render
 */
const safeRender = (page?: PageDocument | null): boolean => {
  return !!(page && Array.isArray(page.sections) && page.sections.length > 0);
};

/**
 * Helper function to extract header layout widget from page data
 * Returns the complete widget object that HeaderLayoutView expects
 */
const extractHeaderWidget = (page: PageDocument) => {
  const headerWidget = page.sections
    ?.flatMap(section => section.rows || [])
    ?.flatMap(row => row.widgets || [])
    ?.find((widget: any) => widget.type === 'header-layout');
  
  return headerWidget || null;
};

/**
 * Helper function to extract footer layout widget from page data
 * Returns the complete widget object that FooterLayoutView expects
 */
const extractFooterWidget = (page: PageDocument) => {
  const footerWidget = page.sections
    ?.flatMap(section => section.rows || [])
    ?.flatMap(row => row.widgets || [])
    ?.find((widget: any) => widget.type === 'footer-layout');
  
  return footerWidget || null;
};

/**
 * Visual Page Builder StoreFront Component
 */
const VisualPageBuilderStoreFrontComponent: React.FC<VisualPageBuilderStoreFrontProps> = ({
  storeId,
  storeName,
  children,
  pagePath = '/',
  storeSlug
}) => {
  const [location] = useLocation();
  
  // Debug: Track component mounting/unmounting
  console.log('🔄 VisualPageBuilderStoreFront MOUNTED/RE-RENDERED for:', {
    storeId,
    storeName,
    pagePath,
    timestamp: new Date().toISOString().split('T')[1]
  });
  
  // Enable delegated link navigation for any remaining HTML links
  useDelegatedLinkNavigation('storefront-main');
  
  const [systemPages, setSystemPages] = useState<SystemPages>({
    header: null,
    footer: null,
    loading: true,
    error: null
  });
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [navigationPages, setNavigationPages] = useState<NavigationPage[]>([]);
  const [currentPage, setCurrentPage] = useState<PageDocument | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Latching with dependency tracking to prevent React Strict Mode duplicates
  const systemPagesRan = useRef<string>('');
  const currentPageRan = useRef<string>('');

  // Memoize repository instance to prevent object identity churn
  const publicRepository = useMemo(() => {
    return storeId ? new PublicPageRepository(storeId) : null;
  }, [storeId]);

  // Fetch analytics integrations for GA4 initialization
  const { data: integrations = [] } = useAnalyticsIntegrations(storeId);
  const ga4Integration = integrations.find(i => i.integration_type === 'google_analytics');

  // Initialize Google Analytics 4 when integration is configured
  useEffect(() => {
    if (ga4Integration && ga4Integration.config.tracking_id && ga4Integration.status === 'active') {
      const initializeGA4 = async () => {
        try {
          await googleAnalytics.initialize({
            measurementId: ga4Integration.config.tracking_id,
            enhancedEcommerce: ga4Integration.config.enhanced_ecommerce ?? true,
            conversionTracking: ga4Integration.config.conversion_tracking ?? true,
            audienceTracking: ga4Integration.config.audience_tracking ?? false,
            customDimensions: {},
            customMetrics: {}
          });

          // Track initial page view
          googleAnalytics.trackPageView(
            currentPage?.name || storeName,
            window.location.href
          );
        } catch (error) {
          console.error('Failed to initialize Google Analytics 4:', error);
        }
      };

      initializeGA4();
    }
  }, [ga4Integration, storeName]);

  // Track page views when page changes
  useEffect(() => {
    if (ga4Integration && currentPage && googleAnalytics.isReady()) {
      googleAnalytics.trackPageView(
        currentPage.name || 'Page',
        window.location.href
      );
    }
  }, [currentPage, ga4Integration]);

  // Memoize stable parameters for data fetching
  const fetchParams = useMemo(() => ({
    storeId,
    storeName,
    pagePath: pagePath || '/'
  }), [storeId, storeName, pagePath]);

  // Load system pages (Header and Footer)  
  useEffect(() => {
    const depKey = `${storeId}-${storeName}`;
    if (systemPagesRan.current === depKey) return;
    systemPagesRan.current = depKey;
    
    const loadSystemPages = async () => {
      if (!publicRepository) {
        setSystemPages(prev => ({
          ...prev,
          loading: false,
          error: 'No store ID provided'
        }));
        return;
      }

      try {
        
        // Load store data, header, footer, and navigation pages concurrently
        const [storeResult, headerResult, footerResult, navigationResult] = await Promise.allSettled([
          publicRepository.getPublicStoreInfo(),
          publicRepository.getPublishedSystemPage('header'),
          publicRepository.getPublishedSystemPage('footer'),
          publicRepository.getNavigationPages()
        ]);

        const store = storeResult.status === 'fulfilled' ? storeResult.value : null;
        
        // Log if store data loading failed
        if (storeResult.status === 'rejected') {
          console.error('❌ Store data loading failed:', storeResult.reason);
        }
        const header = headerResult.status === 'fulfilled' ? headerResult.value : null;
        const footer = footerResult.status === 'fulfilled' ? footerResult.value : null;
        const navPages = navigationResult.status === 'fulfilled' ? navigationResult.value : [];

        // CRITICAL DEBUG: Log system pages loading results
        console.log('🚨 SYSTEM PAGES DEBUG:', {
          headerResult: {
            status: headerResult.status,
            hasData: !!header,
            name: header?.name,
            sections: header?.sections?.length || 0
          },
          footerResult: {
            status: footerResult.status,
            hasData: !!footer,
            name: footer?.name,
            sections: footer?.sections?.length || 0,
            rejected: footerResult.status === 'rejected' ? footerResult.reason : null
          }
        });

        setSystemPages({
          header,
          footer,
          loading: false,
          error: null
        });
        setStoreData(store);
        setNavigationPages(navPages);

        console.log('🎨 Visual Page Builder StoreFront loaded:', {
          ...fetchParams,
          hasHeader: !!header,
          hasFooter: !!footer,
          headerSections: header?.sections.length || 0,
          footerSections: footer?.sections.length || 0,
          navigationPagesCount: navPages.length,
          hasStoreLogo: !!store?.store_logo_url
        });

        // Header content processing
        if (header?.sections) {
          // Check header widgets and styling
          header.sections.forEach((section: any, sIdx: number) => {
            console.log(`🎨 Header Section [${sIdx}]:`, {
              id: section.id,
              backgroundColor: section.backgroundColor,
              padding: section.padding,
              rowsCount: section.rows?.length || 0
            });

            section.rows?.forEach((row: any, rIdx: number) => {
              if (row && row.widgets && Array.isArray(row.widgets)) {
                row.widgets.forEach((widget: any, wIdx: number) => {
                  console.log(`🎨 Header Widget [${sIdx}.${rIdx}.${wIdx}]:`, {
                    type: widget.type,
                    props: widget.props,
                    customCSS: widget.customCSS
                  });
                });
              }
            });
          });
        }

        // Footer content processing (if needed)
        if (footer?.sections) {
          console.log('🎨 Footer sections loaded:', footer.sections.length);
        }

      } catch (error) {
        console.error('❌ Visual Page Builder StoreFront error:', error);
        setSystemPages({
          header: null,
          footer: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    loadSystemPages();
  }, [storeId, storeName, publicRepository]);

  // Load current page content based on pagePath
  useEffect(() => {
    console.log('🔄 VisualPageBuilderStoreFront pagePath changed:', {
      storeId,
      pagePath,
      publicRepository: !!publicRepository
    });
    
    const depKey = `${storeId}-${pagePath}`;
    if (currentPageRan.current === depKey) {
      console.log('⏭️ Skipping page load - already loaded for:', depKey);
      return;
    }
    currentPageRan.current = depKey;
    
    const loadCurrentPage = async () => {
      if (!publicRepository || pagePath === undefined) {
        console.log('❌ Cannot load page - missing dependencies:', {
          publicRepository: !!publicRepository,
          pagePath
        });
        return;
      }

      try {
        setPageLoading(true);
        
        // Normalize the path - remove leading slash for slug lookup
        const pageSlug = (pagePath === '/' || pagePath === '') ? '/' : pagePath.replace(/^\//, '');
        
        console.log('🔍 Loading page for path:', pagePath, '-> normalized slug:', pageSlug);

        let page = null;
        
        // FIXED: Use improved page loading logic that doesn't exclude home pages
        if (pageSlug === '/') {
          // For home page, try direct approach first
          console.log('🏠 Loading home page...');
          page = await publicRepository.getPublishedPageBySlug('/');
          
          // If not found, try alternative home page approaches using ALL published pages
          if (!page) {
            console.log('🔍 Home page not found at /, trying alternatives...');
            const allPages = await publicRepository.getAllPublishedPages();
            page = allPages.find(p => 
              p.slug === '/' || 
              p.slug === '/home' ||
              p.slug === 'home' || 
              p.name.toLowerCase().includes('home')
            );
            
            if (page) {
              console.log('✅ Found home page via alternative search:', page.name);
            }
          }
          
          // Final fallback: get first published page
          if (!page) {
            console.log('⚠️ No home page found, using fallback...');
            const allPages = await publicRepository.getAllPublishedPages();
            if (allPages.length > 0) {
              page = allPages[0];
              console.log('🔄 Using fallback page:', page.name);
            }
          }
        } else {
          // For non-home pages, try direct slug lookup
          console.log('📄 Loading page with slug:', pageSlug);
          page = await publicRepository.getPublishedPageBySlug(pageSlug);
          
          // If not found, search through ALL published pages
          if (!page) {
            console.log('🔍 Page not found, trying alternatives...');
            const allPages = await publicRepository.getAllPublishedPages();
            const alternativeSlug = pageSlug.replace(/-/g, ' ');
            page = allPages.find(p => 
              p.name.toLowerCase() === alternativeSlug.toLowerCase() ||
              p.slug === pageSlug ||
              p.slug === `/${pageSlug}` ||
              p.slug === pageSlug.replace('/', '')
            );
          }
        }

        // Enhanced logging and validation
        console.log('📄 Page loading result:', {
          found: !!page,
          pageName: page?.name,
          pageSlug: page?.slug,
          sectionsCount: page?.sections?.length || 0,
          navigationPlacement: page?.navigation_placement
        });

        // Detailed sections debugging and validation
        if (page) {
          console.log('🔍 SECTIONS DEBUG:', {
            sectionsExists: !!page.sections,
            sectionsType: typeof page.sections,
            sectionsIsArray: Array.isArray(page.sections),
            sectionsLength: page.sections?.length,
            firstSectionPreview: page.sections?.[0] ? {
              id: page.sections[0].id,
              rowsCount: page.sections[0].rows?.length || 0,
              widgetCount: page.sections[0].rows?.reduce((acc: number, row: any) => acc + (row.widgets?.length || 0), 0) || 0
            } : null,
            pageId: page.id,
            pageStatus: page.status
          });

          // Validate sections structure and provide helpful warnings
          if (!page.sections || !Array.isArray(page.sections) || page.sections.length === 0) {
            console.warn('⚠️ PAGE CONTENT ISSUE - Page found but has no valid sections:', {
              pageName: page.name,
              pageId: page.id,
              sectionsRaw: page.sections,
              recommendedActions: [
                '1. Check if page content was properly saved in page builder',
                '2. Verify sections field in database is valid JSON array',
                '3. Ensure page status is "published"',
                '4. Check RLS policies allow reading this page'
              ]
            });
          } else {
            console.log('✅ Page content structure looks valid');
          }
        } else {
          console.error('❌ CRITICAL: No page found for slug:', pageSlug, {
            storeId,
            storeName,
            recommendedActions: [
              '1. Check if any published pages exist for this store',
              '2. Verify slug format matches database records', 
              '3. Run sample data creation script if no content exists',
              '4. Check database connection and RLS policies'
            ]
          });
        }

        setCurrentPage(page);
      } catch (error) {
        console.error('❌ Error loading current page:', error);
        setCurrentPage(null);
      } finally {
        setPageLoading(false);
      }
    };

    loadCurrentPage();
  }, [storeId, pagePath, publicRepository]);

  // Loading state - render nothing while loading
  if (systemPages.loading || pageLoading) {
    return null;
  }

  // Error state - render nothing on error
  if (systemPages.error) {
    return null;
  }

  return (
    <div className="visual-page-builder-storefront">
      {/* Header - Rebuilt from Scratch */}
      {(() => {
        console.log('🔝 Header Debug:', {
          hasHeaderPage: !!systemPages.header,
          headerSections: systemPages.header?.sections?.length || 0,
          storeData: !!storeData,
          storeName: storeData?.store_name,
          navigationPages: navigationPages.length
        });

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
                    {storeData?.store_name || 'Store Name'}
                  </h1>
                  <p className="text-sm text-black opacity-80">
                    Where we come to go!
                  </p>
                </div>
              </div>

              {/* Center: Navigation */}
              <nav className="flex items-center space-x-4">
                {navigationPages
                  .filter(page => page.navigation_placement === 'header' || page.navigation_placement === 'both')
                  .map((page) => {
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
                      onClick={() => console.log('🔗 Direct Link clicked, navigating to:', pageUrl)}
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
      })()}

      {/* Main Content Area - Regular Page Builder Content */}
      <main id="storefront-main" className="storefront-main">
        {safeRender(currentPage) ? (
          <PageBuilderRenderer
            page={currentPage!}
            isSystemPage={false}
            storeData={storeData || undefined}
          />
        ) : children ? (
          children
        ) : null}
      </main>

      {/* Footer - Rebuilt from Scratch */}
      {(() => {
        console.log('🦶 Footer Debug:', {
          hasFooterPage: !!systemPages.footer,
          footerSections: systemPages.footer?.sections?.length || 0,
          storeData: !!storeData,
          storeName: storeData?.store_name
        });

        return (
          <footer 
            className="storefront-footer w-full"
            style={{ 
              backgroundColor: '#0d0f12',
              color: '#f9fafb',
              padding: '48px 24px'
            }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Column 1: Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {storeData?.store_logo_url && (
                      <img 
                        src={storeData.store_logo_url} 
                        alt="Store Logo" 
                        className="h-8 w-auto object-contain"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-white">
                        {storeData?.store_name || 'Store Name'}
                      </h3>
                      <p className="text-sm text-gray-300">
                        Where we go now!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 2: GENERAL */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white uppercase tracking-wide">
                    GENERAL
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link 
                        to={storeSlug ? `/store/${storeSlug}/about` : '/about'} 
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        About Us
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 3: SUPPORT */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white uppercase tracking-wide">
                    SUPPORT
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link 
                        to={storeSlug ? `/store/${storeSlug}/contact` : '/contact'} 
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 4: LEGAL */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white uppercase tracking-wide">
                    LEGAL
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link 
                        to={storeSlug ? `/store/${storeSlug}/terms` : '/terms'} 
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to={storeSlug ? `/store/${storeSlug}/returns` : '/returns'} 
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Returns
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to={storeSlug ? `/store/${storeSlug}/privacy` : '/privacy'} 
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Copyright Section */}
              <div className="mt-12 pt-8 border-t border-gray-700 text-center">
                <p className="text-sm text-gray-400">
                  © {new Date().getFullYear()} {storeData?.store_name || 'Store Name'}. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        );
      })()}

      {/* Shopping Cart Sidebar */}
      <CartSidebar />

    </div>
  );
};

export const VisualPageBuilderStoreFront = VisualPageBuilderStoreFrontComponent;

export default VisualPageBuilderStoreFront;