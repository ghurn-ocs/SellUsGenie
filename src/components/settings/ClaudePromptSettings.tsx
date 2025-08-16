import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Sparkles, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Copy, 
  Check,
  AlertTriangle,
  BarChart3,
  Zap,
  MessageSquare,
  FileText,
  Globe,
  Mail,
  Smartphone,
  Package,
  Megaphone
} from 'lucide-react'
import { GenieMascot } from '../ui/GenieMascot'
import { useClaudePrompts } from '../../hooks/useClaudePrompts'
import { 
  ClaudePromptTemplate, 
  PromptCategory, 
  PROMPT_CATEGORIES,
  CreatePromptTemplateRequest,
  UpdatePromptTemplateRequest
} from '../../types/claude-prompts'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import * as Switch from '@radix-ui/react-switch'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const promptTemplateSchema = z.object({
  template_name: z.string().min(1, 'Template name is required'),
  template_category: z.enum(['product_description', 'marketing_copy', 'customer_support', 'seo_optimization', 'email_campaign', 'social_media']),
  prompt_text: z.string().min(10, 'Prompt text must be at least 10 characters'),
  variables: z.array(z.string()).default([])
})

type PromptTemplateForm = z.infer<typeof promptTemplateSchema>

interface ClaudePromptSettingsProps {
  storeId: string
}

