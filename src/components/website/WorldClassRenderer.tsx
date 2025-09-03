/**
 * World Class Website Renderer
 * Complete rebuild of page rendering system with proper HTML component rendering
 * and adaptive styling based on page-specific color schemes
 */

import React from 'react';
import type { PageDocument } from '../../pageBuilder/types';

interface WorldClassRendererProps {
  page: PageDocument;
  theme?: Record<string, string>;
  className?: string;
}

interface RenderableComponent {
  type: 'header' | 'nav' | 'hero' | 'content' | 'footer' | 'custom';
  html: string;
  styles?: Record<string, string>;
  className?: string;
}

/**
 * Parse HTML content into structured components
 */
function parseHtmlContent(htmlContent: string): RenderableComponent[] {
  const components: RenderableComponent[] = [];
  
  // If no HTML content, return empty
  if (!htmlContent || htmlContent.trim() === '') {
    return components;
  }
  
  console.log('🔍 WorldClassRenderer: Parsing HTML content:', htmlContent.substring(0, 200) + '...');
  
  // Check for specific HTML elements and extract them
  let remainingContent = htmlContent;
  
  // Extract header element
  const headerMatch = htmlContent.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
  if (headerMatch) {
    components.push({
      type: 'header',
      html: headerMatch[0],
      className: 'website-header'
    });
    remainingContent = remainingContent.replace(headerMatch[0], '');
    console.log('✅ Found header component');
  }
  
  // Extract footer element
  const footerMatch = htmlContent.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
  if (footerMatch) {
    components.push({
      type: 'footer',
      html: footerMatch[0],
      className: 'website-footer'
    });
    remainingContent = remainingContent.replace(footerMatch[0], '');
    console.log('✅ Found footer component');
  }
  
  // Extract navigation element (if not inside header/footer)
  const navMatch = remainingContent.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
  if (navMatch) {
    components.push({
      type: 'nav',
      html: navMatch[0],
      className: 'website-navigation'
    });
    remainingContent = remainingContent.replace(navMatch[0], '');
    console.log('✅ Found navigation component');
  }
  
  // If we found no structured components, treat entire content as generic content
  if (components.length === 0) {
    components.push({
      type: 'content',
      html: htmlContent,
      className: 'website-content'
    });
    console.log('📝 Using entire content as generic component');
  }
  
  console.log(`🎯 WorldClassRenderer: Parsed ${components.length} components:`, components.map(c => c.type));
  
  return components;
}

/**
 * Clean and optimize HTML for proper rendering
 */
function cleanHtml(html: string): string {
  return html
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags (we handle styling externally)
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove event handlers
    .replace(/on\w+="[^"]*"/gi, '')
    // Remove javascript: links
    .replace(/javascript:/gi, '#')
    // Ensure proper class structure
    .replace(/class="([^"]*)"/gi, (match, classes) => {
      const cleanClasses = classes
        .split(' ')
        .filter((cls: string) => cls.trim())
        .join(' ');
      return `class="${cleanClasses}"`;
    });
}

/**
 * Generate adaptive CSS based on content and theme
 */
