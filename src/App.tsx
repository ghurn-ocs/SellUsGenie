import React from 'react'
import { Route, Switch, Redirect } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { StoreProvider } from './contexts/StoreContext'
import { ModalProvider } from './contexts/ModalContext'
import LandingPage from './pages/LandingPage'
import FeaturesPage from './pages/FeaturesPage'
import WhyNotPage from './pages/WhyNotPage'
import ContactUsPage from './pages/ContactUsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import StoreOwnerDashboard from './pages/StoreOwnerDashboard'
import { StoreFrontView } from './pages/StoreFrontView'
import AuthCallback from './pages/AuthCallback'
import { VisualPageBuilder } from './pages/VisualPageBuilder'
import { HeaderConfiguration } from './pages/HeaderConfiguration'
import { FooterConfiguration } from './pages/FooterConfiguration'
import CookieConsent from './components/ui/CookieConsent'

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

// Create a client with proper configuration to prevent infinite loops
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: 'always',
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <ModalProvider>
            <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/features" component={FeaturesPage} />
            <Route path="/why-not" component={WhyNotPage} />
            <Route path="/contact" component={ContactUsPage} />
            <Route path="/privacy" component={PrivacyPolicyPage} />
            <Route path="/terms" component={TermsOfServicePage} />
            <Route path="/cookies" component={CookiePolicyPage} />
            <Route path="/admin">
              <ProtectedRoute>
                <StoreOwnerDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/page-builder">
              <ProtectedRoute>
                <VisualPageBuilder />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/header-config">
              <ProtectedRoute>
                <HeaderConfiguration />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/footer-config">
              <ProtectedRoute>
                <FooterConfiguration />
              </ProtectedRoute>
            </Route>
            <Route path="/auth/callback" component={AuthCallback} />
            <Route path="/store/:storeSlug" component={StoreFrontView} />
            </Switch>
            <CookieConsent />
          </ModalProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
