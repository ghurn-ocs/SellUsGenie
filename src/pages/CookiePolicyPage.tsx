import React from 'react'
import { useLocation } from 'wouter'
import { Cookie, Settings, Shield, BarChart3, Mail, Info } from 'lucide-react'
import { GenieMascot } from '../components/ui/GenieMascot'

interface CookiePolicyPageProps {}

const CookiePolicyPage: React.FC<CookiePolicyPageProps> = () => {
  const [, navigate] = useLocation()

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#3A3A3A] bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="flex items-center space-x-2">
                <GenieMascot mood="happy" className="w-8 h-8" />
                <span className="text-xl font-bold text-[#9B51E0]">Sell Us Genie™</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/contact')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors">Contact</button>
              <button onClick={() => navigate('/')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors">Back to Home</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#9B51E0]/20 rounded-full flex items-center justify-center">
              <Cookie className="w-8 h-8 text-[#9B51E0]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
          <p className="text-[#A0A0A0] text-lg">Last updated: August 18, 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-[#1E1E1E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
              <p className="text-[#A0A0A0] leading-relaxed">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, keeping you signed in, and understanding how you use our service.
              </p>
              <p className="text-[#A0A0A0] leading-relaxed mt-4">
                This Cookie Policy explains what cookies we use, why we use them, and how you can control them when using Sell Us Genie™, operated by Omni Cyber Solutions LLC.
              </p>
            </div>

            {/* Types of Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Types of Cookies We Use
              </h2>
              
              <div className="space-y-6">
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center mb-3">
                    <Shield className="w-6 h-6 text-green-400 mr-2" />
                    <h3 className="text-xl font-semibold text-white">Essential Cookies</h3>
                    <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">Required</span>
                  </div>
                  <p className="text-[#A0A0A0] mb-3">These cookies are necessary for the basic functionality of our website:</p>
                  <ul className="text-[#A0A0A0] space-y-1 text-sm">
                    <li>• User authentication and session management</li>
                    <li>• Security and fraud prevention</li>
                    <li>• Shopping cart functionality</li>
                    <li>• Site navigation and core features</li>
                    <li>• Load balancing and performance optimization</li>
                  </ul>
                  <p className="text-[#A0A0A0] text-sm mt-3">
                    <strong>Duration:</strong> Session cookies (deleted when you close your browser) or up to 30 days for persistent cookies
                  </p>
                </div>

                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center mb-3">
                    <Settings className="w-6 h-6 text-blue-400 mr-2" />
                    <h3 className="text-xl font-semibold text-white">Functional Cookies</h3>
                    <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Optional</span>
                  </div>
                  <p className="text-[#A0A0A0] mb-3">These cookies enhance your experience by remembering your preferences:</p>
                  <ul className="text-[#A0A0A0] space-y-1 text-sm">
                    <li>• Language and region preferences</li>
                    <li>• Theme and display settings</li>
                    <li>• Store selection and favorites</li>
                    <li>• Form data and user inputs</li>
                    <li>• Dashboard layout preferences</li>
                  </ul>
                  <p className="text-[#A0A0A0] text-sm mt-3">
                    <strong>Duration:</strong> Up to 1 year
                  </p>
                </div>

                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="w-6 h-6 text-orange-400 mr-2" />
                    <h3 className="text-xl font-semibold text-white">Analytics Cookies</h3>
                    <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full">Optional</span>
                  </div>
                  <p className="text-[#A0A0A0] mb-3">These cookies help us understand how you use our service:</p>
                  <ul className="text-[#A0A0A0] space-y-1 text-sm">
                    <li>• Page views and user journeys</li>
                    <li>• Feature usage and performance metrics</li>
                    <li>• Error tracking and debugging</li>
                    <li>• A/B testing and optimization</li>
                    <li>• Aggregated usage statistics</li>
                  </ul>
                  <p className="text-[#A0A0A0] text-sm mt-3">
                    <strong>Duration:</strong> Up to 2 years
                  </p>
                  <p className="text-[#A0A0A0] text-xs mt-2">
                    <strong>Note:</strong> All analytics data is anonymized and cannot be used to identify individual users.
                  </p>
                </div>
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
              <p className="text-[#A0A0A0] mb-4">We work with trusted third-party services that may also set cookies:</p>
              
              <div className="space-y-4">
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Stripe (Payment Processing)</h3>
                  <p className="text-[#A0A0A0] text-sm">
                    Essential for secure payment processing and fraud detection. These cookies are necessary for checkout functionality.
                  </p>
                </div>

                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Google OAuth (Authentication)</h3>
                  <p className="text-[#A0A0A0] text-sm">
                    Required for Google sign-in functionality. Only used when you choose to authenticate with Google.
                  </p>
                </div>

                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Apple OAuth (Authentication)</h3>
                  <p className="text-[#A0A0A0] text-sm">
                    Required for Apple sign-in functionality. Only used when you choose to authenticate with Apple ID.
                  </p>
                </div>
              </div>
            </div>

            {/* Cookie Management */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Managing Your Cookie Preferences</h2>
              
              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Cookie Consent</h3>
                <p className="text-[#A0A0A0] mb-4">
                  When you first visit our website, you'll see a cookie consent banner with the following options:
                </p>
                <ul className="text-[#A0A0A0] space-y-2">
                  <li>• <strong className="text-white">Accept All:</strong> Allows all cookies including optional analytics and functional cookies</li>
                  <li>• <strong className="text-white">Essential Only:</strong> Only allows essential cookies required for basic functionality</li>
                  <li>• <strong className="text-white">Customize:</strong> Choose which types of cookies you want to allow</li>
                </ul>
              </div>

              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Browser Settings</h3>
                <p className="text-[#A0A0A0] mb-4">You can also manage cookies through your browser settings:</p>
                <ul className="text-[#A0A0A0] space-y-2">
                  <li>• <strong className="text-white">Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                  <li>• <strong className="text-white">Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li>• <strong className="text-white">Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li>• <strong className="text-white">Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
                <p className="text-[#A0A0A0] text-sm mt-4">
                  <strong>Note:</strong> Disabling essential cookies may prevent you from using certain features of our service.
                </p>
              </div>

              <div className="bg-[#9B51E0]/10 border border-[#9B51E0]/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Update Your Preferences</h3>
                <p className="text-[#A0A0A0] mb-4">
                  You can change your cookie preferences at any time by:
                </p>
                <ul className="text-[#A0A0A0] space-y-2 mb-4">
                  <li>• Clicking the "Cookie Settings" link in our website footer</li>
                  <li>• Accessing your account privacy settings</li>
                  <li>• Contacting our privacy team at Privacy@SellUsGenie.com</li>
                </ul>
                <button className="bg-[#9B51E0] text-white px-6 py-2 rounded-lg hover:bg-[#8A47D0] transition-colors font-medium">
                  Manage Cookie Preferences
                </button>
              </div>
            </div>

            {/* Impact of Disabling Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Info className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Impact of Disabling Cookies
              </h2>
              
              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <h3 className="text-lg font-semibold text-white mb-3">If you disable cookies, you may experience:</h3>
                <ul className="text-[#A0A0A0] space-y-2">
                  <li>• <strong className="text-white">Essential Cookies Disabled:</strong> Unable to sign in, checkout, or access core features</li>
                  <li>• <strong className="text-white">Functional Cookies Disabled:</strong> Need to re-enter preferences on each visit</li>
                  <li>• <strong className="text-white">Analytics Cookies Disabled:</strong> We can't improve our service based on usage patterns</li>
                </ul>
                <p className="text-[#A0A0A0] mt-4 text-sm">
                  We respect your privacy choices and strive to provide the best possible experience regardless of your cookie settings.
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Cookie Data Retention</h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-[#3A3A3A] rounded-lg">
                  <thead className="bg-[#2A2A2A]">
                    <tr>
                      <th className="text-left p-4 text-white border-b border-[#3A3A3A]">Cookie Type</th>
                      <th className="text-left p-4 text-white border-b border-[#3A3A3A]">Retention Period</th>
                      <th className="text-left p-4 text-white border-b border-[#3A3A3A]">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#3A3A3A]">
                      <td className="p-4 text-[#A0A0A0]">Session</td>
                      <td className="p-4 text-[#A0A0A0]">Until browser closes</td>
                      <td className="p-4 text-[#A0A0A0]">Authentication, security</td>
                    </tr>
                    <tr className="border-b border-[#3A3A3A]">
                      <td className="p-4 text-[#A0A0A0]">Authentication</td>
                      <td className="p-4 text-[#A0A0A0]">30 days</td>
                      <td className="p-4 text-[#A0A0A0]">Keep you signed in</td>
                    </tr>
                    <tr className="border-b border-[#3A3A3A]">
                      <td className="p-4 text-[#A0A0A0]">Preferences</td>
                      <td className="p-4 text-[#A0A0A0]">1 year</td>
                      <td className="p-4 text-[#A0A0A0]">Remember your settings</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[#A0A0A0]">Analytics</td>
                      <td className="p-4 text-[#A0A0A0]">2 years</td>
                      <td className="p-4 text-[#A0A0A0]">Usage statistics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Updates to Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
              <p className="text-[#A0A0A0] mb-4">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices. When we make material changes, we will:
              </p>
              <ul className="text-[#A0A0A0] space-y-2">
                <li>• Update the "Last updated" date at the top of this policy</li>
                <li>• Display a notification banner on our website</li>
                <li>• Send email notifications for significant changes</li>
                <li>• Request renewed consent where required by law</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-[#9B51E0]" />
                Questions About Cookies?
              </h2>
              <p className="text-[#A0A0A0] mb-4">If you have any questions about our use of cookies or this Cookie Policy, please contact us:</p>
              <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                <h3 className="text-white font-semibold mb-4">Privacy Team</h3>
                <p className="text-[#A0A0A0]">Email: <a href="mailto:Privacy@SellUsGenie.com" className="text-[#9B51E0] hover:text-[#8A47D0]">Privacy@SellUsGenie.com</a></p>
                <p className="text-[#A0A0A0]">Company: Omni Cyber Solutions LLC</p>
                <p className="text-[#A0A0A0]">Location: United States of America</p>
              </div>
              
              <div className="mt-6 p-4 bg-[#9B51E0]/10 border border-[#9B51E0]/20 rounded-lg">
                <p className="text-[#E0E0E0] text-sm">
                  <strong>Response Time:</strong> We aim to respond to all cookie and privacy inquiries within 72 hours.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#3A3A3A] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GenieMascot mood="happy" className="w-6 h-6" />
              <span className="text-[#9B51E0] font-bold">Sell Us Genie™</span>
              <span className="text-[#A0A0A0]">© 2024 Omni Cyber Solutions LLC</span>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => navigate('/')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">Home</button>
              <button onClick={() => navigate('/privacy')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">Privacy</button>
              <button onClick={() => navigate('/terms')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">Terms</button>
              <button onClick={() => navigate('/contact')} className="text-[#A0A0A0] hover:text-[#9B51E0] transition-colors text-sm">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CookiePolicyPage