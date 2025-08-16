// Claude Prompt Settings Types

export type PromptCategory = 
  | 'product_description' 
  | 'marketing_copy' 
  | 'customer_support' 
  | 'seo_optimization' 
  | 'email_campaign' 
  | 'social_media'

export interface ClaudePromptTemplate {
  id: string
  store_id: string
  template_name: string
  template_category: PromptCategory
  prompt_text: string
  variables: string[]
  is_active: boolean
  is_default: boolean
  usage_count: number
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export interface ClaudePromptUsage {
  id: string
  store_id: string
  template_id: string | null
  prompt_text: string
  generated_content: string | null
  tokens_used: number | null
  cost_usd: number | null
  success: boolean
  error_message: string | null
  context: Record<string, any> | null
  created_at: string
}

export interface ClaudePromptSettings {
  id: string
  store_id: string
  setting_key: string
  setting_value: any
  created_at: string
  updated_at: string
}

export interface PromptTestRequest {
  template_id: string
  variables: Record<string, string>
  test_data?: Record<string, any>
}

export interface PromptTestResponse {
  success: boolean
  generated_content?: string
  tokens_used?: number
  cost_usd?: number
  error_message?: string
}

export interface CreatePromptTemplateRequest {
  template_name: string
  template_category: PromptCategory
  prompt_text: string
  variables: string[]
}

export interface UpdatePromptTemplateRequest {
  template_name?: string
  template_category?: PromptCategory
  prompt_text?: string
  variables?: string[]
  is_active?: boolean
}

export interface PromptAnalytics {
  total_usage: number
  total_cost: number
  success_rate: number
  usage_by_category: Record<PromptCategory, number>
  recent_usage: ClaudePromptUsage[]
}

export interface PromptTemplateWithUsage extends ClaudePromptTemplate {
  recent_usage: ClaudePromptUsage[]
  average_tokens: number
  average_cost: number
}

// Default prompt templates for new stores
export const DEFAULT_PROMPT_TEMPLATES: Omit<ClaudePromptTemplate, 'id' | 'store_id' | 'created_at' | 'updated_at'>[] = [
  {
    template_name: 'Product Description Generator',
    template_category: 'product_description',
    prompt_text: 'Create a compelling product description for [product_name] in the [category] category. Include key features, benefits, and a call-to-action. Make it engaging and conversion-focused while maintaining accuracy. Target length: 150-200 words.',
    variables: ['product_name', 'category'],
    is_active: true,
    is_default: true,
    usage_count: 0,
    last_used_at: null
  },
  {
    template_name: 'Marketing Copy Generator',
    template_category: 'marketing_copy',
    prompt_text: 'Generate marketing copy for [product_name] targeting [audience] with a [tone] tone. Focus on the unique value proposition and create urgency without being pushy. Include a strong call-to-action.',
    variables: ['product_name', 'audience', 'tone'],
    is_active: true,
    is_default: true,
    usage_count: 0,
    last_used_at: null
  },
  {
    template_name: 'Customer Support Response',
    template_category: 'customer_support',
    prompt_text: 'Create a helpful and professional response to a customer inquiry about [topic]. Be empathetic, provide clear information, and offer next steps. Keep the tone warm and supportive.',
    variables: ['topic'],
    is_active: true,
    is_default: true,
    usage_count: 0,
    last_used_at: null
  },
  {
    template_name: 'SEO Meta Description',
    template_category: 'seo_optimization',
    prompt_text: 'Write an SEO-optimized meta description for [page_title]. Include relevant keywords naturally, make it compelling for click-through, and keep it under 160 characters.',
    variables: ['page_title'],
    is_active: true,
    is_default: true,
    usage_count: 0,
    last_used_at: null
  },
  {
    template_name: 'Email Campaign Subject Line',
    template_category: 'email_campaign',
    prompt_text: 'Create 5 engaging email subject lines for [campaign_type] campaign about [topic]. Make them compelling, avoid spam triggers, and encourage opens. Keep each under 50 characters.',
    variables: ['campaign_type', 'topic'],
    is_active: true,
    is_default: true,
    usage_count: 0,
    last_used_at: null
  },
  {
    template_name: 'Social Media Post',
    template_category: 'social_media',
    prompt_text: 'Create a [platform] post about [topic] for [brand_name]. Make it engaging, include relevant hashtags, and encourage interaction. Keep it appropriate for the platform format.',
    variables: ['platform', 'topic', 'brand_name'],
    is_active: true,
    is_default: true,
    usage_count: 0,
    last_used_at: null
  }
]

// Category display names and icons
export const PROMPT_CATEGORIES = {
  product_description: {
    name: 'Product Description',
    description: 'Generate compelling product descriptions',
    icon: '📦'
  },
  marketing_copy: {
    name: 'Marketing Copy',
    description: 'Create marketing materials and campaigns',
    icon: '📢'
  },
  customer_support: {
    name: 'Customer Support',
    description: 'Generate helpful customer responses',
    icon: '💬'
  },
  seo_optimization: {
    name: 'SEO Optimization',
    description: 'Create SEO-friendly content',
    icon: '🔍'
  },
  email_campaign: {
    name: 'Email Campaign',
    description: 'Generate email marketing content',
    icon: '📧'
  },
  social_media: {
    name: 'Social Media',
    description: 'Create social media posts',
    icon: '📱'
  }
} as const
