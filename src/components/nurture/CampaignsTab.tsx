import React, { useState } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { useEmailCampaigns, useEmailMarketingOverview, useEmailTemplates, useCreateEmailCampaign, useSendEmailCampaign } from '../../hooks/useEmailMarketing'
import { EmailCampaign, CreateEmailCampaignForm, EmailTemplate } from '../../types/emailMarketing'
import { Mail, Plus, Play, Pause, Calendar, Users, Eye, Edit3, Trash2, AlertCircle, CheckCircle, Clock, X, Search, Filter, Download, TrendingUp, BarChart3 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

export const CampaignsTab: React.FC = () => {
  const { currentStore } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  
  // Data hooks
  const { data: campaigns = [], isLoading: campaignsLoading } = useEmailCampaigns(currentStore?.id || '', {
    status: statusFilter ? [statusFilter as any] : undefined
  })
  const { data: overview } = useEmailMarketingOverview(currentStore?.id || '')
  const { data: templates = [] } = useEmailTemplates(currentStore?.id || '')
  const createCampaign = useCreateEmailCampaign(currentStore?.id || '')
  const sendCampaign = useSendEmailCampaign()

  // Filter campaigns based on search query
  const filteredCampaigns = campaigns.filter(campaign => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      campaign.name.toLowerCase().includes(searchLower) ||
      campaign.description?.toLowerCase().includes(searchLower) ||
      campaign.subject_line.toLowerCase().includes(searchLower)
    )
  })

  const handleCreateCampaign = async (formData: CreateEmailCampaignForm) => {
    try {
      await createCampaign.mutateAsync(formData)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Failed to create campaign:', error)
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    try {
      await sendCampaign.mutateAsync(campaignId)
    } catch (error) {
      console.error('Failed to send campaign:', error)
    }
  }

  const getStatusColor = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'sending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'sent': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'paused': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4" />
      case 'scheduled': return <Calendar className="w-4 h-4" />
      case 'sending': return <Clock className="w-4 h-4" />
      case 'sent': return <CheckCircle className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (!currentStore) {
    return (
      <div className="text-center py-12">
        <p className="text-[#A0A0A0]">Please select a store to manage email campaigns.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Email Campaigns</h3>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-4 py-2 bg-[#00AEEF] text-white hover:bg-[#007AFF] rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Browse Templates</span>
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>
        
        {/* Campaign Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Total Campaigns</p>
                <p className="text-2xl font-bold text-white">{overview?.total_campaigns || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-400 font-medium">{overview?.active_campaigns || 0}</span>
              <span className="text-[#A0A0A0] ml-1">active</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Avg Open Rate</p>
                <p className="text-2xl font-bold text-blue-400">{Math.round(overview?.average_open_rate || 0)}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-400 font-medium">Industry avg: 22%</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Avg Click Rate</p>
                <p className="text-2xl font-bold text-[#9B51E0]">{Math.round(overview?.average_click_rate || 0)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-400 font-medium">Industry avg: 3%</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Subscribers</p>
                <p className="text-2xl font-bold text-orange-400">{overview?.total_subscribers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-400 font-medium">{overview?.emails_sent_last_30_days || 0}</span>
              <span className="text-[#A0A0A0] ml-1">emails sent (30d)</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns by name, subject, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#A0A0A0]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button className="p-2 text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Campaigns Table */}
        {campaignsLoading ? (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B51E0] mx-auto mb-4"></div>
            <p className="text-[#A0A0A0]">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No campaigns found</h3>
            <p className="text-[#A0A0A0] mb-4">
              {searchQuery || statusFilter ? 'Try adjusting your filters or search terms.' : 'Create your first email campaign to start reaching your customers.'}
            </p>
            {!searchQuery && !statusFilter && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#9B51E0] text-white px-4 py-2 rounded-lg hover:bg-[#8A47D0] transition-colors"
              >
                Create First Campaign
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2A2A2A] border-b border-[#3A3A3A]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Recipients</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A3A3A]">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-[#2A2A2A] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{campaign.name}</div>
                            <div className="text-sm text-[#A0A0A0] truncate max-w-xs">{campaign.subject_line}</div>
                            {campaign.description && (
                              <div className="text-xs text-[#666] truncate max-w-xs">{campaign.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          <span className="capitalize">{campaign.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {campaign.total_sent > 0 ? (
                            <div>
                              <div className="font-medium">{campaign.total_sent.toLocaleString()}</div>
                              <div className="text-xs text-[#A0A0A0]">sent</div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium">{campaign.estimated_recipients.toLocaleString()}</div>
                              <div className="text-xs text-[#A0A0A0]">estimated</div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {campaign.total_sent > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-[#A0A0A0]">Open:</span>
                              <span className="text-blue-400 font-medium">{Math.round(campaign.open_rate || 0)}%</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-[#A0A0A0]">Click:</span>
                              <span className="text-green-400 font-medium">{Math.round(campaign.click_rate || 0)}%</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#666]">Not sent yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#A0A0A0]">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedCampaign(campaign)}
                            className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {campaign.status === 'draft' && (
                            <button 
                              onClick={() => handleSendCampaign(campaign.id)}
                              disabled={sendCampaign.isPending}
                              className="p-1 text-green-400 hover:bg-green-500/20 rounded transition-colors disabled:opacity-50"
                              title="Send campaign"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                            title="Edit campaign"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
        isLoading={createCampaign.isPending}
        templates={templates}
      />

      {/* Templates Browser Modal */}
      <TemplatesBrowserModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={templates}
        onSelectTemplate={(template) => {
          setIsTemplateModalOpen(false)
          setIsCreateModalOpen(true)
        }}
      />

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <CampaignDetailsModal 
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSend={handleSendCampaign}
        />
      )}
    </div>
  )
}

// Create Campaign Modal Component
interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEmailCampaignForm) => void
  isLoading: boolean
  templates: EmailTemplate[]
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading,
  templates 
}) => {
  const [formData, setFormData] = useState<CreateEmailCampaignForm>({
    name: '',
    campaign_type: 'one_time',
    subject_line: '',
    sender_name: '',
    sender_email: '',
    send_immediately: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        campaign_type: 'one_time',
        subject_line: '',
        sender_name: '',
        sender_email: '',
        send_immediately: false
      })
      onClose()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-semibold text-white">Create Email Campaign</Dialog.Title>
              <Dialog.Description className="text-sm text-[#A0A0A0] mt-1">
                Create and send targeted email campaigns to your customers
              </Dialog.Description>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-[#A0A0A0] hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                  placeholder="Summer Sale Campaign"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Campaign Type *</label>
                <select
                  required
                  value={formData.campaign_type}
                  onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                  disabled={isLoading}
                >
                  <option value="one_time">One-time</option>
                  <option value="recurring">Recurring</option>
                  <option value="automated">Automated</option>
                  <option value="drip_sequence">Drip Sequence</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Email Subject *</label>
              <input
                type="text"
                required
                value={formData.subject_line}
                onChange={(e) => setFormData({ ...formData, subject_line: e.target.value })}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                placeholder="🔥 Don't miss out on 50% off everything!"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Preview Text</label>
              <input
                type="text"
                value={formData.preview_text || ''}
                onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                placeholder="Limited time offer - shop now before it's gone!"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Sender Name *</label>
                <input
                  type="text"
                  required
                  value={formData.sender_name}
                  onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                  placeholder="Your Store Name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Sender Email *</label>
                <input
                  type="email"
                  required
                  value={formData.sender_email}
                  onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                  placeholder="hello@yourstore.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Email Template</label>
                <select
                  value={formData.template_id || ''}
                  onChange={(e) => setFormData({ ...formData, template_id: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                  disabled={isLoading}
                >
                  <option value="">Select a template (optional)</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="send_immediately"
                checked={formData.send_immediately}
                onChange={(e) => setFormData({ ...formData, send_immediately: e.target.checked })}
                className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                disabled={isLoading}
              />
              <label htmlFor="send_immediately" className="text-sm text-[#A0A0A0]">
                Send immediately after creation
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#3A3A3A]">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name || !formData.subject_line || !formData.sender_name || !formData.sender_email}
                className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{isLoading ? 'Creating...' : 'Create Campaign'}</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Templates Browser Modal Component
interface TemplatesBrowserModalProps {
  isOpen: boolean
  onClose: () => void
  templates: EmailTemplate[]
  onSelectTemplate: (template: EmailTemplate) => void
}

const TemplatesBrowserModal: React.FC<TemplatesBrowserModalProps> = ({ 
  isOpen, 
  onClose, 
  templates,
  onSelectTemplate 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Get unique categories from templates
  const categories = Array.from(new Set(templates.map(t => t.category))).sort()
  
  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject_line.toLowerCase().includes(searchQuery.toLowerCase())
      
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Group templates by category for better organization
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, EmailTemplate[]>)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'welcome': return '👋'
      case 'promotional': return '🎉'
      case 'cart_abandonment': return '🛒'
      case 'seasonal': return '🎄'
      case 'newsletter': return '📰'
      case 'birthday': return '🎂'
      case 'winback': return '💔'
      case 'product_launch': return '🚀'
      case 'transactional': return '📋'
      case 'survey': return '📝'
      case 'event': return '📅'
      default: return '📧'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome': return 'bg-blue-500/20 text-blue-400'
      case 'promotional': return 'bg-green-500/20 text-green-400'
      case 'cart_abandonment': return 'bg-orange-500/20 text-orange-400'
      case 'seasonal': return 'bg-red-500/20 text-red-400'
      case 'newsletter': return 'bg-purple-500/20 text-purple-400'
      case 'birthday': return 'bg-pink-500/20 text-pink-400'
      case 'winback': return 'bg-yellow-500/20 text-yellow-400'
      case 'product_launch': return 'bg-teal-500/20 text-teal-400'
      case 'transactional': return 'bg-gray-500/20 text-gray-400'
      case 'survey': return 'bg-indigo-500/20 text-indigo-400'
      case 'event': return 'bg-cyan-500/20 text-cyan-400'
      default: return 'bg-purple-500/20 text-purple-400'
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] z-50">
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-6 border-b border-[#3A3A3A]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Dialog.Title className="text-xl font-semibold text-white">Email Templates ({filteredTemplates.length})</Dialog.Title>
                  <Dialog.Description className="text-sm text-[#A0A0A0] mt-1">
                    Browse and select from our collection of professional email templates for your campaigns
                  </Dialog.Description>
                </div>
                <button onClick={onClose} className="text-[#A0A0A0] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates by name, description, or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                >
                  <option value="">All Categories ({templates.length})</option>
                  {categories.map((category) => {
                    const count = templates.filter(t => t.category === category).length
                    return (
                      <option key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({count})
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {searchQuery || selectedCategory ? 'No matching templates' : 'No templates available'}
                  </h3>
                  <p className="text-[#A0A0A0]">
                    {searchQuery || selectedCategory 
                      ? 'Try adjusting your search terms or filters.' 
                      : 'Create your first email template to get started.'}
                  </p>
                </div>
              ) : selectedCategory ? (
                // Single category view
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <div 
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-4 hover:border-[#9B51E0] transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-[#9B51E0]/10"
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg ${getCategoryColor(template.category)}`}>
                          {getCategoryIcon(template.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium group-hover:text-[#9B51E0] transition-colors truncate">{template.name}</h4>
                          <p className="text-xs text-[#A0A0A0] capitalize">{template.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      
                      {template.description && (
                        <p className="text-sm text-[#A0A0A0] mb-3 line-clamp-2">{template.description}</p>
                      )}
                      
                      <div className="mb-3">
                        <p className="text-xs text-[#666] mb-1">Subject Preview:</p>
                        <p className="text-sm text-white/80 truncate">{template.subject_line}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#666]">Used {template.usage_count} times</span>
                        <span className={`px-2 py-1 rounded-full ${getCategoryColor(template.category)} text-xs font-medium`}>
                          {template.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Grouped by category view
                <div className="space-y-8">
                  {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                    <div key={category}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${getCategoryColor(category)}`}>
                          {getCategoryIcon(category)}
                        </div>
                        <h3 className="text-lg font-semibold text-white capitalize">
                          {category.replace('_', ' ')} Templates ({categoryTemplates.length})
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryTemplates.slice(0, 6).map((template) => (
                          <div 
                            key={template.id}
                            onClick={() => onSelectTemplate(template)}
                            className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-4 hover:border-[#9B51E0] transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-[#9B51E0]/10"
                          >
                            <div className="flex items-start space-x-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(template.category)}`}>
                                <Mail className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium group-hover:text-[#9B51E0] transition-colors truncate">{template.name}</h4>
                                <p className="text-xs text-[#A0A0A0]">{template.description?.slice(0, 50)}...</p>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-xs text-[#666] mb-1">Subject:</p>
                              <p className="text-sm text-white/80 truncate">{template.subject_line}</p>
                            </div>
                            
                            <div className="text-xs text-[#666]">
                              Used {template.usage_count} times
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {categoryTemplates.length > 6 && (
                        <button
                          onClick={() => setSelectedCategory(category)}
                          className="mt-4 text-[#9B51E0] hover:text-[#A051E0] text-sm font-medium"
                        >
                          View all {categoryTemplates.length} {category.replace('_', ' ')} templates →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Campaign Details Modal Component
interface CampaignDetailsModalProps {
  campaign: EmailCampaign
  onClose: () => void
  onSend: (campaignId: string) => void
}

const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({ 
  campaign, 
  onClose, 
  onSend 
}) => {
  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-3xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">Campaign Details</Dialog.Title>
            <button onClick={onClose} className="text-[#A0A0A0] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Campaign Information</h4>
                <div className="space-y-2">
                  <div><span className="text-white font-medium">{campaign.name}</span></div>
                  <div className="text-sm text-[#A0A0A0]">{campaign.subject_line}</div>
                  {campaign.description && (
                    <div className="text-sm text-[#666]">{campaign.description}</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Status & Type</h4>
                <div className="flex items-center space-x-3">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    <span className="capitalize">{campaign.status}</span>
                  </div>
                  <span className="text-sm text-[#A0A0A0] capitalize">{campaign.campaign_type.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Sender</h4>
                <div className="text-sm text-white">
                  {campaign.sender_name} &lt;{campaign.sender_email}&gt;
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {campaign.total_sent > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#A0A0A0]">Sent</span>
                      <span className="text-white font-medium">{campaign.total_sent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#A0A0A0]">Opened</span>
                      <span className="text-blue-400 font-medium">{campaign.total_opened} ({Math.round(campaign.open_rate || 0)}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#A0A0A0]">Clicked</span>
                      <span className="text-green-400 font-medium">{campaign.total_clicked} ({Math.round(campaign.click_rate || 0)}%)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#A0A0A0]">Unsubscribed</span>
                      <span className="text-red-400 font-medium">{campaign.total_unsubscribed}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Recipients</h4>
                  <div className="text-white font-medium">{campaign.estimated_recipients.toLocaleString()} estimated</div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Timeline</h4>
                <div className="space-y-1 text-sm">
                  <div>Created: {new Date(campaign.created_at).toLocaleString()}</div>
                  {campaign.scheduled_at && (
                    <div>Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {campaign.status === 'draft' && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-[#3A3A3A] mt-6">
              <button
                onClick={() => onSend(campaign.id)}
                className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Send Campaign</span>
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function getStatusColor(status: EmailCampaign['status']) {
  switch (status) {
    case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'sending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'sent': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'paused': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

function getStatusIcon(status: EmailCampaign['status']) {
  switch (status) {
    case 'draft': return <Edit3 className="w-4 h-4" />
    case 'scheduled': return <Calendar className="w-4 h-4" />
    case 'sending': return <Clock className="w-4 h-4" />
    case 'sent': return <CheckCircle className="w-4 h-4" />
    case 'paused': return <Pause className="w-4 h-4" />
    case 'cancelled': return <X className="w-4 h-4" />
    default: return <AlertCircle className="w-4 h-4" />
  }
}