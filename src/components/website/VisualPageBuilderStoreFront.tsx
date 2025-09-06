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
import { HeaderLayoutView } from '../../pageBuilder/widgets/header-layout/HeaderLayoutView';
import { FooterLayoutView } from '../../pageBuilder/widgets/footer-layout/FooterLayoutView';
import type { PageDocument } from '../../pageBuilder/types';
import { useAnalyticsIntegrations } from '../../hooks/useAnalyticsConfig';
import { googleAnalytics } from '../../lib/googleAnalytics';

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
export const VisualPageBuilderStoreFront: React.FC<VisualPageBuilderStoreFrontProps> = ({
  storeId,
  storeName,
  children,
  pagePath = '/',
  storeSlug
}) => {
  const [location] = useLocation();
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
    const depKey = `${storeId}-${pagePath}`;
    if (currentPageRan.current === depKey) return;
    currentPageRan.current = depKey;
    
    const loadCurrentPage = async () => {
      if (!publicRepository || pagePath === undefined) return;

      try {
        setPageLoading(true);
        
        // Normalize the path - remove leading slash for slug lookup
        const pageSlug = (pagePath === '/' || pagePath === '') ? '/' : pagePath.replace(/^\//, '');
        
        console.log('🔍 Loading page for path:', fetchParams.pagePath);

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
      {/* Header - Direct Rendering */}
      {(() => {
        if (!safeRender(systemPages.header)) {
          console.log('🔝 No valid header page found or sections empty');
          return null;
        }
        
        const headerWidget = extractHeaderWidget(systemPages.header!);
        if (!headerWidget) {
          console.log('🔝 No header-layout widget found in header page');
          return null;
        }
        
        return (
          <header className="storefront-header">
            <HeaderLayoutView widget={headerWidget} />
          </header>
        );
      })()}

      {/* Main Content Area - Regular Page Builder Content */}
      <main className="storefront-main">
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

      {/* Footer - Direct Rendering */}
      {(() => {
        if (!safeRender(systemPages.footer)) {
          console.log('🦶 No valid footer page found or sections empty');
          return null;
        }
        
        const footerWidget = extractFooterWidget(systemPages.footer!);
        if (!footerWidget) {
          console.log('🦶 No footer-layout widget found in footer page');
          return null;
        }
        
        return (
          <footer className="storefront-footer">
            <FooterLayoutView widget={footerWidget} />
          </footer>
        );
      })()}

    </div>
  );
};

export default VisualPageBuilderStoreFront;