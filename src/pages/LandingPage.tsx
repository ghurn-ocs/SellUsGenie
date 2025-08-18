import React from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { GenieMascot } from '../components/ui/GenieMascot'

interface LandingPageProps {}

const LandingPage: React.FC<LandingPageProps> = () => {
  const [, navigate] = useLocation()
  const { signInWithGoogle, signInWithApple } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google sign in failed:', error)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple()
    } catch (error) {
      console.error('Apple sign in failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1E1E] to-[#121212]">
      {/* Navigation */}
      <nav className="bg-[#1E1E1E] shadow-lg border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <GenieMascot mood="happy" size="md" showBackground={true} />
              <div>
                <h1 className="text-2xl font-bold text-[#9B51E0]">Sell Us Genie™</h1>
                <p className="text-xs text-[#A0A0A0] italic">Where wishes are real!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/features')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors border border-[#9B51E0] px-3 py-1.5 rounded-lg hover:bg-[#9B51E0]/10">Features</button>
              <a href="#pricing" className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors border border-[#9B51E0] px-3 py-1.5 rounded-lg hover:bg-[#9B51E0]/10">Pricing</a>
              <button onClick={() => navigate('/why-not')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors border border-[#9B51E0] px-3 py-1.5 rounded-lg hover:bg-[#9B51E0]/10">Why Not Others?</button>
              <button onClick={() => navigate('/contact')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors border border-[#9B51E0] px-3 py-1.5 rounded-lg hover:bg-[#9B51E0]/10">Contact</button>
              <button 
                onClick={handleGoogleSignIn}
                className="bg-[#9B51E0] text-white px-4 py-2 rounded-lg hover:bg-[#8A47D0] transition-colors font-medium"
              >
                Sign In to Store
              </button>
              <button 
                onClick={handleGoogleSignIn}
                className="bg-[#FF7F00] text-white px-4 py-2 rounded-lg hover:bg-[#FF8C00] transition-colors font-medium"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <GenieMascot mood="happy" size="xxl" showBackground className="mx-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Launch Your <span className="text-[#9B51E0]">E-commerce Empire</span>
          </h1>
          <p className="text-xl text-[#E0E0E0] mb-8 max-w-3xl mx-auto">
            Create unlimited online stores with our powerful multi-tenant platform. 
            Start your 14-day free trial today and join thousands of successful entrepreneurs.
          </p>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              {/* For Store Owners */}
              <div className="bg-[#1E1E1E] rounded-xl shadow-lg p-8 border-2 border-[#2A2A2A]">
                <h3 className="text-2xl font-bold text-white mb-4">For Store Owners</h3>
                <p className="text-[#E0E0E0] mb-6">Create and manage your online stores with our powerful platform</p>
                <div className="space-y-3">
                  <button 
                    onClick={handleGoogleSignIn}
                    className="bg-[#00AEEF] text-white w-full text-lg py-3 flex items-center justify-center rounded-lg hover:bg-[#007AFF] transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Start with Google
                  </button>
                  <button 
                    onClick={handleAppleSignIn}
                    className="bg-[#2A2A2A] text-[#E0E0E0] w-full text-lg py-3 flex items-center justify-center rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Start with Apple
                  </button>
                </div>
                <p className="text-sm text-[#A0A0A0] mt-4 text-center">
                  14-day free trial • No credit card required
                </p>
              </div>

              {/* For Customers */}
              <div className="bg-[#1E1E1E] rounded-xl shadow-lg p-8 border-2 border-[#2A2A2A]">
                <h3 className="text-2xl font-bold text-white mb-4">For Customers</h3>
                <p className="text-[#E0E0E0] mb-6">Sign in to access your favorite stores and manage your orders</p>
                <div className="space-y-3">
                  <button 
                    onClick={handleGoogleSignIn}
                    className="w-full bg-[#2A2A2A] border-2 border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] hover:border-[#00AEEF] text-lg py-3 rounded-lg flex items-center justify-center font-medium transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                  <button 
                    onClick={handleAppleSignIn}
                    className="w-full bg-[#2A2A2A] border-2 border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] hover:border-[#00AEEF] text-lg py-3 rounded-lg flex items-center justify-center font-medium transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Sign in with Apple
                  </button>
                </div>
                <p className="text-sm text-[#A0A0A0] mt-4 text-center">
                  Access your orders • Track shipments • Manage account
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to <span className="text-[#9B51E0]">Succeed</span>
            </h2>
            <p className="text-xl text-[#E0E0E0]">
              Powerful features designed for modern e-commerce businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center bg-[#2A2A2A] border border-[#3A3A3A]">
              <div className="w-16 h-16 bg-[#9B51E0] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multiple Stores</h3>
              <p className="text-[#E0E0E0]">
                Create and manage unlimited stores under one account. 
                Perfect for brands with multiple product lines or markets.
              </p>
            </div>

            <div className="card text-center bg-[#2A2A2A] border border-[#3A3A3A]">
              <div className="w-16 h-16 bg-[#00AEEF] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure Authentication</h3>
              <p className="text-[#E0E0E0]">
                Google and Apple OAuth integration for seamless, 
                secure login experiences for both store owners and customers.
              </p>
            </div>

            <div className="card text-center bg-[#2A2A2A] border border-[#3A3A3A]">
              <div className="w-16 h-16 bg-[#FF7F00] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics & Insights</h3>
              <p className="text-[#E0E0E0]">
                Comprehensive analytics and reporting to track sales, 
                customer behavior, and store performance across all your stores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent <span className="text-[#9B51E0]">Pricing</span>
            </h2>
            <p className="text-xl text-[#E0E0E0]">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center bg-[#1E1E1E] border border-[#3A3A3A]">
              <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
              <div className="text-4xl font-bold text-[#9B51E0] mb-4">$29<span className="text-lg text-[#A0A0A0]">/month</span></div>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Up to 3 stores
                </li>
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic analytics
                </li>
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Email support
                </li>
              </ul>
              <button onClick={handleGoogleSignIn} className="bg-[#00AEEF] text-white w-full rounded-lg hover:bg-[#007AFF] transition-colors font-medium py-3">
                Start Free Trial
              </button>
            </div>

            <div className="card text-center border-2 border-[#9B51E0] relative bg-[#1E1E1E]">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#9B51E0] text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="text-4xl font-bold text-[#9B51E0] mb-4">$79<span className="text-lg text-[#A0A0A0]">/month</span></div>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Up to 10 stores
                </li>
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom domains
                </li>
              </ul>
              <button onClick={handleGoogleSignIn} className="bg-[#FF7F00] text-white w-full rounded-lg hover:bg-[#FF8C00] transition-colors font-medium py-3">
                Start Free Trial
              </button>
            </div>

            <div className="card text-center bg-[#1E1E1E] border border-[#3A3A3A]">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-[#9B51E0] mb-4">$199<span className="text-lg text-[#A0A0A0]">/month</span></div>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited stores
                </li>
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Enterprise analytics
                </li>
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 phone support
                </li>
                <li className="flex items-center text-[#E0E0E0]">
                  <svg className="w-5 h-5 text-[#00AEEF] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  API access
                </li>
              </ul>
              <button onClick={handleGoogleSignIn} className="bg-[#00AEEF] text-white w-full rounded-lg hover:bg-[#007AFF] transition-colors font-medium py-3">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#121212] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2 text-[#9B51E0]">Sell Us Genie™</h3>
              <p className="text-xs text-[#A0A0A0] italic mb-4">Where wishes are real!</p>
              <p className="text-[#A0A0A0]">
                The ultimate multi-tenant e-commerce platform for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li><button onClick={() => navigate('/features')} className="hover:text-[#9B51E0] transition-colors">Features</button></li>
                <li><a href="#pricing" className="hover:text-[#9B51E0] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#9B51E0] transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li><a href="#" className="hover:text-[#9B51E0] transition-colors">Help Center</a></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-[#9B51E0] transition-colors">Contact Us</button></li>
                <li><a href="#" className="hover:text-[#9B51E0] transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li><button onClick={() => navigate('/privacy')} className="hover:text-[#9B51E0] transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-[#9B51E0] transition-colors">Terms of Service</button></li>
                <li><button onClick={() => navigate('/cookies')} className="hover:text-[#9B51E0] transition-colors">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2A2A2A] mt-8 pt-8 text-center text-[#A0A0A0]">
            <p>&copy; 2025 Sell Us Genie™. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
