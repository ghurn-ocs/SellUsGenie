// Email Marketing Type Definitions
// Comprehensive type system for email templates, campaigns, and segmentation

export interface EmailTemplate {
  id: string
  store_id?: string
  name: string
  description?: string
  category: 'welcome' | 'promotional' | 'transactional' | 'seasonal' | 'cart_abandonment' | 'newsletter' | 'birthday' | 'winback' | 'product_launch' | 'survey' | 'event'
  template_type: 'html' | 'plain_text' | 'mixed'
  subject_line: string
  preview_text?: string
  html_content?: string
  plain_text_content?: string
  template_variables: string[]
  design_config?: {
    primary_color?: string
    secondary_color?: string
    font_family?: string
    logo_url?: string
    header_image?: string
  }
  is_global: boolean
  is_active: boolean
  usage_count: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface EmailCampaign {
  id: string
  store_id: string
  name: string
  description?: string
  campaign_type: 'one_time' | 'recurring' | 'automated' | 'drip_sequence'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  
  // Email Content
  template_id?: string
  subject_line: string
  preview_text?: string
  html_content?: string
  plain_text_content?: string
  
  // Sending Configuration
  sender_name: string
  sender_email: string
  reply_to_email?: string
  
  // Targeting and Segmentation
  target_audience: {
    segment_ids?: string[]
    custom_criteria?: Record<string, any>
    include_unsubscribed?: boolean
  }
  estimated_recipients: number
  
  // Scheduling
  send_immediately: boolean
  scheduled_at?: string
  timezone: string
  
  // Analytics
  total_sent: number
  total_delivered: number
  total_opened: number
  total_clicked: number
  total_unsubscribed: number
  total_bounced: number
  
  created_at: string
  updated_at: string
  
  // Relations
  template?: EmailTemplate
  segments?: EmailSegment[]
  recipients?: CampaignRecipient[]
  
  // Computed
  open_rate?: number
  click_rate?: number
  bounce_rate?: number
  unsubscribe_rate?: number
}

export interface EmailSegment {
  id: string
  store_id: string
  name: string
  description?: string
  segment_type: 'behavioral' | 'demographic' | 'transactional' | 'engagement' | 'custom'
  criteria: {
    type: string
    operator?: string
    value?: any
    metric?: string
    percentile?: number
    within_days?: number
    more_than_days?: number
  }
  is_dynamic: boolean
  member_count: number
  last_calculated_at?: string
  created_at: string
  updated_at: string
}

export interface CampaignRecipient {
  id: string
  campaign_id: string
  customer_email: string
  customer_name?: string
  customer_id?: string
  segment_id?: string
  
  // Personalization
  personalization_data?: Record<string, any>
  
  // Delivery Status
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'failed'
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  first_clicked_at?: string
  last_clicked_at?: string
  bounced_at?: string
  bounce_reason?: string
  unsubscribed_at?: string
  