function generateAdaptiveCSS(components: RenderableComponent[], theme?: Record<string, string>): string {
  const css = `
    .world-class-renderer {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .website-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: ${theme?.['--color-bg-primary'] || '#ffffff'};
      border-bottom: 1px solid ${theme?.['--color-border'] || '#e5e7eb'};
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
    
    .website-navigation {
      background: ${theme?.['--color-bg-primary'] || '#ffffff'};
    }
    
    .website-hero {
      background: linear-gradient(135deg, ${theme?.['--color-bg-primary'] || '#f8fafc'} 0%, ${theme?.['--color-bg-secondary'] || '#f1f5f9'} 100%);
      color: ${theme?.['--color-text-primary'] || '#1f2937'};
    }
    
    .website-content {
      flex: 1;
      background: ${theme?.['--color-bg-primary'] || '#ffffff'};
      color: ${theme?.['--color-text-primary'] || '#1f2937'};
    }
    
    .website-footer {
      margin-top: auto;
      background: ${theme?.['--color-bg-dark'] || '#1f2937'};
      color: ${theme?.['--color-text-inverse'] || '#ffffff'};
      box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    /* Responsive typography */
    .world-class-renderer h1 { font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 700; line-height: 1.2; }
    .world-class-renderer h2 { font-size: clamp(1.25rem, 3vw, 2rem); font-weight: 600; line-height: 1.3; }
    .world-class-renderer h3 { font-size: clamp(1.125rem, 2.5vw, 1.75rem); font-weight: 600; line-height: 1.4; }
    .world-class-renderer h4 { font-size: clamp(1rem, 2vw, 1.5rem); font-weight: 500; line-height: 1.4; }
    .world-class-renderer p { font-size: clamp(0.875rem, 1.5vw, 1.125rem); line-height: 1.6; margin-bottom: 1rem; }
    
    /* Responsive spacing */
    .world-class-renderer .max-w-7xl { max-width: min(1280px, 95vw); margin: 0 auto; }
    .world-class-renderer .max-w-4xl { max-width: min(896px, 90vw); margin: 0 auto; }
    
    /* Adaptive colors */
    .world-class-renderer .text-gray-900 { color: ${theme?.['--color-text-primary'] || '#111827'}; }
    .world-class-renderer .text-gray-700 { color: ${theme?.['--color-text-secondary'] || '#374151'}; }
    .world-class-renderer .text-gray-600 { color: ${theme?.['--color-text-muted'] || '#4b5563'}; }
    .world-class-renderer .text-gray-300 { color: ${theme?.['--color-text-light'] || '#d1d5db'}; }
    .world-class-renderer .text-white { color: ${theme?.['--color-text-inverse'] || '#ffffff'}; }
    
    /* Adaptive backgrounds */
    .world-class-renderer .bg-white { background-color: ${theme?.['--color-bg-primary'] || '#ffffff'}; }
    .world-class-renderer .bg-gray-50 { background-color: ${theme?.['--color-bg-secondary'] || '#f9fafb'}; }
    .world-class-renderer .bg-gray-800 { background-color: ${theme?.['--color-bg-dark'] || '#1f2937'}; }
    .world-class-renderer .bg-blue-600 { background-color: ${theme?.['--color-primary'] || '#2563eb'}; }
    
    /* Interactive elements */
    .world-class-renderer a {
      color: ${theme?.['--color-primary'] || '#2563eb'};
      text-decoration: none;
      transition: all 0.2s ease;
    }
    
    .world-class-renderer a:hover {
      color: ${theme?.['--color-primary-hover'] || '#1d4ed8'};
      text-decoration: underline;
    }
    
    .world-class-renderer button {
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      border-radius: 0.375rem;
    }
    
    .world-class-renderer button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Mobile-first responsive design */
    @media (max-width: 768px) {
      .world-class-renderer .hidden.md\\:flex { display: none !important; }
      .world-class-renderer .md\\:grid-cols-3 { grid-template-columns: 1fr !important; }
      .world-class-renderer .md\\:grid-cols-4 { grid-template-columns: 1fr !important; }
      .world-class-renderer .md\\:flex-row { flex-direction: column !important; }
      .world-class-renderer .max-w-7xl { padding-left: 1rem; padding-right: 1rem; }
      
      /* Mobile header adjustments */
      .website-header .flex.justify-between { padding: 0.5rem 0; }
      .website-header h1 { font-size: 1.5rem; }
      
      /* Mobile footer adjustments */
      .website-footer .grid { gap: 2rem; }
      .website-footer .col-span-1.md\\:col-span-2 { grid-column: span 1; }
    }
    
    @media (min-width: 768px) {
      .world-class-renderer .hidden.md\\:flex { display: flex !important; }
      .world-class-renderer .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
      .world-class-renderer .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
      .world-class-renderer .md\\:flex-row { flex-direction: row !important; }
    }
    
    /* High-quality visual enhancements */
    .world-class-renderer *::selection {
      background-color: ${theme?.['--color-primary'] || '#2563eb'}40;
      color: ${theme?.['--color-text-primary'] || '#111827'};
    }
    
    .world-class-renderer * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `;
  
  return css;
}

