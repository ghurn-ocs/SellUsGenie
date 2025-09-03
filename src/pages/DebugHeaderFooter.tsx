import React from 'react';
import { StoreFrontLayout } from '../components/storefront/StoreFrontLayout';
import { HeaderFooterDebug } from '../components/debug/HeaderFooterDebug';
import { useStore } from '../contexts/StoreContext';

export const DebugHeaderFooter: React.FC = () => {
  const { currentStore } = useStore();
  
  if (!currentStore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug Header/Footer</h1>
          <p className="text-gray-600">No store selected. Please select a store first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Debug overlay */}
      <HeaderFooterDebug 
        storeId={currentStore.id} 
        storeName={currentStore.store_name}
      />
      
      {/* Test the actual StoreFrontLayout with header/footer integration */}
      <StoreFrontLayout
        storeId={currentStore.id}
        storeName={currentStore.store_name}
        storeSlug={currentStore.store_slug}
      >
        <div className="pt-16 pb-8"> {/* Account for fixed header */}
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Header/Footer Integration Test Page
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">🔧 Debug Information</h2>
              <div className="text-left text-sm space-y-2">
                <p><strong>Store:</strong> {currentStore.store_name}</p>
                <p><strong>Store ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{currentStore.id}</code></p>
                <p><strong>Purpose:</strong> Testing Visual Page Builder header/footer integration</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">What to Check:</h3>
              <ul className="text-left space-y-2 text-yellow-800">
                <li>✅ <strong>Header:</strong> Should show Page Builder content, not hardcoded fallback</li>
                <li>✅ <strong>Footer:</strong> Should show Page Builder content, not hardcoded fallback</li>
                <li>✅ <strong>Grid Layout:</strong> Widget content should display with proper column spans</li>
                <li>✅ <strong>Text Widgets:</strong> HTML content should render correctly</li>
                <li>✅ <strong>No Console Errors:</strong> Check browser console for widget rendering errors</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Debug Tools:</h3>
              <p className="text-green-800 text-sm">
                Click the "🔧 Debug Header/Footer" button in the bottom-left corner 
                for detailed system information and troubleshooting data.
              </p>
            </div>
          </div>
        </div>
      </StoreFrontLayout>
    </div>
  );
};