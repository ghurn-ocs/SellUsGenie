/**
 * Page Builder Renderer for Storefront
 * Renders page builder content in the live storefront
 */

import React, { useState, useEffect } from 'react';
import type { PageDocument, Section, Row, WidgetBase } from '../../pageBuilder/types';
import { widgetRegistry } from '../../pageBuilder/widgets/registry';
import { SupabasePageRepository } from '../../pageBuilder/data/SupabasePageRepository';

// Import all widgets to register them
import '../../pageBuilder/widgets/text/index';
import '../../pageBuilder/widgets/button/index';
import '../../pageBuilder/widgets/image/index';
import '../../pageBuilder/widgets/hero/index';
import '../../pageBuilder/widgets/navigation/index';
import '../../pageBuilder/widgets/spacer/index';
import '../../pageBuilder/widgets/gallery/index';
import '../../pageBuilder/widgets/form/index';
import '../../pageBuilder/widgets/carousel/index';
import '../../pageBuilder/widgets/cart/index';
import '../../pageBuilder/widgets/product-listing/index';
import '../../pageBuilder/widgets/subscribe/index';
import '../../pageBuilder/widgets/featured-products/index';
import '../../pageBuilder/widgets/header-layout/index';
import '../../pageBuilder/widgets/footer-layout/index';

interface PageBuilderRendererProps {
  storeId: string;
  storeName: string;
  pagePath?: string;
  className?: string;
  onFallbackNeeded?: () => void;
}

interface WidgetRendererProps {
  widget: WidgetBase;
  theme?: Record<string, string>;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, theme }) => {
  try {
    const config = widgetRegistry.get(widget.type);
    if (!config) {
      console.warn(`Widget type ${widget.type} not found in registry`);
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded">
          <p className="text-red-600 text-sm">Unknown widget type: {widget.type}</p>
        </div>
      );
    }

    const ViewComponent = config.View;
    return <ViewComponent widget={widget} theme={theme} />;
  } catch (error) {
    console.error('Error rendering widget:', error);
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded">
        <p className="text-red-600 text-sm">Error rendering widget</p>
      </div>
    );
  }
};

const RowRenderer: React.FC<{ row: Row; theme?: Record<string, string> }> = ({ row, theme }) => {
  if (row.widgets.length === 0) return null;

  return (
    <div className="grid grid-cols-12 gap-4">
      {row.widgets.map(widget => {
        // Calculate responsive grid classes
        const getColSpanClass = () => {
          const colSpan = widget.colSpan;
          const lg = colSpan.lg || 12;
          const md = colSpan.md || lg;
          const sm = colSpan.sm || md;
          
          return `col-span-${sm} md:col-span-${md} lg:col-span-${lg}`;
        };

        // Check visibility settings
        const isVisible = () => {
          if (!widget.visibility) return true;
          
          // For now, just check if any breakpoint is visible
          // In a real implementation, you'd check the current viewport
          return widget.visibility.lg !== false || 
                 widget.visibility.md !== false || 
                 widget.visibility.sm !== false;
        };

        if (!isVisible()) return null;

        return (
          <div
            key={widget.id}
            className={getColSpanClass()}
            style={{
              // Apply custom CSS if provided
              ...(widget.customCSS ? {} : {}), // You'd parse and apply CSS here
            }}
          >
            <WidgetRenderer widget={widget} theme={theme} />
          </div>
        );
      })}
    </div>
  );
};

const SectionRenderer: React.FC<{ section: Section; theme?: Record<string, string> }> = ({ section, theme }) => {
  const sectionStyle = {
    backgroundColor: section.background?.colorToken || undefined,
    backgroundImage: section.background?.imageUrl ? `url(${section.background.imageUrl})` : undefined,
    backgroundSize: section.background?.imageUrl ? 'cover' : undefined,
    backgroundPosition: section.background?.imageUrl ? 'center' : undefined,
  };

  const paddingClass = section.padding || 'py-8 px-4';

  return (
    <section
      className={`relative ${paddingClass}`}
      style={sectionStyle}
    >
      {section.background?.videoUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            src={section.background.videoUrl}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
        </div>
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {section.rows.map(row => (
          <div key={row.id} className="mb-8 last:mb-0">
            <RowRenderer row={row} theme={theme} />
          </div>
        ))}
      </div>
    </section>
  );
};

export const PageBuilderRenderer: React.FC<PageBuilderRendererProps> = ({
  storeId,
  storeName,
  pagePath = '',
  className = '',
  onFallbackNeeded
}) => {
  const [pageDocument, setPageDocument] = useState<PageDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const repository = new SupabasePageRepository(storeId);
        
        // Determine which page to load based on the path
        let targetSlug = pagePath;
        
        // Handle root path - look for home page or page with empty slug
        if (!pagePath || pagePath === '') {
          // First try to find a page with slug 'home' or empty slug
          const homeQuery = await repository.getPageBySlug('home');
          if (homeQuery && homeQuery.status === 'published') {
            setPageDocument(homeQuery);
            setLoading(false);
            return;
          }
          
          // Try empty slug
          const rootQuery = await repository.getPageBySlug('');
          if (rootQuery && rootQuery.status === 'published') {
            setPageDocument(rootQuery);
            setLoading(false);
            return;
          }
          
          // No home page found, set error message
          setPageDocument(null);
          setError('No home page has been published. Please create and publish a home page in the Visual Page Builder.');
          setLoading(false);
          return;
        }
        
        // Load specific page by slug
        const page = await repository.getPageBySlug(targetSlug);
        
        if (page && page.status === 'published') {
          setPageDocument(page);
        } else {
          // Page not found or not published
          setPageDocument(null);
          setError(`Page "${pagePath}" not found or not published`);
        }
      } catch (err) {
        console.error('Error loading page:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [storeId, pagePath]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {storeName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Page</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!pageDocument && !error) {
    // This shouldn't happen with our new logic, but just in case
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">This page doesn't exist or hasn't been published yet.</p>
        </div>
      </div>
    );
  }

  // Apply custom global styles
  const globalStyles = pageDocument.globalStyles || {};

  return (
    <div 
      className={className}
      style={{
        // Apply global color scheme
        '--primary-color': globalStyles.colors?.primary || '#9B51E0',
        '--secondary-color': globalStyles.colors?.secondary || '#00AEEF',
        '--accent-color': globalStyles.colors?.accent || '#FF7F00',
      } as React.CSSProperties}
    >
      {/* Custom head content */}
      {pageDocument.customCode?.headHTML && (
        <div dangerouslySetInnerHTML={{ __html: pageDocument.customCode.headHTML }} />
      )}

      {/* Page sections */}
      {pageDocument.sections.map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          theme={globalStyles.colors}
        />
      ))}

      {/* Custom body content */}
      {pageDocument.customCode?.bodyHTML && (
        <div dangerouslySetInnerHTML={{ __html: pageDocument.customCode.bodyHTML }} />
      )}

      {/* Analytics tracking */}
      {pageDocument.analytics?.trackingId && (
        <script>
          {`
            // Add analytics tracking code here
            console.log('Analytics tracking for store ${storeId}');
          `}
        </script>
      )}
    </div>
  );
};