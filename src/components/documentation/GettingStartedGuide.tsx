import React from 'react'
import { GenieMascot } from '../ui/GenieMascot'

interface GettingStartedGuideProps {}

const GettingStartedGuide: React.FC<GettingStartedGuideProps> = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#1E1E1E] text-white">
      <div className="mb-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-[#9B51E0] hover:text-[#A051E0] transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Help
        </button>
        
        <div className="flex items-center mb-4">
          <GenieMascot mood="happy" size="lg" className="mr-4" />
          <h1 className="text-3xl font-bold">Getting Started Guide</h1>
        </div>
        <p className="text-[#A0A0A0] text-lg">
          Learn how to set up your StreamSell store and start selling online in just a few simple steps.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <section className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-[#9B51E0] rounded-full flex items-center justify-center text-white font-bold mr-3">
              1
            </div>
            <h2 className="text-xl font-semibold">Account Setup & Store Creation</h2>
          </div>
          
          <div className="ml-11 space-y-4">
            <p className="text-[#A0A0A0]">
              Your account is already set up! Now let's make sure your store is properly configured.
            </p>
            
            <div className="bg-[#1E1E1E] rounded-lg p-4">
              <h3 className="font-medium mb-2">What you've completed:</h3>
              <ul className="text-sm text-[#A0A0A0] space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Created your StreamSell account
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verified your email address
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set up your store name and URL
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-[#9B51E0] rounded-full flex items-center justify-center text-white font-bold mr-3">
              2
            </div>
            <h2 className="text-xl font-semibold">Adding Your First Products</h2>
          </div>
          
          <div className="ml-11 space-y-4">
            <p className="text-[#A0A0A0]">
              Products are the heart of your store. Here's how to add them effectively:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <h3 className="font-medium mb-2 text-[#9B51E0]">Product Information</h3>
                <ul className="text-sm text-[#A0A0A0] space-y-1">
                  <li>• Clear, descriptive product name</li>
                  <li>• Detailed description highlighting benefits</li>
                  <li>• Competitive pricing strategy</li>
                  <li>• Accurate inventory quantities</li>
                  <li>• Product categories and tags</li>
                </ul>
              </div>
              
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <h3 className="font-medium mb-2 text-[#9B51E0]">Image Requirements</h3>
                <ul className="text-sm text-[#A0A0A0] space-y-1">
                  <li>• Minimum 1200x1200 pixels</li>
                  <li>• High-quality, well-lit photos</li>
                  <li>• Multiple angles if applicable</li>
                  <li>• Clean, uncluttered background</li>
                  <li>• Consistent lighting and style</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-blue-400 mb-1">Pro Tip</p>
                  <p className="text-sm text-[#A0A0A0]">
                    Start with 3-5 products to test your store setup. You can always add more later. Focus on products you're passionate about and know well.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-[#9B51E0] rounded-full flex items-center justify-center text-white font-bold mr-3">
              3
            </div>
            <h2 className="text-xl font-semibold">Payment Processing Setup</h2>
          </div>
          
          <div className="ml-11 space-y-4">
            <p className="text-[#A0A0A0]">
              Configure Stripe to accept payments securely from your customers.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-[#9B51E0] text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Create a Stripe Account</p>
                  <p className="text-sm text-[#A0A0A0]">Visit stripe.com and create a business account if you don't have one.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-[#9B51E0] text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Get Your API Keys</p>
                  <p className="text-sm text-[#A0A0A0]">Navigate to Developers → API Keys in your Stripe dashboard.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-[#9B51E0] text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Connect to StreamSell</p>
                  <p className="text-sm text-[#A0A0A0]">Go to Settings → Payment Processing and enter your Stripe keys.</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-400 mb-1">Important</p>
                  <p className="text-sm text-[#A0A0A0]">
                    Use test keys during setup and switch to live keys when you're ready to accept real payments. Never share your secret keys publicly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4 */}
        <section className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-[#9B51E0] rounded-full flex items-center justify-center text-white font-bold mr-3">
              4
            </div>
            <h2 className="text-xl font-semibold">Customizing Your Store</h2>
          </div>
          
          <div className="ml-11 space-y-4">
            <p className="text-[#A0A0A0]">
              Make your store unique and reflect your brand with our Page Builder tools.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <h3 className="font-medium mb-2 text-green-400">Branding</h3>
                <ul className="text-sm text-[#A0A0A0] space-y-1">
                  <li>• Upload your logo</li>
                  <li>• Choose brand colors</li>
                  <li>• Set custom fonts</li>
                  <li>• Add your tagline</li>
                </ul>
              </div>
              
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <h3 className="font-medium mb-2 text-blue-400">Layout</h3>
                <ul className="text-sm text-[#A0A0A0] space-y-1">
                  <li>• Arrange page sections</li>
                  <li>• Add custom content blocks</li>
                  <li>• Configure navigation</li>
                  <li>• Set featured products</li>
                </ul>
              </div>
              
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <h3 className="font-medium mb-2 text-purple-400">Content</h3>
                <ul className="text-sm text-[#A0A0A0] space-y-1">
                  <li>• Write compelling copy</li>
                  <li>• Add product highlights</li>
                  <li>• Include testimonials</li>
                  <li>• Set up contact info</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-[#9B51E0] rounded-full flex items-center justify-center text-white font-bold mr-3">
              5
            </div>
            <h2 className="text-xl font-semibold">Going Live & Making Sales</h2>
          </div>
          
          <div className="ml-11 space-y-4">
            <p className="text-[#A0A0A0]">
              Your store is ready! Here's how to drive traffic and make your first sales.
            </p>
            
            <div className="space-y-4">
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <h3 className="font-medium mb-2 text-[#9B51E0]">Marketing Strategies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#A0A0A0]">
                  <div>
                    <p className="font-medium text-white mb-1">Social Media</p>
                    <ul className="space-y-1">
                      <li>• Share on Instagram, Facebook, Twitter</li>
                      <li>• Create product showcase posts</li>
                      <li>• Use relevant hashtags</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Direct Outreach</p>
                    <ul className="space-y-1">
                      <li>• Email friends and family</li>
                      <li>• Share in relevant communities</li>
                      <li>• Ask for initial feedback</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1E1E1E] rounded-lg p-4">
                <h3 className="font-medium mb-2 text-[#9B51E0]">Order Management</h3>
                <p className="text-sm text-[#A0A0A0] mb-2">When orders start coming in:</p>
                <ul className="text-sm text-[#A0A0A0] space-y-1">
                  <li>• Check the Orders tab regularly</li>
                  <li>• Update order status as you fulfill them</li>
                  <li>• Communicate with customers about shipping</li>
                  <li>• Use the Analytics tab to track performance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-r from-[#9B51E0]/10 to-[#00AEEF]/10 rounded-lg border border-[#9B51E0]/20 p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#9B51E0]">🎉 Congratulations!</h2>
          <p className="text-[#A0A0A0] mb-4">
            You now have all the knowledge needed to run a successful online store. Remember, success takes time and persistence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-white mb-2">Need More Help?</h3>
              <ul className="text-sm text-[#A0A0A0] space-y-1">
                <li>• Check our FAQ section</li>
                <li>• Watch our video tutorials</li>
                <li>• Contact our support team</li>
                <li>• Join our community forum</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Keep Learning</h3>
              <ul className="text-sm text-[#A0A0A0] space-y-1">
                <li>• Monitor your analytics regularly</li>
                <li>• Experiment with pricing</li>
                <li>• Gather customer feedback</li>
                <li>• Stay updated with new features</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default GettingStartedGuide