// Comprehensive Help Center - Redesigned for Non-Technical SMB Owners
import React, { useState } from 'react'
import { TabSection } from '../ui/TabSection'
import { 
  BookOpen, 
  Play, 
  MessageCircle, 
  Users, 
  Rocket, 
  ShoppingCart,
  CreditCard,
  Truck,
  BarChart3,
  Mail,
  Settings,
  Phone,
  Video,
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
  Star,
  Heart,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Globe,
  Camera,
  Palette,
  Search,
  ArrowRight,
  Gift,
  Award,
  DollarSign,
  Plus,
  Eye,
  Package,
  Layout,
  Percent,
  Tags,
  Image,
  MousePointer,
  Upload,
  Link
} from 'lucide-react'
import { GenieMascot } from '../ui/GenieMascot'
import { useStore } from '../../contexts/StoreContext'
import { useLocation } from 'wouter'

interface ComprehensiveHelpCenterProps {}

export const ComprehensiveHelpCenter: React.FC<ComprehensiveHelpCenterProps> = () => {
  const [activeTab, setActiveTab] = useState('getting-started')
  const [growingSalesTab, setGrowingSalesTab] = useState('sales-growth-plan')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeGuide, setActiveGuide] = useState<string | null>(null)
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null)
  const [clickedButtons, setClickedButtons] = useState<Set<string>>(new Set())
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [, navigate] = useLocation()
  // Note: StoreContext doesn't provide setActiveTab function, using URL navigation instead

  // Action handlers - using URL params to specify tab
  const handleNavigateToProducts = () => {
    navigate('/dashboard?tab=products')
  }

  const handleNavigateToSettings = (section?: string) => {
    const url = section ? `/dashboard?tab=settings&section=${section}` : '/dashboard?tab=settings'
    navigate(url)
  }

  const handleNavigateToPageBuilder = () => {
    navigate('/dashboard?tab=page-builder')
  }

  const handleNavigateToCustomers = () => {
    navigate('/dashboard?tab=customers')
  }

  const handleNavigateToAnalytics = () => {
    navigate('/dashboard?tab=analytics')
  }

  const handleNavigateToNurture = () => {
    navigate('/dashboard?tab=nurture')
  }

  const handleOpenExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setActiveGuide(null)
    setClickedButtons(new Set()) // Reset clicked buttons when switching tabs
    setSuccessMessage(null) // Clear any success messages
    if (tab !== 'grow-sales') {
      setGrowingSalesTab('sales-growth-plan') // Reset growing sales tab when switching away
    }
  }

  const handleContactSupport = (method: string) => {
    if (method === 'chat') {
      // Open chat widget or help desk
      window.open('https://sellusgenie.com/contact', '_blank', 'noopener,noreferrer')
    } else if (method === 'phone') {
      window.open('tel:+1-800-SELLUS-1', '_self')
    } else if (method === 'email') {
      window.open('mailto:support@sellusgenie.com?subject=Help Request&body=Hi SellUsGenie Support Team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A[Please describe your issue here]%0D%0A%0D%0AThank you!', '_self')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Search for content within the help center or redirect to search results
      const searchTerms = searchQuery.toLowerCase()
      
      // Auto-navigate to relevant tab based on search terms
      if (searchTerms.includes('product') || searchTerms.includes('upload') || searchTerms.includes('inventory')) {
        setActiveTab('getting-started')
      } else if (searchTerms.includes('sales') || searchTerms.includes('marketing') || searchTerms.includes('revenue')) {
        setActiveTab('grow-sales')
      } else if (searchTerms.includes('customer') || searchTerms.includes('order') || searchTerms.includes('service')) {
        setActiveTab('customer-success')
      } else if (searchTerms.includes('problem') || searchTerms.includes('fix') || searchTerms.includes('error') || searchTerms.includes('issue')) {
        setActiveTab('troubleshooting')
      } else if (searchTerms.includes('support') || searchTerms.includes('help') || searchTerms.includes('contact')) {
        setActiveTab('support')
      }
    }
  }

  // Guide content data
  const guideContent: Record<string, {
    title: string
    sections: Array<{
      title: string
      content: string[]
      tips?: string[]
      warning?: string
    }>
  }> = {
    "How to Add Products That Sell": {
      title: "How to Add Products That Sell",
      sections: [
        {
          title: "Step 1: Product Photography",
          content: [
            "High-quality photos are the #1 factor in online sales. Customers can't touch your products, so photos must tell the complete story.",
            "Use natural lighting whenever possible. Avoid harsh shadows and artificial lighting that distorts colors.",
            "Take multiple angles: front, back, sides, and detail shots of important features.",
            "Include lifestyle shots showing your product in use or in a real environment."
          ],
          tips: [
            "Use a clean, uncluttered background (white works best)",
            "Maintain consistent lighting across all product photos",
            "Show scale by including common objects for reference",
            "For clothing, use models or mannequins to show fit"
          ]
        },
        {
          title: "Step 2: Write Compelling Descriptions",
          content: [
            "Focus on benefits, not just features. Explain how your product solves problems or improves the customer's life.",
            "Use emotional language that connects with your target audience.",
            "Include specific details: dimensions, materials, weight, care instructions.",
            "Address common questions and concerns upfront."
          ],
          tips: [
            "Start with the most important benefit in the first sentence",
            "Use bullet points for easy scanning",
            "Include keywords naturally for better search visibility",
            "End with a clear call-to-action"
          ]
        },
        {
          title: "Step 3: Pricing Strategy",
          content: [
            "Research competitor pricing to understand market expectations.",
            "Factor in all costs: materials, labor, shipping, taxes, platform fees.",
            "Consider psychological pricing ($19.99 vs $20.00).",
            "Test different price points to find your optimal profit margin."
          ],
          warning: "Never price below your break-even point. It's better to sell fewer units profitably than many units at a loss."
        },
        {
          title: "Step 4: Inventory Management",
          content: [
            "Start with accurate stock levels to avoid overselling.",
            "Set up low-stock alerts so you can reorder before running out.",
            "Track which products sell fastest and adjust inventory accordingly.",
            "Consider seasonal variations in demand."
          ]
        }
      ]
    },
    "Setting Up Your Payment Methods": {
      title: "Setting Up Your Payment Methods",
      sections: [
        {
          title: "Step 1: Choose Your Payment Processor",
          content: [
            "Stripe is the most popular choice for new businesses - easy setup, competitive rates, great security.",
            "PayPal offers instant recognition and trust with customers worldwide.",
            "Consider offering multiple payment options to reduce cart abandonment.",
            "Check international capabilities if you plan to sell globally."
          ],
          tips: [
            "Stripe: 2.9% + 30¢ per transaction, excellent for cards",
            "PayPal: 2.9% + 30¢, good for international sales",
            "Consider Square for in-person sales integration",
            "Research local payment methods for your target markets"
          ]
        },
        {
          title: "Step 2: Account Setup & Verification",
          content: [
            "Gather required documents: business license, tax ID, bank account details.",
            "Verify your business information matches your legal documents exactly.",
            "Set up your business bank account if you haven't already.",
            "Complete identity verification promptly to avoid payment delays."
          ],
          warning: "Payment processors are required by law to verify business information. Provide accurate details to avoid account holds or closures."
        },
        {
          title: "Step 3: Configure Payment Settings",
          content: [
            "Set up automatic transfers to your bank account (daily or weekly).",
            "Configure tax collection for applicable jurisdictions.",
            "Set up email receipts for customers.",
            "Enable fraud protection features."
          ]
        },
        {
          title: "Step 4: Test Your Payment Flow",
          content: [
            "Use test card numbers to simulate transactions.",
            "Test the complete checkout process from customer perspective.",
            "Verify that confirmation emails are sent correctly.",
            "Check that orders appear properly in your dashboard."
          ]
        }
      ]
    },
    "Shipping Made Simple": {
      title: "Shipping Made Simple",
      sections: [
        {
          title: "Step 1: Define Your Shipping Zones",
          content: [
            "Start with your local area - this is usually your most cost-effective shipping zone.",
            "Expand to your state/province, then neighboring areas, then nationally.",
            "Consider international shipping only after you've mastered domestic logistics.",
            "Group areas with similar shipping costs together to simplify pricing."
          ]
        },
        {
          title: "Step 2: Calculate Shipping Rates",
          content: [
            "Get quotes from multiple carriers: USPS, UPS, FedEx, DHL.",
            "Factor in packaging materials and handling time.",
            "Consider offering free shipping above a certain order value.",
            "Build shipping costs into your product prices if offering 'free' shipping."
          ],
          tips: [
            "Use shipping calculators to estimate costs accurately",
            "Consider flat-rate shipping for predictable pricing",
            "Offer expedited shipping for time-sensitive customers",
            "Negotiate better rates as your volume increases"
          ]
        },
        {
          title: "Step 3: Packaging Best Practices",
          content: [
            "Choose packaging that protects your products during transit.",
            "Use branded packaging to create a memorable unboxing experience.",
            "Include packing slips and thank-you notes.",
            "Optimize packaging size to reduce shipping costs."
          ]
        },
        {
          title: "Step 4: Tracking & Communication",
          content: [
            "Always provide tracking numbers to customers.",
            "Send shipping confirmation emails with tracking links.",
            "Set up automated tracking updates.",
            "Be proactive about delivery issues or delays."
          ]
        }
      ]
    },
    "Understanding Your Sales Reports": {
      title: "Understanding Your Sales Reports",
      sections: [
        {
          title: "Key Metrics to Track",
          content: [
            "Total Revenue: Your gross sales before expenses and refunds.",
            "Net Revenue: Your revenue after refunds, taxes, and fees.",
            "Average Order Value (AOV): Total revenue divided by number of orders.",
            "Conversion Rate: Percentage of visitors who make a purchase.",
            "Customer Acquisition Cost: How much you spend to get each new customer."
          ]
        },
        {
          title: "Daily, Weekly, and Monthly Analysis",
          content: [
            "Daily: Monitor for unusual spikes or drops in sales.",
            "Weekly: Identify patterns (weekends vs weekdays).",
            "Monthly: Track growth trends and seasonal patterns.",
            "Quarterly: Plan inventory and marketing strategies."
          ]
        },
        {
          title: "Product Performance Analysis",
          content: [
            "Identify your best-selling products and promote them more.",
            "Find underperforming products - improve or discontinue them.",
            "Track inventory turnover rates.",
            "Monitor product return rates and customer feedback."
          ]
        },
        {
          title: "Making Data-Driven Decisions",
          content: [
            "Use trends to inform inventory purchases.",
            "Adjust marketing spend based on customer acquisition costs.",
            "Optimize pricing based on demand patterns.",
            "Plan promotions around slow sales periods."
          ]
        }
      ]
    },
    "Email Marketing That Works": {
      title: "Email Marketing That Works",
      sections: [
        {
          title: "Building Your Email List",
          content: [
            "Offer a valuable lead magnet (discount, guide, or exclusive content).",
            "Add opt-in forms to your website and checkout process.",
            "Never buy email lists - they hurt your deliverability.",
            "Make sure you have permission to email everyone on your list."
          ]
        },
        {
          title: "Types of Email Campaigns",
          content: [
            "Welcome Series: Introduce new subscribers to your brand.",
            "Newsletter: Regular updates about your business and products.",
            "Abandoned Cart: Remind customers about items left in their cart.",
            "Product Recommendations: Suggest products based on past purchases.",
            "Promotional: Announce sales, new products, or special offers."
          ]
        },
        {
          title: "Writing Effective Emails",
          content: [
            "Write compelling subject lines that encourage opens.",
            "Keep your content focused on one main message.",
            "Use a conversational tone that matches your brand.",
            "Include clear calls-to-action that stand out visually."
          ],
          tips: [
            "Personalize with customer's name and purchase history",
            "Test different subject lines to improve open rates",
            "Keep emails mobile-friendly - most people read on phones",
            "Include social proof like reviews or testimonials"
          ]
        },
        {
          title: "Measuring Success",
          content: [
            "Open Rate: Percentage who open your emails (aim for 20-25%).",
            "Click Rate: Percentage who click links in your emails (aim for 2-5%).",
            "Conversion Rate: Percentage who make a purchase from your email.",
            "Unsubscribe Rate: Keep this under 2% per campaign."
          ]
        }
      ]
    },
    "Managing Customer Orders": {
      title: "Managing Customer Orders",
      sections: [
        {
          title: "Order Processing Workflow",
          content: [
            "Set up automated order confirmations that send immediately after purchase.",
            "Create a systematic process for reviewing and fulfilling orders.",
            "Establish clear timelines for processing and shipping.",
            "Implement quality control checks before shipping."
          ]
        },
        {
          title: "Inventory Management",
          content: [
            "Update inventory levels in real-time to prevent overselling.",
            "Set up low-stock alerts for popular products.",
            "Track product performance to inform restocking decisions.",
            "Consider seasonal demand patterns in your ordering."
          ]
        },
        {
          title: "Customer Communication",
          content: [
            "Send order confirmations within minutes of purchase.",
            "Provide shipping confirmations with tracking information.",
            "Be proactive about delays or issues.",
            "Follow up after delivery to ensure satisfaction."
          ]
        },
        {
          title: "Handling Returns and Exchanges",
          content: [
            "Create a clear, customer-friendly return policy.",
            "Process returns quickly to maintain customer trust.",
            "Use returns as learning opportunities to improve products.",
            "Consider offering exchanges instead of refunds when possible."
          ]
        }
      ]
    }
  }

  // Tab configuration with business-focused titles and descriptions
  const tabItems = [
    { 
      key: 'getting-started', 
      label: 'Getting Started',
      title: 'Welcome to Your Online Store',
      description: 'Everything you need to know to launch your business online. Simple step-by-step guides that get you selling quickly.'
    },
    { 
      key: 'grow-sales', 
      label: 'Growing Sales',
      title: 'Boost Your Revenue',
      description: 'Proven strategies and tools to increase your sales, attract more customers, and grow your business profitably.'
    },
    { 
      key: 'customer-success', 
      label: 'Happy Customers',
      title: 'Delight Your Customers',
      description: 'Learn how to provide exceptional customer service, manage orders, and build lasting customer relationships.'
    },
    { 
      key: 'troubleshooting', 
      label: 'Quick Solutions',
      title: 'Solve Common Issues',
      description: 'Fast answers to common questions and step-by-step solutions to get your business running smoothly.'
    },
    { 
      key: 'support', 
      label: 'Get Help',
      title: 'Personal Support',
      description: 'Connect with our support team through chat, email, or phone. We\'re here to help your business succeed.'
    }
  ]

  const currentTabInfo = tabItems.find(tab => tab.key === activeTab) || tabItems[0]

  // Quick Action Cards Data
  const quickActions = [
    {
      title: "Add Your First Product",
      description: "Start selling in minutes with our simple product upload process",
      icon: ShoppingCart,
      color: "blue",
      action: "Add Product",
      time: "5 min"
    },
    {
      title: "Set Up Payments",
      description: "Connect your bank account and start accepting payments securely", 
      icon: CreditCard,
      color: "green",
      action: "Setup Payments",
      time: "10 min"
    },
    {
      title: "Design Your Store",
      description: "Make your store look professional with our easy design tools",
      icon: Palette,
      color: "purple", 
      action: "Customize Store",
      time: "15 min"
    },
    {
      title: "Launch Your Store",
      description: "Go live and start taking orders from customers worldwide",
      icon: Rocket,
      color: "orange",
      action: "Go Live",
      time: "2 min"
    }
  ]

  // Popular Guides
  const popularGuides = [
    {
      title: "How to Add Products That Sell",
      description: "Write descriptions that convert browsers into buyers",
      icon: Star,
      readTime: "8 min",
      category: "Products"
    },
    {
      title: "Setting Up Your Payment Methods",
      description: "Accept credit cards, PayPal, and other payment options",
      icon: CreditCard,
      readTime: "5 min", 
      category: "Payments"
    },
    {
      title: "Shipping Made Simple",
      description: "Configure shipping rates and delivery options",
      icon: Truck,
      readTime: "10 min",
      category: "Fulfillment"
    },
    {
      title: "Understanding Your Sales Reports",
      description: "Track your progress and make data-driven decisions",
      icon: BarChart3,
      readTime: "12 min",
      category: "Analytics"
    },
    {
      title: "Email Marketing That Works",
      description: "Turn visitors into customers with email campaigns",
      icon: Mail,
      readTime: "15 min",
      category: "Marketing"
    },
    {
      title: "Managing Customer Orders",
      description: "Process orders efficiently and keep customers happy",
      icon: CheckCircle,
      readTime: "7 min",
      category: "Orders"
    }
  ]

  // Sales Growth Tips
  const salesGrowthTips = [
    {
      title: "Double Your Conversion Rate",
      description: "Simple changes that can double your sales overnight",
      icon: TrendingUp,
      impact: "High Impact",
      difficulty: "Easy",
      time: "30 min"
    },
    {
      title: "Recover Abandoned Carts",
      description: "Win back customers who left items in their cart",
      icon: ShoppingCart,
      impact: "High Impact", 
      difficulty: "Medium",
      time: "45 min"
    },
    {
      title: "Use Customer Reviews",
      description: "Build trust and increase sales with social proof",
      icon: Star,
      impact: "Medium Impact",
      difficulty: "Easy", 
      time: "20 min"
    },
    {
      title: "Optimize Product Photos",
      description: "Professional-looking photos that sell products",
      icon: Camera,
      impact: "High Impact",
      difficulty: "Easy",
      time: "60 min"
    },
    {
      title: "Create Urgency & Scarcity",
      description: "Psychological triggers that motivate purchases",
      icon: Clock,
      impact: "Medium Impact",
      difficulty: "Easy",
      time: "15 min"
    },
    {
      title: "Bundle Products Together",
      description: "Increase average order value with smart bundling",
      icon: Gift,
      impact: "High Impact",
      difficulty: "Medium",
      time: "40 min"
    }
  ]

  // Detailed Sales Growth Strategy Content
  const salesStrategyDetails: Record<string, {
    overview: string
    steps: Array<{
      title: string
      description: string
      action: string
    }>
    results: string
    tips: string[]
    warning?: string
  }> = {
    "Double Your Conversion Rate": {
      overview: "Conversion rate optimization is the fastest way to increase revenue without spending more on marketing. Small changes to your store can have massive impact on sales.",
      steps: [
        {
          title: "Simplify Your Checkout Process",
          description: "Remove unnecessary form fields and steps that cause customers to abandon their purchase.",
          action: "Reduce checkout to 3 steps or fewer, offer guest checkout option"
        },
        {
          title: "Add Trust Signals",
          description: "Display security badges, customer reviews, and money-back guarantees prominently.",
          action: "Add SSL certificate badge, display customer testimonials, create clear return policy"
        },
        {
          title: "Improve Product Descriptions",
          description: "Focus on benefits over features and address common customer objections upfront.",
          action: "Rewrite descriptions to answer 'What's in it for me?' and include size charts/specifications"
        },
        {
          title: "Optimize Call-to-Action Buttons",
          description: "Make your 'Add to Cart' and 'Buy Now' buttons more compelling and visible.",
          action: "Use action-oriented text like 'Get Yours Today' and choose contrasting colors"
        }
      ],
      results: "Most stores see 15-30% increase in conversion rate within 2 weeks of implementing these changes.",
      tips: [
        "Test one change at a time to measure impact",
        "Use urgency without being pushy ('Limited stock' vs 'Buy now or regret forever!')",
        "Mobile users convert differently - optimize for phone screens",
        "A/B test different button colors and text"
      ]
    },
    "Recover Abandoned Carts": {
      overview: "70% of shopping carts are abandoned before checkout. Recovering even 10% of these can significantly boost your revenue without acquiring new customers.",
      steps: [
        {
          title: "Set Up Automated Email Sequences",
          description: "Create a series of emails that automatically send when customers leave items in their cart.",
          action: "Email 1: 1 hour after abandonment (gentle reminder), Email 2: 24 hours (add urgency), Email 3: 72 hours (offer small discount)"
        },
        {
          title: "Analyze Abandonment Reasons",
          description: "Understand why customers are leaving to address the root causes.",
          action: "Survey customers, check for high shipping costs, complicated checkout, or technical issues"
        },
        {
          title: "Implement Exit-Intent Popups",
          description: "Catch customers before they leave with a compelling offer or reminder.",
          action: "Create popup with discount code or free shipping offer when mouse moves toward browser close button"
        },
        {
          title: "Retargeting Ads",
          description: "Show ads featuring the abandoned products on social media and other websites.",
          action: "Set up Facebook and Google retargeting pixels to show abandoned products in ads"
        }
      ],
      results: "Well-executed cart recovery campaigns typically recover 5-15% of abandoned carts, increasing overall revenue by 2-5%.",
      tips: [
        "Don't be too aggressive - space out your emails",
        "Personalize with customer name and actual products left behind",
        "Mobile-optimize all recovery emails",
        "Include product images in recovery emails"
      ]
    },
    "Use Customer Reviews": {
      overview: "93% of consumers read online reviews before making a purchase. Social proof is one of the most powerful tools for increasing sales and building trust.",
      steps: [
        {
          title: "Collect Reviews Systematically",
          description: "Set up automated systems to request reviews from every customer after their purchase.",
          action: "Send review request emails 7-14 days after delivery, offer small incentive for honest reviews"
        },
        {
          title: "Display Reviews Prominently",
          description: "Show customer reviews and ratings prominently on product pages and throughout your site.",
          action: "Add star ratings to product listings, feature customer photos, create testimonial sections"
        },
        {
          title: "Respond to All Reviews",
          description: "Engage with both positive and negative reviews to show you care about customer experience.",
          action: "Thank customers for positive reviews, address concerns in negative reviews professionally"
        },
        {
          title: "Use Reviews in Marketing",
          description: "Leverage great reviews in your email marketing, social media, and advertising.",
          action: "Create social media posts featuring customer testimonials, add reviews to email newsletters"
        }
      ],
      results: "Products with reviews convert 3.5x better than those without. Even a few negative reviews (20% or less) can actually increase trust.",
      tips: [
        "Photos in reviews increase their impact by 200%",
        "Respond to negative reviews thoughtfully - it shows you care",
        "Feature reviews from customers similar to your target audience",
        "Use review snippets in Google Ads for better performance"
      ]
    },
    "Optimize Product Photos": {
      overview: "Product photos are often the deciding factor in online purchases. High-quality, professional images can dramatically increase conversion rates and reduce returns.",
      steps: [
        {
          title: "Master Lighting Techniques",
          description: "Use natural lighting or proper studio lighting to showcase your products accurately.",
          action: "Shoot near large windows during daylight, avoid harsh shadows, use reflectors to fill dark areas"
        },
        {
          title: "Show Multiple Angles",
          description: "Provide comprehensive views of your product from different perspectives.",
          action: "Take front, back, side, top, and detail shots. Include close-ups of texture, materials, and important features"
        },
        {
          title: "Include Lifestyle Shots",
          description: "Show products in use or in real-world settings to help customers visualize ownership.",
          action: "Photograph products being used by real people, in appropriate settings, showing scale and context"
        },
        {
          title: "Optimize for Web",
          description: "Ensure fast loading times while maintaining image quality across all devices.",
          action: "Compress images without losing quality, use consistent dimensions, enable zoom functionality"
        }
      ],
      results: "Professional product photography can increase conversion rates by 30-60% and reduce return rates by showing products accurately.",
      tips: [
        "Consistency across all product photos builds brand trust",
        "Include a size reference (coin, ruler, or person) for scale",
        "For fashion, show items on models and flat lay styles",
        "Invest in a good camera or hire a professional photographer"
      ],
      warning: "Poor photos are the #1 reason customers return items. Invest time in getting this right from the start."
    },
    "Create Urgency & Scarcity": {
      overview: "Psychological triggers like urgency and scarcity tap into our fear of missing out, motivating faster purchase decisions when used ethically.",
      steps: [
        {
          title: "Limited-Time Offers",
          description: "Create genuine time-sensitive promotions that encourage immediate action.",
          action: "Run flash sales, holiday promotions, or weekend specials with clear countdown timers"
        },
        {
          title: "Inventory Scarcity Indicators",
          description: "Show real stock levels to create natural urgency without being deceptive.",
          action: "Display 'Only 3 left in stock' or 'Low inventory' messages when items are genuinely running low"
        },
        {
          title: "Social Proof Urgency",
          description: "Show how many people are viewing or have recently purchased items.",
          action: "Add notifications like '5 people bought this in the last hour' or '12 people are viewing this item'"
        },
        {
          title: "Exclusive Access",
          description: "Make certain products or discounts available only to specific customer groups.",
          action: "Create VIP early access for email subscribers, member-only products, or loyalty program exclusives"
        }
      ],
      results: "Ethical urgency and scarcity tactics can increase conversion rates by 10-25% without negatively impacting customer trust.",
      tips: [
        "Always be truthful - fake scarcity destroys trust",
        "Use countdown timers sparingly to maintain effectiveness",
        "Combine urgency with value (discount + time limit)",
        "Test different urgency messages to see what resonates with your audience"
      ],
      warning: "Never use fake urgency or scarcity. Customers will discover dishonesty and it will damage your brand permanently."
    },
    "Bundle Products Together": {
      overview: "Product bundling increases average order value by encouraging customers to buy complementary items together, often at a perceived discount.",
      steps: [
        {
          title: "Identify Complementary Products",
          description: "Find products that naturally work well together or solve related problems.",
          action: "Analyze purchase history to see what customers buy together, group products by use case or theme"
        },
        {
          title: "Create Value-Driven Bundles",
          description: "Package products in a way that provides clear value and convenience to customers.",
          action: "Offer bundles at 10-20% less than individual prices, create themed collections (starter kit, complete set)"
        },
        {
          title: "Present Bundles Strategically",
          description: "Show bundles prominently on product pages and during checkout process.",
          action: "Add 'Frequently bought together' sections, offer bundle upgrades in cart, feature bundles on homepage"
        },
        {
          title: "Test Different Bundle Types",
          description: "Experiment with various bundling strategies to find what works best for your products.",
          action: "Try complementary bundles, tiered bundles (good/better/best), or seasonal collections"
        }
      ],
      results: "Effective product bundling can increase average order value by 20-50% and improve customer satisfaction through convenience.",
      tips: [
        "Bundle best-sellers with slow-moving inventory",
        "Create urgency with limited-time bundle offers",
        "Use clear savings messaging ('Save $25 when you buy together')",
        "Make it easy to buy individual items too - don't force bundles"
      ]
    }
  }

  // Customer Success Strategies
  const customerSuccessStrategies = [
    {
      title: "Lightning-Fast Order Processing",
      description: "Process and ship orders quickly to delight customers",
      icon: Zap,
      benefit: "Higher Ratings"
    },
    {
      title: "Proactive Communication", 
      description: "Keep customers informed at every step of their order",
      icon: MessageCircle,
      benefit: "Fewer Complaints"
    },
    {
      title: "Easy Returns Policy",
      description: "Make returns simple to build customer confidence",
      icon: Shield,
      benefit: "More Sales"
    },
    {
      title: "Personal Touch",
      description: "Add handwritten notes or small gifts to create loyalty",
      icon: Heart,
      benefit: "Repeat Customers"
    },
    {
      title: "Follow-Up After Delivery",
      description: "Check in with customers to ensure satisfaction",
      icon: CheckCircle,
      benefit: "Great Reviews"
    },
    {
      title: "Reward Loyal Customers",
      description: "Create a loyalty program that encourages repeat purchases",
      icon: Award,
      benefit: "Customer Retention"
    }
  ]

  // Common Issues & Solutions
  const commonIssues = [
    {
      issue: "My store isn't getting any visitors",
      solution: "Add SEO-friendly product descriptions and share your store on social media",
      category: "Traffic",
      difficulty: "Easy"
    },
    {
      issue: "Customers add items to cart but don't buy",
      solution: "Reduce shipping costs, add customer reviews, and simplify checkout",
      category: "Conversion", 
      difficulty: "Medium"
    },
    {
      issue: "Payment processing isn't working",
      solution: "Check your Stripe connection and ensure all required fields are completed",
      category: "Payments",
      difficulty: "Easy"
    },
    {
      issue: "Products aren't showing up on my store",
      solution: "Make sure products are marked as 'Active' and have valid prices and descriptions",
      category: "Products",
      difficulty: "Easy"
    },
    {
      issue: "Shipping calculations seem wrong",
      solution: "Review your shipping zones and rates in the Delivery settings section",
      category: "Shipping", 
      difficulty: "Medium"
    },
    {
      issue: "Email notifications not sending",
      solution: "Verify your email settings and check spam folders for test emails",
      category: "Email",
      difficulty: "Easy"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Hero Section */}
      <div className="bg-gradient-to-r from-[#9B51E0]/10 to-[#7C3AED]/10 border border-[#9B51E0]/20 rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <GenieMascot mood="helpful" size="xl" showBackground />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Your Business Success Hub</h1>
          <p className="text-lg text-[#A0A0A0] max-w-3xl mx-auto mb-8">
            Everything you need to build, grow, and manage your online store. 
            From your first sale to scaling your business - we've got you covered with simple, actionable guidance.
          </p>
          
          {/* Quick Search */}
          <div className="max-w-lg mx-auto mb-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Search for help with products, orders, payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#9B51E0] transition-colors text-base"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
              >
                Search
              </button>
            </form>
          </div>

          {/* Success Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50,000+</div>
              <div className="text-sm text-[#A0A0A0]">Happy Store Owners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">$2.5M+</div>
              <div className="text-sm text-[#A0A0A0]">In Sales Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">&lt; 2 hrs</div>
              <div className="text-sm text-[#A0A0A0]">Average Setup Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-[#A0A0A0]">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Section with Separate Navigation and Content Boxes */}
      <TabSection
        title={currentTabInfo.title}
        description={currentTabInfo.description}
        items={tabItems.map(tab => ({
          key: tab.key,
          label: tab.label
        }))}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="secondary"
      >
        {/* Getting Started Tab */}
        {activeTab === 'getting-started' && (
          <div className="space-y-8">
            {/* Quick Start Actions */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Rocket className="w-6 h-6 text-[#9B51E0]" />
                <span>Launch Your Store in 4 Simple Steps</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <div key={index} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#9B51E0]/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        action.color === 'blue' ? 'bg-blue-500/20' :
                        action.color === 'green' ? 'bg-green-500/20' :
                        action.color === 'purple' ? 'bg-purple-500/20' : 'bg-orange-500/20'
                      }`}>
                        <action.icon className={`w-6 h-6 ${
                          action.color === 'blue' ? 'text-blue-400' :
                          action.color === 'green' ? 'text-green-400' :
                          action.color === 'purple' ? 'text-purple-400' : 'text-orange-400'
                        }`} />
                      </div>
                      <div className="text-xs text-[#A0A0A0] bg-[#2A2A2A] px-2 py-1 rounded-full">
                        {action.time}
                      </div>
                    </div>
                    <h4 className="font-semibold text-white mb-2">{action.title}</h4>
                    <p className="text-sm text-[#A0A0A0] mb-4 leading-relaxed">{action.description}</p>
                    <button 
                      className="w-full px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm font-medium"
                      onClick={() => {
                        if (action.action.includes('Add Product')) handleNavigateToProducts()
                        else if (action.action.includes('Setup Payments')) handleNavigateToSettings('payment')
                        else if (action.action.includes('Customize Store')) handleNavigateToPageBuilder()
                        else if (action.action.includes('Go Live')) handleNavigateToSettings('general')
                      }}
                    >
                      {action.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Guides */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-[#9B51E0]" />
                <span>Most Popular Guides</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularGuides.map((guide, index) => (
                  <div key={index} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#9B51E0]/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <guide.icon className="w-8 h-8 text-[#9B51E0] flex-shrink-0" />
                      <div className="text-right">
                        <div className="text-xs text-[#A0A0A0] bg-[#2A2A2A] px-2 py-1 rounded-full mb-1">
                          {guide.category}
                        </div>
                        <div className="text-xs text-[#A0A0A0]">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {guide.readTime}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-white mb-2 leading-tight">{guide.title}</h4>
                    <p className="text-sm text-[#A0A0A0] mb-4 leading-relaxed">{guide.description}</p>
                    <button 
                      className="flex items-center text-[#9B51E0] text-sm font-medium hover:text-[#A051E0] transition-colors"
                      onClick={() => {
                        console.log('Clicked guide:', guide.title)
                        console.log('Guide content exists:', !!guideContent[guide.title])
                        setActiveGuide(guide.title)
                      }}
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Guide Content Display */}
            {activeGuide && guideContent[activeGuide] && (
              <div className="mt-8 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#3A3A3A] bg-[#2A2A2A]">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <BookOpen className="w-6 h-6 text-[#9B51E0]" />
                    <span>{guideContent[activeGuide].title}</span>
                  </h3>
                  <button
                    onClick={() => setActiveGuide(null)}
                    className="w-8 h-8 bg-[#3A3A3A] hover:bg-[#4A4A4A] rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="text-white text-lg">×</span>
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-8">
                  {guideContent[activeGuide].sections.map((section, index) => (
                    <div key={index} className="space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <span className="w-8 h-8 bg-[#9B51E0] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span>{section.title}</span>
                      </h4>
                      
                      <div className="space-y-3">
                        {section.content.map((paragraph, pIndex) => (
                          <p key={pIndex} className="text-[#A0A0A0] leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      
                      {section.tips && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <h5 className="text-blue-400 font-medium mb-3 flex items-center space-x-2">
                            <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">💡</span>
                            <span>Pro Tips</span>
                          </h5>
                          <ul className="space-y-2">
                            {section.tips.map((tip, tIndex) => (
                              <li key={tIndex} className="text-[#A0A0A0] text-sm flex items-start space-x-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {section.warning && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                          <h5 className="text-yellow-400 font-medium mb-2 flex items-center space-x-2">
                            <span className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">⚠</span>
                            <span>Important Warning</span>
                          </h5>
                          <p className="text-[#A0A0A0] text-sm">{section.warning}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-[#3A3A3A] bg-[#2A2A2A]">
                  <div className="text-sm text-[#A0A0A0]">
                    Need more help? Contact our support team
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setActiveGuide(null)
                        // Navigate to the appropriate dashboard section after reading the guide
                        if (activeGuide?.includes('Products')) handleNavigateToProducts()
                        else if (activeGuide?.includes('Payment')) handleNavigateToSettings('payment')
                        else if (activeGuide?.includes('Shipping')) handleNavigateToSettings('delivery')
                        else if (activeGuide?.includes('Reports')) handleNavigateToAnalytics()
                        else if (activeGuide?.includes('Email')) handleNavigateToNurture()
                        else if (activeGuide?.includes('Orders')) handleNavigateToCustomers()
                      }}
                      className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                    >
                      Implement This Guide
                    </button>
                    <button
                      onClick={() => setActiveGuide(null)}
                      className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg hover:bg-[#4A4A4A] transition-colors text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Getting Started Guide */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-[#9B51E0]" />
                <span>Complete Setup Checklist</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    <span>Store Foundation (Day 1)</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Set up store details</div>
                        <div className="text-sm text-[#A0A0A0]">Store name, description, and contact information</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Upload your logo</div>
                        <div className="text-sm text-[#A0A0A0]">Brand recognition starts with your visual identity</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Configure payment methods</div>
                        <div className="text-sm text-[#A0A0A0]">Connect Stripe, PayPal, or other payment processors</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Set up shipping zones</div>
                        <div className="text-sm text-[#A0A0A0]">Define where you deliver and shipping costs</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                    <Rocket className="w-5 h-5 text-orange-400" />
                    <span>Ready to Launch (Day 2-3)</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Add your first products</div>
                        <div className="text-sm text-[#A0A0A0]">High-quality photos and compelling descriptions</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Customize your storefront</div>
                        <div className="text-sm text-[#A0A0A0]">Choose colors, fonts, and layout that match your brand</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Test your checkout process</div>
                        <div className="text-sm text-[#A0A0A0]">Make sure customers can complete purchases smoothly</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">Go live!</div>
                        <div className="text-sm text-[#A0A0A0]">Share your store with the world and start taking orders</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-[#9B51E0]/10 border border-[#9B51E0]/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-[#9B51E0]" />
                  <div>
                    <div className="text-white font-medium">Average setup time: 90 minutes</div>
                    <div className="text-sm text-[#A0A0A0]">Most store owners complete setup in under 2 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Tutorials */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Video className="w-6 h-6 text-[#9B51E0]" />
                <span>Video Tutorials</span>
                <span className="text-sm text-[#A0A0A0] font-normal">(Watch & Learn)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden hover:border-[#9B51E0]/30 transition-colors">
                  <div className="aspect-video bg-gradient-to-br from-[#9B51E0]/20 to-[#7C3AED]/20 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-white mb-2">Complete Store Setup (20 mins)</h4>
                    <p className="text-sm text-[#A0A0A0] mb-4">Watch as we build a complete online store from scratch</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-[#A0A0A0]">
                        <Users className="w-3 h-3" />
                        <span>12,450 views</span>
                      </div>
                      <button 
                        className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                        onClick={() => handleOpenExternalLink('https://www.youtube.com/c/SellUsGenieOfficial')}
                      >
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden hover:border-[#9B51E0]/30 transition-colors">
                  <div className="aspect-video bg-gradient-to-br from-[#9B51E0]/20 to-[#7C3AED]/20 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-white mb-2">First Sale Celebration (8 mins)</h4>
                    <p className="text-sm text-[#A0A0A0] mb-4">Everything you need to know after making your first sale</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-[#A0A0A0]">
                        <Users className="w-3 h-3" />
                        <span>8,920 views</span>
                      </div>
                      <button 
                        className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                        onClick={() => handleOpenExternalLink('https://www.youtube.com/c/SellUsGenieOfficial')}
                      >
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Growing Sales Tab */}
        {activeTab === 'grow-sales' && (
          <div className="space-y-8">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Tertiary Tabs for Growing Sales */}
            <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-[#3A3A3A]">
                <button
                  onClick={() => setGrowingSalesTab('sales-growth-plan')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    growingSalesTab === 'sales-growth-plan'
                      ? 'bg-[#9B51E0] text-white'
                      : 'bg-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A]'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Sales Growth Plan</span>
                  </div>
                </button>
                <button
                  onClick={() => setGrowingSalesTab('sales-growth-strategies')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    growingSalesTab === 'sales-growth-strategies'
                      ? 'bg-[#9B51E0] text-white'
                      : 'bg-[#2A2A2A] text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A]'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Sales Growth Strategies</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {/* Sales Growth Plan Tab */}
                {growingSalesTab === 'sales-growth-plan' && (
                  <div className="space-y-8">
                    {/* Revenue Calculator */}
                    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-8">
                      <div className="text-center mb-6">
                        <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Revenue Growth Calculator</h3>
                        <p className="text-[#A0A0A0] max-w-2xl mx-auto">
                          See how small improvements can dramatically increase your monthly revenue
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                          <div className="text-2xl font-bold text-white mb-2">+25%</div>
                          <div className="text-sm text-[#A0A0A0] mb-3">More visitors from SEO</div>
                          <div className="text-xs text-green-400">+$500/month potential</div>
                        </div>
                        <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                          <div className="text-2xl font-bold text-white mb-2">+15%</div>
                          <div className="text-sm text-[#A0A0A0] mb-3">Better conversion rate</div>
                          <div className="text-xs text-green-400">+$300/month potential</div>
                        </div>
                        <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                          <div className="text-2xl font-bold text-white mb-2">+30%</div>
                          <div className="text-sm text-[#A0A0A0] mb-3">Higher average order</div>
                          <div className="text-xs text-green-400">+$600/month potential</div>
                        </div>
                      </div>
                      <div className="text-center mt-6">
                        <div className="text-2xl font-bold text-green-400 mb-2">Total: +$1,400/month</div>
                        <p className="text-sm text-[#A0A0A0]">Realistic revenue increase with our growth strategies</p>
                      </div>
                    </div>

                    {/* Step-by-Step Sales Growth Plan */}
                    <div className="bg-[#2A2A2A] rounded-lg p-8 border border-[#3A3A3A]">
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                        <Target className="w-6 h-6 text-[#9B51E0]" />
                        <span>Step-by-Step Sales Growth Plan</span>
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                            <span>Optimize Product Listings (Week 1)</span>
                          </h4>
                          <div className="space-y-4 mb-6">
                            <div className="p-4 bg-[#1E1E1E] rounded-lg">
                              <div className="font-medium text-white mb-2">Professional Product Photos</div>
                              <div className="text-sm text-[#A0A0A0] mb-3">
                                Use natural lighting, multiple angles, and lifestyle shots showing products in use
                              </div>
                              <div className="flex items-center text-sm text-green-400">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span>Can increase sales by 40%</span>
                              </div>
                            </div>
                            <div className="p-4 bg-[#1E1E1E] rounded-lg">
                              <div className="font-medium text-white mb-2">Compelling Product Descriptions</div>
                              <div className="text-sm text-[#A0A0A0] mb-3">
                                Focus on benefits, not features. Tell a story about how your product solves problems
                              </div>
                              <div className="flex items-center text-sm text-green-400">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span>Improves conversion by 25%</span>
                              </div>
                            </div>
                          </div>

                          <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                            <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                            <span>Build Customer Trust (Week 2)</span>
                          </h4>
                          <div className="space-y-4">
                            <div className="p-4 bg-[#1E1E1E] rounded-lg">
                              <div className="font-medium text-white mb-2">Customer Reviews & Testimonials</div>
                              <div className="text-sm text-[#A0A0A0] mb-3">
                                Follow up with customers for reviews. Display testimonials prominently on product pages
                              </div>
                              <div className="flex items-center text-sm text-green-400">
                                <Star className="w-4 h-4 mr-1" />
                                <span>Increases trust & purchases by 35%</span>
                              </div>
                            </div>
                            <div className="p-4 bg-[#1E1E1E] rounded-lg">
                              <div className="font-medium text-white mb-2">Security & Trust Badges</div>
                              <div className="text-sm text-[#A0A0A0] mb-3">
                                Display SSL certificates, payment security badges, and money-back guarantees
                              </div>
                              <div className="flex items-center text-sm text-green-400">
                                <Shield className="w-4 h-4 mr-1" />
                                <span>Reduces cart abandonment by 20%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                            <span>Drive More Traffic (Week 3)</span>
                          </h4>
                          <div className="space-y-4 mb-6">
                            <div className="p-4 bg-[#1E1E1E] rounded-lg">
                              <div className="font-medium text-white mb-2">Social Media Marketing</div>
                              <div className="text-sm text-[#A0A0A0] mb-3">
                                Share product photos, customer stories, and behind-the-scenes content on Instagram, Facebook
                              </div>
                              <div className="flex items-center text-sm text-green-400">
                                <Users className="w-4 h-4 mr-1" />
                                <span>Organic reach to potential customers</span>
                              </div>
                            </div>
                            <div className="p-4 bg-[#1E1E1E] rounded-lg">
                              <div className="font-medium text-white mb-2">Email Marketing Campaigns</div>
                              <div className="text-sm text-[#A0A0A0] mb-3">
                                Send newsletters, abandoned cart reminders, and special offers to your customer list
                              </div>
                              <div className="flex items-center text-sm text-green-400">
                                <Mail className="w-4 h-4 mr-1" />
                                <span>38x ROI on email marketing</span>
                              </div>
                            </div>
                          </div>

                          <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                            <span>Increase Order Value (Week 4)</span>
                          </h4>
                          <div className="space-y-4">
                            <div className="p-4 bg-[#1E1E1E] rounded-lg">
                              <div className="font-medium text-white mb-2">Product Bundles & Upsells</div>
                              <div className="text-sm text-[#A0A0A0] mb-3">
                                Offer complementary products together at a discount. Suggest upgrades during checkout
                              </div>
                              <div className="flex items-center text-sm text-green-400">
                                <Gift className="w-4 h-4 mr-1" />
                                <span>Increases average order by 30%</span>
                              </div>
                            </div>
                            <div className="p-4 bg-[#1E1E1E] rounded-lg">
                              <div className="font-medium text-white mb-2">Free Shipping Thresholds</div>
                              <div className="text-sm text-[#A0A0A0] mb-3">
                                Offer free shipping on orders over $50 to encourage customers to buy more
                              </div>
                              <div className="flex items-center text-sm text-green-400">
                                <Truck className="w-4 h-4 mr-1" />
                                <span>Boosts order size by 25%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sales Growth Strategies Tab */}
                {growingSalesTab === 'sales-growth-strategies' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                      <TrendingUp className="w-6 h-6 text-[#9B51E0]" />
                      <span>Proven Sales Growth Strategies</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {salesGrowthTips.map((tip, index) => (
                        <div key={index} className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#9B51E0]/30 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <tip.icon className="w-8 h-8 text-[#9B51E0]" />
                            <div className="text-right">
                              <div className={`text-xs px-2 py-1 rounded-full mb-1 ${
                                tip.impact === 'High Impact' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {tip.impact}
                              </div>
                              <div className="text-xs text-[#A0A0A0]">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {tip.time}
                              </div>
                            </div>
                          </div>
                          <h4 className="font-semibold text-white mb-2 leading-tight">{tip.title}</h4>
                          <p className="text-sm text-[#A0A0A0] mb-4 leading-relaxed">{tip.description}</p>
                          <div className="flex items-center justify-between">
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              tip.difficulty === 'Easy' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {tip.difficulty}
                            </div>
                            <button 
                              className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                              onClick={() => {
                                setExpandedStrategy(expandedStrategy === tip.title ? null : tip.title)
                              }}
                            >
                              {expandedStrategy === tip.title ? 'Hide Details' : 'Learn How'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Expanded Strategy Details */}
                    {expandedStrategy && salesStrategyDetails[expandedStrategy] && (
                      <div className="mt-8 bg-[#1E1E1E] border border-[#9B51E0]/30 rounded-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xl font-semibold text-white">{expandedStrategy}</h4>
                          <button
                            onClick={() => setExpandedStrategy(null)}
                            className="text-[#A0A0A0] hover:text-white transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Overview */}
                          <div>
                            <h5 className="text-lg font-medium text-white mb-3">Overview</h5>
                            <p className="text-[#A0A0A0] leading-relaxed">{salesStrategyDetails[expandedStrategy].overview}</p>
                          </div>
                          
                          {/* Implementation Steps */}
                          <div>
                            <h5 className="text-lg font-medium text-white mb-4">Implementation Steps</h5>
                            <div className="space-y-4">
                              {salesStrategyDetails[expandedStrategy].steps.map((step, index) => (
                                <div key={index} className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A]">
                                  <div className="flex items-start space-x-4">
                                    <div className="w-8 h-8 bg-[#9B51E0] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <h6 className="font-semibold text-white mb-2">{step.title}</h6>
                                      <p className="text-[#A0A0A0] mb-3 text-sm leading-relaxed">{step.description}</p>
                                      <div className="bg-[#9B51E0]/10 border border-[#9B51E0]/20 rounded-lg p-3">
                                        <div className="text-xs font-medium text-[#9B51E0] mb-1">ACTION TO TAKE:</div>
                                        <div className="text-sm text-white">{step.action}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Expected Results */}
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <h5 className="text-lg font-medium text-green-400 mb-2 flex items-center space-x-2">
                              <TrendingUp className="w-5 h-5" />
                              <span>Expected Results</span>
                            </h5>
                            <p className="text-[#A0A0A0] leading-relaxed">{salesStrategyDetails[expandedStrategy].results}</p>
                          </div>
                          
                          {/* Pro Tips */}
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <h5 className="text-lg font-medium text-blue-400 mb-3 flex items-center space-x-2">
                              <span>💡</span>
                              <span>Pro Tips</span>
                            </h5>
                            <ul className="space-y-2">
                              {salesStrategyDetails[expandedStrategy].tips.map((tip, index) => (
                                <li key={index} className="text-[#A0A0A0] text-sm flex items-start space-x-2">
                                  <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Warning if exists */}
                          {salesStrategyDetails[expandedStrategy].warning && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                              <h5 className="text-lg font-medium text-yellow-400 mb-2 flex items-center space-x-2">
                                <span>⚠️</span>
                                <span>Important Warning</span>
                              </h5>
                              <p className="text-[#A0A0A0] leading-relaxed">{salesStrategyDetails[expandedStrategy].warning}</p>
                            </div>
                          )}
                          
                          {/* Action Button */}
                          <div className="flex items-center justify-between pt-4 border-t border-[#3A3A3A]">
                            <div className="text-sm text-[#A0A0A0]">
                              Ready to implement this strategy?
                            </div>
                            <button
                              onClick={() => {
                                setExpandedStrategy(null)
                                // Navigate to relevant dashboard section
                                if (expandedStrategy?.includes('Conversion')) handleNavigateToAnalytics()
                                else if (expandedStrategy?.includes('Cart')) handleNavigateToNurture()
                                else if (expandedStrategy?.includes('Reviews')) handleNavigateToSettings('general')
                                else if (expandedStrategy?.includes('Photos')) handleNavigateToProducts()
                                else if (expandedStrategy?.includes('Urgency')) handleNavigateToPageBuilder()
                                else if (expandedStrategy?.includes('Bundle')) handleNavigateToProducts()
                                else handleNavigateToProducts()
                              }}
                              className="px-6 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors font-medium"
                            >
                              Implement Now →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Success Tab */}
        {activeTab === 'customer-success' && (
          <div className="space-y-8">
            {/* Customer Success Strategies */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Heart className="w-6 h-6 text-[#9B51E0]" />
                <span>Build Customer Loyalty</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customerSuccessStrategies.map((strategy, index) => (
                  <div key={index} className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#9B51E0]/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <strategy.icon className="w-8 h-8 text-[#9B51E0]" />
                      <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        {strategy.benefit}
                      </div>
                    </div>
                    <h4 className="font-semibold text-white mb-2 leading-tight">{strategy.title}</h4>
                    <p className="text-sm text-[#A0A0A0] mb-4 leading-relaxed">{strategy.description}</p>
                    <button 
                      className="w-full px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                      onClick={() => {
                        if (strategy.title.includes('Processing')) handleNavigateToCustomers()
                        else if (strategy.title.includes('Communication')) handleNavigateToNurture()
                        else if (strategy.title.includes('Returns')) handleNavigateToSettings('general')
                        else if (strategy.title.includes('Personal')) handleNavigateToSettings('general')
                        else if (strategy.title.includes('Follow-Up')) handleNavigateToNurture()
                        else if (strategy.title.includes('Reward')) handleNavigateToSettings('integrations')
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Management Guide */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-[#9B51E0]" />
                <span>Order Processing Excellence</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center space-x-2">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span>Order Received</span>
                  </h4>
                  <div className="p-4 bg-[#2A2A2A] rounded-lg">
                    <div className="text-sm text-[#A0A0A0] mb-3">
                      <strong className="text-white">Within 15 minutes:</strong>
                    </div>
                    <ul className="space-y-2 text-sm text-[#A0A0A0]">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Send order confirmation email</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Verify payment processed</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Check inventory availability</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center space-x-2">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span>Processing & Packing</span>
                  </h4>
                  <div className="p-4 bg-[#2A2A2A] rounded-lg">
                    <div className="text-sm text-[#A0A0A0] mb-3">
                      <strong className="text-white">Within 24 hours:</strong>
                    </div>
                    <ul className="space-y-2 text-sm text-[#A0A0A0]">
                      <li className="flex items-start space-x-2">
                        <Package className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span>Pick items from inventory</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Package className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span>Quality check each product</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Package className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span>Pack with care & branded materials</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white flex items-center space-x-2">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span>Shipped & Delivered</span>
                  </h4>
                  <div className="p-4 bg-[#2A2A2A] rounded-lg">
                    <div className="text-sm text-[#A0A0A0] mb-3">
                      <strong className="text-white">Same/Next day:</strong>
                    </div>
                    <ul className="space-y-2 text-sm text-[#A0A0A0]">
                      <li className="flex items-start space-x-2">
                        <Truck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Ship via preferred carrier</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Truck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Send tracking information</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Truck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Follow up after delivery</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-[#9B51E0]/10 border border-[#9B51E0]/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-[#9B51E0]" />
                  <div>
                    <div className="text-white font-medium">Pro Tip: Personal Touch</div>
                    <div className="text-sm text-[#A0A0A0]">Include a handwritten thank-you note with orders. It costs pennies but creates lasting impressions and repeat customers.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Service Tools */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-[#9B51E0]" />
                <span>Customer Service Excellence</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-white mb-4">Response Time Goals</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                      <span className="text-white">Email Inquiries</span>
                      <span className="text-green-400 font-medium">&lt; 4 hours</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                      <span className="text-white">Order Issues</span>
                      <span className="text-green-400 font-medium">&lt; 2 hours</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                      <span className="text-white">Shipping Questions</span>
                      <span className="text-green-400 font-medium">&lt; 1 hour</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-4">Customer Satisfaction Score</h4>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">4.8★</div>
                    <div className="text-[#A0A0A0] mb-4">Industry Average: 3.2★</div>
                    <div className="text-sm text-green-400">You're exceeding expectations!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Troubleshooting Tab */}
        {activeTab === 'troubleshooting' && (
          <div className="space-y-8">
            {/* Detailed Troubleshooting Guide */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Settings className="w-6 h-6 text-[#9B51E0]" />
                <span>Step-by-Step Problem Solving</span>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-[#2A2A2A] rounded-lg">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">!</div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Payments Not Working</h4>
                        <p className="text-sm text-[#A0A0A0] mb-4">Customers can't complete purchases or payment errors occur</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 1: Check Stripe Connection</div>
                        <div className="text-[#A0A0A0] pl-4">• Go to Settings → Payment Methods<br/>• Verify Stripe keys are correct<br/>• Test with Stripe test mode first</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 2: Verify SSL Certificate</div>
                        <div className="text-[#A0A0A0] pl-4">• Ensure your domain has valid SSL<br/>• Check for mixed content warnings<br/>• Payment forms require HTTPS</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 3: Test Payment Flow</div>
                        <div className="text-[#A0A0A0] pl-4">• Use Stripe test card numbers<br/>• Complete full checkout process<br/>• Check webhook delivery logs</div>
                      </div>
                    </div>
                    
                    <button 
                      className="mt-4 px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                      onClick={() => handleNavigateToSettings('payment')}
                    >
                      Fix Payment Settings
                    </button>
                  </div>

                  <div className="p-6 bg-[#2A2A2A] rounded-lg">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">?</div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Low Website Traffic</h4>
                        <p className="text-sm text-[#A0A0A0] mb-4">Few visitors finding your store, need more exposure</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 1: Optimize for Search</div>
                        <div className="text-[#A0A0A0] pl-4">• Add descriptive product titles<br/>• Write unique meta descriptions<br/>• Use relevant keywords naturally</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 2: Social Media Presence</div>
                        <div className="text-[#A0A0A0] pl-4">• Share products on Instagram/Facebook<br/>• Post customer photos and reviews<br/>• Use relevant hashtags</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 3: Email Marketing</div>
                        <div className="text-[#A0A0A0] pl-4">• Send newsletters to existing customers<br/>• Create abandoned cart campaigns<br/>• Offer exclusive discounts</div>
                      </div>
                    </div>
                    
                    <button 
                      className="mt-4 px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                      onClick={() => handleNavigateToNurture()}
                    >
                      Start Marketing Campaign
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-[#2A2A2A] rounded-lg">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">⚠</div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Cart Abandonment Issues</h4>
                        <p className="text-sm text-[#A0A0A0] mb-4">Customers add items but don't complete purchase</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 1: Analyze Checkout Flow</div>
                        <div className="text-[#A0A0A0] pl-4">• Test checkout process yourself<br/>• Check for form errors or bugs<br/>• Ensure mobile-friendly design</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 2: Review Shipping Costs</div>
                        <div className="text-[#A0A0A0] pl-4">• High shipping may deter customers<br/>• Offer free shipping thresholds<br/>• Display costs early in process</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 3: Add Trust Elements</div>
                        <div className="text-[#A0A0A0] pl-4">• Display security badges<br/>• Add customer testimonials<br/>• Show clear return policy</div>
                      </div>
                    </div>
                    
                    <button 
                      className="mt-4 px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                      onClick={() => handleNavigateToAnalytics()}
                    >
                      Analyze Cart Abandonment
                    </button>
                  </div>

                  <div className="p-6 bg-[#2A2A2A] rounded-lg">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">i</div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Products Not Displaying</h4>
                        <p className="text-sm text-[#A0A0A0] mb-4">Products added but not showing on storefront</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 1: Check Product Status</div>
                        <div className="text-[#A0A0A0] pl-4">• Ensure products are marked 'Active'<br/>• Verify all required fields filled<br/>• Check price is set correctly</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 2: Review Inventory</div>
                        <div className="text-[#A0A0A0] pl-4">• Products with 0 stock may be hidden<br/>• Update inventory quantities<br/>• Set low stock thresholds</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-white font-medium mb-1">Step 3: Clear Cache</div>
                        <div className="text-[#A0A0A0] pl-4">• Refresh your browser<br/>• Clear browser cache and cookies<br/>• Check in incognito/private mode</div>
                      </div>
                    </div>
                    
                    <button 
                      className="mt-4 px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                      onClick={() => handleNavigateToProducts()}
                    >
                      Review Product Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Solutions */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Zap className="w-6 h-6 text-[#9B51E0]" />
                <span>Quick Solutions to Common Issues</span>
              </h3>
              <div className="space-y-4">
                {commonIssues.map((item, index) => (
                  <div key={index} className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] hover:border-[#9B51E0]/30 transition-colors">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2 leading-tight">{item.issue}</h4>
                          <p className="text-sm text-[#A0A0A0] leading-relaxed">{item.solution}</p>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          <div className="text-xs bg-[#9B51E0]/20 text-[#9B51E0] px-2 py-1 rounded-full">
                            {item.category}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            item.difficulty === 'Easy' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {item.difficulty}
                          </div>
                        </div>
                      </div>
                      <button 
                        className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors text-sm"
                        onClick={() => {
                          if (item.category === 'Traffic') handleNavigateToPageBuilder()
                          else if (item.category === 'Conversion') handleNavigateToAnalytics()
                          else if (item.category === 'Payments') handleNavigateToSettings('payment')
                          else if (item.category === 'Products') handleNavigateToProducts()
                          else if (item.category === 'Shipping') handleNavigateToSettings('delivery')
                          else if (item.category === 'Email') handleNavigateToNurture()
                        }}
                      >
                        See Full Solution
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-[#9B51E0]" />
                <span>System Status</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="font-semibold text-white mb-1">Payments</div>
                  <div className="text-sm text-green-400">All Systems Go</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="font-semibold text-white mb-1">Orders</div>
                  <div className="text-sm text-green-400">Processing Normally</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="font-semibold text-white mb-1">Email</div>
                  <div className="text-sm text-green-400">Delivering Perfectly</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="font-semibold text-white mb-1">Website</div>
                  <div className="text-sm text-green-400">99.9% Uptime</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-8">
            {/* Contact Options */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-[#9B51E0]" />
                <span>Get Personal Help</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#9B51E0]/30 transition-colors text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Live Chat</h4>
                  <p className="text-sm text-[#A0A0A0] mb-4">
                    Get instant help from our support team
                  </p>
                  <div className="text-xs text-green-400 mb-4">● Available Now</div>
                  <button 
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => handleContactSupport('chat')}
                  >
                    Start Chat
                  </button>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#9B51E0]/30 transition-colors text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Phone Support</h4>
                  <p className="text-sm text-[#A0A0A0] mb-4">
                    Speak directly with our business experts
                  </p>
                  <div className="text-xs text-green-400 mb-4">Mon-Fri 9AM-6PM EST</div>
                  <button 
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    onClick={() => handleContactSupport('phone')}
                  >
                    Call Now
                  </button>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#9B51E0]/30 transition-colors text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Email Support</h4>
                  <p className="text-sm text-[#A0A0A0] mb-4">
                    Detailed help with screenshots and guides
                  </p>
                  <div className="text-xs text-green-400 mb-4">&lt; 4 hour response</div>
                  <button 
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    onClick={() => handleContactSupport('email')}
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </div>

            {/* Success Team */}
            <div className="bg-gradient-to-r from-[#9B51E0]/10 to-[#7C3AED]/10 border border-[#9B51E0]/20 rounded-lg p-8">
              <div className="text-center">
                <Users className="w-12 h-12 text-[#9B51E0] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Meet Your Success Team</h3>
                <p className="text-[#A0A0A0] max-w-2xl mx-auto mb-8">
                  Our dedicated team of business experts, technical specialists, and growth consultants 
                  are here to ensure your online store succeeds.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-8 h-8 text-[#9B51E0]" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Business Consultants</h4>
                    <p className="text-sm text-[#A0A0A0]">Strategic advice for growing your revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Settings className="w-8 h-8 text-[#9B51E0]" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Technical Experts</h4>
                    <p className="text-sm text-[#A0A0A0]">Help with setup, integrations, and troubleshooting</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-8 h-8 text-[#9B51E0]" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Growth Specialists</h4>
                    <p className="text-sm text-[#A0A0A0]">Marketing and optimization strategies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Community */}
            <div className="bg-[#1E1E1E] rounded-lg p-8 border border-[#3A3A3A]">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Globe className="w-6 h-6 text-[#9B51E0]" />
                <span>Join Our Community</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-white mb-4">Business Owner Community</h4>
                  <p className="text-[#A0A0A0] mb-4">
                    Connect with thousands of successful store owners, share experiences, 
                    get advice, and celebrate wins together.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">15,000+ active members</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">Daily success stories</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">Expert AMAs every week</span>
                    </div>
                  </div>
                  <button 
                    className="px-6 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
                    onClick={() => handleOpenExternalLink('https://community.sellusgenie.com')}
                  >
                    Join Community
                  </button>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-4">Resource Library</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-[#9B51E0]" />
                        <span className="text-white text-sm">Product Photo Templates</span>
                      </div>
                      <button onClick={() => handleOpenExternalLink('https://resources.sellusgenie.com/photo-templates')}>
                        <ExternalLink className="w-4 h-4 text-[#A0A0A0] hover:text-[#9B51E0] transition-colors" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-[#9B51E0]" />
                        <span className="text-white text-sm">Email Marketing Templates</span>
                      </div>
                      <button onClick={() => handleOpenExternalLink('https://resources.sellusgenie.com/email-templates')}>
                        <ExternalLink className="w-4 h-4 text-[#A0A0A0] hover:text-[#9B51E0] transition-colors" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-[#9B51E0]" />
                        <span className="text-white text-sm">Legal Documents Templates</span>
                      </div>
                      <button onClick={() => handleOpenExternalLink('https://resources.sellusgenie.com/legal-templates')}>
                        <ExternalLink className="w-4 h-4 text-[#A0A0A0] hover:text-[#9B51E0] transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
              </TabSection>


    </div>
  )
}