  created_at: string
  updated_at: string
}

export interface EmailClickTracking {
  id: string
  campaign_id: string
  recipient_id: string
  link_url: string
  link_label?: string
  clicked_at: string
  ip_address?: string
  user_agent?: string
}

export interface EmailUnsubscribe {
  id: string
  store_id: string
  email: string
  unsubscribe_type: 'all' | 'promotional' | 'transactional' | 'newsletters'
  campaign_id?: string
  reason?: string
  unsubscribed_at: string
}

export interface PredefinedSegment {
  id: string
  name: string
  description?: string
  segment_criteria: Record<string, any>
  is_system: boolean
  created_at: string
}

export interface EmailABTest {
  id: string
  campaign_id: string
  test_name: string
  test_type: 'subject_line' | 'content' | 'sender_name' | 'send_time'
  variant_a: Record<string, any>
  variant_b: Record<string, any>
  traffic_split: number
  winner_criteria: 'open_rate' | 'click_rate' | 'conversion_rate'
  test_duration_hours: number
  status: 'running' | 'completed' | 'cancelled'
  winner_variant?: 'A' | 'B'
  results?: {
    variant_a_performance: number
    variant_b_performance: number
    confidence_level: number
    statistical_significance: boolean
  }
  created_at: string
  completed_at?: string
}

// Template Categories with Descriptions
export const TEMPLATE_CATEGORIES = {
  welcome: 'Welcome new customers and subscribers',
  promotional: 'Sales, discounts, and special offers',
  transactional: 'Order confirmations, receipts, shipping updates',
  seasonal: 'Holiday and seasonal campaigns',
  cart_abandonment: 'Recover abandoned shopping carts',
  newsletter: 'Regular updates and company news',
  birthday: 'Birthday wishes and special offers',
  winback: 'Re-engage inactive customers',
  product_launch: 'Announce new products or features',
  survey: 'Collect customer feedback',
  event: 'Event invitations and announcements'
} as const

// Pre-built Email Template Configurations
export const EMAIL_TEMPLATE_LIBRARY = {
  // Welcome Series
  'welcome-minimal': {
    name: 'Welcome - Modern Minimalist',
    category: 'welcome' as const,
    description: 'Clean and modern welcome email template',
    subject_line: 'Welcome to {{store_name}}! 🎉',
    preview_text: 'Thank you for joining our community',
    variables: ['customer_name', 'store_name', 'store_url', 'unsubscribe_url']
  },
  'welcome-hero': {
    name: 'Welcome - Hero Image',
    category: 'welcome' as const,
    description: 'Welcome template with large hero image',
    subject_line: 'Welcome aboard, {{customer_name}}!',
    preview_text: 'Your journey with us begins now',
    variables: ['customer_name', 'store_name', 'store_url', 'hero_image', 'unsubscribe_url']
  },
  
  // Promotional
  'flash-sale': {
    name: 'Flash Sale - Urgent',
    category: 'promotional' as const,
    description: 'Eye-catching flash sale template with urgency',
    subject_line: '⚡ FLASH SALE: {{discount_percent}}% OFF Everything!',
    preview_text: 'Limited time offer - don\'t miss out',
    variables: ['customer_name', 'discount_percent', 'discount_code', 'hours_remaining', 'shop_url']
  },
  'product-showcase': {
    name: 'Product Showcase',
    category: 'promotional' as const,
    description: 'Highlight featured products with images',
    subject_line: 'New Arrivals Just for You, {{customer_name}}',
    preview_text: 'Check out our latest products',
    variables: ['customer_name', 'featured_products', 'shop_url', 'store_name']
  },
  
  // Cart Abandonment
  'cart-recovery-friendly': {
    name: 'Cart Recovery - Friendly Reminder',
    category: 'cart_abandonment' as const,
    description: 'Gentle cart abandonment recovery email',
    subject_line: 'You left something special behind... 🛒',
    preview_text: 'Complete your purchase before it\'s gone',
    variables: ['customer_name', 'cart_items', 'cart_total', 'checkout_url', 'support_url']
  },
  'cart-recovery-urgent': {
    name: 'Cart Recovery - Limited Time',
    category: 'cart_abandonment' as const,
    description: 'Urgent cart abandonment with time pressure',
    subject_line: '⏰ Your cart expires in 24 hours!',
    preview_text: 'Don\'t lose these items forever',
    variables: ['customer_name', 'cart_items', 'cart_total', 'checkout_url', 'hours_remaining']
  },
  'cart-recovery-discount': {
    name: 'Cart Recovery - Special Discount',
    category: 'cart_abandonment' as const,
    description: 'Recover carts with exclusive discount offer',
    subject_line: 'Here\'s 15% off your cart, {{customer_name}}! 💸',
    preview_text: 'Complete your purchase and save big',
    variables: ['customer_name', 'discount_code', 'cart_items', 'checkout_url', 'expiry_date']
  },

  // More Welcome Series
  'welcome-tutorial': {
    name: 'Welcome - Getting Started Guide',
    category: 'welcome' as const,
    description: 'Educational welcome with product tutorials',
    subject_line: 'Get the most out of {{store_name}} 📚',
    preview_text: 'Here\'s how to get started with us',
    variables: ['customer_name', 'tutorial_links', 'support_email', 'store_name']
  },
  'welcome-social': {
    name: 'Welcome - Social Connect',
    category: 'welcome' as const,
    description: 'Welcome email with social media integration',
    subject_line: 'Join our community, {{customer_name}}! 🌟',
    preview_text: 'Connect with thousands of happy customers',
    variables: ['customer_name', 'social_links', 'community_stats', 'store_name']
  },
  'welcome-first-purchase': {
    name: 'Welcome - First Purchase Incentive',
    category: 'welcome' as const,
    description: 'Welcome with first purchase discount',
    subject_line: 'Welcome! Here\'s {{discount_percent}}% off your first order',
    preview_text: 'Start shopping with this exclusive offer',
    variables: ['customer_name', 'discount_percent', 'discount_code', 'shop_url', 'expiry_date']
  },

  // Promotional Campaigns
  'seasonal-sale': {
    name: 'Seasonal Sale - Holiday Special',
    category: 'seasonal' as const,
    description: 'Holiday-themed promotional template',
    subject_line: '🎄 Holiday Sale: Up to {{max_discount}}% Off!',
    preview_text: 'Celebrate the season with amazing deals',
    variables: ['customer_name', 'max_discount', 'featured_categories', 'sale_end_date']
  },
  'vip-exclusive': {
    name: 'VIP Exclusive - Early Access',
    category: 'promotional' as const,
    description: 'Exclusive offer for VIP customers',
    subject_line: 'VIP Early Access: New Collection Launch! 👑',
    preview_text: 'Shop before everyone else gets access',
    variables: ['customer_name', 'collection_name', 'early_access_hours', 'shop_url']
  },
  'bundle-offer': {
    name: 'Bundle Deal - Save More',
    category: 'promotional' as const,
    description: 'Product bundle promotional template',
    subject_line: 'Save {{savings_amount}} with our Perfect Bundle! 📦',
    preview_text: 'Everything you need in one great deal',
    variables: ['customer_name', 'bundle_products', 'savings_amount', 'bundle_url']
  },
  'clearance-sale': {
    name: 'Clearance Sale - Final Chance',
    category: 'promotional' as const,
    description: 'Clearance sale with urgency messaging',
    subject_line: 'Final Hours: Up to {{discount}}% Off Clearance! 🏷️',
    preview_text: 'Last chance for incredible savings',
    variables: ['customer_name', 'discount', 'clearance_items', 'hours_left', 'shop_url']
  },

  // Transactional Templates
  'order-confirmation': {
    name: 'Order Confirmation - Professional',
    category: 'transactional' as const,
    description: 'Clean order confirmation template',
    subject_line: 'Order Confirmed: {{order_number}} 📋',
    preview_text: 'Thank you for your order',
    variables: ['customer_name', 'order_number', 'order_items', 'total_amount', 'tracking_info']
  },
  'shipping-notification': {
    name: 'Shipping Notification - Tracking',
    category: 'transactional' as const,
    description: 'Order shipped with tracking information',
    subject_line: 'Your order is on the way! 🚚',
    preview_text: 'Track your package delivery',
    variables: ['customer_name', 'order_number', 'tracking_number', 'carrier', 'estimated_delivery']
  },
  'delivery-confirmation': {
    name: 'Delivery Confirmation - Satisfaction',
    category: 'transactional' as const,
    description: 'Package delivered with review request',
    subject_line: 'Your order has been delivered! 📦',
    preview_text: 'How was your experience?',
    variables: ['customer_name', 'order_number', 'review_url', 'support_email']
  },

  // Newsletter Templates
  'monthly-newsletter': {
    name: 'Monthly Newsletter - Updates',
    category: 'newsletter' as const,
    description: 'Monthly company and product updates',
    subject_line: '{{month}} Update: What\'s New at {{store_name}} 📰',
    preview_text: 'Catch up on our latest news and features',
    variables: ['customer_name', 'month', 'store_name', 'featured_stories', 'upcoming_events']
  },
  'product-tips': {
    name: 'Newsletter - Tips & Tricks',
    category: 'newsletter' as const,
    description: 'Educational content and product tips',
    subject_line: '5 Ways to Get More from {{product_category}} 💡',
    preview_text: 'Expert tips and tricks inside',
    variables: ['customer_name', 'product_category', 'tips_content', 'related_products']
  },

  // Birthday & Special Occasions
  'birthday-special': {
    name: 'Birthday Special - Personal Gift',
    category: 'birthday' as const,
    description: 'Personalized birthday offer template',
    subject_line: 'Happy Birthday, {{customer_name}}! 🎂 Here\'s your gift',
    preview_text: 'Celebrate with a special discount',
    variables: ['customer_name', 'birthday_discount', 'gift_code', 'expiry_date', 'birthday_products']
  },
  'anniversary-celebration': {
    name: 'Anniversary - Customer Milestone',
    category: 'birthday' as const,
    description: 'Celebrate customer anniversary with brand',
    subject_line: 'Celebrating {{years}} year{{s}} together! 🎉',
    preview_text: 'Thank you for being part of our journey',
    variables: ['customer_name', 'years', 'anniversary_date', 'loyalty_rewards', 'milestone_offer']
  },

  // Win-back Campaigns
  'winback-miss-you': {
    name: 'Win-back - We Miss You',
    category: 'winback' as const,
    description: 'Gentle re-engagement for inactive customers',
    subject_line: 'We miss you, {{customer_name}} 💔',
    preview_text: 'Come back and see what\'s new',
    variables: ['customer_name', 'last_purchase_date', 'new_arrivals', 'comeback_offer']
  },
  'winback-special-return': {
    name: 'Win-back - Special Return Offer',
    category: 'winback' as const,
    description: 'Irresistible offer to re-engage customers',
    subject_line: 'Special Comeback Offer: {{discount}}% Off Just for You! 🎯',
    preview_text: 'We want you back with this exclusive deal',
    variables: ['customer_name', 'discount', 'return_code', 'product_recommendations', 'expiry']
  },

  // Product Launch
  'product-launch-announcement': {
    name: 'Product Launch - Big Reveal',
    category: 'product_launch' as const,
    description: 'Exciting product launch announcement',
    subject_line: 'Introducing {{product_name}} - The Future is Here! 🚀',
    preview_text: 'Be among the first to experience innovation',
    variables: ['customer_name', 'product_name', 'launch_date', 'product_features', 'preorder_url']
  },
  'product-waitlist': {
    name: 'Product Launch - Waitlist Notification',
    category: 'product_launch' as const,
    description: 'Notify waitlist customers about availability',
    subject_line: '{{product_name}} is now available! ⭐',
    preview_text: 'Your wait is over - shop now',
    variables: ['customer_name', 'product_name', 'product_url', 'limited_stock', 'exclusive_hours']
  },

  // Survey & Feedback
  'feedback-request': {
    name: 'Feedback Request - Customer Survey',
    category: 'survey' as const,
    description: 'Request customer feedback and reviews',
    subject_line: 'How was your experience with {{store_name}}? 📝',
    preview_text: 'Your feedback helps us improve',
    variables: ['customer_name', 'store_name', 'survey_url', 'incentive_offer', 'order_reference']
  },
  'review-request': {
    name: 'Review Request - Product Feedback',
    category: 'survey' as const,
    description: 'Ask for product reviews post-purchase',
    subject_line: 'Love your {{product_name}}? Share your thoughts! ⭐',
    preview_text: 'Help others discover great products',
    variables: ['customer_name', 'product_name', 'review_url', 'review_incentive', 'product_image']
  }
}

// Customer Segmentation Criteria
export interface SegmentationCriteria {
  // Behavioral
  total_spent?: {
    operator: 'greater_than' | 'less_than' | 'equals' | 'between'
    value: number | [number, number]
  }
  order_count?: {
    operator: 'greater_than' | 'less_than' | 'equals' | 'between'
    value: number | [number, number]
  }
  last_purchase?: {
    operator: 'within_days' | 'more_than_days' | 'between_dates'
    value: number | [string, string]
  }
  average_order_value?: {
    operator: 'greater_than' | 'less_than' | 'equals' | 'between'
    value: number | [number, number]
  }
  
