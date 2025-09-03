import React, { useState } from 'react'
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Star, 
  Camera, 
  Clock, 
  Gift, 
  Mail, 
  BarChart3, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Percent, 
  Award,
  Heart,
  MessageCircle,
  Globe,
  Search,
  Tag,
  Package,
  Truck,
  CreditCard,
  Shield,
  Play,
  BookOpen,
  FileText
} from 'lucide-react'
import { GenieMascot } from '../ui/GenieMascot'

interface GrowingSalesContentProps {
  onNavigateToSection?: (section: string) => void
}

export const GrowingSalesContent: React.FC<GrowingSalesContentProps> = ({ 
  onNavigateToSection 
}) => {
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null)

  // Quick Wins
  const quickWins = [
    {
      title: 'Add Customer Reviews',
      description: 'Display customer reviews on product pages to build trust',
      impact: '+15% conversion rate',
      time: '30 minutes',
      icon: Star,
      action: 'Add Reviews'
    },
    {
      title: 'Optimize Product Photos',
      description: 'Use professional, high-quality product images',
      impact: '+25% conversion rate',
      time: '2 hours',
      icon: Camera,
      action: 'Update Photos'
    },
    {
      title: 'Add Urgency Elements',
      description: 'Use countdown timers and limited-time offers',
      impact: '+20% conversion rate',
      time: '1 hour',
      icon: Clock,
      action: 'Add Urgency'
    },
    {
      title: 'Simplify Checkout',
      description: 'Reduce checkout steps and add guest checkout',
      impact: '+30% completion rate',
      time: '45 minutes',
      icon: ShoppingCart,
      action: 'Optimize Checkout'
    },
    {
      title: 'Add Trust Badges',
      description: 'Display security and trust indicators',
      impact: '+18% conversion rate',
      time: '15 minutes',
      icon: Shield,
      action: 'Add Badges'
    },
    {
      title: 'Create Product Bundles',
      description: 'Offer related products together at a discount',
      impact: '+35% average order value',
      time: '1 hour',
      icon: Package,
      action: 'Create Bundles'
    }
  ]

  // Growth Strategies
  const growthStrategies = [
    {
      id: 'conversion-optimization',
      title: 'Conversion Rate Optimization',
      subtitle: 'Turn more visitors into customers',
      icon: Target,
      impact: 'High Impact',
      difficulty: 'Medium',
      timeToImplement: '2-4 weeks',
      potentialIncrease: '+25-40%',
      description: 'Systematically improve your store to convert more visitors into paying customers.',
      strategies: [
        {
          title: 'Optimize Product Pages',
          description: 'Create compelling product pages that drive purchases',
          steps: [
            'Use high-quality, professional product photos',
            'Write benefit-focused product descriptions',
            'Add customer reviews and testimonials',
            'Include clear calls-to-action',
            'Show product availability and shipping info'
          ]
        },
        {
          title: 'Streamline Checkout Process',
          description: 'Remove friction from the purchase process',
          steps: [
            'Reduce checkout steps to minimum',
            'Add guest checkout option',
            'Show progress indicators',
            'Display security badges and trust signals',
            'Offer multiple payment methods'
          ]
        }
      ]
    },
    {
      id: 'traffic-generation',
      title: 'Traffic Generation',
      subtitle: 'Attract more potential customers',
      icon: Users,
      impact: 'High Impact',
      difficulty: 'Medium',
      timeToImplement: '4-8 weeks',
      potentialIncrease: '+50-100%',
      description: 'Increase the number of visitors to your store through multiple channels.',
      strategies: [
        {
          title: 'Search Engine Optimization (SEO)',
          description: 'Improve your store\'s visibility in search results',
          steps: [
            'Research relevant keywords for your products',
            'Optimize product titles and descriptions',
            'Create valuable content (blog posts, guides)',
            'Improve page loading speed',
            'Build quality backlinks'
          ]
        },
        {
          title: 'Social Media Marketing',
          description: 'Leverage social platforms to reach your audience',
          steps: [
            'Create engaging product posts',
            'Share customer testimonials and reviews',
            'Run targeted social media ads',
            'Engage with your audience regularly',
            'Collaborate with influencers in your niche'
          ]
        }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <GenieMascot mood="happy" size="xl" showBackground />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Grow Your Sales & Revenue</h1>
          <p className="text-lg text-[#A0A0A0] max-w-3xl mx-auto mb-8">
            Proven strategies to increase your conversion rates, attract more customers, 
            and boost your average order value. Turn your store into a revenue-generating machine.
          </p>
          
          {/* Success Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">+40%</div>
              <div className="text-sm text-[#A0A0A0]">Average Conversion Increase</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">+60%</div>
              <div className="text-sm text-[#A0A0A0]">Revenue Growth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">+35%</div>
              <div className="text-sm text-[#A0A0A0]">Average Order Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">+50%</div>
              <div className="text-sm text-[#A0A0A0]">Customer Retention</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Wins */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Zap className="w-8 h-8 text-yellow-400" />
          <span>Quick Wins (Implement Today)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickWins.map((win, index) => (
            <div key={index} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-green-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <win.icon className="w-8 h-8 text-green-400" />
                <div className="text-right">
                  <div className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full mb-1">
                    {win.impact}
                  </div>
                  <div className="text-xs text-[#A0A0A0]">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {win.time}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">{win.title}</h3>
              <p className="text-sm text-[#A0A0A0] mb-4">{win.description}</p>
              <button 
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                onClick={() => onNavigateToSection?.(win.action.toLowerCase().replace(' ', '-'))}
              >
                {win.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Strategies */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <TrendingUp className="w-8 h-8 text-blue-400" />
          <span>Comprehensive Growth Strategies</span>
        </h2>
        <div className="space-y-6">
          {growthStrategies.map((strategy) => (
            <div key={strategy.id} className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <strategy.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{strategy.title}</h3>
                      <p className="text-[#A0A0A0] mb-2">{strategy.subtitle}</p>
                      <p className="text-sm text-[#A0A0A0]">{strategy.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full mb-1">
                      {strategy.impact}
                    </div>
                    <div className="text-xs text-[#A0A0A0] mb-1">
                      {strategy.difficulty} • {strategy.timeToImplement}
                    </div>
                    <div className="text-sm font-bold text-green-400">
                      {strategy.potentialIncrease}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveStrategy(activeStrategy === strategy.id ? null : strategy.id)}
                  className="flex items-center text-[#9B51E0] hover:text-[#A051E0] transition-colors text-sm"
                >
                  <span>{activeStrategy === strategy.id ? 'Hide' : 'Show'} Implementation Guide</span>
                  <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${activeStrategy === strategy.id ? 'rotate-90' : ''}`} />
                </button>
              </div>
              
              {activeStrategy === strategy.id && (
                <div className="border-t border-[#3A3A3A] bg-[#2A2A2A] p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {strategy.strategies.map((subStrategy, index) => (
                      <div key={index} className="space-y-4">
                        <h4 className="font-semibold text-white flex items-center space-x-2">
                          <span className="w-6 h-6 bg-[#9B51E0] text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span>{subStrategy.title}</span>
                        </h4>
                        <p className="text-sm text-[#A0A0A0]">{subStrategy.description}</p>
                        
                        <div>
                          <h5 className="text-white font-medium mb-2">Implementation Steps:</h5>
                          <ul className="space-y-1">
                            {subStrategy.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="text-sm text-[#A0A0A0] flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div className="bg-gradient-to-r from-[#9B51E0]/10 to-[#7C3AED]/10 border border-[#9B51E0]/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Sarah's Boutique</h3>
            <p className="text-sm text-[#A0A0A0] mb-3">
              "Implemented product bundles and saw a 45% increase in average order value within 30 days."
            </p>
            <div className="text-lg font-bold text-green-400">+45% AOV</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Mike's Electronics</h3>
            <p className="text-sm text-[#A0A0A0] mb-3">
              "Optimized checkout process and customer reviews increased conversion rate by 38%."
            </p>
            <div className="text-lg font-bold text-blue-400">+38% Conversion</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Lisa's Handmade</h3>
            <p className="text-sm text-[#A0A0A0] mb-3">
              "Started a loyalty program and email marketing, customer retention increased by 52%."
            </p>
            <div className="text-lg font-bold text-purple-400">+52% Retention</div>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Target className="w-8 h-8 text-orange-400" />
          <span>Your 30-Day Action Plan</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Week 1: Foundation</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Implement quick wins</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Optimize product pages</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Set up analytics tracking</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Week 2: Traffic</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Start SEO optimization</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Launch social media presence</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Begin email marketing</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
              <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Week 3: Conversion</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Streamline checkout process</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Add product bundles</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Implement upselling</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Week 4: Retention</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Launch loyalty program</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Improve customer service</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Analyze and optimize</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
