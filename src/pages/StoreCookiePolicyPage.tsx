/**
 * Store-specific Cookie Policy Page
 * Shows cookie policy information specific to each individual store
 */

import React from 'react'
import { useRoute } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Cookie, Shield, BarChart3, Settings, Building2 } from 'lucide-react'

interface Store {
  id: string
  store_name: string
  store_slug: string
  store_address_line1?: string
  store_city?: string
  store_state?: string
  store_country?: string
}

const StoreCookiePolicyPage: React.FC = () => {
  const [match, params] = useRoute('/store/:storeSlug/cookies')
  const storeSlug = params?.storeSlug

  // Fetch store information
  const { data: store, isLoading, error } = useQuery({
    queryKey: ['store-info', storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null
      
      const { data, error } = await supabase
        .from('stores')
        .select('id, store_name, store_slug, store_address_line1, store_city, store_state, store_country')
        .eq('store_slug', storeSlug)
        .eq('is_active', true)
        .single()

      if (error) {
        throw new Error('Store not found')
      }

      return data as Store
    },
    enabled: !!storeSlug
  })

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cookie policy...</p>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600">The requested store could not be found.</p>
        </div>
      </div>
    )
  }

  const storeLocation = [store.store_city, store.store_state, store.store_country]
    .filter(Boolean)
    .join(', ') || 'our location'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Cookie className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
              <p className="text-lg text-gray-600 flex items-center mt-1">
                <Building2 className="w-4 h-4 mr-2" />
                {store.store_name}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {currentDate}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              This Cookie Policy explains how <strong>{store.store_name}</strong> ("we", "us", or "our") uses cookies and similar 
              technologies when you visit our online store. This policy helps you understand what cookies are, how we use them, 
              the types of cookies we use, and how you can control your cookie preferences.
            </p>
          </section>

          {/* What are cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit our website. 
              They help us provide you with a better shopping experience by remembering your preferences and enabling essential 
              functionality of our online store.
            </p>
          </section>

          {/* Types of cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800">Essential Cookies</h3>
                  <span className="ml-auto px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Always Active</span>
                </div>
                <p className="text-green-700 mb-3">
                  These cookies are necessary for our website to function properly and cannot be disabled.
                </p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• <strong>Authentication:</strong> Keep you logged in during your shopping session</li>
                  <li>• <strong>Shopping Cart:</strong> Remember items you've added to your cart</li>
                  <li>• <strong>Security:</strong> Protect against fraud and ensure secure transactions</li>
                  <li>• <strong>Form Data:</strong> Remember information you've entered in forms</li>
                </ul>
              </div>

              {/* Functional Cookies */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Settings className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-800">Functional Cookies</h3>
                  <span className="ml-auto px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Optional</span>
                </div>
                <p className="text-blue-700 mb-3">
                  These cookies enhance your experience by remembering your preferences and settings.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• <strong>Language Preferences:</strong> Remember your preferred language</li>
                  <li>• <strong>Display Settings:</strong> Remember your preferred view (grid/list mode)</li>
                  <li>• <strong>Store Preferences:</strong> Remember your favorite products and wishlists</li>
                  <li>• <strong>Location Settings:</strong> Remember your preferred shipping address</li>
                </ul>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <BarChart3 className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-orange-800">Analytics Cookies</h3>
                  <span className="ml-auto px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">Optional</span>
                </div>
                <p className="text-orange-700 mb-3">
                  These cookies help us understand how visitors use our website so we can improve your shopping experience.
                </p>
                <ul className="text-orange-700 text-sm space-y-1">
                  <li>• <strong>Usage Analytics:</strong> Track page views and popular products (anonymized)</li>
                  <li>• <strong>Performance Monitoring:</strong> Identify and fix website issues</li>
                  <li>• <strong>Shopping Patterns:</strong> Understand customer preferences (anonymized)</li>
                  <li>• <strong>Search Analytics:</strong> Improve our product search functionality</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to manage cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have full control over your cookie preferences. You can:
            </p>
            <ul className="text-gray-700 space-y-2 mb-4">
              <li>• <strong>Accept All Cookies:</strong> Enable all cookies for the best shopping experience</li>
              <li>• <strong>Essential Only:</strong> Use only essential cookies required for basic functionality</li>
              <li>• <strong>Customize:</strong> Choose exactly which types of cookies you want to allow</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You can also manage cookies through your browser settings, though this may limit some features of our store.
            </p>
          </section>

          {/* Store-specific information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Store Information</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed">
                <strong>{store.store_name}</strong> operates from {storeLocation}. This cookie policy applies 
                specifically to our online store and the services we provide to our customers. If you have any 
                questions about our use of cookies or this policy, please contact us through our store's 
                contact information.
              </p>
            </div>
          </section>

          {/* Updates to policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
              operational, or regulatory reasons. When we make changes, we will update the "Last updated" date at 
              the top of this policy. We encourage you to review this policy periodically to stay informed about 
              how we use cookies.
            </p>
          </section>

          {/* Contact information */}
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Questions?</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Cookie Policy or our use of cookies, please contact {store.store_name} 
              through our store's contact page or customer service.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default StoreCookiePolicyPage