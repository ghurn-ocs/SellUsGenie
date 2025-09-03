import React, { useState } from 'react';
import { fixEmptySystemPages } from '../../utils/updateSystemPagesSimple';

interface SystemPageFixerProps {
  storeId: string;
}

export const SystemPageFixer: React.FC<SystemPageFixerProps> = ({ storeId }) => {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFix = async () => {
    setIsFixing(true);
    setResult(null);
    
    try {
      const fixResult = await fixEmptySystemPages(storeId);
      setResult(`${fixResult.success ? '✅' : '❌'} ${fixResult.message}`);
      
      if (fixResult.errors.length > 0) {
        console.error('Errors:', fixResult.errors);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded shadow-lg z-50">
      <h3 className="text-sm font-semibold mb-2">System Page Fixer</h3>
      <button
        onClick={handleFix}
        disabled={isFixing}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {isFixing ? 'Fixing...' : 'Fix Empty Pages'}
      </button>
      {result && (
        <div className="mt-2 text-xs">
          {result}
        </div>
      )}
    </div>
  );
};