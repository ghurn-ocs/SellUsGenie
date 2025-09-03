/**
 * Debug utility component to fix null slugs in existing pages
 * This helps resolve navigation issues caused by legacy pages without slugs
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { fixNullSlugsForStore, checkForNullSlugs } from '../../utils/fixNullSlugs';
import { RefreshCw, AlertTriangle, CheckCircle, Settings, Database } from 'lucide-react';

export const SlugFixUtility: React.FC = () => {
  const { currentStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [results, setResults] = useState<{
    hasNullSlugs: boolean;
    count: number;
    pages: Array<{ id: string; name: string; status: string }>;
  }>({ hasNullSlugs: false, count: 0, pages: [] });
  const [fixResults, setFixResults] = useState<{
    success: boolean;
    fixed: number;
    errors: string[];
  } | null>(null);

  // Check for null slugs on component mount
  useEffect(() => {
    if (currentStore?.id) {
      checkForIssues();
    }
  }, [currentStore?.id]);

  const checkForIssues = async () => {
    if (!currentStore?.id) return;
    
    setChecking(true);
    try {
      const checkResults = await checkForNullSlugs(currentStore.id);
      setResults(checkResults);
    } catch (error) {
      console.error('Error checking for slug issues:', error);
    } finally {
      setChecking(false);
    }
  };

  const fixSlugs = async () => {
    if (!currentStore?.id) return;
    
    setLoading(true);
    try {
      const results = await fixNullSlugsForStore(currentStore.id);
      setFixResults(results);
      
      // Refresh the check after fixing
      if (results.success) {
        await checkForIssues();
      }
    } catch (error) {
      console.error('Error fixing slugs:', error);
      setFixResults({
        success: false,
        fixed: 0,
        errors: [`Unexpected error: ${error}`]
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentStore) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border">
        <p className="text-gray-600">No store selected</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Page Slug Fix Utility</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        This utility fixes pages with missing slugs that prevent navigation from working properly.
      </p>

      {checking ? (
        <div className="flex items-center space-x-2 text-blue-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Checking for slug issues...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Status */}
          <div className={`p-4 rounded-lg border ${
            results.hasNullSlugs 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-2">
              {results.hasNullSlugs ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <span className={`font-medium ${
                results.hasNullSlugs ? 'text-red-800' : 'text-green-800'
              }`}>
                {results.hasNullSlugs 
                  ? `Found ${results.count} pages with missing slugs`
                  : 'All pages have valid slugs'
                }
              </span>
            </div>
            
            {results.hasNullSlugs && results.pages.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-red-700 font-medium mb-2">Pages that need fixing:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {results.pages.map(page => (
                    <li key={page.id} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      <span>"{page.name}" ({page.status})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          {results.hasNullSlugs && (
            <div className="flex items-center space-x-3">
              <button
                onClick={fixSlugs}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4" />
                )}
                <span>{loading ? 'Fixing...' : 'Fix All Slugs'}</span>
              </button>
              
              <button
                onClick={checkForIssues}
                disabled={checking || loading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                <span>Re-check</span>
              </button>
            </div>
          )}

          {/* Fix Results */}
          {fixResults && (
            <div className={`p-4 rounded-lg border ${
              fixResults.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {fixResults.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  fixResults.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {fixResults.success 
                    ? `Successfully fixed ${fixResults.fixed} pages`
                    : 'Fix operation completed with errors'
                  }
                </span>
              </div>
              
              {fixResults.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-700 font-medium mb-1">Errors:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {fixResults.errors.map((error, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-1 flex-shrink-0"></span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 <strong>Tip:</strong> After fixing slugs, refresh your storefront to see updated navigation.
        </p>
      </div>
    </div>
  );
};