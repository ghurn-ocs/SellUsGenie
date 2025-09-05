// Email Marketing React Hooks
// Custom hooks for email templates, campaigns, segments, and analytics

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { 
  EmailTemplate,
  EmailCampaign,
  EmailSegment,
  CampaignRecipient,
  EmailCampaignAnalytics,
  EmailMarketingOverview,
  CreateEmailCampaignForm,
  CreateEmailTemplateForm,
  CreateEmailSegmentForm,
  CampaignFilters,
  TemplateFilters,
  SegmentFilters,
  PredefinedSegment
} from '../types/emailMarketing'
import { EMAIL_TEMPLATE_LIBRARY } from '../types/emailMarketing'

// Email Templates Hooks
export const useEmailTemplates = (storeId: string, filters?: TemplateFilters) => {
  return useQuery({
    queryKey: ['email-templates', storeId, filters],
    queryFn: async (): Promise<EmailTemplate[]> => {
      // First, try to get templates from database
      let query = supabase
        .from('email_templates')
        .select('*')
        .or(`store_id.eq.${storeId},is_global.eq.true`)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })

      // Apply filters
      if (filters?.category?.length) {
        query = query.in('category', filters.category)
      }
      if (filters?.template_type?.length) {
        query = query.in('template_type', filters.template_type)
      }
      if (filters?.is_global !== undefined) {
        query = query.eq('is_global', filters.is_global)
      }

      const { data: dbTemplates, error } = await query

      // If there's an error or no database templates, use the template library
      const libraryTemplates = Object.entries(EMAIL_TEMPLATE_LIBRARY).map(([key, template]) => ({
        id: key,
        store_id: null,
        name: template.name,
        description: template.description,
        category: template.category,
        template_type: 'html' as const,
        subject_line: template.subject_line,
        preview_text: template.preview_text,
        html_content: `<p>Template content for ${template.name}</p>`,
        plain_text_content: template.preview_text,
        template_variables: template.variables,
        design_config: {},
        is_global: true,
        is_active: true,
        usage_count: Math.floor(Math.random() * 100), // Simulate usage
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Combine database templates with library templates
      const allTemplates = [...(dbTemplates || []), ...libraryTemplates]
      
      // Apply filters to combined results
      let filteredTemplates = allTemplates
      
      if (filters?.category?.length) {
        filteredTemplates = filteredTemplates.filter(t => filters.category!.includes(t.category))
      }
      
      return filteredTemplates
    },
    enabled: !!storeId
  })
}

export const useEmailTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['email-template', templateId],
    queryFn: async (): Promise<EmailTemplate | null> => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!templateId
  })
}

export const useCreateEmailTemplate = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateData: CreateEmailTemplateForm): Promise<EmailTemplate> => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          ...templateData,
          store_id: storeId,
          template_variables: extractTemplateVariables(templateData.html_content || templateData.plain_text_content || ''),
          is_global: false,
          usage_count: 0
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates', storeId] })
    }
  })
}

// Email Campaigns Hooks
export const useEmailCampaigns = (storeId: string, filters?: CampaignFilters) => {
  return useQuery({
    queryKey: ['email-campaigns', storeId, filters],
    queryFn: async (): Promise<EmailCampaign[]> => {
      let query = supabase
        .from('email_campaigns')
        .select(`
          *,
          template:email_templates(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status)
      }
      if (filters?.campaign_type?.length) {
        query = query.in('campaign_type', filters.campaign_type)
      }
      if (filters?.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Calculate computed metrics
      return (data || []).map(campaign => ({
        ...campaign,
        open_rate: campaign.total_sent > 0 ? (campaign.total_opened / campaign.total_sent) * 100 : 0,
        click_rate: campaign.total_sent > 0 ? (campaign.total_clicked / campaign.total_sent) * 100 : 0,
        bounce_rate: campaign.total_sent > 0 ? (campaign.total_bounced / campaign.total_sent) * 100 : 0,
        unsubscribe_rate: campaign.total_sent > 0 ? (campaign.total_unsubscribed / campaign.total_sent) * 100 : 0
      }))
    },
    enabled: !!storeId
  })
}

export const useEmailCampaign = (campaignId: string) => {
  return useQuery({
    queryKey: ['email-campaign', campaignId],
    queryFn: async (): Promise<EmailCampaign | null> => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          template:email_templates(*),
          recipients:campaign_recipients(*)
        `)
        .eq('id', campaignId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!campaignId
  })
}

export const useCreateEmailCampaign = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignData: CreateEmailCampaignForm): Promise<EmailCampaign> => {
      // If using a template, fetch template content
      let emailContent = {
        html_content: campaignData.html_content,
        plain_text_content: campaignData.plain_text_content
      }

      if (campaignData.template_id) {
        const { data: template } = await supabase
          .from('email_templates')
          .select('html_content, plain_text_content, subject_line, preview_text')
          .eq('id', campaignData.template_id)
          .single()

        if (template) {
          emailContent = {
            html_content: template.html_content || campaignData.html_content,
            plain_text_content: template.plain_text_content || campaignData.plain_text_content
          }
          
          // Use template subject and preview if not overridden
          if (!campaignData.subject_line && template.subject_line) {
            campaignData.subject_line = template.subject_line
          }
          if (!campaignData.preview_text && template.preview_text) {
            campaignData.preview_text = template.preview_text
          }

          // Increment template usage
          await supabase.rpc('increment_template_usage', { template_id: campaignData.template_id })
        }
      }

      // Create campaign
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaignData,
          ...emailContent,
          store_id: storeId,
          status: campaignData.send_immediately ? 'sending' : 'draft',
          estimated_recipients: 0, // Will be calculated when recipients are added
          target_audience: {
            segment_ids: campaignData.segment_ids,
            custom_criteria: campaignData.custom_criteria
          }
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns', storeId] })
    }
  })
}

