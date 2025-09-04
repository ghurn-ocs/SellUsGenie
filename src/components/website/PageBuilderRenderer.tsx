/**
 * Page Builder Renderer
 * Properly renders Visual Page Builder pages with their individual content, styling, and themes
 * Respects the Page Builder architecture for widgets, themes, and navigation settings
 */

import React from 'react';
import type { PageDocument } from '../../pageBuilder/types';
import { widgetRegistry } from '../../pageBuilder/widgets/registry';

// Import all widgets to ensure they're registered
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

interface PageBuilderRendererProps {
  page: PageDocument;
  isSystemPage?: boolean;
  className?: string;
  storeData?: {
    id: string;
    store_name: string;
    store_slug: string;
    store_logo_url?: string | null;
  };
}

/**
 * Render individual widgets with their specific props and styling
 */
const WidgetRenderer: React.FC<{
  widget: any;
  theme?: Record<string, string>;
  isSystemPage?: boolean;
  storeData?: any;
}> = ({ widget, theme, isSystemPage, storeData }) => {
  try {
    // Debug widget rendering for system pages in development
    if (isSystemPage && process.env.NODE_ENV === 'development') {
      console.log('🎨 Rendering widget:', {
        widgetType: widget.type,
        widgetId: widget.id,
        hasProps: !!widget.props
      });
    }

    const widgetConfig = widgetRegistry.get(widget.type);
    if (!widgetConfig) {
      console.warn(`🚨 Widget type "${widget.type}" not found in registry`, {
        availableWidgets: widgetRegistry.getTypes(),
        requestedType: widget.type
      });
      return (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-yellow-800">Unknown widget type: {widget.type}</p>
          <p className="text-yellow-600 text-xs mt-1">Available: {widgetRegistry.getTypes().join(', ')}</p>
        </div>
      );
    }

    const WidgetView = widgetConfig.View;
    
    // Process widget props to replace placeholders with store data
    const processedWidget = { ...widget };
    if (storeData && widget.props?.content && typeof widget.props.content === 'string') {
      // Replace store name placeholders
      processedWidget.props = {
        ...widget.props,
        content: widget.props.content
          .replace(/{{store_name}}/gi, storeData.store_name)
          .replace(/{{storeName}}/gi, storeData.store_name)
          .replace(/Testingmy/g, storeData.store_name) // Replace hardcoded store names
      };
    }
    
    // Apply column span classes
    const colSpanClasses = [];
    if (widget.colSpan?.sm) colSpanClasses.push(`col-span-${widget.colSpan.sm}`);
    if (widget.colSpan?.md) colSpanClasses.push(`md:col-span-${widget.colSpan.md}`);
    if (widget.colSpan?.lg) colSpanClasses.push(`lg:col-span-${widget.colSpan.lg}`);

    // Add debug logging for system pages
    if (isSystemPage && process.env.NODE_ENV === 'development') {
      console.log('🔧 System Page Widget:', {
        type: widget.type,
        props: widget.props,
        isSystemPage,
        colSpan: widget.colSpan
      });
    }

    // For text widgets in system pages, add proper HTML styling class
    const systemPageClass = isSystemPage && widget.type === 'text' && widget.props?.allowHtml 
      ? 'widget-text-html' 
      : '';

    const renderedWidget = (
      <div className={`${colSpanClasses.join(' ')} ${systemPageClass}`} data-widget-type={widget.type}>
        <WidgetView widget={processedWidget} theme={theme} storeData={storeData} />
      </div>
    );

    // Debug theme passing for navigation widgets
    if (widget.type === 'navigation' && process.env.NODE_ENV === 'development') {
      console.log('🔗 Navigation widget theme passing:', {
        widgetType: widget.type,
        hasTheme: !!theme,
        navLinkStyle: theme?.navLinkStyle,
        themeData: theme
      });
    }

    return renderedWidget;
  } catch (error) {
    console.error(`Error rendering widget ${widget.type}:`, error);
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <p className="text-red-800">Error rendering {widget.type} widget</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-2 text-xs text-red-600">{error?.toString()}</pre>
        )}
      </div>
    );
  }
};

/**
 * Render a page row with its widgets
 */
const RowRenderer: React.FC<{
  row: any;
  theme?: Record<string, string>;
  isSystemPage?: boolean;
  pageType?: string;
  storeData?: any;
}> = ({ row, theme, isSystemPage, pageType, storeData }) => {
  // Validate row structure
  if (!row.widgets || !Array.isArray(row.widgets)) {
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Row missing widgets array:', {
        rowId: row.id,
        hasWidgets: !!row.widgets
      });
    }
    return null;
  }

  return (
    <div className={`grid grid-cols-12 gap-4 w-full ${pageType === 'header' ? 'items-center' : ''}`}>
      {(row.widgets || []).map((widget: any) => (
        <WidgetRenderer
          key={widget.id}
          widget={widget}
          theme={theme}
          isSystemPage={isSystemPage}
          storeData={storeData}
        />
      ))}
    </div>
  );
};

/**
 * Render a page section with its styling and content
 */
