import React, { useState } from 'react'
import { 
  Heart, 
  MessageCircle, 
  Star, 
  Users, 
  CheckCircle, 
  Clock, 
  Shield, 
  Gift, 
  Award, 
  Zap, 
  Mail, 
  Phone, 
  Truck, 
  Package, 
  Smile, 
  ThumbsUp,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Headphones,
  Calendar,
  Settings,
  FileText,
  Play,
  BookOpen,
  BarChart3,
  Target
} from 'lucide-react'
import { GenieMascot } from '../ui/GenieMascot'

interface HappyCustomersContentProps {
  onNavigateToSection?: (section: string) => void
}

export const HappyCustomersContent: React.FC<HappyCustomersContentProps> = ({ 
  onNavigateToSection 
}) => {
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null)

  // Customer Service Excellence
  const serviceExcellence = [
    {
      title: '24/7 Support Availability',
      description: 'Be there when customers need you',
      icon: Clock,
      benefit: 'Higher Satisfaction',
      time: 'Immediate'
    },
    {
      title: 'Multiple Contact Channels',
      description: 'Let customers reach you their preferred way',
      icon: MessageCircle,
      benefit: 'Better Accessibility',
      time: '1 day'
    },
    {
      title: 'Proactive Communication',
      description: 'Keep customers informed at every step',
      icon: Mail,
      benefit: 'Reduced Anxiety',
      time: 'Ongoing'
    },
    {
      title: 'Easy Returns Process',
      description: 'Make returns simple and hassle-free',
      icon: Shield,
      benefit: 'Increased Trust',
      time: '1 week'
    },
    {
      title: 'Personal Touch',
      description: 'Add handwritten notes and small gifts',
      icon: Gift,
      benefit: 'Memorable Experience',
      time: 'Per Order'
    },
    {
      title: 'Follow-Up After Delivery',
      description: 'Check in to ensure satisfaction',
      icon: CheckCircle,
      benefit: 'Higher Retention',
      time: '3 days'
    }
  ]

  // Customer Success Strategies
  const customerStrategies = [
    {
      id: 'exceptional-service',
      title: 'Exceptional Customer Service',
      subtitle: 'Go above and beyond expectations',
      icon: MessageCircle,
      impact: 'High Impact',
      difficulty: 'Easy',
      timeToImplement: '1-2 weeks',
      potentialIncrease: '+40% satisfaction',
      description: 'Create memorable customer experiences that build loyalty and drive repeat purchases.',
      strategies: [
        {
          title: 'Fast Response Times',
          description: 'Respond to customer inquiries quickly and efficiently',
          steps: [
            'Respond to emails within 4 hours',
            'Answer phone calls within 3 rings',
            'Provide live chat support during business hours',
            'Set up automated order confirmations',
            'Send proactive shipping updates'
          ]
        },
        {
          title: 'Personalized Communication',
          description: 'Make customers feel valued and understood',
          steps: [
            'Use customer names in communications',
            'Reference past purchases and preferences',
            'Send personalized thank you notes',
            'Remember customer birthdays and anniversaries',
            'Offer personalized product recommendations'
          ]
        }
      ]
    },
    {
      id: 'loyalty-programs',
      title: 'Loyalty & Rewards Programs',
      subtitle: 'Reward customer loyalty',
      icon: Award,
      impact: 'High Impact',
      difficulty: 'Medium',
      timeToImplement: '2-3 weeks',
      potentialIncrease: '+60% retention',
      description: 'Create programs that incentivize repeat purchases and build long-term relationships.',
      strategies: [
        {
          title: 'Points-Based System',
          description: 'Reward customers for every purchase',
          steps: [
            'Award points for every dollar spent',
            'Offer bonus points for specific actions',
            'Create tier levels (Bronze, Silver, Gold)',
            'Allow points redemption for discounts',
            'Send points expiration reminders'
          ]
        },
        {
          title: 'Exclusive Member Benefits',
          description: 'Provide special perks for loyal customers',
          steps: [
            'Early access to new products',
            'Exclusive member-only sales',
            'Free shipping for all members',
            'Birthday discounts and gifts',
            'VIP customer support line'
          ]
        }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <GenieMascot mood="happy" size="xl" showBackground />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Create Happy, Loyal Customers</h1>
          <p className="text-lg text-[#A0A0A0] max-w-3xl mx-auto mb-8">
            Transform your customer service from good to exceptional. Build lasting relationships 
            that drive repeat purchases and turn customers into brand advocates.
          </p>
          
          {/* Success Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">4.8★</div>
              <div className="text-sm text-[#A0A0A0]">Average Customer Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">+80%</div>
              <div className="text-sm text-[#A0A0A0]">Customer Retention</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">&lt; 4hr</div>
              <div className="text-sm text-[#A0A0A0]">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">95%</div>
              <div className="text-sm text-[#A0A0A0]">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Service Excellence */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Heart className="w-8 h-8 text-pink-400" />
          <span>Customer Service Excellence</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceExcellence.map((service, index) => (
            <div key={index} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-pink-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <service.icon className="w-8 h-8 text-pink-400" />
                <div className="text-right">
                  <div className="text-xs text-pink-400 bg-pink-500/20 px-2 py-1 rounded-full mb-1">
                    {service.benefit}
                  </div>
                  <div className="text-xs text-[#A0A0A0]">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {service.time}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">{service.title}</h3>
              <p className="text-sm text-[#A0A0A0] mb-4">{service.description}</p>
              <button 
                className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
                onClick={() => onNavigateToSection?.(service.title.toLowerCase().replace(/\s+/g, '-'))}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Success Strategies */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <TrendingUp className="w-8 h-8 text-blue-400" />
          <span>Customer Success Strategies</span>
        </h2>
        <div className="space-y-6">
          {customerStrategies.map((strategy) => (
            <div key={strategy.id} className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <strategy.icon className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{strategy.title}</h3>
                      <p className="text-[#A0A0A0] mb-2">{strategy.subtitle}</p>
                      <p className="text-sm text-[#A0A0A0]">{strategy.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-pink-400 bg-pink-500/20 px-2 py-1 rounded-full mb-1">
                      {strategy.impact}
                    </div>
                    <div className="text-xs text-[#A0A0A0] mb-1">
                      {strategy.difficulty} • {strategy.timeToImplement}
                    </div>
                    <div className="text-sm font-bold text-pink-400">
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
                          <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
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
      <div className="bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Customer Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smile className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Emma's Feedback</h3>
            <p className="text-sm text-[#A0A0A0] mb-3">
              "The handwritten thank you note made me feel so special. I've already told 5 friends about this store!"
            </p>
            <div className="text-lg font-bold text-pink-400">5 New Customers</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Mike's Experience</h3>
            <p className="text-sm text-[#A0A0A0] mb-3">
              "When my order was delayed, they proactively reached out and upgraded my shipping for free."
            </p>
            <div className="text-lg font-bold text-red-400">Loyal Customer</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Sarah's Loyalty</h3>
            <p className="text-sm text-[#A0A0A0] mb-3">
              "The loyalty program rewards are amazing. I've earned over $200 in discounts this year!"
            </p>
            <div className="text-lg font-bold text-purple-400">$200+ Saved</div>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Target className="w-8 h-8 text-orange-400" />
          <span>30-Day Customer Success Plan</span>
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
                <span className="text-sm text-[#A0A0A0]">Set up response time standards</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Create customer service templates</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Implement order tracking</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Week 2: Communication</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Set up automated confirmations</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Create follow-up system</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Implement feedback collection</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
              <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Week 3: Loyalty</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Launch loyalty program</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Add personal touches</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Create VIP customer tier</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Week 4: Optimization</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Analyze feedback data</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Optimize processes</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Plan next improvements</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
