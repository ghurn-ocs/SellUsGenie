/**
 * Page Builder Renderer
 * Properly renders Visual Page Builder pages with their individual content, styling, and themes
 * Respects the Page Builder architecture for widgets, themes, and navigation settings
 */

import React, { memo, useMemo } from 'react';
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
// Import header and footer layout widgets for system pages
import '../../pageBuilder/widgets/header-layout/index';
import '../../pageBuilder/widgets/footer-layout/index';

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
      return null;
    }

    const WidgetView = widgetConfig.View;
    
    // Process widget props to replace placeholders with store data
    const processedWidget = { ...widget };
    
    if (storeData) {
      processedWidget.props = { ...widget.props };
      
      // Replace store name in content strings
      if (widget.props?.content && typeof widget.props.content === 'string') {
        processedWidget.props.content = widget.props.content
          // Standard placeholders
          .replace(/{{store_name}}/gi, storeData.store_name)
          .replace(/{{storeName}}/gi, storeData.store_name)
          // Hardcoded store names (case-insensitive)
          .replace(/Testingmy/gi, storeData.store_name)
          .replace(/Your Store/gi, storeData.store_name)
          // Generic placeholders
          .replace(/\{\{store\.name\}\}/gi, storeData.store_name)
          .replace(/\[\[store_name\]\]/gi, storeData.store_name);
      }
      
      // For header and footer layout widgets, inject dynamic store data
      if (widget.type === 'header-layout' && widget.props) {
        // Use store name if logo text is null/empty
        if (processedWidget.props.logo && (!processedWidget.props.logo.text || processedWidget.props.logo.text === null)) {
          processedWidget.props.logo.text = storeData.store_name;
        }
        // Replace "Your Store" with actual store name
        if (processedWidget.props.logo?.text === 'Your Store') {
          processedWidget.props.logo.text = storeData.store_name;
        }
      }
      
      if (widget.type === 'footer-layout' && widget.props) {
        // Use store name if company name is null/empty
        if (processedWidget.props.company && (!processedWidget.props.company.name || processedWidget.props.company.name === null)) {
          processedWidget.props.company.name = storeData.store_name;
        }
        // Replace "Your Store" with actual store name
        if (processedWidget.props.company?.name === 'Your Store') {
          processedWidget.props.company.name = storeData.store_name;
        }
      }
    }
    
    // Apply column span classes
    const colSpanClasses = [];
    if (widget.colSpan?.sm) colSpanClasses.push(`col-span-${widget.colSpan.sm}`);
    if (widget.colSpan?.md) colSpanClasses.push(`md:col-span-${widget.colSpan.md}`);
    if (widget.colSpan?.lg) colSpanClasses.push(`lg:col-span-${widget.colSpan.lg}`);

    // Add debug logging for system pages
    if (isSystemPage && import.meta.env.DEV) {
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
    if (widget.type === 'navigation' && import.meta.env.DEV) {
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
    return null;
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
    
    // Prioritize Visual Page Builder section padding for precise control
    if (section.padding) {
      // Use exact padding from Visual Page Builder (overrides theme defaults)
      paddingClass = section.padding;
    } else if (pageType === 'header' || pageType === 'footer') {
      // Fallback to theme-based horizontal spacing
      switch (horizontalSpacing) {
        case 'thin':
          paddingClass = 'py-2 px-3';
          break;
        case 'expanded':
          paddingClass = 'py-8 px-8';
          break;
        case 'standard':
        default:
          // Minimal padding for footer to respect page builder layout
          paddingClass = pageType === 'footer' ? 'py-0 px-0' : 'py-4 px-6';
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
    
    // Only use minimal fallback styling if absolutely no theme data exists
    // IMPORTANT: Don't override Visual Page Builder styling with borders/backgrounds
    if (!theme?.backgroundColor && !bgClass && !section.backgroundColor) {
      if (pageType === 'header') {
        // Minimal header styling - no borders to respect page builder design
        bgClass = '';
      } else if (pageType === 'footer') {
        // Minimal footer styling - no borders to respect page builder design  
        bgClass = '';
      }
    }
  }
  
  return (
    <section 
      className={`${paddingClass} ${bgClass} ${isSystemPage ? 'page-builder-system-page' : ''}`}
      style={sectionStyle}
    >
      <div className={`${isSystemPage ? 'responsive-content-width' : 'responsive-content-width'} ${pageType === 'header' ? 'flex items-center min-h-[80px] px-4 sm:px-6 lg:px-8' : ''}`}>
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
const PageBuilderRendererComponent: React.FC<PageBuilderRendererProps> = ({
  page,
  isSystemPage = false,
  className = '',
  storeData
}) => {
  // Memoize theme to prevent object identity churn
  const pageTheme = useMemo(() => ({
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
  }), [page.themeOverrides]);

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

// Memoize the component to prevent unnecessary re-renders
export const PageBuilderRenderer = memo(PageBuilderRendererComponent);
export default PageBuilderRenderer;