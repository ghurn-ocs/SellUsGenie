import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PublicPageRepository } from '../../lib/supabase-public';
import { PageBuilderRenderer } from './PageBuilderRenderer';
import type { PageDocument } from '../../pageBuilder/types';
import { useDelegatedLinkNavigation } from '../../hooks/useDelegatedLinkNavigation';

interface StorefrontMainContentProps {
  storeId: string;
  storeName: string;
  pagePath: string;
  storeData?: {
    id: string;
    store_name: string;
    store_slug: string;
    store_logo_url: string | null;
    is_active: boolean;
  };
}

export const StorefrontMainContent: React.FC<StorefrontMainContentProps> = ({
  storeId,
  storeName,
  pagePath,
  storeData
}) => {
  const [currentPage, setCurrentPage] = useState<PageDocument | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const currentPageRan = useRef<string>('');

  // Enable delegated link navigation for any remaining HTML links
  useDelegatedLinkNavigation('storefront-main');
  
  // Memoize repository instance
  const publicRepository = useMemo(() => {
    return storeId ? new PublicPageRepository(storeId) : null;
  }, [storeId]);

  // Load current page content based on pagePath
  useEffect(() => {
    console.log('🔄 StorefrontMainContent pagePath changed:', {
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
        
        // Use improved page loading logic
        if (pageSlug === '/') {
          // For home page, try direct approach first
          console.log('🏠 Loading home page...');
          page = await publicRepository.getPublishedPageBySlug('/');
          
          // If not found, try alternative home page approaches
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
              p.slug === pageSlug || 
              p.slug === `/${pageSlug}` ||
              p.slug === pageSlug.replace(/\//g, '') ||
              p.name.toLowerCase().replace(/\s+/g, '-') === pageSlug ||
              p.name.toLowerCase() === alternativeSlug.toLowerCase()
            );
            
            if (page) {
              console.log('✅ Found page via alternative search:', page.name);
            }
          }
        }

        console.log('📄 Page loading result:', {
          found: !!page,
          pageName: page?.name,
          pageSlug: pageSlug,
          sectionsCount: page?.sections?.length || 0,
          navigationPlacement: page?.navigation_placement
        });

        if (page?.sections) {
          console.log('🔍 SECTIONS DEBUG:', {
            sectionsExists: !!page.sections,
            sectionsType: typeof page.sections,
            sectionsIsArray: Array.isArray(page.sections),
            sectionsLength: page.sections.length,
            firstSectionPreview: page.sections[0] ? {
              id: page.sections[0].id,
              rowsCount: page.sections[0].rows?.length || 0
            } : null,
            pageData: {
              name: page.name,
              slug: page.slug,
              status: page.status
            }
          });
          
          console.log('✅ Page content structure looks valid');
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

  // Helper function to check if rendering is safe
  const safeRender = (page: PageDocument | null) => {
    return page && 
           page.sections && 
           Array.isArray(page.sections) && 
           page.sections.length > 0;
  };

  console.log('📄 StorefrontMainContent rendered for:', { storeId, pagePath, hasPage: !!currentPage });

  // Loading state
  if (pageLoading) {
    return (
      <main id="storefront-main" className="storefront-main">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </main>
    );
  }

  return (
    <main id="storefront-main" className="storefront-main">
      {safeRender(currentPage) ? (
        <PageBuilderRenderer
          page={currentPage!}
          isSystemPage={false}
          storeData={storeData || undefined}
        />
      ) : (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-600">The requested page could not be found.</p>
          </div>
        </div>
      )}
    </main>
  );
};