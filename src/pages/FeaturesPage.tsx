import React from 'react'
import { useLocation } from 'wouter'
import { GenieMascot } from '../components/ui/GenieMascot'
import { useAuth } from '../contexts/AuthContext'

interface FeaturesPageProps {}

const FeaturesPage: React.FC<FeaturesPageProps> = () => {
  const [, navigate] = useLocation()
  const { signInWithGoogle, signInWithApple } = useAuth()

  const handleGetStarted = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in failed:', error)
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
                <button 
                  onClick={() => navigate('/')}
                  className="text-2xl font-bold text-[#9B51E0] hover:text-[#A051E0] transition-colors"
                >
                  Sell Us Genie™
                </button>
                <p className="text-xs text-[#A0A0A0] italic">Where wishes are real!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors border border-[#9B51E0] px-3 py-1.5 rounded-lg hover:bg-[#9B51E0]/10">Home</button>
              <span className="text-[#9B51E0] font-semibold border border-[#9B51E0] px-3 py-1.5 rounded-lg bg-[#9B51E0]/10">Features</span>
              <button onClick={() => navigate('/#pricing')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors border border-[#9B51E0] px-3 py-1.5 rounded-lg hover:bg-[#9B51E0]/10">Pricing</button>
              <button onClick={() => navigate('/why-not')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors border border-[#9B51E0] px-3 py-1.5 rounded-lg hover:bg-[#9B51E0]/10">Why Not Others?</button>
              <button 
                onClick={handleGetStarted}
                className="bg-[#9B51E0] text-white px-4 py-2 rounded-lg hover:bg-[#8A47D0] transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Powerful E-commerce Features for 
            <span className="text-[#9B51E0]"> Modern Businesses</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#E0E0E0] mb-8 max-w-4xl mx-auto leading-relaxed">
            Launch your online store in minutes with our comprehensive multi-tenant e-commerce platform. 
            Built for scalability, security, and immediate availability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-[#9B51E0] text-white px-8 py-4 rounded-lg hover:bg-[#8A47D0] transition-colors font-semibold text-lg"
            >
              Start Your Store Now - Free Trial
            </button>
            <button 
              onClick={() => navigate('/#pricing')}
              className="bg-transparent border-2 border-[#9B51E0] text-[#9B51E0] px-8 py-4 rounded-lg hover:bg-[#9B51E0] hover:text-white transition-colors font-semibold text-lg"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </section>

      {/* Immediate Store Availability */}
      <section className="py-16 bg-[#2A2A2A] border-t border-[#3A3A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              🚀 <span className="text-[#00AEEF]">Instant Store Launch</span> - Go Live in Minutes
            </h2>
            <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              No waiting periods, no complex setup processes. Your professional e-commerce store is ready immediately after signup.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">⚡ 60-Second Setup</h3>
              <p className="text-[#A0A0A0]">
                Sign in with Google or Apple OAuth and your store infrastructure is instantly provisioned. 
                No credit card required for 14-day free trial.
              </p>
            </div>

            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">🌐 Live Immediately</h3>
              <p className="text-[#A0A0A0]">
                Your store goes live with a professional subdomain instantly. Custom domains can be configured 
                in minutes with our automated SSL certificate provisioning.
              </p>
            </div>

            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">✨ Pre-configured Features</h3>
              <p className="text-[#A0A0A0]">
                Payment processing, inventory management, customer accounts, and analytics are ready 
                out-of-the-box. Start selling immediately.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center bg-green-500/20 text-green-400 px-6 py-3 rounded-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="font-semibold">99.9% Uptime Guarantee • Enterprise-Grade Infrastructure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Complete E-commerce Solution
            </h2>
            <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              Everything you need to run a successful online business, from product management to financial reporting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Multi-Store Management */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Store Management</h3>
              <p className="text-[#A0A0A0] mb-4">
                Create unlimited stores under one account. Perfect for brands with multiple product lines, 
                different markets, or various business ventures. Each store operates independently with 
                complete data isolation.
              </p>
              <ul className="text-sm text-[#E0E0E0] space-y-1">
                <li>• Separate domains and branding per store</li>
                <li>• Individual analytics and reporting</li>
                <li>• Unified billing and management</li>
                <li>• Cross-store customer insights</li>
              </ul>
            </div>

            {/* Professional Page Builder */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Visual Page Builder</h3>
              <p className="text-[#A0A0A0] mb-4">
                Drag-and-drop page builder with responsive design controls. Create stunning product pages, 
                landing pages, and custom layouts without any coding knowledge. Professional templates included.
              </p>
              <ul className="text-sm text-[#E0E0E0] space-y-1">
                <li>• Responsive design controls</li>
                <li>• Pre-built widget library</li>
                <li>• Custom CSS support</li>
                <li>• Mobile-first templates</li>
              </ul>
            </div>

            {/* Advanced Analytics */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Financial Year Analytics</h3>
              <p className="text-[#A0A0A0] mb-4">
                Comprehensive business intelligence with custom financial year periods. Track revenue, 
                profit margins, customer behavior, and product performance with real-time dashboards and reporting.
              </p>
              <ul className="text-sm text-[#E0E0E0] space-y-1">
                <li>• Custom financial year configuration</li>
                <li>• Real-time COGS tracking</li>
                <li>• Customer lifetime value analysis</li>
                <li>• Automated financial reporting</li>
              </ul>
            </div>

            {/* Secure Payments */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Enterprise Payment Processing</h3>
              <p className="text-[#A0A0A0] mb-4">
                Integrated Stripe payment processing with support for all major credit cards, digital wallets, 
                and international payments. PCI DSS compliant with automated fraud detection.
              </p>
              <ul className="text-sm text-[#E0E0E0] space-y-1">
                <li>• Global payment methods</li>
                <li>• Automated tax calculation</li>
                <li>• Subscription billing support</li>
                <li>• Real-time fraud protection</li>
              </ul>
            </div>

            {/* Inventory Management */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Inventory Control</h3>
              <p className="text-[#A0A0A0] mb-4">
                Automated inventory tracking with low-stock alerts, product variants, and bulk management tools. 
                Real-time synchronization across all sales channels with profit margin calculations.
              </p>
              <ul className="text-sm text-[#E0E0E0] space-y-1">
                <li>• Real-time stock levels</li>
                <li>• Automated reorder alerts</li>
                <li>• Product variant management</li>
                <li>• Bulk import/export tools</li>
              </ul>
            </div>

            {/* Customer Management */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Customer Relationship Management</h3>
              <p className="text-[#A0A0A0] mb-4">
                Complete customer lifecycle management with purchase history, segmentation, and automated 
                marketing campaigns. OAuth integration for seamless customer experience.
              </p>
              <ul className="text-sm text-[#E0E0E0] space-y-1">
                <li>• Customer segmentation tools</li>
                <li>• Purchase history tracking</li>
                <li>• Automated email campaigns</li>
                <li>• Loyalty program support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Excellence */}
      <section className="py-20 bg-[#2A2A2A] border-t border-[#3A3A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise-Grade <span className="text-[#00AEEF]">Technology Stack</span>
            </h2>
            <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              Built on modern, scalable infrastructure with security and performance as top priorities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Security First</h3>
              <p className="text-[#A0A0A0] text-sm">
                SOC 2 compliant infrastructure with row-level security, encrypted data transmission, and regular security audits.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-[#A0A0A0] text-sm">
                Global CDN, optimized databases, and modern React architecture deliver sub-second page loads worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Scalable Architecture</h3>
              <p className="text-[#A0A0A0] text-sm">
                Auto-scaling infrastructure handles traffic spikes effortlessly. From startup to enterprise scale.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">24/7 Support</h3>
              <p className="text-[#A0A0A0] text-sm">
                Dedicated support team with 99.9% uptime SLA and comprehensive documentation and tutorials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO & Marketing Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built-in <span className="text-[#FF7F00]">Marketing & SEO</span> Tools
            </h2>
            <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              Drive traffic and increase conversions with our comprehensive marketing toolkit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-[#FF7F00]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#FF7F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">SEO Optimization</h3>
              <p className="text-[#A0A0A0] mb-4">
                Automatic sitemap generation, meta tag optimization, structured data markup, and Google Analytics integration.
              </p>
              <ul className="text-sm text-[#E0E0E0] space-y-1">
                <li>• Automatic meta tag generation</li>
                <li>• XML sitemap creation</li>
                <li>• Schema.org markup</li>
                <li>• Page speed optimization</li>
              </ul>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4L5.5 6M17 4l1.5 2M3 6h18M5 6v12a2 2 0 002 2h10a2 2 0 002-2V6M10 11v6M14 11v6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Email Marketing</h3>
              <p className="text-[#A0A0A0] mb-4">
                Automated email campaigns, abandoned cart recovery, customer segmentation, and newsletter management.
              </p>
              <ul className="text-sm text-[#E0E0E0] space-y-1">
                <li>• Automated drip campaigns</li>
                <li>• Cart abandonment emails</li>
                <li>• Customer win-back sequences</li>
                <li>• Performance analytics</li>
              </ul>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Social Commerce</h3>
              <p className="text-[#A0A0A0] mb-4">
                Social media integration, product catalog sync, Instagram shopping, and Facebook Pixel integration.
              </p>
              <ul className="text-sm text-[#E0E0E0] space-y-1">
                <li>• Instagram Shopping integration</li>
                <li>• Facebook catalog sync</li>
                <li>• Social media analytics</li>
                <li>• Influencer collaboration tools</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Ecosystem */}
      <section className="py-20 bg-[#2A2A2A] border-t border-[#3A3A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Seamless <span className="text-[#00AEEF]">Integrations</span>
            </h2>
            <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              Connect with your favorite tools and services to streamline your workflow.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "Stripe", icon: "💳" },
              { name: "Google Analytics", icon: "📊" },
              { name: "Mailchimp", icon: "📧" },
              { name: "Zapier", icon: "⚡" },
              { name: "Shopify", icon: "🛍️" },
              { name: "QuickBooks", icon: "📋" },
              { name: "Slack", icon: "💬" },
              { name: "Twilio", icon: "📱" },
              { name: "AWS", icon: "☁️" },
              { name: "HubSpot", icon: "🎯" },
              { name: "Zendesk", icon: "🎧" },
              { name: "Instagram", icon: "📸" }
            ].map((integration, index) => (
              <div key={index} className="text-center p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors">
                <div className="text-3xl mb-2">{integration.icon}</div>
                <h4 className="text-white font-semibold text-sm">{integration.name}</h4>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[#A0A0A0] mb-6">
              Plus 500+ more integrations through our API and webhook system
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-[#9B51E0] text-white px-8 py-3 rounded-lg hover:bg-[#8A47D0] transition-colors font-semibold"
            >
              Explore All Integrations
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#9B51E0] to-[#00AEEF]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Launch Your Store?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of businesses already selling successfully with Sell Us Genie™. 
            Start your 14-day free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-[#9B51E0] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
            >
              Start Free Trial - Launch in 60 Seconds
            </button>
            <button 
              onClick={() => navigate('/#pricing')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-semibold text-lg"
            >
              View Pricing Plans
            </button>
          </div>
          <p className="text-sm text-white/80 mt-6">
            ✓ 14-day free trial ✓ No setup fees ✓ Cancel anytime ✓ 24/7 support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E1E1E] border-t border-[#2A2A2A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <GenieMascot mood="happy" size="sm" showBackground={true} />
                <span className="text-xl font-bold text-[#9B51E0]">Sell Us Genie™</span>
              </div>
              <p className="text-xs text-[#A0A0A0] italic mb-4">Where wishes are real!</p>
              <p className="text-[#A0A0A0] text-sm">
                The complete e-commerce platform for modern businesses. Launch faster, sell more, grow unlimited.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#A0A0A0]">
                <li><button onClick={() => navigate('/features')} className="hover:text-[#9B51E0] transition-colors">Features</button></li>
                <li><button onClick={() => navigate('/#pricing')} className="hover:text-[#9B51E0] transition-colors">Pricing</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-[#9B51E0] transition-colors">Get Started</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-[#A0A0A0]">
                <li><a href="#" className="hover:text-[#9B51E0] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#9B51E0] transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-[#9B51E0] transition-colors">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#A0A0A0]">
                <li><a href="#" className="hover:text-[#9B51E0] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#9B51E0] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#9B51E0] transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2A2A2A] mt-8 pt-8 text-center">
            <p className="text-[#A0A0A0] text-sm">
              © 2025 Sell Us Genie™. All rights reserved. Built with ❤️ for entrepreneurs worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default FeaturesPage