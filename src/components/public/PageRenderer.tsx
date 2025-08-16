/**
 * Page Renderer
 * Renders published pages for public viewing
 */

import React from 'react';
import { PageDocument } from '../../pageBuilder/types';
import { widgetRegistry } from '../../pageBuilder/widgets/registry';

interface PageRendererProps {
  document: PageDocument;
  theme?: Record<string, string>;
}

export const PageRenderer: React.FC<PageRendererProps> = ({ document, theme }) => {
  // Apply theme overrides
  const themeStyles = theme ? Object.entries(theme).map(([key, value]) => `${key}: ${value}`).join(';') : '';

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

