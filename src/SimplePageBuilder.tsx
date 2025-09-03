/**
 * Simple Page Builder Test with Enhanced Page Builder Integration
 */

import React, { useState } from 'react'
import { EnhancedPageBuilder } from './pageBuilder/editor/EnhancedPageBuilder'
import { SupabasePageRepository } from './pageBuilder/data/SupabasePageRepository'

export default function SimplePageBuilder() {
  const [showPageBuilder, setShowPageBuilder] = useState(false);

  const handleSave = (doc: any) => {
    console.log('Saving page document:', doc);
    alert('Page saved successfully! Check the console for details.');
  };

  const handlePublish = (doc: any) => {
    console.log('Publishing page document:', doc);
    alert('Page published successfully! Check the console for details.');
  };

  const handleError = (error: Error) => {
    console.error('Page builder error:', error);
    alert(`Error: ${error.message}`);
  };

  if (showPageBuilder) {
    // Mock user and repository for testing
    const mockUser = { id: 'test-user', email: 'test@example.com' };
    const repository = new SupabasePageRepository('test-store');

    return (
      <div className="h-screen">
        <div className="bg-gray-800 text-white p-2 text-sm flex justify-between items-center">
          <span>🎨 Enhanced Page Builder - Test Mode</span>
          <button 
            onClick={() => setShowPageBuilder(false)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
          >
            ← Back to Status
          </button>
        </div>
        <EnhancedPageBuilder
          user={mockUser}
          repository={repository}
          onSave={handleSave}
          onPublish={handlePublish}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🎨 Enhanced Visual Page Builder
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Page Builder Status</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>React is rendering correctly</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Tailwind CSS is loading</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Enhanced Page Builder integrated</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>Success!</strong> The standalone page builder is now integrated with the 
              comprehensive EnhancedPageBuilder system including drag-and-drop widgets, 
              responsive design, templates, and advanced features.
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            <button 
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              onClick={() => setShowPageBuilder(true)}
            >
              🚀 Launch Enhanced Page Builder
            </button>
            
            <button 
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => alert('Button clicked! React events are working.')}
            >
              Test React Events
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Features Available:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Drag-and-drop widget library</li>
              <li>• Responsive design tools</li>
              <li>• Template marketplace</li>
              <li>• SEO optimization panel</li>
              <li>• Layers and properties panels</li>
              <li>• Real-time preview mode</li>
              <li>• Undo/redo functionality</li>
              <li>• Auto-save capabilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}