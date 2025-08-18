// Nurture Program Type Definitions
// Comprehensive type system for lead management, incomplete orders, and customer nurturing

export interface LeadSource {
  id: string
  name: string
  description?: string
  store_id: string
  created_at: string
  updated_at: string
}

export interface CustomerLead {
  id: string
  store_id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  lead_source_id?: string
  lead_score: number
  status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'converted' | 'lost'
  tags?: string[]
  notes?: string
  last_interaction_at?: string
  converted_at?: string
  created_at: string
  updated_at: string
  
  // Computed properties
  full_name?: string
  lead_source?: LeadSource
  recent_activities?: LeadActivity[]
}

export interface LeadActivity {
  id: string
  lead_id: string
  activity_type: string
  activity_data?: Record<string, any>
  score_impact: number
  created_at: string
}

export interface IncompleteOrder {
  id: string
  store_id: string
  customer_email: string
  customer_name?: string
  cart_data: {
    items: Array<{
      product_id: string
      name: string
      price: number
      quantity: number
      image?: string
    }>
    subtotal: number
    tax?: number
    shipping?: number
  }
  total_amount: number
  abandoned_at: string
  last_reminder_sent_at?: string
  recovery_attempts: number
  recovered: boolean
  recovered_at?: string
  recovery_order_id?: string
  created_at: string
  updated_at: string
  
  // Computed properties
  hours_since_abandoned?: number
  days_since_abandoned?: number
}

export interface NurtureCampaign {
  id: string
  store_id: string
  name: string
  description?: string
  campaign_type: 'lead_nurture' | 'cart_abandonment' | 'post_purchase' | 'winback'
  trigger_conditions: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Relations
  steps?: NurtureCampaignStep[]
  enrollments_count?: number
  active_enrollments?: number
}

export interface NurtureCampaignStep {
  id: string
  campaign_id: string
  step_order: number
  step_name: string
  delay_hours: number
  email_subject: string
  email_content: string
  email_template?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CampaignEnrollment {
  id: string
  campaign_id: string
  lead_id?: string
  incomplete_order_id?: string
  customer_email: string
  current_step: number
  enrolled_at: string
  completed_at?: string
  status: 'active' | 'paused' | 'completed' | 'unsubscribed'
  created_at: string
  updated_at: string
  
  // Relations
  campaign?: NurtureCampaign
  lead?: CustomerLead
  incomplete_order?: IncompleteOrder
  executions?: CampaignStepExecution[]
}

export interface CampaignStepExecution {
  id: string
  enrollment_id: string
  step_id: string
  scheduled_at?: string
  sent_at?: string
  opened_at?: string
  clicked_at?: string
  status: 'scheduled' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed'
  error_message?: string
  created_at: string
  
  // Relations
  step?: NurtureCampaignStep
}

export interface CustomerSegment {
  id: string
  store_id: string
  name: string
  description?: string
  segment_criteria: Record<string, any>
  is_dynamic: boolean
  created_at: string
  updated_at: string
  
  // Computed
  member_count?: number
}

export interface SegmentMembership {
  id: string
  segment_id: string
  lead_id?: string
  customer_email: string
  added_at: string
  removed_at?: string
  is_active: boolean
  
  // Relations
  segment?: CustomerSegment
  lead?: CustomerLead
}

// API Response Types
export interface LeadAnalytics {
  total_leads: number
  new_leads: number
  qualified_leads: number
  converted_leads: number
  conversion_rate: number
  average_lead_score: number
  leads_by_source: Array<{
    source: string
    count: number
    conversion_rate: number
  }>
  leads_by_status: Array<{
    status: string
    count: number
    percentage: number
  }>
  recent_activities: LeadActivity[]
}

export interface CartAbandonmentAnalytics {
  total_abandoned: number
  total_value: number
  recovered_carts: number
  recovered_value: number
  recovery_rate: number
  average_cart_value: number
  abandonment_by_hour: Array<{
    hour: number
    count: number
  }>
  top_abandoned_products: Array<{
    product_name: string
    abandon_count: number
  }>
}

export interface CampaignAnalytics {
  campaign_id: string
  campaign_name: string
  total_enrollments: number
  active_enrollments: number
  completed_enrollments: number
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  open_rate: number
  click_rate: number
  conversion_count: number
  conversion_rate: number
  step_performance: Array<{
    step_name: string
    sent: number
    opened: number
    clicked: number
    open_rate: number
    click_rate: number
  }>
}

export interface NurtureOverview {
  total_leads: number
  active_campaigns: number
  incomplete_orders: number
  total_recoverable_value: number
  recent_conversions: number
  lead_analytics: LeadAnalytics
  cart_analytics: CartAbandonmentAnalytics
  top_performing_campaigns: Array<{
    campaign_name: string
    enrollment_count: number
    conversion_rate: number
  }>
}

// Form and UI Types
export interface CreateLeadForm {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  lead_source_id?: string
  tags?: string[]
  notes?: string
}

export interface CreateCampaignForm {
  name: string
  description?: string
  campaign_type: 'lead_nurture' | 'cart_abandonment' | 'post_purchase' | 'winback'
  trigger_conditions: Record<string, any>
  steps: Array<{
    step_name: string
    delay_hours: number
    email_subject: string
    email_content: string
  }>
}

export interface CreateSegmentForm {
  name: string
  description?: string
  segment_criteria: Record<string, any>
  is_dynamic: boolean
}

// Search and Filter Types
export interface LeadFilters {
  status?: string[]
  lead_source?: string[]
  score_min?: number
  score_max?: number
  tags?: string[]
  date_range?: {
    start: string
    end: string
  }
}

export interface CampaignFilters {
  campaign_type?: string[]
  is_active?: boolean
  date_range?: {
    start: string
    end: string
  }
}

export interface IncompleteOrderFilters {
  min_value?: number
  max_value?: number
  days_abandoned?: {
    min: number
    max: number
  }
  recovered?: boolean
}