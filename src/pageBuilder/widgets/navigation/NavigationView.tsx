import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import type { WidgetBase } from '../../types';
import { PublicPageRepository } from '../../../lib/supabase-public';
interface NavigationProps {
  links?: Array<{
    name: string;
    href: string;
    active?: boolean;
  }>;
  className?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
}
export interface NavigationWidgetProps extends WidgetBase {
  props: NavigationProps;
}
export const NavigationView: React.FC<{ widget: NavigationWidgetProps; theme?: Record<string, any>; storeData?: any }> = ({ widget, theme, storeData }) => {
  const [location] = useLocation();
  const { links = [], className = '', linkClassName = '', activeLinkClassName = '' } = widget.props;
  const [publishedPages, setPublishedPages] = useState<Array<{ name: string; href: string }>>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  
  // Latching to prevent React Strict Mode duplicate calls
  const navigationRan = useRef<string>('');

  // Load published pages from Supabase for navigation
  useEffect(() => {
    const depKey = `${location}-${storeData?.id || 'no-store'}`;
    if (navigationRan.current === depKey) return;
    navigationRan.current = depKey;
    const loadPublishedPages = async () => {
      try {
        let storeId = null;
        let storeSlug = null;

        // First, try to use storeData if available (passed from parent component)
        if (storeData?.id) {
          storeId = storeData.id;
          if (import.meta.env.DEV) {
            console.log('🔗 Navigation: Using storeData from parent:', { 
              storeId, 
              storeName: storeData.store_name 
            });
          }
        } else {
          // Fallback: Extract store slug from current location
          const storeMatch = location.match(/^\/store\/([^\/]+)/);
          if (storeMatch) {
            storeSlug = storeMatch[1];
          } else {
            // Try to get from hostname or other context
            const hostname = window.location.hostname;
            if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
              // In development, try to extract from page URL structure
              if (location.includes('/admin/page-builder')) {
                // In admin interface, we need to get store from context
                // For now, return early to avoid showing incorrect navigation
                console.warn('🔗 Navigation: In admin interface without store context');
                setPagesLoading(false);
                return;
              }
            }
            // Check for subdomain-based routing
            const subdomain = hostname.split('.')[0];
            if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
              storeSlug = subdomain;
            }
          }

          if (!storeSlug) {
            console.warn('🔗 Navigation: No store context available');
            setPagesLoading(false);
            return;
          }

          // Get store by slug first
          const tempRepo = new PublicPageRepository('temp');
          const storeInfo = await tempRepo.getPublicStoreBySlug(storeSlug);
          if (!storeInfo) {
            console.warn('🔗 Navigation: Store not found for slug:', storeSlug);
            setPagesLoading(false);
            return;
          }
          storeId = storeInfo.id;
        }

        // Load published pages with navigation placement
        const repo = new PublicPageRepository(storeId);
        const navPages = await repo.getNavigationPages();
        // Convert to navigation link format
        const navigationLinks = navPages
          .filter(page => page.navigation_placement === 'header' || page.navigation_placement === 'both')
          .map(page => ({
            name: page.name,
            href: `/${page.slug}`
          }));
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔗 Navigation: Loaded pages for navigation:', {
            totalPages: navPages.length,
            headerPages: navigationLinks.length,
            pages: navigationLinks.map(p => ({ name: p.name, href: p.href }))
          });
        }
        
        setPublishedPages(navigationLinks);
        setPagesLoading(false);
      } catch (error) {
        setPagesLoading(false);
      }
    };
    loadPublishedPages();
  }, [location, storeData]);
  // Use provided links, or published pages, or empty (no more hardcoded defaults)
  const navigationLinks = links.length > 0 ? links : publishedPages;
  const getNavigationHref = (href: string) => {
    // Extract current store slug from location
    const storeMatch = location.match(/^\/store\/([^\/]+)/);
    if (storeMatch) {
      const storeSlug = storeMatch[1];
      return `/store/${storeSlug}${href}`;
    }
    return href;
  };
  // Show loading state while pages are being loaded
  if (pagesLoading && links.length === 0) {
    return (
      <nav className={`hidden md:flex space-x-8 ${className}`}>
        <span className="px-3 py-2 text-sm opacity-50">Loading navigation...</span>
      </nav>
    );
  }
  // Show message if no navigation links available
  if (navigationLinks.length === 0) {
    return (
      <nav className={`hidden md:flex space-x-8 ${className}`}>
        <span className="px-3 py-2 text-sm opacity-50">No published pages for navigation</span>
      </nav>
    );
  }
  return (
    <nav className={`hidden md:flex space-x-8 ${className}`}>
      {navigationLinks.map((link, index) => {
        // Check if current page matches this link
        const isActive = location.includes(link.href);
        const finalLinkClassName = isActive 
          ? `${linkClassName} ${activeLinkClassName}`.trim()
          : linkClassName;
        const href = getNavigationHref(link.href);
        // Build inline styles from theme - prioritize theme over default linkClassName
        const linkStyle: React.CSSProperties = {};
        let computedClassName = '';
        let shouldUseTheme = false;
        // If theme exists and has styling info, always use it (ignore hardcoded classes)
        if (theme && theme.linkColor && theme.navLinkStyle) {
          shouldUseTheme = true;
          linkStyle.color = theme.linkColor;
          // Apply navigation link style from theme
          if (theme.navLinkStyle === 'bordered') {
            // Bordered style: transparent background with colored border, fills on hover
            const borderRadius = theme.buttonStyle === 'round' ? 'rounded-full' : 
                                theme.buttonStyle === 'square' ? 'rounded-none' : 'rounded';
            computedClassName = `px-3 py-1 ${borderRadius} border transition-all duration-200`;
            linkStyle.borderColor = theme.linkColor;
            linkStyle.backgroundColor = 'transparent';
          } else {
            // Text style: bold letters
            computedClassName = 'font-semibold px-3 py-2 transition-colors';
          }
        } else if (finalLinkClassName) {
          // Use provided classes only if no theme available
          computedClassName = finalLinkClassName;
        } else {
          // Fallback to default classes
          computedClassName = 'text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors';
        }
        return (
          <Link
            key={index}
            href={href}
            className={computedClassName}
            style={linkStyle}
            onMouseEnter={(e) => {
              if (shouldUseTheme) {
                if (theme.navLinkStyle === 'bordered') {
                  // Bordered style: fill background with link color, text becomes background color
                  e.currentTarget.style.backgroundColor = theme.linkColor;
                  e.currentTarget.style.color = theme.backgroundColor || '#ffffff';
                } else if (theme.linkHoverColor) {
                  // Text style: change to hover color
                  e.currentTarget.style.color = theme.linkHoverColor;
                }
              }
            }}
            onMouseLeave={(e) => {
              if (shouldUseTheme) {
                if (theme.navLinkStyle === 'bordered') {
                  // Bordered style: back to transparent background
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.linkColor;
                } else if (theme.linkColor) {
                  // Text style: back to normal color
                  e.currentTarget.style.color = theme.linkColor;
                }
              }
            }}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
};