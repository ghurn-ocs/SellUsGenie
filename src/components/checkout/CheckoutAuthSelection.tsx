import React, { useState } from 'react'
import { User, Mail, Smartphone, ShoppingBag, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface CheckoutAuthSelectionProps {
  onGuestCheckout: () => void
  onExistingLogin: () => void
  onAuthSuccess: () => void
  cartItemCount: number
  cartTotal: string
}

export const CheckoutAuthSelection: React.FC<CheckoutAuthSelectionProps> = ({
  onGuestCheckout,
  onExistingLogin,
  onAuthSuccess,
  cartItemCount,
  cartTotal
}) => {
  const { signInWithGoogle, signInWithApple, signInWithEmail } = useAuth()
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      onAuthSuccess()
    } catch (error) {
      console.error('Google auth failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleAuth = async () => {
    setIsLoading(true)
    try {
      await signInWithApple()
      onAuthSuccess()
    } catch (error) {
      console.error('Apple auth failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signInWithEmail(loginData.email, loginData.password)
      onAuthSuccess() // User is now authenticated, proceed to shipping
    } catch (error) {
      console.error('Email login failed:', error)
      // In a real app, you'd show an error message to the user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Order Summary Header */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <span className="font-semibold text-gray-900">{cartTotal}</span>
        </div>
      </div>

      <div className="text-center mb-6">
        <Lock className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Secure Checkout</h2>
        <p className="text-gray-600 text-sm">Choose how you'd like to complete your order</p>
      </div>

      {/* Authentication Options */}
      <div className="space-y-4">
        {/* Guest Checkout */}
        <button
          onClick={onGuestCheckout}
          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#9B51E0] hover:bg-[#9B51E0]/10 transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#9B51E0]/20 transition-colors">
              <User className="w-5 h-5 text-gray-600 group-hover:text-[#9B51E0]" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Continue as Guest</h3>
              <p className="text-sm text-gray-600">Quick checkout without creating an account</p>
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or sign in to save time</span>
          </div>
        </div>

        {/* OAuth Options */}
        <div className="space-y-3">
          {/* Google OAuth */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Apple OAuth */}
          <button
            onClick={handleAppleAuth}
            disabled={isLoading}
            className="w-full p-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="font-medium">
              {isLoading ? 'Signing in...' : 'Continue with Apple'}
            </span>
          </button>

          {/* Email Login Toggle */}
          <button
            onClick={() => setShowEmailLogin(!showEmailLogin)}
            className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-3"
          >
            <Mail className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Sign in with Email</span>
          </button>
        </div>

        {/* Email Login Form */}
        {showEmailLogin && (
          <form onSubmit={handleEmailLogin} className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
            <h3 className="font-medium text-gray-900">Sign in with Email</h3>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-[#9B51E0] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#8A47D0] transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setShowEmailLogin(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Don't have an account?{' '}
              <button type="button" className="text-[#9B51E0] hover:underline">
                Sign up with Google or Apple above
              </button>
            </p>
          </form>
        )}

        {/* Security Note */}
        <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start space-x-2">
            <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-800">
              <p className="font-medium">Your information is secure</p>
              <p>We use SSL encryption and never store your payment details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}