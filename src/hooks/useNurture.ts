// Nurture Program React Hooks
// Custom hooks for lead management, cart abandonment, and nurture campaigns

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { 
  CustomerLead, 
  IncompleteOrder, 
  NurtureCampaign, 
  CampaignEnrollment,
  LeadAnalytics,
  CartAbandonmentAnalytics,
  CampaignAnalytics,
  NurtureOverview,
  CreateLeadForm,
  CreateCampaignForm,
  LeadFilters,
  CampaignFilters,
  IncompleteOrderFilters
} from '../types/nurture'

// Lead Management Hooks
export const useLeads = (storeId: string, filters?: LeadFilters) => {
  return useQuery({
    queryKey: ['leads', storeId, filters],
    queryFn: async (): Promise<CustomerLead[]> => {
      let query = supabase
        .from('customer_leads')
        .select(`
          *,
          lead_source:lead_sources(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status)
      }
      if (filters?.lead_source?.length) {
        query = query.in('lead_source_id', filters.lead_source)
      }
      if (filters?.score_min !== undefined) {
        query = query.gte('lead_score', filters.score_min)
      }
      if (filters?.score_max !== undefined) {
        query = query.lte('lead_score', filters.score_max)
      }
      if (filters?.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })
}

export const useLead = (leadId: string) => {
  return useQuery({
    queryKey: ['lead', leadId],
    queryFn: async (): Promise<CustomerLead | null> => {
      const { data, error } = await supabase
        .from('customer_leads')
        .select(`
          *,
          lead_source:lead_sources(*),
          recent_activities:lead_activities(*)
        `)
        .eq('id', leadId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!leadId
  })
}

export const useCreateLead = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (leadData: CreateLeadForm): Promise<CustomerLead> => {
      const { data, error } = await supabase
        .from('customer_leads')
        .insert({
          ...leadData,
          store_id: storeId
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', storeId] })
      queryClient.invalidateQueries({ queryKey: ['lead-analytics', storeId] })
    }
  })
}

export const useUpdateLead = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      leadId, 
      updates 
    }: { 
      leadId: string
      updates: Partial<CustomerLead> 
    }): Promise<CustomerLead> => {
      const { data, error } = await supabase
        .from('customer_leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads', storeId] })
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] })
      queryClient.invalidateQueries({ queryKey: ['lead-analytics', storeId] })
    }
  })
}

// Incomplete Orders Hooks
export const useIncompleteOrders = (storeId: string, filters?: IncompleteOrderFilters) => {
  return useQuery({
    queryKey: ['incomplete-orders', storeId, filters],
    queryFn: async (): Promise<IncompleteOrder[]> => {
      let query = supabase
        .from('incomplete_orders')
        .select('*')
        .eq('store_id', storeId)
        .order('abandoned_at', { ascending: false })

      // Apply filters
      if (filters?.min_value !== undefined) {
        query = query.gte('total_amount', filters.min_value)
      }
      if (filters?.max_value !== undefined) {
        query = query.lte('total_amount', filters.max_value)
      }
      if (filters?.recovered !== undefined) {
        query = query.eq('recovered', filters.recovered)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Add computed fields
      return (data || []).map(order => ({
        ...order,
        hours_since_abandoned: Math.floor(
          (new Date().getTime() - new Date(order.abandoned_at).getTime()) / (1000 * 60 * 60)
        ),
        days_since_abandoned: Math.floor(
          (new Date().getTime() - new Date(order.abandoned_at).getTime()) / (1000 * 60 * 60 * 24)
        )
      }))
    },
    enabled: !!storeId
  })
}

export const useCreateIncompleteOrder = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderData: Omit<IncompleteOrder, 'id' | 'store_id' | 'created_at' | 'updated_at'>): Promise<IncompleteOrder> => {
      const { data, error } = await supabase
        .from('incomplete_orders')
        .insert({
          ...orderData,
          store_id: storeId
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomplete-orders', storeId] })
      queryClient.invalidateQueries({ queryKey: ['cart-analytics', storeId] })
    }
  })
}

// Nurture Campaigns Hooks
export const useCampaigns = (storeId: string, filters?: CampaignFilters) => {
  return useQuery({
    queryKey: ['campaigns', storeId, filters],
    queryFn: async (): Promise<NurtureCampaign[]> => {
      let query = supabase
        .from('nurture_campaigns')
        .select(`
          *,
          steps:nurture_campaign_steps(*),
          enrollments_count:campaign_enrollments(count)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.campaign_type?.length) {
        query = query.in('campaign_type', filters.campaign_type)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })
}

export const useCampaign = (campaignId: string) => {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async (): Promise<NurtureCampaign | null> => {
      const { data, error } = await supabase
        .from('nurture_campaigns')
        .select(`
          *,
          steps:nurture_campaign_steps(*),
          enrollments:campaign_enrollments(*)
        `)
        .eq('id', campaignId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!campaignId
  })
}

export const useCreateCampaign = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignData: CreateCampaignForm): Promise<NurtureCampaign> => {
      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('nurture_campaigns')
        .insert({
          name: campaignData.name,
          description: campaignData.description,
          campaign_type: campaignData.campaign_type,
          trigger_conditions: campaignData.trigger_conditions,
          store_id: storeId
        })
        .select()
        .single()

      if (campaignError) throw campaignError

      // Create campaign steps
      if (campaignData.steps.length > 0) {
        const steps = campaignData.steps.map((step, index) => ({
          campaign_id: campaign.id,
          step_order: index + 1,
          step_name: step.step_name,
          delay_hours: step.delay_hours,
          email_subject: step.email_subject,
          email_content: step.email_content
        }))

        const { error: stepsError } = await supabase
          .from('nurture_campaign_steps')
          .insert(steps)

        if (stepsError) throw stepsError
      }

      return campaign
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', storeId] })
    }
  })
}

