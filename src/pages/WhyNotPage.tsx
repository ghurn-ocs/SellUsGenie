import React from 'react'
import { useLocation } from 'wouter'
import { GenieMascot } from '../components/ui/GenieMascot'
import { useAuth } from '../contexts/AuthContext'

const WhyNotPage: React.FC = () => {
  const [, navigate] = useLocation()
  const { signInWithGoogle } = useAuth()

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
              <GenieMascot mood="mischievous" size="md" showBackground={true} />
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
              <button onClick={() => navigate('/features')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors border border-[#9B51E0] px-3 py-1.5 rounded-lg hover:bg-[#9B51E0]/10">Features</button>
              <button onClick={() => navigate('/#pricing')} className="text-[#E0E0E0] hover:text-[#9B51E0] transition-colors border border-[#9B51E0] px-3 py-1.5 rounded-lg hover:bg-[#9B51E0]/10">Pricing</button>
              <span className="text-[#9B51E0] font-semibold border border-[#9B51E0] px-3 py-1.5 rounded-lg bg-[#9B51E0]/10">Why Not Others?</span>
              <button 
                onClick={handleGetStarted}
                className="bg-[#9B51E0] text-white px-4 py-2 rounded-lg hover:bg-[#8A47D0] transition-colors font-medium"
              >
                Escape the Madness
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            E-commerce <span className="text-red-500">Horror Stories</span> & 
            <br />Why We Built Something <span className="text-[#9B51E0]">Better</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#E0E0E0] mb-8 max-w-4xl mx-auto leading-relaxed">
            Tired of platform nightmares? We've heard every sob story. Here's why thousands of merchants 
            fled their old platforms faster than customers abandon shopping carts.
          </p>
          <div className="inline-flex items-center bg-red-500/20 text-red-400 px-6 py-3 rounded-lg mb-8">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-semibold">Warning: Contains real merchant trauma. Side effects may include switching platforms.</span>
          </div>
        </div>
      </section>

      {/* Horror Stories */}
      <section className="py-20 bg-[#2A2A2A] border-t border-[#3A3A3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              🎭 The Hall of <span className="text-red-500">E-commerce Horrors</span>
            </h2>
            <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              Real stories from merchants who escaped the clutches of legacy platforms. Names changed to protect the traumatized.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Shopify Nightmares */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="text-2xl font-bold text-white">The $300/Month Surprise</h3>
              </div>
              <p className="text-[#A0A0A0] mb-4 italic">
                "Started with Shopify's $29 plan. Seemed reasonable, right? WRONG. Add apps for email marketing ($30), 
                abandoned cart recovery ($20), advanced analytics ($40), inventory management ($35), customer reviews ($15), 
                SEO tools ($25), live chat ($29), subscription billing ($99)... suddenly I'm paying $323/month before I sell anything!"
              </p>
              <p className="text-red-400 font-semibold mb-4">- Sarah M., Fashion Retailer</p>
              <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                <p className="text-green-400 font-semibold">✅ Sell Us Genie™ Solution:</p>
                <p className="text-[#E0E0E0] text-sm">
                  Everything included from day one. No app marketplace gouging. No surprise bills. 
                  One price, unlimited features. Sarah now saves $2,500+ annually.
                </p>
              </div>
            </div>

            {/* WooCommerce Woes */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border-l-4 border-orange-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-2xl font-bold text-white">The "Free" WordPress Trap</h3>
              </div>
              <p className="text-[#A0A0A0] mb-4 italic">
                "WooCommerce is free, they said! Just install it yourself, they said! 6 months later: 
                $3,000 in developer fees, site crashes every Black Friday, security breaches, 
                plugin conflicts, and I still can't get the checkout to work properly on mobile. 
                'Free' cost me $10,000 in lost sales."
              </p>
              <p className="text-orange-400 font-semibold mb-4">- Mike T., Electronics Store</p>
              <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                <p className="text-green-400 font-semibold">✅ Sell Us Genie™ Solution:</p>
                <p className="text-[#E0E0E0] text-sm">
                  Fully managed, enterprise-grade infrastructure. Auto-scaling for traffic spikes. 
                  No plugins to break. No security headaches. Mike launched in 60 seconds and handles 10x traffic.
                </p>
              </div>
            </div>

            {/* BigCommerce Blunders */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="text-2xl font-bold text-white">The Corporate Complexity</h3>
              </div>
              <p className="text-[#A0A0A0] mb-4 italic">
                "BigCommerce seemed professional until I needed to customize anything. 
                Want to change a button color? Edit theme files. Add a custom field? Hire a developer. 
                Create multiple stores? Pay enterprise prices. Simple changes took weeks and cost thousands."
              </p>
              <p className="text-blue-400 font-semibold mb-4">- Lisa R., Beauty Brand</p>
              <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                <p className="text-green-400 font-semibold">✅ Sell Us Genie™ Solution:</p>
                <p className="text-[#E0E0E0] text-sm">
                  Visual page builder with drag-and-drop customization. Multiple stores included. 
                  No coding required. Lisa redesigned her entire store in one afternoon.
                </p>
              </div>
            </div>

            {/* Magento Madness */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border-l-4 border-purple-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🧙‍♂️</span>
                </div>
                <h3 className="text-2xl font-bold text-white">The Magento Maze</h3>
              </div>
              <p className="text-[#A0A0A0] mb-4 italic">
                "Chose Magento for its 'power and flexibility.' Took 8 months to launch, 
                required a full-time developer, crashed under moderate traffic, and the admin panel 
                was so complex I needed training courses. Flexible? More like impossibly complicated."
              </p>
              <p className="text-purple-400 font-semibold mb-4">- David K., Home Goods</p>
              <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                <p className="text-green-400 font-semibold">✅ Sell Us Genie™ Solution:</p>
                <p className="text-[#E0E0E0] text-sm">
                  Intuitive interface that anyone can use. Launch in 60 seconds, not 8 months. 
                  Enterprise features without enterprise complexity. David's team learned it in 10 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Big Problems Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              🔥 The Platform Problems That <span className="text-red-500">Keep Merchants Awake</span>
            </h2>
            <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              The recurring nightmares that plague every major e-commerce platform (and how we fixed them).
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Transaction Fee Torture */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">Transaction Fee Torture</h3>
              <div className="space-y-4">
                <div className="bg-red-500/20 p-3 rounded border border-red-500/30">
                  <p className="text-red-400 font-semibold text-sm">😱 The Horror:</p>
                  <p className="text-[#A0A0A0] text-sm">
                    2.9% + 30¢ per transaction on Shopify, 2.4-2.9% on Square, 2.59% on BigCommerce. 
                    Selling $100k? Kiss $2,900+ goodbye in fees alone.
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded border border-green-500/30">
                  <p className="text-green-400 font-semibold text-sm">✨ Our Magic:</p>
                  <p className="text-[#E0E0E0] text-sm">
                    Direct Stripe integration at wholesale rates. No platform markup. 
                    Keep more of YOUR money where it belongs - in your pocket.
                  </p>
                </div>
              </div>
            </div>

            {/* Template Torture */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-16 h-16 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">Template Torture</h3>
              <div className="space-y-4">
                <div className="bg-red-500/20 p-3 rounded border border-red-500/30">
                  <p className="text-red-400 font-semibold text-sm">😱 The Horror:</p>
                  <p className="text-[#A0A0A0] text-sm">
                    $300+ for premium themes that look like everyone else's store. 
                    Want customization? That'll be $150/hour for a developer.
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded border border-green-500/30">
                  <p className="text-green-400 font-semibold text-sm">✨ Our Magic:</p>
                  <p className="text-[#E0E0E0] text-sm">
                    Professional drag-and-drop page builder included. Unlimited customization. 
                    No coding, no developers, no extra fees. Be unique, not basic.
                  </p>
                </div>
              </div>
            </div>

            {/* App Addiction */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">App Addiction Agony</h3>
              <div className="space-y-4">
                <div className="bg-red-500/20 p-3 rounded border border-red-500/30">
                  <p className="text-red-400 font-semibold text-sm">😱 The Horror:</p>
                  <p className="text-[#A0A0A0] text-sm">
                    Need email marketing? $30/month app. Analytics? $40 app. Reviews? $15 app. 
                    Soon you're paying more for apps than hosting.
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded border border-green-500/30">
                  <p className="text-green-400 font-semibold text-sm">✨ Our Magic:</p>
                  <p className="text-[#E0E0E0] text-sm">
                    Everything built-in from day one. Email marketing, analytics, reviews, 
                    SEO tools, inventory management - all included, forever.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Suffering */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎧</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">Support Suffering</h3>
              <div className="space-y-4">
                <div className="bg-red-500/20 p-3 rounded border border-red-500/30">
                  <p className="text-red-400 font-semibold text-sm">😱 The Horror:</p>
                  <p className="text-[#A0A0A0] text-sm">
                    "Have you tried turning it off and on again?" 3-day response times. 
                    Forum posts with no solutions. Enterprise support only for enterprise prices.
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded border border-green-500/30">
                  <p className="text-green-400 font-semibold text-sm">✨ Our Magic:</p>
                  <p className="text-[#E0E0E0] text-sm">
                    Real humans who actually help. Same-day responses. 
                    We fix problems, not shuffle you between departments.
                  </p>
                </div>
              </div>
            </div>

            {/* Multi-Store Misery */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏪</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">Multi-Store Misery</h3>
              <div className="space-y-4">
                <div className="bg-red-500/20 p-3 rounded border border-red-500/30">
                  <p className="text-red-400 font-semibold text-sm">😱 The Horror:</p>
                  <p className="text-[#A0A0A0] text-sm">
                    Want 3 stores? Pay 3x the price. Separate logins, separate billing, 
                    separate headaches. No unified dashboard or analytics.
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded border border-green-500/30">
                  <p className="text-green-400 font-semibold text-sm">✨ Our Magic:</p>
                  <p className="text-[#E0E0E0] text-sm">
                    Unlimited stores, one account, one price. Unified dashboard with 
                    cross-store analytics. Scale without the price scaling.
                  </p>
                </div>
              </div>
            </div>

            {/* Launch Time Lunacy */}
            <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A]">
              <div className="w-16 h-16 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏰</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 text-center">Launch Time Lunacy</h3>
              <div className="space-y-4">
                <div className="bg-red-500/20 p-3 rounded border border-red-500/30">
                  <p className="text-red-400 font-semibold text-sm">😱 The Horror:</p>
                  <p className="text-[#A0A0A0] text-sm">
                    6 months to launch with developers. Countless revisions. 
                    Budget overruns. By launch time, competitors have captured your market.
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded border border-green-500/30">
                  <p className="text-green-400 font-semibold text-sm">✨ Our Magic:</p>
                  <p className="text-[#E0E0E0] text-sm">
                    Sign in with Google, store goes live in 60 seconds. 
                    Strike while the market is hot. First-mover advantage? Yours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Calculator of Doom */}
      <section className="py-20 bg-[#2A2A2A] border-t border-[#3A3A3A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            💸 The True Cost <span className="text-red-500">Calculator of Doom</span>
          </h2>
          <p className="text-xl text-[#E0E0E0] mb-12">
            What other platforms ACTUALLY cost vs. what we cost. Math doesn't lie.
          </p>

          <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
            <h3 className="text-2xl font-bold text-white mb-8">Annual Cost Comparison (Medium Business - $500k Revenue)</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Other Platforms */}
              <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
                <h4 className="text-xl font-bold text-red-400 mb-4">💀 "Other Guys" Reality Check</h4>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Platform subscription (Advanced)</span>
                    <span>$3,588</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Transaction fees (2.9%)</span>
                    <span>$14,500</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Premium theme</span>
                    <span>$350</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Essential apps (10 apps)</span>
                    <span>$3,600</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Developer customizations</span>
                    <span>$5,000</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Support incidents</span>
                    <span>$1,200</span>
                  </div>
                  <div className="border-t border-red-500/30 pt-2 mt-4">
                    <div className="flex justify-between text-red-400 font-bold text-xl">
                      <span>Total Annual Cost:</span>
                      <span>$28,238</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sell Us Genie */}
              <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
                <h4 className="text-xl font-bold text-green-400 mb-4">✨ Sell Us Genie™ Reality</h4>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Platform subscription (Pro)</span>
                    <span>$1,188</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Transaction fees (Direct Stripe)</span>
                    <span>$12,200</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Themes & templates</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Apps & extensions</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Developer customizations</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Support (24/7 included)</span>
                    <span>$0</span>
                  </div>
                  <div className="border-t border-green-500/30 pt-2 mt-4">
                    <div className="flex justify-between text-green-400 font-bold text-xl">
                      <span>Total Annual Cost:</span>
                      <span>$13,388</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-[#9B51E0]/20 rounded-lg border border-[#9B51E0]/30">
              <p className="text-[#9B51E0] font-bold text-2xl">💰 You Save: $14,850 Annually</p>
              <p className="text-[#E0E0E0] text-sm mt-2">
                That's enough for a nice vacation, new inventory, or actual marketing instead of platform fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              😌 The <span className="text-green-400">Happy Ending</span> Stories
            </h2>
            <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto">
              Meet the merchants who escaped platform purgatory and found e-commerce paradise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#2A2A2A] rounded-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🚀</span>
                <h3 className="text-lg font-bold text-white">Emma's Electronics Empire</h3>
              </div>
              <p className="text-[#A0A0A0] text-sm mb-4 italic">
                "Migrated from Shopify after paying $400/month in apps. 
                Launched 3 new stores in one day with Sell Us Genie™. 
                Same features, fraction of the cost. My accountant literally cheered."
              </p>
              <div className="text-green-400 text-sm font-semibold">
                💰 Savings: $4,200/year  📈 Growth: +340%
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">⚡</span>
                <h3 className="text-lg font-bold text-white">Marcus's Marketplace Magic</h3>
              </div>
              <p className="text-[#A0A0A0] text-sm mb-4 italic">
                "WooCommerce crashed every weekend. Lost thousands in sales. 
                Sell Us Genie™ handles Black Friday traffic like it's Tuesday. 
                No crashes, no stress, just sales."
              </p>
              <div className="text-blue-400 text-sm font-semibold">
                🛡️ Uptime: 99.99%  💸 Lost sales: $0
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🎯</span>
                <h3 className="text-lg font-bold text-white">Luna's Launch Lightning</h3>
              </div>
              <p className="text-[#A0A0A0] text-sm mb-4 italic">
                "BigCommerce project took 4 months and $10k. 
                Launched my new jewelry store with Sell Us Genie™ in 
                literally 2 minutes. Same features, better design."
              </p>
              <div className="text-purple-400 text-sm font-semibold">
                ⏱️ Launch time: 2 minutes  💰 Dev costs: $0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-[#9B51E0] to-[#00AEEF]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            🆘 Escape Platform Purgatory Today
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Don't be another horror story. Join thousands of merchants who chose sanity, 
            savings, and success with Sell Us Genie™. Your future self will thank you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-[#9B51E0] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
            >
              🏃‍♂️ Escape Now - Free Trial
            </button>
            <button 
              onClick={() => navigate('/#pricing')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-semibold text-lg"
            >
              💰 See Pricing (Spoiler: It's Fair)
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-white/80">
            <div>
              <div className="font-bold text-white">60 Seconds</div>
              <div>To Launch</div>
            </div>
            <div>
              <div className="font-bold text-white">$0</div>
              <div>Hidden Fees</div>
            </div>
            <div>
              <div className="font-bold text-white">24/7</div>
              <div>Real Support</div>
            </div>
            <div>
              <div className="font-bold text-white">∞</div>
              <div>Features Included</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E1E1E] border-t border-[#2A2A2A] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <GenieMascot mood="happy" size="sm" showBackground={true} />
            <span className="text-xl font-bold text-[#9B51E0]">Sell Us Genie™</span>
          </div>
          <p className="text-xs text-[#A0A0A0] italic mb-4">Where wishes are real!</p>
          <p className="text-[#A0A0A0] text-sm mb-4">
            Saving merchants from platform nightmares since 2024. 
            Side effects include increased profits, better sleep, and platform PTSD recovery.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-[#A0A0A0]">
            <button onClick={() => navigate('/')} className="hover:text-[#9B51E0] transition-colors">Home</button>
            <button onClick={() => navigate('/features')} className="hover:text-[#9B51E0] transition-colors">Features</button>
            <button onClick={() => navigate('/#pricing')} className="hover:text-[#9B51E0] transition-colors">Pricing</button>
            <span className="text-[#666]">|</span>
            <span>© 2024 Platform Trauma Recovery Center</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default WhyNotPage