  // Engagement
  email_engagement?: {
    operator: 'high' | 'medium' | 'low'
    metric: 'open_rate' | 'click_rate' | 'both'
  }
  website_activity?: {
    operator: 'active' | 'inactive'
    days: number
  }
  
  // Demographics
  location?: {
    operator: 'in' | 'not_in'
    value: string[]
  }
  signup_date?: {
    operator: 'within_days' | 'more_than_days' | 'between_dates'
    value: number | [string, string]
  }
  
  // Custom
  custom_field?: {
    field_name: string
    operator: string
    value: any
  }
}

// Form Types
export interface CreateEmailCampaignForm {
  name: string
  description?: string
  campaign_type: 'one_time' | 'recurring' | 'automated' | 'drip_sequence'
  
  // Email Content
  template_id?: string
  subject_line: string
  preview_text?: string
  html_content?: string
  plain_text_content?: string
  
  // Sender Info
  sender_name: string
  sender_email: string
  reply_to_email?: string
  
  // Targeting
  segment_ids?: string[]
  custom_criteria?: SegmentationCriteria
  
  // Scheduling
  send_immediately: boolean
  scheduled_at?: string
  timezone?: string
}

export interface CreateEmailTemplateForm {
  name: string
  description?: string
  category: keyof typeof TEMPLATE_CATEGORIES
  template_type: 'html' | 'plain_text' | 'mixed'
  subject_line: string
  preview_text?: string
  html_content?: string
  plain_text_content?: string
  design_config?: {
    primary_color?: string
    secondary_color?: string
    font_family?: string
    logo_url?: string
  }
}

export interface CreateEmailSegmentForm {
  name: string
  description?: string
  segment_type: 'behavioral' | 'demographic' | 'transactional' | 'engagement' | 'custom'
  criteria: SegmentationCriteria
  is_dynamic: boolean
}

// Analytics Types
export interface EmailCampaignAnalytics {
  campaign_id: string
  campaign_name: string
  sent_date: string
  total_recipients: number
  delivered: number
  opened: number
  clicked: number
  unsubscribed: number
  bounced: number
  
