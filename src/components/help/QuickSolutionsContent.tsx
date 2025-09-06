import React, { useState } from 'react'
import { 
  Zap, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Tool, 
  Wrench, 
  HelpCircle, 
  FileText, 
  Play, 
  BookOpen, 
  ArrowRight, 
  Shield, 
  DollarSign, 
  ShoppingCart, 
  Truck, 
  Mail, 
  Phone, 
  Globe,
  Monitor,
  Smartphone,
  Database,
  Server,
  Wifi,
  Lock,
  Unlock,
  RefreshCw,
  RotateCcw,
  Power,
  AlertCircle,
  Info,
  XCircle,
  MinusCircle,
  PlusCircle,
  Package
} from 'lucide-react'
import { GenieMascot } from '../ui/GenieMascot'

interface QuickSolutionsContentProps {
  onNavigateToSection?: (section: string) => void
}

export const QuickSolutionsContent: React.FC<QuickSolutionsContentProps> = ({ 
  onNavigateToSection 
}) => {
  const [activeIssue, setActiveIssue] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Common Issues & Solutions
  const commonIssues = [
    {
      id: 'payment-issues',
      title: 'Payment Processing Problems',
      icon: DollarSign,
      severity: 'High',
      frequency: 'Common',
      description: 'Customers can\'t complete purchases or payment errors occur',
      solutions: [
        {
          title: 'Check Stripe Connection',
          steps: [
            'Go to Settings → Payment Methods',
            'Verify Stripe API keys are correct',
            'Test with Stripe test mode first',
            'Check for any error messages in logs'
          ],
          time: '5 minutes',
          difficulty: 'Easy'
        },
        {
          title: 'Verify SSL Certificate',
          steps: [
            'Ensure your domain has valid SSL certificate',
            'Check for mixed content warnings',
            'Payment forms require HTTPS to function',
            'Contact your hosting provider if needed'
          ],
          time: '10 minutes',
          difficulty: 'Medium'
        },
        {
          title: 'Test Payment Flow',
          steps: [
            'Use Stripe test card numbers',
            'Complete full checkout process',
            'Verify confirmation emails are sent',
            'Check that orders appear in dashboard'
          ],
          time: '15 minutes',
          difficulty: 'Easy'
        }
      ]
    },
    {
      id: 'low-traffic',
      title: 'Low Website Traffic',
      icon: Globe,
      severity: 'Medium',
      frequency: 'Common',
      description: 'Few visitors finding your store, need more exposure',
      solutions: [
        {
          title: 'Optimize for Search Engines',
          steps: [
            'Add descriptive product titles',
            'Write unique meta descriptions',
            'Use relevant keywords naturally',
            'Improve page loading speed'
          ],
          time: '30 minutes',
          difficulty: 'Medium'
        },
        {
          title: 'Social Media Marketing',
          steps: [
            'Share products on Instagram/Facebook',
            'Post customer photos and reviews',
            'Use relevant hashtags',
            'Engage with your audience regularly'
          ],
          time: '1 hour',
          difficulty: 'Easy'
        },
        {
          title: 'Email Marketing Campaigns',
          steps: [
            'Send newsletters to existing customers',
            'Create abandoned cart campaigns',
            'Offer exclusive discounts',
            'Build email list through lead magnets'
          ],
          time: '2 hours',
          difficulty: 'Medium'
        }
      ]
    },
    {
      id: 'cart-abandonment',
      title: 'Cart Abandonment Issues',
      icon: ShoppingCart,
      severity: 'High',
      frequency: 'Very Common',
      description: 'Customers add items but don\'t complete purchase',
      solutions: [
        {
          title: 'Analyze Checkout Flow',
          steps: [
            'Test checkout process yourself',
            'Check for form errors or bugs',
            'Ensure mobile-friendly design',
            'Simplify checkout steps'
          ],
          time: '20 minutes',
          difficulty: 'Easy'
        },
        {
          title: 'Review Shipping Costs',
          steps: [
            'Check if shipping costs are too high',
            'Offer free shipping thresholds',
            'Display costs early in process',
            'Consider flat-rate shipping'
          ],
          time: '30 minutes',
          difficulty: 'Medium'
        },
        {
          title: 'Add Trust Elements',
          steps: [
            'Display security badges',
            'Add customer testimonials',
            'Show clear return policy',
            'Include money-back guarantees'
          ],
          time: '15 minutes',
          difficulty: 'Easy'
        }
      ]
    },
    {
      id: 'product-display',
      title: 'Products Not Showing',
      icon: Package,
      severity: 'Medium',
      frequency: 'Common',
      description: 'Products added but not displaying on storefront',
      solutions: [
        {
          title: 'Check Product Status',
          steps: [
            'Ensure products are marked as "Active"',
            'Verify all required fields are filled',
            'Check price is set correctly',
            'Review product categories'
          ],
          time: '10 minutes',
          difficulty: 'Easy'
        },
        {
          title: 'Review Inventory',
          steps: [
            'Products with 0 stock may be hidden',
            'Update inventory quantities',
            'Set low stock thresholds',
            'Check inventory settings'
          ],
          time: '15 minutes',
          difficulty: 'Easy'
        },
        {
          title: 'Clear Cache',
          steps: [
            'Refresh your browser',
            'Clear browser cache and cookies',
            'Check in incognito/private mode',
            'Wait 5-10 minutes for changes'
          ],
          time: '5 minutes',
          difficulty: 'Easy'
        }
      ]
    }
  ]

  // Quick Fixes
  const quickFixes = [
    {
      title: 'My Store Won\'t Load',
      description: 'Your website appears to be down or won\'t open',
      icon: Monitor,
      solution: 'First, check your internet connection. Try refreshing the page or opening it in a different browser. Try clearing your browser cache or using an incognito window.',
      time: '2 minutes',
      category: 'Website'
    },
    {
      title: 'I Can\'t Log In',
      description: 'Can\'t get into your store dashboard',
      icon: Lock,
      solution: 'Click "Forgot Password" to reset it. Make sure caps lock is off and you\'re typing your email correctly. Try typing your password in a text editor first to see if it\'s correct.',
      time: '5 minutes',
      category: 'Login'
    },
    {
      title: 'Customer Emails Not Working',
      description: 'Order confirmations aren\'t being sent out',
      icon: Mail,
      solution: 'Check your spam folder first - they might be going there. Then check your email settings in the dashboard. Try sending a test email.',
      time: '10 minutes',
      category: 'Email'
    },
    {
      title: 'Store Looks Weird On Phones',
      description: 'Your website doesn\'t display properly on mobile',
      icon: Smartphone,
      solution: 'Try clearing your phone\'s browser cache (Google "clear cache" + your phone type). Check if your store theme is mobile-friendly in settings.',
      time: '15 minutes',
      category: 'Mobile'
    },
    {
      title: 'My Store Loads Really Slow',
      description: 'Pages take forever to load for customers',
      icon: Clock,
      solution: 'Your product photos might be too big. Resize them to be smaller files. Also check your internet speed - slow internet makes everything feel slow.',
      time: '20 minutes',
      category: 'Speed'
    },
    {
      title: 'Orders Are Stuck',
      description: 'Orders aren\'t processing properly',
      icon: AlertCircle,
      solution: 'Check if your payment setup is working in Settings → Payment Methods. Make sure you have inventory for the products. Review the order details page for specific error messages.',
      time: '10 minutes',
      category: 'Orders'
    }
  ]

  // System Status
  const systemStatus = [
    {
      service: 'Website',
      status: 'Operational',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      service: 'Payments',
      status: 'Operational',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      service: 'Email',
      status: 'Operational',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      service: 'Analytics',
      status: 'Operational',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    }
  ]

  const filteredIssues = searchQuery 
    ? commonIssues.filter(issue => 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : commonIssues

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <GenieMascot mood="helpful" size="xl" showBackground />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Fix Problems Fast (No Tech Skills Needed)</h1>
          <p className="text-lg text-[#A0A0A0] max-w-3xl mx-auto mb-8">
            Something not working? Don't panic. Most problems have simple solutions. 
            We'll walk you through fixing common issues step-by-step, in plain English.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Search for issues or problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:border-orange-500 transition-colors text-base"
              />
            </div>
          </div>
          
          {/* Success Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">99.9%</div>
              <div className="text-sm text-[#A0A0A0]">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">&lt; 5min</div>
              <div className="text-sm text-[#A0A0A0]">Average Fix Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-[#A0A0A0]">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">95%</div>
              <div className="text-sm text-[#A0A0A0]">Self-Service Resolution</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-green-400" />
          <span>System Status</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemStatus.map((service, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-[#2A2A2A] rounded-lg">
              <div className={`w-8 h-8 ${service.bgColor} rounded-full flex items-center justify-center`}>
                <service.icon className={`w-4 h-4 ${service.color}`} />
              </div>
              <div>
                <div className="text-white font-medium">{service.service}</div>
                <div className={`text-xs ${service.color}`}>{service.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Fixes */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Zap className="w-8 h-8 text-yellow-400" />
          <span>Quick Fixes (Under 20 Minutes)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickFixes.map((fix, index) => (
            <div key={index} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-orange-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <fix.icon className="w-8 h-8 text-orange-400" />
                <div className="text-right">
                  <div className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full mb-1">
                    {fix.category}
                  </div>
                  <div className="text-xs text-[#A0A0A0]">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {fix.time}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">{fix.title}</h3>
              <p className="text-sm text-[#A0A0A0] mb-4">{fix.description}</p>
              <p className="text-sm text-white mb-4">{fix.solution}</p>
              <button 
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                onClick={() => onNavigateToSection?.(fix.title.toLowerCase().replace(/\s+/g, '-'))}
              >
                Try This Fix
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Common Issues */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Wrench className="w-8 h-8 text-blue-400" />
          <span>Common Issues & Solutions</span>
        </h2>
        <div className="space-y-6">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <issue.icon className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{issue.title}</h3>
                      <p className="text-sm text-[#A0A0A0] mb-2">{issue.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          issue.severity === 'High' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {issue.severity} Priority
                        </span>
                        <span className="text-xs text-[#A0A0A0]">
                          {issue.frequency} Issue
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setActiveIssue(activeIssue === issue.id ? null : issue.id)}
                  className="flex items-center text-[#9B51E0] hover:text-[#A051E0] transition-colors text-sm"
                >
                  <span>{activeIssue === issue.id ? 'Hide' : 'Show'} Solutions</span>
                  <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${activeIssue === issue.id ? 'rotate-90' : ''}`} />
                </button>
              </div>
              
              {activeIssue === issue.id && (
                <div className="border-t border-[#3A3A3A] bg-[#2A2A2A] p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {issue.solutions.map((solution, index) => (
                      <div key={index} className="space-y-4">
                        <h4 className="font-semibold text-white flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span>{solution.title}</span>
                        </h4>
                        
                        <div>
                          <h5 className="text-white font-medium mb-2">Steps:</h5>
                          <ul className="space-y-1">
                            {solution.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="text-sm text-[#A0A0A0] flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-[#A0A0A0]">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {solution.time}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            solution.difficulty === 'Easy' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {solution.difficulty}
                          </div>
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

      {/* When to Contact Support */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">When to Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span>Contact Support Immediately</span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Complete website outage</span>
              </li>
              <li className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Payment processing completely down</span>
              </li>
              <li className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Data loss or corruption</span>
              </li>
              <li className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Security breach suspected</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Info className="w-6 h-6 text-blue-400" />
              <span>Try Self-Service First</span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">General setup questions</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Feature configuration</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Design customization</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#A0A0A0]">Best practices guidance</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="text-lg font-bold text-white mb-2">Still Having Issues?</div>
          <div className="text-[#A0A0A0] mb-4">Try our interactive troubleshooting guides and comprehensive help documentation first</div>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Browse All Guides
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Search className="w-4 h-4 inline mr-2" />
              Search Help Center
            </button>
          </div>
        </div>
      </div>

      {/* Prevention Tips */}
      <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Shield className="w-8 h-8 text-green-400" />
          <span>Prevention Tips</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-400" />
              <span>Regular Maintenance</span>
            </h3>
            <ul className="space-y-2 text-sm text-[#A0A0A0]">
              <li>• Update product information regularly</li>
              <li>• Monitor inventory levels</li>
              <li>• Check payment processing weekly</li>
              <li>• Review analytics for issues</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <Lock className="w-5 h-5 text-green-400" />
              <span>Security Best Practices</span>
            </h3>
            <ul className="space-y-2 text-sm text-[#A0A0A0]">
              <li>• Use strong, unique passwords</li>
              <li>• Enable two-factor authentication</li>
              <li>• Keep software updated</li>
              <li>• Monitor for suspicious activity</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span>Stay Informed</span>
            </h3>
            <ul className="space-y-2 text-sm text-[#A0A0A0]">
              <li>• Read our documentation</li>
              <li>• Watch tutorial videos</li>
              <li>• Join community forums</li>
              <li>• Subscribe to updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