const SectionRenderer: React.FC<{
  section: any;
  theme?: Record<string, string>;
  isSystemPage?: boolean;
  pageType?: string;
  storeData?: any;
}> = ({ section, theme, isSystemPage, pageType, storeData }) => {
  // Apply section padding - use appropriate padding for system pages with horizontal spacing
  let paddingClass = '';
  
  if (isSystemPage) {
    const horizontalSpacing = theme?.horizontalSpacing || 'standard';
    
    // Apply horizontal spacing for header and footer system pages
    if (pageType === 'header' || pageType === 'footer') {
      switch (horizontalSpacing) {
        case 'thin':
          paddingClass = 'py-2 px-3';
          break;
        case 'expanded':
          paddingClass = 'py-8 px-8';
          break;
        case 'standard':
        default:
          paddingClass = 'py-4 px-6';
          break;
      }
    } else {
      paddingClass = section.padding || 'py-4 px-0';
    }
  } else {
    paddingClass = section.padding || 'py-8 px-4';
  }
  
  // Apply section background if specified, with theme overrides for system pages
  let bgClass = section.backgroundColor || '';
  const sectionStyle: React.CSSProperties = {};
  
  // For system pages, use theme overrides from Supabase instead of hardcoded defaults
  if (isSystemPage) {
    if (theme?.backgroundColor) {
      sectionStyle.backgroundColor = theme.backgroundColor;
    }
    if (theme?.textColor) {
      sectionStyle.color = theme.textColor;
    }
    
    // Only use fallback styling if no theme overrides are available
    if (!theme?.backgroundColor && !bgClass) {
      if (pageType === 'header') {
        bgClass = 'bg-white border-b border-gray-200';
      } else if (pageType === 'footer') {
        bgClass = 'bg-gray-50 border-t border-gray-200';
      }
    }
  }
  
  return (
    <section 
      className={`${paddingClass} ${bgClass} ${isSystemPage ? 'page-builder-system-page' : ''}`}
      style={sectionStyle}
    >
      <div className={`${isSystemPage ? 'responsive-content-width px-4 sm:px-6 lg:px-8' : 'responsive-content-width'} ${pageType === 'header' ? 'flex items-center min-h-[80px]' : ''}`}>
        {(section.rows || []).map((row: any) => (
          <div key={row.id} className={`${isSystemPage ? 'mb-2 last:mb-0' : 'mb-6 last:mb-0'} ${pageType === 'header' ? 'w-full' : ''}`}>
            <RowRenderer row={row} theme={theme} isSystemPage={isSystemPage} pageType={pageType} storeData={storeData} />
          </div>
        ))}
      </div>
    </section>
  );
};

/**
 * Main Page Builder Renderer Component
 */
export const PageBuilderRenderer: React.FC<PageBuilderRendererProps> = ({
  page,
  isSystemPage = false,
  className = '',
  storeData
}) => {
  // Extract theme from page theme overrides
  const pageTheme = {
    '--color-primary': '#2563eb',
    '--color-primary-hover': '#1d4ed8',
    '--color-bg-primary': '#ffffff',
    '--color-bg-secondary': '#f8fafc',
    '--color-bg-dark': '#1f2937',
    '--color-text-primary': '#111827',
    '--color-text-secondary': '#374151',
    '--color-text-muted': '#6b7280',
    '--color-border': '#e5e7eb',
    ...page.themeOverrides
  };

  console.log('🎨 PageBuilderRenderer:', {
    pageName: page.name,
    pageType: page.pageType,
    isSystemPage,
    sectionsCount: page.sections?.length || 0,
    hasThemeOverrides: Object.keys(page.themeOverrides || {}).length > 0,
    themeOverrides: page.themeOverrides,
    finalTheme: pageTheme
  });

  // Debug page structure for system pages only in development
  if (isSystemPage && process.env.NODE_ENV === 'development') {
    console.log('🔍 Page Structure:', {
      pageName: page.name,
      sectionsCount: page.sections?.length || 0,
      firstSectionId: page.sections?.[0]?.id
    });
  }

  return (
    <div className={`page-builder-content ${className} ${
      // Add minimum header height and professional spacing for header system pages
      isSystemPage && page.pageType === 'header' ? 'min-h-[80px] py-4' : ''
    }`} data-page-type={page.pageType}>
      {/* Inject page-specific theme CSS */}
      <style>{`
        [data-page-type="${page.pageType}"] {
          ${Object.entries(pageTheme)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n          ')}
        }
      `}</style>

      {/* Render page sections */}
      <div className={isSystemPage ? 'w-full' : 'min-h-screen'}>
        {(page.sections || []).map((section) => {
          // Validate section structure
          if (!section.rows || !Array.isArray(section.rows)) {
            if (process.env.NODE_ENV === 'development') {
              console.error('🚨 Section missing rows array:', {
                sectionId: section.id,
                pageType: page.pageType
              });
            }
            return null;
          }
          
          return (
            <SectionRenderer
              key={section.id}
              section={section}
              theme={pageTheme}
              isSystemPage={isSystemPage}
              pageType={page.pageType}
              storeData={storeData}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PageBuilderRenderer;