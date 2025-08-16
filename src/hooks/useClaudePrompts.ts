import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  ClaudePromptTemplate,
  ClaudePromptUsage,
  ClaudePromptSettings,
  PromptCategory,
  CreatePromptTemplateRequest,
  UpdatePromptTemplateRequest,
  PromptTestRequest,
  PromptTestResponse,
  PromptAnalytics,
  DEFAULT_PROMPT_TEMPLATES
} from '../types/claude-prompts'

export const useClaudePrompts = (storeId: string) => {
  const queryClient = useQueryClient()

  // Fetch all prompt templates for a store
  const {
    data: templates = [],
    isLoading: templatesLoading,
    error: templatesError
  } = useQuery({
    queryKey: ['claude-prompts', storeId],
    queryFn: async (): Promise<ClaudePromptTemplate[]> => {
      const { data, error } = await supabase
        .from('claude_prompt_templates')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })

  // Fetch prompt usage analytics
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError
  } = useQuery({
    queryKey: ['claude-prompts-analytics', storeId],
    queryFn: async (): Promise<PromptAnalytics> => {
      const { data: usage, error: usageError } = await supabase
        .from('claude_prompt_usage')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (usageError) throw usageError

      const totalUsage = usage?.length || 0
      const totalCost = usage?.reduce((sum, u) => sum + (u.cost_usd || 0), 0) || 0
      const successCount = usage?.filter(u => u.success).length || 0
      const successRate = totalUsage > 0 ? (successCount / totalUsage) * 100 : 0

      const usageByCategory: Record<PromptCategory, number> = {
        product_description: 0,
        marketing_copy: 0,
        customer_support: 0,
        seo_optimization: 0,
        email_campaign: 0,
        social_media: 0
      }

      // Get category usage from templates
      const { data: templateUsage } = await supabase
        .from('claude_prompt_templates')
        .select('template_category, usage_count')
        .eq('store_id', storeId)

      templateUsage?.forEach(t => {
        if (t.template_category in usageByCategory) {
          usageByCategory[t.template_category as PromptCategory] += t.usage_count
        }
      })

      return {
        total_usage: totalUsage,
        total_cost: totalCost,
        success_rate: successRate,
        usage_by_category: usageByCategory,
        recent_usage: usage || []
      }
    },
    enabled: !!storeId
  })

  // Fetch prompt settings
  const {
    data: settings = [],
    isLoading: settingsLoading,
    error: settingsError
  } = useQuery({
    queryKey: ['claude-prompts-settings', storeId],
    queryFn: async (): Promise<ClaudePromptSettings[]> => {
      const { data, error } = await supabase
        .from('claude_prompt_settings')
        .select('*')
        .eq('store_id', storeId)

      if (error) throw error
      return data || []
    },
    enabled: !!storeId
  })

  // Initialize default templates for new stores
  const initializeDefaultTemplates = useMutation({
    mutationFn: async () => {
      const templatesToInsert = DEFAULT_PROMPT_TEMPLATES.map(template => ({
        ...template,
        store_id: storeId
      }))

      const { data, error } = await supabase
        .from('claude_prompt_templates')
        .insert(templatesToInsert)
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claude-prompts', storeId] })
    }
  })

  // Create new prompt template
  const createTemplate = useMutation({
    mutationFn: async (template: CreatePromptTemplateRequest): Promise<ClaudePromptTemplate> => {
      const { data, error } = await supabase
        .from('claude_prompt_templates')
        .insert({
          ...template,
          store_id: storeId
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claude-prompts', storeId] })
    }
  })

  // Update prompt template
  const updateTemplate = useMutation({
    mutationFn: async ({ 
      templateId, 
      updates 
    }: { 
      templateId: string
      updates: UpdatePromptTemplateRequest 
    }): Promise<ClaudePromptTemplate> => {
      const { data, error } = await supabase
        .from('claude_prompt_templates')
        .update(updates)
        .eq('id', templateId)
        .eq('store_id', storeId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claude-prompts', storeId] })
      queryClient.invalidateQueries({ queryKey: ['claude-prompts-analytics', storeId] })
    }
  })

  // Delete prompt template
  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string): Promise<void> => {
      const { error } = await supabase
        .from('claude_prompt_templates')
        .delete()
        .eq('id', templateId)
        .eq('store_id', storeId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claude-prompts', storeId] })
    }
  })

  // Test prompt template
  const testPrompt = useMutation({
    mutationFn: async (request: PromptTestRequest): Promise<PromptTestResponse> => {
      // This would integrate with Claude API
      // For now, return a mock response
      const template = templates.find(t => t.id === request.template_id)
      if (!template) {
        throw new Error('Template not found')
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock response - in real implementation, this would call Claude API
      const mockResponse: PromptTestResponse = {
        success: true,
        generated_content: `This is a mock response for testing the prompt: "${template.prompt_text}" with variables: ${JSON.stringify(request.variables)}`,
        tokens_used: 150,
        cost_usd: 0.003
      }

      return mockResponse
    },
    onSuccess: (response, variables) => {
      // Log the usage
      logPromptUsage({
        template_id: variables.template_id,
        prompt_text: templates.find(t => t.id === variables.template_id)?.prompt_text || '',
        generated_content: response.generated_content,
        tokens_used: response.tokens_used,
        cost_usd: response.cost_usd,
        success: response.success,
        context: { test_data: variables.test_data }
      })
    }
  })

  // Log prompt usage
  const logPromptUsage = useMutation({
    mutationFn: async (usage: {
      template_id: string | null
      prompt_text: string
      generated_content?: string
      tokens_used?: number
      cost_usd?: number
      success: boolean
      error_message?: string
      context?: Record<string, any>
    }) => {
      const { error } = await supabase
        .from('claude_prompt_usage')
        .insert({
          ...usage,
          store_id: storeId
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claude-prompts-analytics', storeId] })
    }
  })

  // Update prompt settings
  const updateSettings = useMutation({
    mutationFn: async ({ 
      key, 
      value 
    }: { 
      key: string
      value: any 
    }): Promise<ClaudePromptSettings> => {
      const { data, error } = await supabase
        .from('claude_prompt_settings')
        .upsert({
          store_id: storeId,
          setting_key: key,
          setting_value: value
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claude-prompts-settings', storeId] })
    }
  })

  // Get setting value helper
  const getSetting = (key: string) => {
    return settings.find(s => s.setting_key === key)?.setting_value
  }

  // Check if AI features are enabled
  const isAIEnabled = getSetting('ai_features_enabled') !== false

  return {
    // Data
    templates,
    analytics,
    settings,
    isAIEnabled,

    // Loading states
    templatesLoading,
    analyticsLoading,
    settingsLoading,

    // Error states
    templatesError,
    analyticsError,
    settingsError,

    // Mutations
    initializeDefaultTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    testPrompt,
    logPromptUsage,
    updateSettings,

    // Helpers
    getSetting
  }
}
