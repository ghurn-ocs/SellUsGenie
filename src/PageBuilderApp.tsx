/**
 * Standalone Page Builder Application
 * Independent WYSIWYG canvas editor
 */

import React from 'react'
import { Route, Switch } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { StoreProvider } from './contexts/StoreContext'
import { CanvasEditor } from './pageBuilder/canvas/CanvasEditor'
import { CanvasError } from './pageBuilder/canvas/types/CanvasTypes'

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Page Builder...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Builder Access</h1>
          <p className="text-gray-600 mb-6">
            Please authenticate to access the visual page builder.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              This is a standalone page builder application for creating and editing pages.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}

// Page Builder Route Component
const PageBuilderRoute: React.FC<{ pageId?: string }> = ({ pageId }) => {
  const handleSave = (canvasData: any) => {
    console.log('Saving canvas data:', canvasData);
    // TODO: Implement save functionality
  };

  const handleError = (error: CanvasError) => {
    console.error('Canvas error:', error);
    // TODO: Implement error notification
  };

  const initialData = pageId 
    ? null // TODO: Load existing page data
    : { version: '1.0', pageTitle: 'New Page', timestamp: Date.now() };

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

// Create a client
const queryClient = new QueryClient()

function PageBuilderApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <Switch>
            <Route path="/">
              <ProtectedRoute>
                <PageBuilderRoute />
              </ProtectedRoute>
            </Route>
            <Route path="/page/:pageId">
              {({ pageId }) => (
                <ProtectedRoute>
                  <PageBuilderRoute pageId={pageId} />
                </ProtectedRoute>
              )}
            </Route>
            {/* Default fallback */}
            <Route>
              <ProtectedRoute>
                <PageBuilderRoute />
              </ProtectedRoute>
            </Route>
          </Switch>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default PageBuilderApp