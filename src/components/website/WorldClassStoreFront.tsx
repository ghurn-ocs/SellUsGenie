/**
 * World Class StoreFront Layout
 * Complete replacement for the old StoreFrontLayout with proper HTML rendering
 * and adaptive styling based on page-specific themes
 */

import React, { useState, useEffect } from 'react';
import { SupabasePageRepository } from '../../pageBuilder/data/SupabasePageRepository';
import { WorldClassRenderer } from './WorldClassRenderer';
import type { PageDocument } from '../../pageBuilder/types';

interface WorldClassStoreFrontProps {
  storeId: string;
  storeName: string;
  theme?: Record<string, string>;
  children?: React.ReactNode;
}

interface SystemPages {
  header: PageDocument | null;
  footer: PageDocument | null;
  loading: boolean;
  error: string | null;
}

/**
 * World Class StoreFront Component
 */
export const WorldClassStoreFront: React.FC<WorldClassStoreFrontProps> = ({
  storeId,
  storeName,
  theme,
  children
}) => {
  const [systemPages, setSystemPages] = useState<SystemPages>({
    header: null,
    footer: null,
    loading: true,
    error: null
  });

  // Load system pages
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
        const repository = new SupabasePageRepository(storeId);
        
        // Load header and footer in parallel
        const [headerResult, footerResult] = await Promise.allSettled([
          repository.getSystemPage('header'),
          repository.getSystemPage('footer')
        ]);

        const header = headerResult.status === 'fulfilled' ? headerResult.value : null;
        const footer = footerResult.status === 'fulfilled' ? footerResult.value : null;

        setSystemPages({
          header,
          footer,
          loading: false,
          error: null
        });

        console.log('🌟 World Class StoreFront loaded:', {
          storeId,
          hasHeader: !!header,
          hasFooter: !!footer,
          headerSections: header?.sections.length || 0,
          footerSections: footer?.sections.length || 0
        });

      } catch (error) {
        console.error('❌ World Class StoreFront error:', error);
        setSystemPages({
          header: null,
          footer: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    loadSystemPages();
  }, [storeId]);

  // Generate default theme if none provided
  const defaultTheme = {
    '--color-primary': '#2563eb',
    '--color-primary-hover': '#1d4ed8',
    '--color-bg-primary': '#ffffff',
    '--color-bg-secondary': '#f8fafc',
    '--color-bg-dark': '#1f2937',
    '--color-text-primary': '#111827',
    '--color-text-secondary': '#374151',
    '--color-text-muted': '#6b7280',
    '--color-text-light': '#d1d5db',
    '--color-text-inverse': '#ffffff',
    '--color-border': '#e5e7eb'
  };

  const activeTheme = { ...defaultTheme, ...theme };

  // Loading state
  if (systemPages.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading world-class website...</p>
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
          <h1 className="text-xl font-semibold text-red-800 mb-2">Website Loading Error</h1>
          <p className="text-red-700 mb-4">{systemPages.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="world-class-storefront">
      {/* Inject theme CSS variables */}
      <style>{`
        :root {
          ${Object.entries(activeTheme)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n          ')}
        }
      `}</style>

      {/* Header */}
      {systemPages.header && (
        <WorldClassRenderer
          page={systemPages.header}
          theme={activeTheme}
          className="storefront-header"
        />
      )}

      {/* Main Content */}
      <main className="storefront-main flex-1">
        {children}
      </main>

      {/* Footer */}
      {systemPages.footer && (
        <WorldClassRenderer
          page={systemPages.footer}
          theme={activeTheme}
          className="storefront-footer"
        />
      )}

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs max-w-sm">
          <div className="font-semibold mb-2">🌟 World Class StoreFront</div>
          <div>Store: {storeName}</div>
          <div>Header: {systemPages.header ? '✅ Loaded' : '❌ Missing'}</div>
          <div>Footer: {systemPages.footer ? '✅ Loaded' : '❌ Missing'}</div>
          <div>Theme: {Object.keys(activeTheme).length} variables</div>
        </div>
      )}
    </div>
  );
};

export default WorldClassStoreFront;