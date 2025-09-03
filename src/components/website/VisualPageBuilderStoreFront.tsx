/**
 * Visual Page Builder StoreFront
 * Properly respects Visual Page Builder architecture:
 * - Each page has individual content, widgets, and styling
 * - Standard pages are widget-based
 * - Header/Footer have specialized editing
 * - Dynamic navigation based on page visibility settings
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { PublicPageRepository } from '../../lib/supabase-public';
import { PageBuilderRenderer } from './PageBuilderRenderer';
import type { PageDocument } from '../../pageBuilder/types';

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

  // Load system pages (Header and Footer)
  useEffect(() => {
    const loadSystemPages = async () => {
      if (!storeId) {
        setSystemPages(prev => ({
          ...prev,
          loading: false,
          error: 'No store ID provided'
        }));
        return;
      }

      try {
        const publicRepository = new PublicPageRepository(storeId);
        
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

        setSystemPages({
          header,
          footer,
          loading: false,
          error: null
        });
        setStoreData(store);
        setNavigationPages(navPages);

        console.log('🎨 Visual Page Builder StoreFront loaded:', {
          storeId,
          storeName,
          hasHeader: !!header,
          hasFooter: !!footer,
          headerSections: header?.sections.length || 0,
          footerSections: footer?.sections.length || 0,
          headerNavigationPlacement: header ? 'System Page' : 'None',
          footerNavigationPlacement: footer ? 'System Page' : 'None',
          storeData: store,
          hasStoreLogo: !!store?.store_logo_url,
          storeLogo: store?.store_logo_url,
          navigationPagesCount: navPages.length
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
              row.widgets?.forEach((widget: any, wIdx: number) => {
                console.log(`🎨 Header Widget [${sIdx}.${rIdx}.${wIdx}]:`, {
                  type: widget.type,
                  props: widget.props,
                  customCSS: widget.customCSS
                });
              });
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
  }, [storeId, storeName]);

  // Load current page content based on pagePath
  useEffect(() => {
    const loadCurrentPage = async () => {
      if (!storeId || !pagePath) return;

      try {
        setPageLoading(true);
        const publicRepository = new PublicPageRepository(storeId);
        
        // Normalize the path - remove leading slash for slug lookup
        const pageSlug = pagePath === '/' ? '/' : pagePath.replace(/^\//, '');
        
        console.log('🔍 Loading page for path:', {
          pagePath,
          pageSlug,
          storeId,
          storeName
        });

        let page = null;
        
        // Try to get page by slug
        if (pageSlug === '/') {
          // For home page, try different approaches
          const allPages = await publicRepository.getNavigationPages();
          page = allPages.find(p => 
            p.slug === '/' || 
            p.slug === 'home' || 
            p.name.toLowerCase().includes('home')
          );
          
          // If no home page found, try to get the first published page
          if (!page && allPages.length > 0) {
            page = await publicRepository.getPublishedPageBySlug(allPages[0].slug);
          }
        } else {
          // Try to get page by slug
          page = await publicRepository.getPublishedPageBySlug(pageSlug);
          
          // If not found, try with different slug formats
          if (!page) {
            const alternativeSlug = pageSlug.replace(/-/g, ' ');
            const allPages = await publicRepository.getNavigationPages();
            const matchingPage = allPages.find(p => 
              p.name.toLowerCase() === alternativeSlug.toLowerCase() ||
              p.slug === pageSlug ||
              p.slug === `/${pageSlug}`
            );
            if (matchingPage) {
              page = await publicRepository.getPublishedPageBySlug(matchingPage.slug);
            }
          }
        }

        console.log('📄 Page loading result:', {
          found: !!page,
          pageName: page?.name,
          pageSlug: page?.slug,
          sectionsCount: page?.sections?.length || 0
        });

        setCurrentPage(page);
      } catch (error) {
        console.error('❌ Error loading current page:', error);
        setCurrentPage(null);
      } finally {
        setPageLoading(false);
      }
    };

    loadCurrentPage();
  }, [storeId, pagePath]);

  // Loading state
  if (systemPages.loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {storeName}...</p>
        </div>
      </div>
    );
  }

  // Error state  
  if (systemPages.error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-red-800 mb-2">Store Loading Error</h1>
          <p className="text-red-700 mb-4">{systemPages.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="visual-page-builder-storefront">
      {/* Header - Rendered as System Page */}
      {(() => {
        console.log('🔍 HEADER DECISION DEBUG:', {
          hasSystemPagesHeader: !!systemPages.header,
          headerName: systemPages.header?.name,
          headerId: systemPages.header?.id,
          headerSections: systemPages.header?.sections?.length || 0,
          isUsingFallback: !systemPages.header
        });
        return systemPages.header;
      })() ? (
        <header className="storefront-header">
          <PageBuilderRenderer
            page={systemPages.header}
            isSystemPage={true}
            storeData={storeData || undefined}
          />
        </header>
      ) : (
        /* Enhanced Fallback Header with Theme Styling from Database */
        <header 
          className="storefront-header border-b"
          style={{
            backgroundColor: systemPages.header?.themeOverrides?.backgroundColor || '#ffffff',
            color: systemPages.header?.themeOverrides?.textColor || '#1f2937',
            borderColor: systemPages.header?.themeOverrides?.borderColor || '#e5e7eb'
          }}
        >
          <div 
            className={`storefront-header-content responsive-content-width flex items-center justify-between ${
              systemPages.header?.themeOverrides?.horizontalSpacing === 'thin' ? 'py-2 px-3' :
              systemPages.header?.themeOverrides?.horizontalSpacing === 'expanded' ? 'py-8 px-8' :
              'py-4 px-6' // standard default
            }`}
          >
            <div className="storefront-header-brand flex items-center space-x-3">
              {storeData?.store_logo_url ? (
                <img 
                  src={storeData.store_logo_url} 
                  alt={`${storeName} logo`}
                  className="h-8 w-auto"
                  onLoad={() => console.log('✅ Logo loaded successfully:', storeData.store_logo_url)}
                  onError={(e) => console.error('❌ Logo failed to load:', storeData.store_logo_url, e)}
                />
              ) : (
                <h1 
                  className="storefront-header-title text-xl font-bold"
                  style={{
                    color: systemPages.header?.themeOverrides?.textColor || '#1f2937',
                    fontFamily: systemPages.header?.themeOverrides?.fontFamily || 'inherit'
                  }}
                >
                  {storeName}
                </h1>
              )}
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <small className="text-xs text-gray-500">
                  Logo: {storeData?.store_logo_url ? 'Found' : 'Not found'} | 
                  Store ID: {storeId} | 
                  Store Data: {storeData ? 'Loaded' : 'Missing'}
                </small>
              )}
              {/* Display tagline if provided in theme overrides */}
              {systemPages.header?.themeOverrides?.tagline && (
                <span 
                  className="text-sm opacity-75 ml-2"
                  style={{
                    color: systemPages.header?.themeOverrides?.textColor || '#1f2937'
                  }}
                >
                  {systemPages.header?.themeOverrides?.tagline}
                </span>
              )}
            </div>
            
            <nav className="storefront-header-nav hidden md:flex space-x-8">
              {navigationPages.filter(page => 
                page.navigation_placement === 'header' || page.navigation_placement === 'both'
              ).length > 0 ? (
                navigationPages.filter(page => 
                  page.navigation_placement === 'header' || page.navigation_placement === 'both'
                ).map(page => {
                  const navLinkStyle = systemPages.header?.themeOverrides?.navLinkStyle || 'text';
                  const buttonStyle = systemPages.header?.themeOverrides?.buttonStyle || 'rounded';
                  const linkColor = systemPages.header?.themeOverrides?.linkColor || '#6b7280';
                  const linkHoverColor = systemPages.header?.themeOverrides?.linkHoverColor || '#1f2937';
                  const backgroundColor = systemPages.header?.themeOverrides?.backgroundColor || '#ffffff';

                  // Generate CSS classes based on navLinkStyle and buttonStyle
                  let linkClassName = 'storefront-header-nav-link transition-all duration-200';
                  const linkStyle: React.CSSProperties = {
                    color: linkColor,
                    fontFamily: systemPages.header?.themeOverrides?.fontFamily || 'inherit'
                  };

                  if (navLinkStyle === 'bordered') {
                    // Bordered style with border radius based on buttonStyle
                    const borderRadius = buttonStyle === 'round' ? 'rounded-full' : 
                                        buttonStyle === 'square' ? 'rounded-none' : 'rounded';
                    linkClassName += ` px-3 py-1 ${borderRadius} border`;
                    linkStyle.borderColor = linkColor;
                    linkStyle.backgroundColor = 'transparent';
                  } else {
                    // Text style with bold font
                    linkClassName += ' font-semibold px-3 py-2';
                  }

                  // Extract store base path from current location
                  const storeMatch = location.match(/^(\/store\/[^\/]+)/);
                  const storeBasePath = storeMatch ? storeMatch[1] : '/store/unknown';
                  
                  const href = page.slug === '/' || page.slug === ''
                    ? storeBasePath
                    : `${storeBasePath}/${page.slug}`;
                    
                  console.log('🔗 Header Navigation Link:', {
                    pageName: page.name,
                    pageSlug: page.slug,
                    href,
                    storeBasePath,
                    currentLocation: location
                  });
                  
                  return (
                    <Link 
                      key={page.id}
                      href={href} 
                      className={linkClassName}
                      style={linkStyle}
                      onClick={(e) => {
                        console.log('🖱️ Navigation Link Clicked:', {
                          pageName: page.name,
                          href,
                          event: e.type
                        });
                      }}
                      onMouseEnter={(e) => {
                        if (navLinkStyle === 'bordered') {
                          e.currentTarget.style.backgroundColor = linkColor;
                          e.currentTarget.style.color = backgroundColor;
                        } else {
                          e.currentTarget.style.color = linkHoverColor;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (navLinkStyle === 'bordered') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = linkColor;
                        } else {
                          e.currentTarget.style.color = linkColor;
                        }
                      }}
                    >
                      {page.name}
                    </Link>
                  );
                })
              ) : (
                <span className="text-sm text-gray-500">No published pages available for navigation</span>
              )}
            </nav>
            
            <div className="storefront-header-actions">
              {/* Cart icon will be positioned here by ShoppingCartSystem */}
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="storefront-mobile-nav md:hidden">
            <button 
              className="storefront-mobile-nav-button flex items-center justify-center p-2" 
              type="button"
              style={{
                color: systemPages.header?.themeOverrides?.textColor || '#6b7280'
              }}
            >
              <span className="sr-only">Open main menu</span>
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                style={{
                  color: systemPages.header?.themeOverrides?.textColor || '#6b7280'
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area - Regular Page Builder Content */}
      <main className="storefront-main">
        {currentPage ? (
          <PageBuilderRenderer
            page={currentPage}
            isSystemPage={false}
            storeData={storeData || undefined}
          />
        ) : children ? (
          children
        ) : (
          <div className="py-16">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-6xl mb-4">🏗️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-4">
                  The page "{pagePath}" could not be found.
                </p>
                <p className="text-sm text-gray-500">
                  Please check that the page has been published in the Visual Page Builder.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded text-left">
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Debug Info:</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Store ID: {storeId}</div>
                      <div>Page Path: {pagePath}</div>
                      <div>Store Name: {storeName}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Rendered as System Page */}
      {systemPages.footer ? (
        <footer className="storefront-footer">
          <PageBuilderRenderer
            page={systemPages.footer}
            isSystemPage={true}
            storeData={storeData || undefined}
          />
        </footer>
      ) : (
        /* Enhanced Fallback Footer with Theme Styling from Database */
        <footer 
          className="storefront-footer border-t"
          style={{
            backgroundColor: systemPages.footer?.themeOverrides?.backgroundColor || '#f9fafb',
            color: systemPages.footer?.themeOverrides?.textColor || '#6b7280',
            borderColor: systemPages.footer?.themeOverrides?.borderColor || '#e5e7eb'
          }}
        >
          <div 
            className={`storefront-footer-content ${
              systemPages.footer?.themeOverrides?.horizontalSpacing === 'thin' ? 'py-4 px-3' :
              systemPages.footer?.themeOverrides?.horizontalSpacing === 'expanded' ? 'py-12 px-8' :
              'py-8 px-6' // standard default
            }`}
          >
            <div className="text-center">
              <p 
                className="mb-2"
                style={{
                  color: systemPages.footer?.themeOverrides?.textColor || '#6b7280',
                  fontFamily: systemPages.footer?.themeOverrides?.fontFamily || 'inherit'
                }}
              >
                {systemPages.footer?.themeOverrides?.footerText || `© 2024 ${storeName}. All rights reserved.`}
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                {navigationPages.filter(page => 
                  page.navigation_placement === 'footer' || page.navigation_placement === 'both'
                ).length > 0 ? (
                  navigationPages.filter(page => 
                    page.navigation_placement === 'footer' || page.navigation_placement === 'both'
                  ).map(page => {
                    // Extract store base path from current location
                    const storeMatch = location.match(/^(\/store\/[^\/]+)/);
                    const storeBasePath = storeMatch ? storeMatch[1] : '/store/unknown';
                    
                    const href = page.slug === '/' || page.slug === ''
                      ? storeBasePath
                      : `${storeBasePath}/${page.slug}`;
                      
                    console.log('🔗 Footer Navigation Link:', {
                      pageName: page.name,
                      pageSlug: page.slug,
                      href,
                      storeBasePath,
                      currentLocation: location
                    });
                    
                    return (
                      <Link 
                        key={page.id}
                        href={href} 
                        className="transition-colors"
                        onClick={(e) => {
                          console.log('🖱️ Footer Link Clicked:', {
                            pageName: page.name,
                            href,
                            event: e.type
                          });
                        }}
                      style={{
                        color: systemPages.footer?.themeOverrides?.linkColor || '#9ca3af',
                        fontFamily: systemPages.footer?.themeOverrides?.fontFamily || 'inherit'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = systemPages.footer?.themeOverrides?.linkHoverColor || '#4b5563';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = systemPages.footer?.themeOverrides?.linkColor || '#9ca3af';
                      }}
                      >
                        {page.name}
                      </Link>
                    );
                  })
                ) : (
                  <span className="text-sm opacity-60">No published pages available for footer navigation</span>
                )}
              </div>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};

export default VisualPageBuilderStoreFront;