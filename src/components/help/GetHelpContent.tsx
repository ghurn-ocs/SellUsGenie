import React, { useState } from 'react'
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Users, 
  Globe, 
  FileText, 
  Play, 
  BookOpen, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Star, 
  Award, 
  Headphones, 
  Calendar,
  MapPin,
  ExternalLink,
  Download,
  Share2,
  Heart,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Settings,
  HelpCircle,
  Search,
  Filter,
  Tag,
  DollarSign,
  Package,
  ShoppingCart,
  Palette,
  BarChart3
} from 'lucide-react'
import { GenieMascot } from '../ui/GenieMascot'

interface GetHelpContentProps {
  onNavigateToSection?: (section: string) => void
}

export const GetHelpContent: React.FC<GetHelpContentProps> = ({ 
  onNavigateToSection 
}) => {
  const [selectedSupportMethod, setSelectedSupportMethod] = useState<string | null>(null)

  // Support Channels
  const supportChannels = [
    {
      id: 'live-chat',
      title: 'Live Chat',
      subtitle: 'Get instant help from our support team',
      icon: MessageCircle,
      availability: 'Available Now',
      responseTime: '< 2 minutes',
      bestFor: 'Quick questions, urgent issues',
      color: 'blue',
      action: 'Start Chat',
      description: 'Connect with our support team in real-time for immediate assistance with any questions or issues.',
      features: [
        'Real-time conversation',
        'Screen sharing capability',
        'File upload support',
        'Chat history saved'
      ]
    },
    {
      id: 'phone-support',
      title: 'Phone Support',
      subtitle: 'Speak directly with our business experts',
      icon: Phone,
      availability: 'Mon-Fri 9AM-6PM EST',
      responseTime: 'Immediate',
      bestFor: 'Complex issues, detailed discussions',
      color: 'green',
      action: 'Call Now',
      description: 'Speak directly with our experienced support team for personalized assistance and detailed problem resolution.',
      features: [
        'Direct conversation',
        'Personalized assistance',
        'Complex issue resolution',
        'Follow-up calls available'
      ]
    },
    {
      id: 'email-support',
      title: 'Email Support',
      subtitle: 'Detailed help with screenshots and guides',
      icon: Mail,
      availability: '24/7',
      responseTime: '< 4 hours',
      bestFor: 'Detailed issues, documentation',
      color: 'purple',
      action: 'Send Email',
      description: 'Send us detailed information about your issue and receive comprehensive solutions with step-by-step guidance.',
      features: [
        'Detailed responses',
        'Screenshot attachments',
        'Step-by-step guides',
        'Follow-up tracking'
      ]
    }
  ]

  // Success Team
  const successTeam = [
    {
      name: 'Business Consultants',
      role: 'Strategic advice for growing your revenue',
      icon: Target,
      expertise: ['Revenue optimization', 'Business strategy', 'Market analysis', 'Growth planning'],
      availability: 'Mon-Fri 9AM-6PM EST'
    },
    {
      name: 'Technical Experts',
      role: 'Help with setup, integrations, and troubleshooting',
      icon: Settings,
      expertise: ['Platform setup', 'API integrations', 'Technical issues', 'Custom development'],
      availability: '24/7'
    },
    {
      name: 'Growth Specialists',
      role: 'Marketing and optimization strategies',
      icon: TrendingUp,
      expertise: ['Marketing campaigns', 'SEO optimization', 'Conversion rates', 'Customer acquisition'],
      availability: 'Mon-Fri 9AM-6PM EST'
    }
  ]

  // Community Resources
  const communityResources = [
    {
      title: 'Business Owner Community',
      description: 'Connect with thousands of successful store owners',
      members: '15,000+',
      features: [
        'Daily success stories',
        'Expert AMAs every week',
        'Peer-to-peer support',
        'Best practices sharing'
      ],
      icon: Users,
      action: 'Join Community'
    },
    {
      title: 'Resource Library',
      description: 'Access to templates, guides, and tools',
      resources: '500+',
      features: [
        'Product photo templates',
        'Email marketing templates',
        'Legal document templates',
        'Video tutorials'
      ],
      icon: FileText,
      action: 'Browse Resources'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides for every feature',
      videos: '200+',
      features: [
        'Complete setup guides',
        'Feature walkthroughs',
        'Best practices videos',
        'Troubleshooting guides'
      ],
      icon: Play,
      action: 'Watch Videos'
    }
  ]

  // FAQ Categories
  const faqCategories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      count: 25,
      popular: true
    },
    {
      title: 'Payments & Billing',
      icon: DollarSign,
      count: 18,
      popular: true
    },
    {
      title: 'Product Management',
      icon: Package,
      count: 22,
      popular: false
    },
    {
      title: 'Order Processing',
      icon: ShoppingCart,
      count: 15,
      popular: false
    },
    {
      title: 'Store Customization',
      icon: Palette,
      count: 20,
      popular: false
    },
    {
      title: 'Analytics & Reports',
      icon: BarChart3,
      count: 12,
      popular: false
    }
  ]

  // Support Statistics
  const supportStats = [
    {
      metric: 'Average Response Time',
      value: '< 4 hours',
      icon: Clock,
      color: 'text-green-400'
    },
    {
      metric: 'Customer Satisfaction',
      value: '4.8★',
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      metric: 'First Contact Resolution',
      value: '85%',
      icon: CheckCircle,
      color: 'text-blue-400'
    },
    {
      metric: 'Support Team Size',
      value: '50+',
      icon: Users,
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <GenieMascot mood="helpful" size="xl" showBackground />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Get Personal Help & Support</h1>
          <p className="text-lg text-[#A0A0A0] max-w-3xl mx-auto mb-8">
            Our dedicated team of business experts, technical specialists, and growth consultants 
            are here to ensure your online store succeeds. Choose the support method that works best for you.
          </p>
          
          {/* Support Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {supportStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-[#A0A0A0]">{stat.metric}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Channels */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <MessageCircle className="w-8 h-8 text-blue-400" />
          <span>Choose Your Support Method</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportChannels.map((channel) => (
            <div key={channel.id} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-blue-500/30 transition-colors">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${channel.color === 'blue' ? 'bg-blue-500/20' : channel.color === 'green' ? 'bg-green-500/20' : 'bg-purple-500/20'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <channel.icon className={`w-8 h-8 ${channel.color === 'blue' ? 'text-blue-400' : channel.color === 'green' ? 'text-green-400' : 'text-purple-400'}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{channel.title}</h3>
                <p className="text-[#A0A0A0] mb-4">{channel.subtitle}</p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-white font-medium">Availability:</span>
                    <span className="text-green-400 ml-2">{channel.availability}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-white font-medium">Response Time:</span>
                    <span className="text-blue-400 ml-2">{channel.responseTime}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-white font-medium">Best For:</span>
                    <span className="text-[#A0A0A0] ml-2">{channel.bestFor}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-[#A0A0A0] mb-6">{channel.description}</p>
              
              <div className="mb-6">
                <h4 className="text-white font-medium mb-3">Features:</h4>
                <ul className="space-y-2">
                  {channel.features.map((feature, index) => (
                    <li key={index} className="text-sm text-[#A0A0A0] flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button 
                className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-colors ${
                  channel.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                  channel.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-purple-600 hover:bg-purple-700'
                }`}
                onClick={() => setSelectedSupportMethod(channel.id)}
              >
                {channel.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Success Team */}
      <div className="bg-gradient-to-r from-[#9B51E0]/10 to-[#7C3AED]/10 border border-[#9B51E0]/20 rounded-lg p-8">
        <div className="text-center mb-8">
          <Users className="w-12 h-12 text-[#9B51E0] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Meet Your Success Team</h2>
          <p className="text-[#A0A0A0] max-w-2xl mx-auto">
            Our dedicated team of business experts, technical specialists, and growth consultants 
            are here to ensure your online store succeeds.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successTeam.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <member.icon className="w-8 h-8 text-[#9B51E0]" />
              </div>
              <h3 className="font-semibold text-white mb-2">{member.name}</h3>
              <p className="text-sm text-[#A0A0A0] mb-4">{member.role}</p>
              
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Expertise:</h4>
                <div className="flex flex-wrap justify-center gap-1">
                  {member.expertise.map((skill, skillIndex) => (
                    <span key={skillIndex} className="text-xs bg-[#9B51E0]/20 text-[#9B51E0] px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-[#A0A0A0]">
                <Clock className="w-3 h-3 inline mr-1" />
                {member.availability}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Resources */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Globe className="w-8 h-8 text-green-400" />
          <span>Community & Resources</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityResources.map((resource, index) => (
            <div key={index} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-green-500/30 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <resource.icon className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="font-semibold text-white">{resource.title}</h3>
                  <p className="text-sm text-[#A0A0A0]">{resource.description}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-lg font-bold text-green-400 mb-2">
                  {resource.members || resource.resources || resource.videos}
                </div>
                <h4 className="text-white font-medium mb-2">Features:</h4>
                <ul className="space-y-1">
                  {resource.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-[#A0A0A0] flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button 
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                onClick={() => onNavigateToSection?.(resource.title.toLowerCase().replace(/\s+/g, '-'))}
              >
                {resource.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Categories */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <HelpCircle className="w-8 h-8 text-purple-400" />
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faqCategories.map((category, index) => (
            <div key={index} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-purple-500/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <category.icon className="w-8 h-8 text-purple-400" />
                {category.popular && (
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white mb-2">{category.title}</h3>
              <p className="text-sm text-[#A0A0A0] mb-4">{category.count} articles</p>
              <button 
                className="flex items-center text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors"
                onClick={() => onNavigateToSection?.(category.title.toLowerCase().replace(/\s+/g, '-'))}
              >
                <span>Browse Questions</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <MapPin className="w-8 h-8 text-orange-400" />
          <span>Contact Information</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Phone Support</h3>
            <p className="text-sm text-[#A0A0A0] mb-2">1-800-SELLUS-1</p>
            <p className="text-xs text-[#A0A0A0]">Mon-Fri 9AM-6PM EST</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Email Support</h3>
            <p className="text-sm text-[#A0A0A0] mb-2">support@sellusgenie.com</p>
            <p className="text-xs text-[#A0A0A0]">24/7 Response</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Live Chat</h3>
            <p className="text-sm text-[#A0A0A0] mb-2">Available Now</p>
            <p className="text-xs text-[#A0A0A0]">&lt; 2 min response</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Community</h3>
            <p className="text-sm text-[#A0A0A0] mb-2">community.sellusgenie.com</p>
            <p className="text-xs text-[#A0A0A0]">15,000+ members</p>
          </div>
        </div>
      </div>

      {/* Support Hours & Response Times */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Support Hours & Response Times</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-blue-400" />
              <span>Support Hours</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                <span className="text-white">Live Chat</span>
                <span className="text-green-400 font-medium">24/7</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                <span className="text-white">Phone Support</span>
                <span className="text-green-400 font-medium">Mon-Fri 9AM-6PM EST</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                <span className="text-white">Email Support</span>
                <span className="text-green-400 font-medium">24/7</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                <span className="text-white">Community Forum</span>
                <span className="text-green-400 font-medium">24/7</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-purple-400" />
              <span>Response Times</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                <span className="text-white">Live Chat</span>
                <span className="text-green-400 font-medium">&lt; 2 minutes</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                <span className="text-white">Phone Support</span>
                <span className="text-green-400 font-medium">Immediate</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                <span className="text-white">Email Support</span>
                <span className="text-green-400 font-medium">&lt; 4 hours</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                <span className="text-white">Community</span>
                <span className="text-green-400 font-medium">&lt; 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A] text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-[#A0A0A0] mb-6 max-w-2xl mx-auto">
          Don't let technical issues hold back your business. Our support team is here to help you succeed.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Start Live Chat
          </button>
          <button className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <Phone className="w-4 h-4 inline mr-2" />
            Call Support
          </button>
          <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            <Mail className="w-4 h-4 inline mr-2" />
            Send Email
          </button>
        </div>
      </div>
    </div>
  )
}

