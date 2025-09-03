import React, { useState, useEffect } from 'react';
import { SupabasePageRepository } from '../../pageBuilder/data/SupabasePageRepository';
import { createStandardPages } from '../../utils/createStandardPages';
import type { PageDocument } from '../../pageBuilder/types';

interface HeaderFooterDebugProps {
  storeId: string;
  storeName: string;
}

export const HeaderFooterDebug: React.FC<HeaderFooterDebugProps> = ({ storeId, storeName }) => {
  const [headerPage, setHeaderPage] = useState<PageDocument | null>(null);
  const [footerPage, setFooterPage] = useState<PageDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [updateResult, setUpdateResult] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [recreateResult, setRecreateResult] = useState<string | null>(null);
  const [isRecreating, setIsRecreating] = useState(false);

  useEffect(() => {
    const loadSystemPages = async () => {
      try {
        const repository = new SupabasePageRepository(storeId);
        const [header, footer] = await Promise.all([
          repository.getSystemPage('header').catch(() => null),
          repository.getSystemPage('footer').catch(() => null)
        ]);
        
        setHeaderPage(header);
        setFooterPage(footer);
        console.log('🔧 HeaderFooterDebug: Loaded system pages', { header, footer });
      } catch (error) {
        console.error('🔧 HeaderFooterDebug: Error loading pages', error);
      } finally {
        setLoading(false);
      }
    };

    loadSystemPages();
  }, [storeId]);

  // Simplified debug info without registry dependency
  const debugInfo = {
    timestamp: new Date().toISOString(),
    pagesLoaded: !loading,
    hasHeader: !!headerPage,
    hasFooter: !!footerPage,
  };

  const handleUpdateNavigation = async () => {
    setIsUpdating(true);
    setUpdateResult(null);
    
    try {
      // For now, just use the world-class recreation functionality
      const result = await createWorldClassPages(storeId);
      setUpdateResult(`${result.success ? '✅' : '❌'} Navigation updated: ${result.message}`);
      
      // Reload system pages to reflect changes
      if (result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setUpdateResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateStandardPages = async () => {
    setIsRecreating(true);
    setRecreateResult(null);
    
    try {
      const result = await createStandardPages(storeId);
      setRecreateResult(`${result.success ? '✅' : '❌'} ${result.message}`);
      
      // Reload system pages to reflect changes
      if (result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setRecreateResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRecreating(false);
    }
  };


  if (!expanded) {
    return (
      <div className="fixed bottom-4 left-4 bg-blue-600 text-white p-2 rounded shadow-lg z-50 cursor-pointer text-xs"
           onClick={() => setExpanded(true)}>
        🔧 Debug Header/Footer
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-96 max-h-96 overflow-y-auto">
      <div className="bg-blue-600 text-white p-2 flex justify-between items-center">
        <span className="text-sm font-semibold">🔧 Header/Footer Debug</span>
        <button 
          onClick={() => setExpanded(false)}
          className="text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="p-3 text-xs space-y-3">
        {/* Debug Status */}
        <div className="border rounded p-2 bg-blue-50">
          <h4 className="font-semibold mb-1 text-blue-800">🎯 ANALYSIS: Page Builder Integration</h4>
          <div className="space-y-1 text-blue-700">
            <div>✅ System Pages Loading: {debugInfo.pagesLoaded ? 'Working' : 'Loading'}</div>
            <div>✅ Header Rendering: {debugInfo.hasHeader ? 'Working' : 'Missing'}</div>
            <div>✅ Footer Rendering: {debugInfo.hasFooter ? 'Working' : 'Missing'}</div>
          </div>
        </div>
        
        {/* Visual Page Builder Solution */}
        <div className="border rounded p-2 bg-blue-50">
          <h4 className="font-semibold mb-1 text-blue-800">🎨 VISUAL PAGE BUILDER ARCHITECTURE</h4>
          <div className="space-y-1 text-blue-700 text-xs">
            <div><strong>✅ Individual Page Content:</strong> Each page has own widgets, styling, themes</div>
            <div><strong>✅ Standard Pages:</strong> Widget-based content structure</div>
            <div><strong>✅ System Pages:</strong> Specialized Header/Footer editing</div>
            <div><strong>✅ Dynamic Navigation:</strong> Based on page visibility settings</div>
          </div>
        </div>

        {/* System Pages Status */}
        <div className="border rounded p-2 bg-gray-50">
          <h4 className="font-semibold mb-1">System Pages Status</h4>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              <div>
                <strong>Header:</strong> {headerPage ? (
                  <span className="text-green-600">
                    ✅ Loaded ({headerPage.sections.length} sections, {headerPage.sections[0]?.rows[0]?.widgets.length || 0} widgets)
                  </span>
                ) : (
                  <span className="text-red-600">❌ Not found</span>
                )}
              </div>
              <div>
                <strong>Footer:</strong> {footerPage ? (
                  <span className="text-green-600">
                    ✅ Loaded ({footerPage.sections.length} sections, {footerPage.sections[0]?.rows[0]?.widgets.length || 0} widgets)
                  </span>
                ) : (
                  <span className="text-red-600">❌ Not found</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Widget Content Preview */}
        {headerPage && (
          <div className="border rounded p-2 bg-gray-50">
            <h4 className="font-semibold mb-1">Header Content Preview</h4>
            {headerPage.sections[0]?.rows[0]?.widgets[0] ? (
              <div className="bg-white p-2 rounded border text-xs">
                <div>Type: {headerPage.sections[0].rows[0].widgets[0].type}</div>
                <div>Content: {JSON.stringify(headerPage.sections[0].rows[0].widgets[0].props).substring(0, 100)}...</div>
              </div>
            ) : (
              <div className="text-red-600">No widgets found</div>
            )}
          </div>
        )}

        {footerPage && (
          <div className="border rounded p-2 bg-gray-50">
            <h4 className="font-semibold mb-1">Footer Content Preview</h4>
            {footerPage.sections[0]?.rows[0]?.widgets[0] ? (
              <div className="bg-white p-2 rounded border text-xs">
                <div>Type: {footerPage.sections[0].rows[0].widgets[0].type}</div>
                <div>Content: {JSON.stringify(footerPage.sections[0].rows[0].widgets[0].props).substring(0, 100)}...</div>
              </div>
            ) : (
              <div className="text-red-600">No widgets found</div>
            )}
          </div>
        )}

        {/* CSS Grid Classes Check */}
        <div className="border rounded p-2 bg-gray-50">
          <h4 className="font-semibold mb-1">CSS Grid Classes Check</h4>
          <div className="grid grid-cols-12 gap-1">
            <div className="col-span-1 bg-blue-100 p-1 text-center">1</div>
            <div className="col-span-2 bg-blue-100 p-1 text-center">2</div>
            <div className="col-span-3 bg-blue-100 p-1 text-center">3</div>
            <div className="col-span-6 bg-blue-100 p-1 text-center">6</div>
          </div>
          <div className="text-xs mt-1 text-gray-600">If you see numbered boxes above, grid classes are working</div>
        </div>

        {/* Standard Pages Actions */}
        <div className="border rounded p-2 bg-green-50">
          <h4 className="font-semibold mb-2 text-green-800">🎨 VISUAL PAGE BUILDER PAGES</h4>
          <div className="space-y-2">
            <button
              onClick={handleCreateStandardPages}
              disabled={isRecreating}
              className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 font-semibold"
            >
              {isRecreating ? 'Creating Standard Pages...' : '🎨 CREATE STANDARD PAGES'}
            </button>
            {recreateResult && (
              <div className="text-xs p-2 bg-white rounded border">
                {recreateResult}
              </div>
            )}
            
            <button
              onClick={handleUpdateNavigation}
              disabled={isUpdating}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Updating Navigation...' : '2. Update Existing Navigation'}
            </button>
            {updateResult && (
              <div className="text-xs p-2 bg-white rounded border">
                {updateResult}
              </div>
            )}
          </div>
        </div>

        {/* Store Information */}
        <div className="border rounded p-2 bg-gray-50">
          <h4 className="font-semibold mb-1">Store Information</h4>
          <div>Store Name: {storeName}</div>
          <div>Store ID: <span className="font-mono text-xs">{storeId}</span></div>
        </div>
      </div>
    </div>
  );
};