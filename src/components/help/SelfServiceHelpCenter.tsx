import React, { useState, useMemo } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { useLocation } from 'wouter'
import { 
  Search, 
  BookOpen, 
  Play, 
  Zap, 
  ChevronRight, 
  Clock, 
  CheckCircle,
  Star,
  TrendingUp,
  Heart,
  ShoppingCart,
  MessageCircle,
  Settings,
  Package,
  CreditCard,
  Truck,
  BarChart3,
  Mail,
  Camera,
  Shield,
  Award,
  Target,
  Users,
  Globe,
  Filter,
  ArrowRight,
  AlertTriangle,
  Info,
  HelpCircle,
  Lightbulb,
  Bookmark,
  Eye,
  Rocket
} from 'lucide-react'
import { GenieMascot } from '../ui/GenieMascot'
import { StoreSetupWizard } from './StoreSetupWizard'

interface SelfServiceHelpCenterProps {
  onNavigateToSection?: (section: string) => void
  onNavigateToTab?: (tab: string) => void
}

interface HelpArticle {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  readTime: string
  icon: React.ComponentType<any>
  tags: string[]
  popularity: number
}

export const SelfServiceHelpCenter: React.FC<SelfServiceHelpCenterProps> = ({
  onNavigateToSection,
  onNavigateToTab
}) => {
  const [, navigate] = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [showSetupWizard, setShowSetupWizard] = useState(false)

  // Navigation handlers
  const handleNavigateToProducts = () => {
    onNavigateToTab?.('products')
    navigate('/dashboard?tab=products')
  }

  const handleNavigateToSettings = (section?: string) => {
    onNavigateToTab?.('settings')
    const url = section ? `/dashboard?tab=settings&section=${section}` : '/dashboard?tab=settings'
    navigate(url)
  }

  const handleNavigateToPageBuilder = () => {
    onNavigateToTab?.('page-builder')
    navigate('/dashboard?tab=page-builder')
  }

  const handleNavigateToAnalytics = () => {
    onNavigateToTab?.('analytics')
    navigate('/dashboard?tab=analytics')
  }

  const handleArticleClick = (articleId: string) => {
    // Handle specific article navigation
    switch (articleId) {
      case 'store-setup-wizard':
        setShowSetupWizard(true)
        break
      case 'add-first-product':
        handleNavigateToProducts()
        break
      case 'payment-setup':
        handleNavigateToSettings('payment')
        break
      case 'shipping-configuration':
        handleNavigateToSettings('delivery')
        break
      case 'product-photos':
        handleNavigateToProducts()
        break
      case 'abandoned-cart-recovery':
        handleNavigateToSettings('integrations')
        break
      case 'troubleshooting':
        // Navigate to Quick Solutions tab or content
        onNavigateToSection?.('troubleshooting')
        break
      default:
        // For other articles, use the callback if provided
        onNavigateToSection?.(articleId)
        break
    }
  }

  // Comprehensive help articles database
  const helpArticles: HelpArticle[] = [
    {
      id: 'store-setup-wizard',
      title: '🚀 Complete Store Setup Guide',
      description: 'Interactive step-by-step wizard to get your store ready for business',
      category: 'Getting Started',
      difficulty: 'Beginner',
      readTime: '30 min',
      icon: Rocket,
      tags: ['setup', 'wizard', 'checklist', 'launch', 'essential'],
      popularity: 98
    },
    {
      id: 'add-first-product',
      title: 'Add Your First Product',
      description: 'Step-by-step guide to adding products that customers want to buy',
      category: 'Getting Started',
      difficulty: 'Beginner',
      readTime: '5 min',
      icon: Package,
      tags: ['products', 'setup', 'beginner', 'photos', 'pricing'],
      popularity: 95
    },
    {
      id: 'payment-setup',
      title: 'Set Up Payments (Stripe & PayPal)',
      description: 'Configure payment processing to start accepting money',
      category: 'Getting Started',
      difficulty: 'Beginner', 
      readTime: '8 min',
      icon: CreditCard,
      tags: ['payments', 'stripe', 'paypal', 'setup', 'money'],
      popularity: 92
    },
    {
      id: 'shipping-configuration',
      title: 'Simple Shipping Setup',
      description: 'Set shipping rates and delivery options for your customers',
      category: 'Getting Started',
      difficulty: 'Beginner',
      readTime: '10 min', 
      icon: Truck,
      tags: ['shipping', 'delivery', 'rates', 'zones', 'setup'],
      popularity: 88
    },
    {
      id: 'double-conversion-rate',
      title: 'Double Your Sales Overnight',
      description: 'Proven tactics to convert more visitors into paying customers',
      category: 'Growing Sales',
      difficulty: 'Intermediate',
      readTime: '12 min',
      icon: TrendingUp,
      tags: ['conversion', 'sales', 'optimization', 'marketing', 'revenue'],
      popularity: 89
    },
    {
      id: 'product-photos',
      title: 'Take Photos That Sell Products',
      description: 'Professional photo techniques using just your smartphone',
      category: 'Growing Sales',
      difficulty: 'Beginner',
      readTime: '15 min',
      icon: Camera,
      tags: ['photos', 'photography', 'products', 'mobile', 'visual'],
      popularity: 91
    },
    {
      id: 'abandoned-cart-recovery',
      title: 'Win Back Lost Sales',
      description: 'Recover abandoned carts and turn browsers into buyers',
      category: 'Growing Sales', 
      difficulty: 'Intermediate',
      readTime: '8 min',
      icon: ShoppingCart,
      tags: ['cart', 'abandonment', 'email', 'recovery', 'sales'],
      popularity: 85
    },
    {
      id: 'customer-reviews',
      title: 'Get More 5-Star Reviews',
      description: 'Build trust and credibility with authentic customer feedback',
      category: 'Happy Customers',
      difficulty: 'Beginner',
      readTime: '6 min',
      icon: Star,
      tags: ['reviews', 'feedback', 'trust', 'testimonials', 'social proof'],
      popularity: 82
    },
    {
      id: 'customer-service',
      title: 'Provide Amazing Customer Service',
      description: 'Turn customers into raving fans who buy again and again',
      category: 'Happy Customers',
      difficulty: 'Intermediate', 
      readTime: '10 min',
      icon: Heart,
      tags: ['service', 'support', 'satisfaction', 'retention', 'loyalty'],
      popularity: 78
    },
    {
      id: 'payment-issues',
      title: 'Fix Payment Problems Fast',
      description: 'Troubleshoot common payment and checkout issues',
      category: 'Quick Fixes',
      difficulty: 'Beginner',
      readTime: '5 min',
      icon: AlertTriangle,
      tags: ['payments', 'errors', 'troubleshooting', 'checkout', 'fix'],
      popularity: 75
    },
    {
      id: 'site-speed',
      title: 'Speed Up Your Store',
      description: 'Make your store load faster for better customer experience',
      category: 'Quick Fixes',
      difficulty: 'Intermediate',
      readTime: '12 min',
      icon: Zap,
      tags: ['speed', 'performance', 'loading', 'optimization', 'technical'],
      popularity: 73
    }
  ]

  // Categories
  const categories = [
    { id: 'all', name: 'All Topics', count: helpArticles.length },
    { id: 'Getting Started', name: 'Getting Started', count: helpArticles.filter(a => a.category === 'Getting Started').length },
    { id: 'Growing Sales', name: 'Growing Sales', count: helpArticles.filter(a => a.category === 'Growing Sales').length },
    { id: 'Happy Customers', name: 'Happy Customers', count: helpArticles.filter(a => a.category === 'Happy Customers').length },
    { id: 'Quick Fixes', name: 'Quick Fixes', count: helpArticles.filter(a => a.category === 'Quick Fixes').length }
  ]

  // Filter articles based on search and filters
  const filteredArticles = useMemo(() => {
    return helpArticles.filter(article => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))

      // Category filter
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesDifficulty
    }).sort((a, b) => b.popularity - a.popularity)
  }, [searchQuery, selectedCategory, selectedDifficulty, helpArticles])

  // Popular searches
  const popularSearches = [
    'add products', 'payment setup', 'shipping rates', 'photos', 'sales tips',
    'customer reviews', 'fix problems', 'speed up store', 'email marketing'
  ]

  // Quick action cards
  const quickActions = [
    {
      title: 'Start Selling Today',
      description: 'Complete setup guide from zero to first sale',
      icon: Target,
      color: 'green',
      time: '30 min',
      difficulty: 'Beginner',
      action: () => setShowSetupWizard(true)
    },
    {
      title: 'Boost Your Sales',  
      description: 'Proven strategies to increase revenue',
      icon: TrendingUp,
      color: 'blue', 
      time: '45 min',
      difficulty: 'Intermediate',
      action: () => handleArticleClick('double-conversion-rate')
    },
    {
      title: 'Fix Common Issues',
      description: 'Quick solutions to frequent problems',
      icon: Zap,
      color: 'orange',
      time: '10 min', 
      difficulty: 'Beginner',
      action: () => handleArticleClick('troubleshooting')
    }
  ]

  // Show Setup Wizard if requested
  if (showSetupWizard) {
    return (
      <div className="space-y-8">
        {/* Back Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSetupWizard(false)}
            className="flex items-center text-[#A0A0A0] hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Help Center
          </button>
        </div>
        <StoreSetupWizard 
          onClose={() => setShowSetupWizard(false)} 
          onNavigateToTab={onNavigateToTab}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <GenieMascot mood="helpful" size="xl" showBackground />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Find Your Answer in Seconds</h1>
          <p className="text-lg text-[#A0A0A0] max-w-3xl mx-auto mb-8">
            Self-service help center with everything you need to build, grow, and manage your online business. 
            No waiting, no complicated explanations - just clear answers when you need them.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Search for help (e.g., 'add products', 'payment setup', 'fix slow store')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:border-blue-500 transition-colors text-base"
              />
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mb-8">
            <p className="text-sm text-[#A0A0A0] mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(search)}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#A0A0A0] rounded-full text-sm hover:bg-[#3A3A3A] transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Success Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">95%</div>
              <div className="text-sm text-[#A0A0A0]">Self-Service Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">&lt; 2min</div>
              <div className="text-sm text-[#A0A0A0]">Average Find Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">500+</div>
              <div className="text-sm text-[#A0A0A0]">Help Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">24/7</div>
              <div className="text-sm text-[#A0A0A0]">Always Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <div 
            key={index} 
            className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-blue-500/30 transition-colors cursor-pointer"
            onClick={action.action}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                action.color === 'green' ? 'bg-green-500/20' : 
                action.color === 'blue' ? 'bg-blue-500/20' : 
                'bg-orange-500/20'
              }`}>
                <action.icon className={`w-6 h-6 ${
                  action.color === 'green' ? 'text-green-400' : 
                  action.color === 'blue' ? 'text-blue-400' : 
                  'text-orange-400'
                }`} />
              </div>
              <div className="text-right text-xs text-[#A0A0A0]">
                <div>{action.time}</div>
                <div>{action.difficulty}</div>
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2">{action.title}</h3>
            <p className="text-sm text-[#A0A0A0] mb-4">{action.description}</p>
            <button className="flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#A0A0A0]" />
          <span className="text-sm text-[#A0A0A0]">Filter by:</span>
        </div>
        
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <div className="ml-auto text-sm text-[#A0A0A0]">
          {filteredArticles.length} articles found
        </div>
      </div>

      {/* Search Results / Articles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <div 
            key={article.id} 
            className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-blue-500/30 transition-colors cursor-pointer group"
            onClick={() => handleArticleClick(article.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <article.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#A0A0A0] mb-2">{article.description}</p>
                  <div className="flex items-center space-x-3 text-xs text-[#A0A0A0]">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${
                      article.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      article.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {article.difficulty}
                    </span>
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-400 mb-1">
                  {article.popularity}% helpful
                </div>
                <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 text-[#A0A0A0] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
          <p className="text-[#A0A0A0] mb-6">Try adjusting your search terms or filters</p>
          <button 
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Help Tips */}
      <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
          Pro Search Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-white font-medium mb-2">Search effectively:</h4>
            <ul className="space-y-1 text-sm text-[#A0A0A0]">
              <li>• Use specific terms: "stripe payment setup"</li>
              <li>• Try different words: "photos" or "images"</li>
              <li>• Search by problem: "site loading slow"</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Can't find what you need?</h4>
            <ul className="space-y-1 text-sm text-[#A0A0A0]">
              <li>• Check different categories</li>
              <li>• Try beginner-level articles first</li>
              <li>• Look in troubleshooting for fixes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}