/**
 * World Class Website Renderer Component
 */
export const WorldClassRenderer: React.FC<WorldClassRendererProps> = ({ 
  page, 
  theme, 
  className = '' 
}) => {
  const [renderedComponents, setRenderedComponents] = React.useState<RenderableComponent[]>([]);
  const [adaptiveCSS, setAdaptiveCSS] = React.useState<string>('');

  React.useEffect(() => {
    console.log('🌟 WorldClassRenderer: Processing page:', {
      pageId: page.id,
      pageName: page.name,
      pageType: page.pageType,
      sectionsCount: page.sections.length
    });

    // Process all sections and extract HTML content
    let allHtmlContent = '';
    
    page.sections.forEach((section, sIndex) => {
      console.log(`📄 Processing section ${sIndex}:`, {
        id: section.id,
        title: section.title,
        rowsCount: section.rows.length
      });
      
      section.rows.forEach((row, rIndex) => {
        console.log(`📋 Processing row ${rIndex}:`, {
          id: row.id,
          widgetsCount: row.widgets.length
        });
        
        row.widgets.forEach((widget, wIndex) => {
          console.log(`🧩 Processing widget ${wIndex}:`, {
            id: widget.id,
            type: widget.type,
            hasContent: !!(widget.props?.content),
            contentLength: widget.props?.content?.length || 0
          });
          
          if (widget.type === 'text' && widget.props?.content) {
            allHtmlContent += widget.props.content;
            console.log(`✅ Added content from widget ${wIndex}:`, widget.props.content.substring(0, 100) + '...');
          }
        });
      });
    });

    console.log('📝 Total HTML content length:', allHtmlContent.length);
    console.log('📝 HTML content preview:', allHtmlContent.substring(0, 300) + '...');

    // Parse HTML into structured components
    const components = parseHtmlContent(allHtmlContent);
    setRenderedComponents(components);
    
    // Generate adaptive CSS
    const css = generateAdaptiveCSS(components, theme);
    setAdaptiveCSS(css);
    
    console.log('🎨 Generated adaptive CSS length:', css.length);
  }, [page, theme]);

  // Development debugging info
  const debugInfo = process.env.NODE_ENV === 'development' && (
    <div className="fixed top-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded text-xs max-w-sm z-[9999]">
      <div className="font-semibold mb-2">🔍 WorldClassRenderer Debug</div>
      <div>Page: {page.name} ({page.pageType})</div>
      <div>Components: {renderedComponents.length}</div>
      <div>Types: {renderedComponents.map(c => c.type).join(', ')}</div>
      <div>CSS: {adaptiveCSS.length} chars</div>
      <div className="mt-2 text-yellow-200">
        {renderedComponents.length === 0 ? '⚠️ No components rendered' : '✅ Components active'}
      </div>
    </div>
  );

  return (
    <>
      {/* Inject adaptive CSS */}
      <style dangerouslySetInnerHTML={{ __html: adaptiveCSS }} />
      
      {/* Render website with world-class structure */}
      <div className={`world-class-renderer ${className}`}>
        {renderedComponents.length > 0 ? (
          renderedComponents.map((component, index) => {
            console.log(`🎨 Rendering component ${index}:`, {
              type: component.type,
              className: component.className,
              htmlLength: component.html.length
            });
            
            return (
              <div
                key={index}
                className={component.className}
                dangerouslySetInnerHTML={{ 
                  __html: cleanHtml(component.html) 
                }}
              />
            );
          })
        ) : (
          <div className="world-class-fallback p-8 bg-gray-50 text-center">
            <div className="text-gray-600">
              <div className="text-2xl mb-4">🌟</div>
              <h2 className="text-lg font-semibold mb-2">World-Class Renderer</h2>
              <p className="text-sm">No content components found to render.</p>
              <div className="mt-4 text-xs text-gray-500">
                Page: {page.name} • Type: {page.pageType}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Development debug info */}
      {debugInfo}
    </>
  );
};

export default WorldClassRenderer;