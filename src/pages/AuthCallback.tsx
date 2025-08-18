import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '../lib/supabase'

interface AuthCallbackProps {}

const AuthCallback: React.FC<AuthCallbackProps> = () => {
  const [, setLocation] = useLocation()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          return
        }

        if (data.session) {
          // Check if user is a store owner
          const { data: storeOwner, error: storeOwnerError } = await supabase
            .from('store_owners')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (storeOwnerError && storeOwnerError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected for new users
            console.error('Store owner check error:', storeOwnerError)
            setError('Failed to verify store owner status')
            return
          }

          if (!storeOwner) {
            // Create store owner record for new users
            const { error: createError } = await supabase
              .from('store_owners')
              .insert([
                {
                  id: data.session.user.id,
                  email: data.session.user.email,
                  google_id: data.session.user.app_metadata?.provider === 'google' ? data.session.user.id : null,
                  apple_id: data.session.user.app_metadata?.provider === 'apple' ? data.session.user.id : null,
                  subscription_tier: 'trial',
                  trial_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
                }
              ])

            if (createError) {
              console.error('Create store owner error:', createError)
              setError('Failed to create store owner account')
              return
            }
          }

          // Redirect to admin dashboard
          setLocation('/admin')
        } else {
          setError('No session found')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Authentication failed')
      }
    }

    handleAuthCallback()
  }, [setLocation])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => setLocation('/')}
              className="btn-primary"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

export default AuthCallback