export const useSendEmailCampaign = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignId: string): Promise<void> => {
      // Update campaign status to sending
      const { error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sending',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error

      // TODO: Trigger actual email sending service
      // This would integrate with your email service provider (SendGrid, Mailgun, etc.)
      
      // For now, simulate sending by updating status after a delay
      setTimeout(async () => {
        await supabase
          .from('email_campaigns')
          .update({ 
            status: 'sent',
            updated_at: new Date().toISOString()
          })
          .eq('id', campaignId)
      }, 5000)
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['email-campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] })
    }
  })
}

// Email Segments Hooks
export const useEmailSegments = (storeId: string, filters?: SegmentFilters) => {
  return useQuery({
    queryKey: ['email-segments', storeId, filters],
    queryFn: async (): Promise<EmailSegment[]> => {
      let query = supabase
        .from('email_segments')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.segment_type?.length) {
        query = query.in('segment_type', filters.segment_type)
      }
      if (filters?.is_dynamic !== undefined) {
        query = query.eq('is_dynamic', filters.is_dynamic)
      }
      if (filters?.member_count_range) {
        query = query
          .gte('member_count', filters.member_count_range.min)
          .lte('member_count', filters.member_count_range.max)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })
}

export const usePredefinedSegments = () => {
  return useQuery({
    queryKey: ['predefined-segments'],
    queryFn: async (): Promise<PredefinedSegment[]> => {
      const { data, error } = await supabase
        .from('predefined_segments')
        .select('*')
        .eq('is_system', true)
        .order('name')

      if (error) throw error
      return data || []
    }
  })
}

export const useCreateEmailSegment = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (segmentData: CreateEmailSegmentForm): Promise<EmailSegment> => {
      const { data, error } = await supabase
        .from('email_segments')
        .insert({
          ...segmentData,
          store_id: storeId,
          member_count: 0 // Will be calculated after creation
        })
        .select()
        .single()

      if (error) throw error

      // Calculate initial member count
      if (data.id) {
        await supabase.rpc('calculate_segment_members', { segment_id: data.id })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-segments', storeId] })
    }
  })
}

export const useUpdateEmailSegment = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ segmentId, segmentData }: { segmentId: string, segmentData: Partial<CreateEmailSegmentForm> }): Promise<EmailSegment> => {
      const { data, error } = await supabase
        .from('email_segments')
        .update({
          ...segmentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', segmentId)
        .select()
        .single()

      if (error) throw error

      // Recalculate member count if criteria changed
      if (segmentData.criteria && data.id) {
        await supabase.rpc('calculate_segment_members', { segment_id: data.id })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-segments', storeId] })
    }
  })
}

export const useDeleteEmailSegment = (storeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (segmentId: string): Promise<void> => {
      const { error } = await supabase
        .from('email_segments')
        .delete()
        .eq('id', segmentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-segments', storeId] })
    }
  })
}

