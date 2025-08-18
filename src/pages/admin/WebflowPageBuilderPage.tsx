/**
 * Webflow-Like Page Builder Page
 * Integration wrapper for the new visual page builder with advanced canvas
 */

import React from 'react';
import { CanvasEditor } from '../../pageBuilder/canvas/CanvasEditor';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { CanvasError } from '../../pageBuilder/canvas/types/CanvasTypes';

interface WebflowPageBuilderPageProps {
  pageId?: string;
}

// Create initial canvas data for new pages
const createInitialCanvasData = (storeId: string, storeName: string) => ({
  version: '1.0',
  storeId,
  storeName,
  pageTitle: 'New Page',
  timestamp: Date.now()
});

export const WebflowPageBuilderPage: React.FC<WebflowPageBuilderPageProps> = ({ pageId }) => {
  const { user } = useAuth();
  const { currentStore } = useStore();

  const handleSave = (canvasData: any) => {
    // TODO: Save to database
    console.log('Saving canvas data:', canvasData);
  };

  const handleError = (error: CanvasError) => {
    console.error('Canvas error:', error);
    // TODO: Show error notification to user
  };

  // Show loading state while auth/store is loading
  if (!user || !currentStore) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl font-semibold mb-4">Loading Page Builder...</div>
          <div className="text-gray-500">Authenticating and loading store data</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  const initialData = pageId 
    ? null // TODO: Load existing page data from database
    : createInitialCanvasData(currentStore.id, currentStore.store_name);

  return (
    <div className="h-screen">
      <CanvasEditor
        onSave={handleSave}
        onError={handleError}
        initialData={initialData}
      />
    </div>
  );
};

export default WebflowPageBuilderPage;