// Analytics Hooks
export const useLeadAnalytics = (storeId: string) => {
  return useQuery({
    queryKey: ['lead-analytics', storeId],
    queryFn: async (): Promise<LeadAnalytics> => {
      // Get lead counts by status
      const { data: leads, error: leadsError } = await supabase
        .from('customer_leads')
        .select(`
          status,
          lead_score,
          lead_source_id,
          lead_source:lead_sources(name),
          created_at,
          converted_at
        `)
        .eq('store_id', storeId)

      if (leadsError) throw leadsError

      const totalLeads = leads?.length || 0
      const newLeads = leads?.filter(l => l.status === 'new').length || 0
      const qualifiedLeads = leads?.filter(l => l.status === 'qualified').length || 0
      const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
      const averageScore = leads?.reduce((sum, l) => sum + l.lead_score, 0) / totalLeads || 0

      // Group by source
      const sourceMap = new Map()
      leads?.forEach(lead => {
        const sourceName = lead.lead_source?.name || 'Unknown'
        if (!sourceMap.has(sourceName)) {
          sourceMap.set(sourceName, { count: 0, converted: 0 })
        }
        const current = sourceMap.get(sourceName)
        current.count++
        if (lead.status === 'converted') current.converted++
      })

      const leadsBySource = Array.from(sourceMap.entries()).map(([source, data]) => ({
        source,
        count: data.count,
        conversion_rate: data.count > 0 ? (data.converted / data.count) * 100 : 0
      }))

      // Group by status
      const statusMap = new Map()
      leads?.forEach(lead => {
        const count = statusMap.get(lead.status) || 0
        statusMap.set(lead.status, count + 1)
      })

      const leadsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count,
        percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0
      }))

      return {
        total_leads: totalLeads,
        new_leads: newLeads,
        qualified_leads: qualifiedLeads,
        converted_leads: convertedLeads,
        conversion_rate: conversionRate,
        average_lead_score: averageScore,
        leads_by_source: leadsBySource,
        leads_by_status: leadsByStatus,
        recent_activities: [] // TODO: Implement recent activities
      }
    },
    enabled: !!storeId
  })
}

export const useCartAbandonmentAnalytics = (storeId: string) => {
  return useQuery({
    queryKey: ['cart-analytics', storeId],
    queryFn: async (): Promise<CartAbandonmentAnalytics> => {
      const { data: incompleteOrders, error } = await supabase
        .from('incomplete_orders')
        .select('*')
        .eq('store_id', storeId)

      if (error) throw error

      const totalAbandoned = incompleteOrders?.length || 0
      const totalValue = incompleteOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const recoveredCarts = incompleteOrders?.filter(o => o.recovered).length || 0
      const recoveredValue = incompleteOrders
        ?.filter(o => o.recovered)
        .reduce((sum, order) => sum + order.total_amount, 0) || 0
      
      const recoveryRate = totalAbandoned > 0 ? (recoveredCarts / totalAbandoned) * 100 : 0
      const averageCartValue = totalAbandoned > 0 ? totalValue / totalAbandoned : 0

      return {
        total_abandoned: totalAbandoned,
        total_value: totalValue,
        recovered_carts: recoveredCarts,
        recovered_value: recoveredValue,
        recovery_rate: recoveryRate,
        average_cart_value: averageCartValue,
        abandonment_by_hour: [], // TODO: Implement hourly breakdown
        top_abandoned_products: [] // TODO: Implement product analysis
      }
    },
    enabled: !!storeId
  })
}

export const useNurtureOverview = (storeId: string) => {
  return useQuery({
    queryKey: ['nurture-overview', storeId],
    queryFn: async (): Promise<NurtureOverview> => {
      const [leadAnalytics, cartAnalytics, campaignsData] = await Promise.all([
        // Get lead analytics
        supabase
          .from('customer_leads')
          .select('status, lead_score')
          .eq('store_id', storeId),
        
        // Get incomplete orders
        supabase
          .from('incomplete_orders')
          .select('total_amount, recovered')
          .eq('store_id', storeId),
        
        // Get active campaigns
        supabase
          .from('nurture_campaigns')
          .select('id, name, is_active')
          .eq('store_id', storeId)
      ])

      const totalLeads = leadAnalytics.data?.length || 0
      const activeCampaigns = campaignsData.data?.filter(c => c.is_active).length || 0
      const incompleteOrders = cartAnalytics.data?.length || 0
      const totalRecoverableValue = cartAnalytics.data
        ?.filter(o => !o.recovered)
        .reduce((sum, order) => sum + order.total_amount, 0) || 0
      
      const recentConversions = leadAnalytics.data?.filter(l => l.status === 'converted').length || 0

      return {
        total_leads: totalLeads,
        active_campaigns: activeCampaigns,
        incomplete_orders: incompleteOrders,
        total_recoverable_value: totalRecoverableValue,
        recent_conversions: recentConversions,
        lead_analytics: {} as LeadAnalytics, // TODO: Use actual lead analytics
        cart_analytics: {} as CartAbandonmentAnalytics, // TODO: Use actual cart analytics
        top_performing_campaigns: [] // TODO: Implement campaign performance
      }
    },
    enabled: !!storeId
  })
}