export const ClaudePromptSettings: React.FC<ClaudePromptSettingsProps> = ({ storeId }) => {
  const {
    templates,
    analytics,
    settings,
    isAIEnabled,
    templatesLoading,
    analyticsLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    testPrompt,
    updateSettings,
    initializeDefaultTemplates,
    getSetting
  } = useClaudePrompts(storeId)

  const [activeTab, setActiveTab] = useState('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<ClaudePromptTemplate | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [testVariables, setTestVariables] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PromptTemplateForm>({
    resolver: zodResolver(promptTemplateSchema),
    defaultValues: {
      template_name: '',
      template_category: 'product_description',
      prompt_text: '',
      variables: []
    }
  })

  const watchedCategory = watch('template_category')

  // Initialize default templates if none exist
  useEffect(() => {
    if (templates.length === 0 && !templatesLoading) {
      initializeDefaultTemplates.mutate()
    }
  }, [templates.length, templatesLoading, initializeDefaultTemplates])

  const handleCreateTemplate = async (data: PromptTemplateForm) => {
    try {
      await createTemplate.mutateAsync(data)
      setIsCreateModalOpen(false)
      reset()
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const handleEditTemplate = async (data: PromptTemplateForm) => {
    if (!selectedTemplate) return
    
    try {
      await updateTemplate.mutateAsync({
        templateId: selectedTemplate.id,
        updates: data
      })
      setIsEditModalOpen(false)
      setSelectedTemplate(null)
      reset()
    } catch (error) {
      console.error('Failed to update template:', error)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate.mutateAsync(templateId)
      } catch (error) {
        console.error('Failed to delete template:', error)
      }
    }
  }

  const handleTestTemplate = async (template: ClaudePromptTemplate) => {
    setSelectedTemplate(template)
    setTestVariables({})
    setTestResult('')
    setIsTestModalOpen(true)
  }

  const handleRunTest = async () => {
    if (!selectedTemplate) return

    try {
      const result = await testPrompt.mutateAsync({
        template_id: selectedTemplate.id,
        variables: testVariables
      })
      setTestResult(result.generated_content || 'No content generated')
    } catch (error) {
      setTestResult('Error: Failed to test prompt')
    }
  }

  const handleToggleAI = async (enabled: boolean) => {
    try {
      await updateSettings.mutateAsync({
        key: 'ai_features_enabled',
        value: enabled
      })
    } catch (error) {
      console.error('Failed to update AI settings:', error)
    }
  }

  const getCategoryIcon = (category: PromptCategory) => {
    const icons = {
      product_description: Package,
      marketing_copy: Megaphone,
      customer_support: MessageSquare,
      seo_optimization: Globe,
      email_campaign: Mail,
      social_media: Smartphone
    }
    const IconComponent = icons[category]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <FileText className="w-4 h-4" />
  }

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(cost)
  }

  if (templatesLoading) {
    return (
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B51E0]"></div>
          <span className="ml-3 text-[#E0E0E0]">Loading Claude AI settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Genie Mascot */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <GenieMascot mood="happy" size="lg" className="flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-white">Claude AI Settings</h3>
              <p className="text-[#A0A0A0]">Configure AI-powered features for your store</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Switch.Root
              checked={isAIEnabled}
              onCheckedChange={handleToggleAI}
              className="w-11 h-6 bg-[#3A3A3A] rounded-full relative data-[state=checked]:bg-[#9B51E0] transition-colors"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
            <span className="text-sm text-[#A0A0A0]">
              {isAIEnabled ? 'AI Enabled' : 'AI Disabled'}
            </span>
          </div>
        </div>

        {/* AI Status Card */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#9B51E0]/20 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#9B51E0]" />
              </div>
              <div>
                <p className="text-white font-medium">AI Features Status</p>
                <p className="text-sm text-[#A0A0A0]">
                  {isAIEnabled 
                    ? 'AI features are active and ready to use' 
                    : 'AI features are currently disabled'
                  }
                </p>
              </div>
            </div>
            {analytics && (
              <div className="text-right">
                <p className="text-white font-medium">{analytics.total_usage}</p>
                <p className="text-sm text-[#A0A0A0]">Total uses</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]">
        <Tabs.List className="flex justify-center border-b border-[#3A3A3A]">
          <Tabs.Trigger
            value="templates"
            className="flex-1 px-4 py-3 text-[#A0A0A0] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#9B51E0] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Prompt Templates</span>
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="analytics"
            className="flex-1 px-4 py-3 text-[#A0A0A0] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#9B51E0] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </div>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="settings"
            className="flex-1 px-4 py-3 text-[#A0A0A0] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#9B51E0] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Templates Tab */}
        <Tabs.Content value="templates" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-white">Prompt Templates</h4>
              <p className="text-[#A0A0A0]">Manage your AI prompt templates</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#9B51E0] hover:bg-[#8B4FD0] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Template</span>
            </button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0]/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getCategoryIcon(template.template_category)}
                      <h5 className="text-white font-medium">{template.template_name}</h5>
                      <span className="px-2 py-1 bg-[#9B51E0]/20 text-[#9B51E0] text-xs rounded-full">
                        {PROMPT_CATEGORIES[template.template_category].name}
                      </span>
                      {template.is_default && (
                        <span className="px-2 py-1 bg-[#22C55E]/20 text-[#22C55E] text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[#A0A0A0] text-sm mb-3 line-clamp-2">
                      {template.prompt_text}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-[#A0A0A0]">
                      <span>Used {template.usage_count} times</span>
                      {template.last_used_at && (
                        <span>Last used {new Date(template.last_used_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleTestTemplate(template)}
                      className="p-2 text-[#9B51E0] hover:bg-[#9B51E0]/10 rounded-lg transition-colors"
                      title="Test Template"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    {!template.is_default && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTemplate(template)
                            setValue('template_name', template.template_name)
                            setValue('template_category', template.template_category)
                            setValue('prompt_text', template.prompt_text)
                            setValue('variables', template.variables)
                            setIsEditModalOpen(true)
                          }}
                          className="p-2 text-[#A0A0A0] hover:text-white hover:bg-[#3A3A3A] rounded-lg transition-colors"
                          title="Edit Template"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tabs.Content>

        {/* Analytics Tab */}
        <Tabs.Content value="analytics" className="p-6">
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B51E0]"></div>
              <span className="ml-3 text-[#E0E0E0]">Loading analytics...</span>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#9B51E0]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{analytics.total_usage}</p>
                      <p className="text-sm text-[#A0A0A0]">Total Uses</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#22C55E]/20 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{analytics.success_rate.toFixed(1)}%</p>
                      <p className="text-sm text-[#A0A0A0]">Success Rate</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{formatCost(analytics.total_cost)}</p>
                      <p className="text-sm text-[#A0A0A0]">Total Cost</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                <h5 className="text-white font-medium mb-4">Usage by Category</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(analytics.usage_by_category).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category as PromptCategory)}
                        <span className="text-white text-sm">
                          {PROMPT_CATEGORIES[category as PromptCategory].name}
                        </span>
                      </div>
                      <span className="text-[#9B51E0] font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#A0A0A0]">No analytics data available</p>
            </div>
          )}
        </Tabs.Content>

        {/* Settings Tab */}
        <Tabs.Content value="settings" className="p-6">
          <div className="space-y-6">
            <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
              <h5 className="text-white font-medium mb-4">AI Configuration</h5>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Auto-generate product descriptions</p>
                    <p className="text-sm text-[#A0A0A0]">Automatically generate descriptions when creating products</p>
                  </div>
                  <Switch.Root
                    checked={getSetting('auto_generate_product_descriptions') === true}
                    onCheckedChange={(checked) => updateSettings.mutate({ key: 'auto_generate_product_descriptions', value: checked })}
                    className="w-11 h-6 bg-[#3A3A3A] rounded-full relative data-[state=checked]:bg-[#9B51E0] transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Usage notifications</p>
                    <p className="text-sm text-[#A0A0A0]">Receive notifications about AI usage and costs</p>
                  </div>
                  <Switch.Root
                    checked={getSetting('prompt_usage_notifications') !== false}
                    onCheckedChange={(checked) => updateSettings.mutate({ key: 'prompt_usage_notifications', value: checked })}
                    className="w-11 h-6 bg-[#3A3A3A] rounded-full relative data-[state=checked]:bg-[#9B51E0] transition-colors"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                </div>
              </div>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Create Template Modal */}
      <Dialog.Root open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-semibold text-white mb-4">
              Create New Prompt Template
            </Dialog.Title>
            <form onSubmit={handleSubmit(handleCreateTemplate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Template Name</label>
                <input
                  {...register('template_name')}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                  placeholder="Enter template name"
                />
                {errors.template_name && (
                  <p className="text-[#EF4444] text-sm mt-1">{errors.template_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  {...register('template_category')}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                >
                  {Object.entries(PROMPT_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Prompt Text</label>
                <textarea
                  {...register('prompt_text')}
                  rows={6}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                  placeholder="Enter your prompt template. Use [variable_name] for dynamic variables."
                />
                {errors.prompt_text && (
                  <p className="text-[#EF4444] text-sm mt-1">{errors.prompt_text.message}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-[#A0A0A0] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#9B51E0] hover:bg-[#8B4FD0] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Template Modal */}
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-semibold text-white mb-4">
              Edit Prompt Template
            </Dialog.Title>
            <form onSubmit={handleSubmit(handleEditTemplate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Template Name</label>
                <input
                  {...register('template_name')}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                  placeholder="Enter template name"
                />
                {errors.template_name && (
                  <p className="text-[#EF4444] text-sm mt-1">{errors.template_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  {...register('template_category')}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                >
                  {Object.entries(PROMPT_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Prompt Text</label>
                <textarea
                  {...register('prompt_text')}
                  rows={6}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                  placeholder="Enter your prompt template. Use [variable_name] for dynamic variables."
                />
                {errors.prompt_text && (
                  <p className="text-[#EF4444] text-sm mt-1">{errors.prompt_text.message}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-[#A0A0A0] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#9B51E0] hover:bg-[#8B4FD0] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Template'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Test Template Modal */}
      <Dialog.Root open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-3xl z-50 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-semibold text-white mb-4">
              Test Prompt Template
            </Dialog.Title>
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                  <h6 className="text-white font-medium mb-2">{selectedTemplate.template_name}</h6>
                  <p className="text-[#A0A0A0] text-sm">{selectedTemplate.prompt_text}</p>
                </div>
                
                {selectedTemplate.variables.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Test Variables</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTemplate.variables.map((variable) => (
                        <div key={variable}>
                          <label className="block text-xs text-[#A0A0A0] mb-1">{variable}</label>
                          <input
                            type="text"
                            value={testVariables[variable] || ''}
                            onChange={(e) => setTestVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                            className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                            placeholder={`Enter ${variable}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleRunTest}
                    disabled={testPrompt.isPending}
                    className="bg-[#9B51E0] hover:bg-[#8B4FD0] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>{testPrompt.isPending ? 'Testing...' : 'Test Prompt'}</span>
                  </button>
                </div>

                {testResult && (
                  <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                    <h6 className="text-white font-medium mb-2">Generated Content</h6>
                    <div className="bg-[#2A2A2A] rounded-lg p-3">
                      <p className="text-[#E0E0E0] whitespace-pre-wrap">{testResult}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
