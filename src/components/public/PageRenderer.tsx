/**
 * Page Renderer
 * Renders published pages for public viewing
 * Uses specialized layout views for Header and Footer pages
 */

import React from 'react';
import { PageDocument } from '../../pageBuilder/types';
import { widgetRegistry } from '../../pageBuilder/widgets/registry';
import { FooterLayoutView } from '../../pageBuilder/widgets/footer-layout/FooterLayoutView';
import { HeaderLayoutView } from '../../pageBuilder/widgets/header-layout/HeaderLayoutView';

interface PageRendererProps {
  document: PageDocument;
  theme?: Record<string, string>;
  isPreviewMode?: boolean;
}

export const PageRenderer: React.FC<PageRendererProps> = ({ document, theme, isPreviewMode = false }) => {
  // Apply theme overrides
  const themeStyles = theme ? Object.entries(theme).map(([key, value]) => `${key}: ${value}`).join(';') : '';

  // Detect if this is a Header or Footer page
  const isHeaderPage = document.systemPageType === 'header' || 
                       document.name?.toLowerCase().includes('header') ||
                       document.name === 'Site Header';
                       
  const isFooterPage = document.systemPageType === 'footer' || 
                       document.name?.toLowerCase().includes('footer') ||
                       document.name === 'Site Footer' ||
                       document.name === 'Footer';

  // For Header pages, use HeaderLayoutView
  if (isHeaderPage && document.sections.length > 0) {
    // Find the header-layout widget in the page
    const headerWidget = document.sections
      .flatMap(section => section.rows)
      .flatMap(row => row.widgets)
      .find(widget => widget.type === 'header-layout');

    if (headerWidget) {
      return (
        <div className="min-h-screen" style={themeStyles ? { cssText: themeStyles } : undefined}>
          <HeaderLayoutView widget={headerWidget} />
        </div>
      );
    }
  }

  // For Footer pages, use FooterLayoutView  
  if (isFooterPage && document.sections.length > 0) {
    // Find the footer-layout widget in the page
    const footerWidget = document.sections
      .flatMap(section => section.rows)
      .flatMap(row => row.widgets)
      .find(widget => widget.type === 'footer-layout');

    if (footerWidget) {
      return (
        <div className="min-h-screen" style={themeStyles ? { cssText: themeStyles } : undefined}>
          <FooterLayoutView widget={footerWidget} />
        </div>
      );
    }
  }

  // Default rendering for regular pages
  return (
    <div className="min-h-screen" style={themeStyles ? { cssText: themeStyles } : undefined}>
      {/* SEO Meta Tags */}
      {document.seo?.metaTitle && (
        <title>{document.seo.metaTitle}</title>
      )}
      {document.seo?.metaDescription && (
        <meta name="description" content={document.seo.metaDescription} />
      )}
      {document.seo?.openGraphImage && (
        <meta property="og:image" content={document.seo.openGraphImage} />
      )}

      {/* Page Content */}
      {document.sections.map((section) => (
        <section
          key={section.id}
          className={`${
            section.background?.colorToken ? section.background.colorToken : ''
          } ${section.padding || 'p-4'}`}
          style={{
            backgroundImage: section.background?.imageUrl ? `url(${section.background.imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {section.rows.map((row) => (
            <div key={row.id} className="grid grid-cols-12 gap-4">
              {row.widgets.map((widget) => {
                const widgetConfig = widgetRegistry.get(widget.type);
                const WidgetView = widgetConfig?.View;

                if (!WidgetView) {
                  console.warn(`Unknown widget type: ${widget.type}`);
                  return null;
                }

                // Calculate column span classes
                const colSpanClasses = [];
                if (widget.colSpan.sm !== undefined) {
                  colSpanClasses.push(`col-span-${widget.colSpan.sm}`);
                }
                if (widget.colSpan.md !== undefined) {
                  colSpanClasses.push(`md:col-span-${widget.colSpan.md}`);
                }
                if (widget.colSpan.lg !== undefined) {
                  colSpanClasses.push(`lg:col-span-${widget.colSpan.lg}`);
                }

                // Default fallback
                if (colSpanClasses.length === 0) {
                  colSpanClasses.push('col-span-12');
                }

                // Handle visibility
                const visibilityClasses = [];
                if (widget.visibility) {
                  if (widget.visibility.sm === false) visibilityClasses.push('hidden sm:block');
                  if (widget.visibility.md === false) visibilityClasses.push('sm:hidden md:block');
                  if (widget.visibility.lg === false) visibilityClasses.push('md:hidden lg:block');
                }

                return (
                  <div
                    key={widget.id}
                    className={`${colSpanClasses.join(' ')} ${visibilityClasses.join(' ')}`}
                  >
                    <WidgetView widget={widget} theme={theme} />
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