  // Rates
  delivery_rate: number
  open_rate: number
  click_rate: number
  click_to_open_rate: number
  unsubscribe_rate: number
  bounce_rate: number
  
  // Time-based metrics
  opens_over_time: Array<{
    hour: number
    opens: number
  }>
  clicks_over_time: Array<{
    hour: number
    clicks: number
  }>
  
  // Link performance
  top_clicked_links: Array<{
    url: string
    label?: string
    clicks: number
    unique_clicks: number
  }>
  
  // Device/Client breakdown
  client_breakdown: Array<{
    client: string
    opens: number
    percentage: number
  }>
}

export interface EmailMarketingOverview {
  total_campaigns: number
  active_campaigns: number
  total_subscribers: number
  average_open_rate: number
  average_click_rate: number
  total_unsubscribes: number
  
  // Recent performance
  campaigns_last_30_days: number
  emails_sent_last_30_days: number
  new_subscribers_last_30_days: number
  
  // Top performing
  top_performing_campaigns: Array<{
    campaign_name: string
    open_rate: number
    click_rate: number
    sent_date: string
  }>
  
  // Segment performance
  segment_performance: Array<{
    segment_name: string
    member_count: number
    average_open_rate: number
    average_click_rate: number
  }>
}

// Filters and Search
export interface CampaignFilters {
  status?: ('draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled')[]
  campaign_type?: ('one_time' | 'recurring' | 'automated' | 'drip_sequence')[]
  date_range?: {
    start: string
    end: string
  }
  performance?: {
    open_rate_min?: number
    click_rate_min?: number
  }
}

export interface TemplateFilters {
  category?: (keyof typeof TEMPLATE_CATEGORIES)[]
  is_global?: boolean
  is_active?: boolean
  template_type?: ('html' | 'plain_text' | 'mixed')[]
}

export interface SegmentFilters {
  segment_type?: ('behavioral' | 'demographic' | 'transactional' | 'engagement' | 'custom')[]
  is_dynamic?: boolean
  member_count_range?: {
    min: number
    max: number
  }
}