// Campaign Analytics Hooks
export const useEmailCampaignAnalytics = (campaignId: string) => {
  return useQuery({
    queryKey: ['email-campaign-analytics', campaignId],
    queryFn: async (): Promise<EmailCampaignAnalytics | null> => {
      // Get campaign basic info
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError
      if (!campaign) return null

      // Get recipient statistics
      const { data: recipients, error: recipientsError } = await supabase
        .from('campaign_recipients')
        .select('status, sent_at, opened_at, first_clicked_at')
        .eq('campaign_id', campaignId)

      if (recipientsError) throw recipientsError

      const totalRecipients = recipients?.length || 0
      const delivered = recipients?.filter(r => r.status !== 'bounced' && r.status !== 'failed').length || 0
      const opened = recipients?.filter(r => r.opened_at).length || 0
      const clicked = recipients?.filter(r => r.first_clicked_at).length || 0
      const unsubscribed = recipients?.filter(r => r.status === 'unsubscribed').length || 0
      const bounced = recipients?.filter(r => r.status === 'bounced').length || 0

      // Get click tracking data
      const { data: clickTracking, error: clickError } = await supabase
        .from('email_click_tracking')
        .select('link_url, link_label, clicked_at')
        .eq('campaign_id', campaignId)

      if (clickError) throw clickError

      // Process click data
      const linkClicks = new Map()
      clickTracking?.forEach(click => {
        const key = click.link_url
        if (!linkClicks.has(key)) {
          linkClicks.set(key, {
            url: click.link_url,
            label: click.link_label,
            clicks: 0,
            unique_clicks: new Set()
          })
        }
        const linkData = linkClicks.get(key)
        linkData.clicks++
        linkData.unique_clicks.add(click.clicked_at) // Simplified - should use recipient_id
      })

      const topClickedLinks = Array.from(linkClicks.values())
        .map(link => ({
          url: link.url,
          label: link.label,
          clicks: link.clicks,
          unique_clicks: link.unique_clicks.size
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10)

      return {
        campaign_id: campaignId,
        campaign_name: campaign.name,
        sent_date: campaign.created_at,
        total_recipients: totalRecipients,
        delivered,
        opened,
        clicked,
        unsubscribed,
        bounced,
        delivery_rate: totalRecipients > 0 ? (delivered / totalRecipients) * 100 : 0,
        open_rate: delivered > 0 ? (opened / delivered) * 100 : 0,
        click_rate: delivered > 0 ? (clicked / delivered) * 100 : 0,
        click_to_open_rate: opened > 0 ? (clicked / opened) * 100 : 0,
        unsubscribe_rate: delivered > 0 ? (unsubscribed / delivered) * 100 : 0,
        bounce_rate: totalRecipients > 0 ? (bounced / totalRecipients) * 100 : 0,
        opens_over_time: [], // TODO: Implement time-based analysis
        clicks_over_time: [], // TODO: Implement time-based analysis
        top_clicked_links: topClickedLinks,
        client_breakdown: [] // TODO: Implement client analysis
      }
    },
    enabled: !!campaignId
  })
}

export const useEmailMarketingOverview = (storeId: string) => {
  return useQuery({
    queryKey: ['email-marketing-overview', storeId],
    queryFn: async (): Promise<EmailMarketingOverview> => {
      // Get campaign statistics
      const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select('status, total_sent, total_opened, total_clicked, created_at')
        .eq('store_id', storeId)

      const totalCampaigns = campaigns?.length || 0
      const activeCampaigns = campaigns?.filter(c => c.status === 'sending' || c.status === 'scheduled').length || 0
      
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentCampaigns = campaigns?.filter(c => new Date(c.created_at) >= thirtyDaysAgo) || []
      
      const totalSent = campaigns?.reduce((sum, c) => sum + (c.total_sent || 0), 0) || 0
      const totalOpened = campaigns?.reduce((sum, c) => sum + (c.total_opened || 0), 0) || 0
      const totalClicked = campaigns?.reduce((sum, c) => sum + (c.total_clicked || 0), 0) || 0
      
      const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
      const averageClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0

      // Get segment statistics
      const { data: segments } = await supabase
        .from('email_segments')
        .select('name, member_count')
        .eq('store_id', storeId)

      const totalSubscribers = segments?.reduce((sum, s) => sum + s.member_count, 0) || 0

      // Get unsubscribe count
      const { data: unsubscribes } = await supabase
        .from('email_unsubscribes')
        .select('id')
        .eq('store_id', storeId)
        .gte('unsubscribed_at', thirtyDaysAgo.toISOString())

      return {
        total_campaigns: totalCampaigns,
        active_campaigns: activeCampaigns,
        total_subscribers: totalSubscribers,
        average_open_rate: averageOpenRate,
        average_click_rate: averageClickRate,
        total_unsubscribes: unsubscribes?.length || 0,
        campaigns_last_30_days: recentCampaigns.length,
        emails_sent_last_30_days: recentCampaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0),
        new_subscribers_last_30_days: 0, // TODO: Implement subscriber tracking
        top_performing_campaigns: [], // TODO: Implement performance ranking
        segment_performance: segments?.map(s => ({
          segment_name: s.name,
          member_count: s.member_count,
          average_open_rate: 0, // TODO: Calculate per segment
          average_click_rate: 0 // TODO: Calculate per segment
        })) || []
      }
    },
    enabled: !!storeId
  })
}

// Utility function to extract template variables from content
function extractTemplateVariables(content: string): string[] {
  const variableRegex = /\{\{([^}]+)\}\}/g
  const variables = new Set<string>()
  let match

  while ((match = variableRegex.exec(content)) !== null) {
    const variable = match[1].trim()
    if (variable && !variable.startsWith('#') && !variable.startsWith('/')) {
      variables.add(variable)
    }
  }

  return Array.from(variables)
}