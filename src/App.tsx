import React from 'react'
import { Route, Switch, Redirect } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { StoreProvider } from './contexts/StoreContext'
import LandingPage from './pages/LandingPage'
import StoreOwnerDashboard from './pages/StoreOwnerDashboard'
import StoreFrontend from './pages/StoreFrontend'
import AuthCallback from './pages/AuthCallback'
import { PageBuilder } from './pages/admin/PageBuilder'

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Redirect to="/" />
  }
  
  return <>{children}</>
}

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/admin">
              <ProtectedRoute>
                <StoreOwnerDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/page-builder">
              <ProtectedRoute>
                <PageBuilder isFullScreen={true} />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/page-builder/:pageId">
              {({ pageId }) => (
                <ProtectedRoute>
                  <PageBuilder pageId={pageId} isFullScreen={true} />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/auth/callback" component={AuthCallback} />
            <Route path="/store/:storeSlug" component={StoreFrontend} />
          </Switch>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
