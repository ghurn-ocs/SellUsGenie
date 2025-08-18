import React, { useState, useEffect } from 'react'
import { Cookie, Settings, Shield, BarChart3, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

interface CookieConsentProps {}

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
}

const CookieConsent: React.FC<CookieConsentProps> = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    functional: false,
    analytics: false
  })

  useEffect(() => {
    // Check if user has already made a cookie consent decision
    const consentGiven = localStorage.getItem('cookieConsent')
    if (!consentGiven) {
      // Show banner after a short delay to avoid flash
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const allPreferences = {
      essential: true,
      functional: true,
      analytics: true
    }
    savePreferences(allPreferences)
    setShowBanner(false)
  }

  const handleEssentialOnly = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false
    }
    savePreferences(essentialOnly)
    setShowBanner(false)
  }

  const handleCustomize = () => {
    setShowCustomize(true)
  }

  const handleSaveCustom = () => {
    savePreferences(preferences)
    setShowCustomize(false)
    setShowBanner(false)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      timestamp: new Date().toISOString(),
      preferences: prefs
    }))
    
    // Here you would typically initialize your analytics tools based on preferences
    if (prefs.analytics) {
      console.log('Analytics cookies enabled')
      // Initialize analytics
    }
    
    if (prefs.functional) {
      console.log('Functional cookies enabled')
      // Initialize functional features
    }
    
    console.log('Cookie preferences saved:', prefs)
  }

  const handlePreferenceChange = (type: keyof CookiePreferences, enabled: boolean) => {
    if (type === 'essential') return // Essential cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [type]: enabled
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E1E1E] border-t border-[#3A3A3A] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-[#9B51E0]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Cookie Preferences</h3>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">
                  We use cookies to enhance your experience, provide essential functionality, and analyze usage. 
                  You can customize your preferences or accept all cookies to continue.
                  <button 
                    onClick={() => window.open('/cookies', '_blank')}
                    className="text-[#9B51E0] hover:text-[#8A47D0] ml-1 underline"
                  >
                    Learn more
                  </button>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <button
                onClick={handleEssentialOnly}
                className="px-4 py-2 bg-[#2A2A2A] text-[#E0E0E0] border border-[#3A3A3A] rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium text-sm whitespace-nowrap"
              >
                Essential Only
              </button>
              <button
                onClick={handleCustomize}
                className="px-4 py-2 bg-[#2A2A2A] text-[#E0E0E0] border border-[#9B51E0] rounded-lg hover:bg-[#9B51E0]/10 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center"
              >
                <Settings className="w-4 h-4 mr-1" />
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#8A47D0] transition-colors font-medium text-sm whitespace-nowrap"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      <Dialog.Root open={showCustomize} onOpenChange={setShowCustomize}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-70 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-2xl font-bold text-white flex items-center">
                <Settings className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Cookie Preferences
              </Dialog.Title>
              <Dialog.Close asChild>
                <button 
                  onClick={() => setShowCustomize(false)}
                  className="text-[#A0A0A0] hover:text-white transition-colors"
                  aria-label="Close cookie preferences"
                >
                  <X className="w-6 h-6" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Essential Cookies</h3>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Always Active</span>
                </div>
                <p className="text-[#A0A0A0] text-sm mb-3">
                  These cookies are necessary for the website to function and cannot be disabled.
                </p>
                <ul className="text-[#A0A0A0] text-xs space-y-1">
                  <li>• Authentication and security</li>
                  <li>• Shopping cart functionality</li>
                  <li>• Form submissions and data validation</li>
                </ul>
              </div>

              {/* Functional Cookies */}
              <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Functional Cookies</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#3A3A3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B51E0]"></div>
                  </label>
                </div>
                <p className="text-[#A0A0A0] text-sm mb-3">
                  Remember your preferences and settings to enhance your experience.
                </p>
                <ul className="text-[#A0A0A0] text-xs space-y-1">
                  <li>• Language and region settings</li>
                  <li>• Theme and display preferences</li>
                  <li>• Dashboard layout customization</li>
                </ul>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-orange-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">Analytics Cookies</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#3A3A3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B51E0]"></div>
                  </label>
                </div>
                <p className="text-[#A0A0A0] text-sm mb-3">
                  Help us improve our service by allowing anonymous usage analytics.
                </p>
                <ul className="text-[#A0A0A0] text-xs space-y-1">
                  <li>• Page views and user journeys</li>
                  <li>• Feature usage statistics</li>
                  <li>• Performance monitoring (anonymized)</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-[#3A3A3A]">
              <button
                onClick={() => setShowCustomize(false)}
                className="px-4 py-2 text-[#A0A0A0] bg-[#3A3A3A] rounded-lg hover:bg-[#4A4A4A] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-6 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#8A47D0] transition-colors font-medium"
              >
                Save Preferences
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

export default CookieConsent