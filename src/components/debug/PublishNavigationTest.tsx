/**
 * Debug Component: Publish and Navigation Test
 * UI component to test the reconstructed publish and navigation system
 */

import React, { useState } from 'react';
import { testPublishAndNavigation, quickSlugCheck } from '../../utils/testPublishAndNavigation';
import { useStore } from '../../contexts/StoreContext';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export const PublishNavigationTest: React.FC = () => {
  const { selectedStore } = useStore();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{ overall: boolean; results: TestResult[] } | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const runFullTest = async () => {
    if (!selectedStore?.id) return;
    
    setTesting(true);
    setResults(null);
    
    try {
      const testResults = await testPublishAndNavigation(selectedStore.id);
      setResults(testResults);
    } catch (error) {
      console.error('Test failed:', error);
      setResults({
        overall: false,
        results: [{
          success: false,
          message: `Test suite crashed: ${error.message}`,
          details: { error }
        }]
      });
    } finally {
      setTesting(false);
    }
  };

  const runQuickCheck = async () => {
    if (!selectedStore?.id) return;
    
    console.log('🔍 Running quick slug check...');
    await quickSlugCheck(selectedStore.id);
    console.log('✅ Quick check complete - see browser console for details');
  };

  if (!selectedStore) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded">
        <p className="text-yellow-800">Please select a store to run tests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">🧪 Publish & Navigation System Tests</h3>
        <p className="text-sm text-gray-600 mb-4">
          Test the reconstructed publish function and navigation system for store: <strong>{selectedStore.name}</strong>
        </p>
        
        <div className="space-x-4 mb-4">
          <button
            onClick={runFullTest}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Running Full Test...' : 'Run Full Test'}
          </button>
          
          <button
            onClick={runQuickCheck}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Quick Slug Check
          </button>
        </div>

        {results && (
          <div className="mt-6">
            <div className={`p-4 rounded mb-4 ${
              results.overall 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h4 className={`font-semibold ${
                results.overall ? 'text-green-800' : 'text-red-800'
              }`}>
                {results.overall ? '✅ All Tests Passed' : '❌ Some Tests Failed'}
              </h4>
            </div>

            <div className="space-y-2">
              {results.results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? '✅' : '❌'} {result.message}
                    </span>
                    
                    {result.details && (
                      <button
                        onClick={() => setShowDetails(showDetails === index ? null : index)}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        {showDetails === index ? 'Hide Details' : 'Show Details'}
                      </button>
                    )}
                  </div>
                  
                  {showDetails === index && result.details && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};