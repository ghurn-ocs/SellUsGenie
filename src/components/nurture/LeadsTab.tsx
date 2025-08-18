import React, { useState } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { useLeads, useLeadAnalytics, useCreateLead, useUpdateLead } from '../../hooks/useNurture'
import { CustomerLead, LeadFilters, CreateLeadForm } from '../../types/nurture'
import { User, Mail, Phone, Star, Calendar, Tag, Filter, Search, Plus, Download, Edit3, Eye, Trash2, AlertCircle, CheckCircle, Clock, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

export const LeadsTab: React.FC = () => {
  const { currentStore } = useStore()
  const [filters, setFilters] = useState<LeadFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<CustomerLead | null>(null)
  
  // Data hooks
  const { data: leads = [], isLoading, error } = useLeads(currentStore?.id || '', filters)
  const { data: analytics } = useLeadAnalytics(currentStore?.id || '')
  const createLead = useCreateLead(currentStore?.id || '')
  const updateLead = useUpdateLead(currentStore?.id || '')

  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      lead.email.toLowerCase().includes(searchLower) ||
      lead.first_name?.toLowerCase().includes(searchLower) ||
      lead.last_name?.toLowerCase().includes(searchLower) ||
      lead.notes?.toLowerCase().includes(searchLower)
    )
  })

  const handleCreateLead = async (formData: CreateLeadForm) => {
    try {
      await createLead.mutateAsync(formData)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Failed to create lead:', error)
    }
  }

  const handleUpdateLeadStatus = async (leadId: string, status: CustomerLead['status']) => {
    try {
      await updateLead.mutateAsync({ leadId, updates: { status } })
    } catch (error) {
      console.error('Failed to update lead status:', error)
    }
  }

  const getStatusColor = (status: CustomerLead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'qualified': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'nurturing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'converted': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (!currentStore) {
    return (
      <div className="text-center py-12">
        <p className="text-[#A0A0A0]">Please select a store to manage leads.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Lead Management</h3>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-[#00AEEF] text-white hover:bg-[#007AFF] rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Import Leads</span>
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>
        
        {/* Leads Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Total Leads</p>
                <p className="text-2xl font-bold text-white">{analytics?.total_leads || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-400 font-medium">+{analytics?.new_leads || 0}</span>
              <span className="text-[#A0A0A0] ml-1">new leads</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Qualified</p>
                <p className="text-2xl font-bold text-green-400">{analytics?.qualified_leads || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-400 font-medium">
                {analytics?.total_leads > 0 ? Math.round((analytics.qualified_leads / analytics.total_leads) * 100) : 0}%
              </span>
              <span className="text-[#A0A0A0] ml-1">qualification rate</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Converted</p>
                <p className="text-2xl font-bold text-[#9B51E0]">{analytics?.converted_leads || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-[#9B51E0] font-medium">
                {Math.round(analytics?.conversion_rate || 0)}%
              </span>
              <span className="text-[#A0A0A0] ml-1">conversion rate</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Avg. Score</p>
                <p className="text-2xl font-bold text-orange-400">{Math.round(analytics?.average_lead_score || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-400 font-medium">Quality score</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
            <input
              type="text"
              placeholder="Search leads by name, email, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#A0A0A0]" />
            <select
              value={filters.status?.[0] || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value as any] : undefined })}
              className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="nurturing">Nurturing</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Leads Table */}
        {isLoading ? (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B51E0] mx-auto mb-4"></div>
            <p className="text-[#A0A0A0]">Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-8 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No leads found</h3>
            <p className="text-[#A0A0A0] mb-4">
              {searchQuery || filters.status ? 'Try adjusting your filters or search terms.' : 'Start by adding your first lead to begin nurturing potential customers.'}
            </p>
            {!searchQuery && !filters.status && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#9B51E0] text-white px-4 py-2 rounded-lg hover:bg-[#8A47D0] transition-colors"
              >
                Add First Lead
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2A2A2A] border-b border-[#3A3A3A]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Lead</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A3A3A]">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#2A2A2A] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : 'Unnamed Lead'}
                            </div>
                            <div className="text-sm text-[#A0A0A0]">{lead.email}</div>
                            {lead.phone && (
                              <div className="text-xs text-[#666] flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{lead.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as CustomerLead['status'])}
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(lead.status)} bg-transparent focus:outline-none focus:ring-2 focus:ring-[#9B51E0]`}
                          disabled={updateLead.isPending}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="nurturing">Nurturing</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-[#3A3A3A] rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                              style={{ width: `${Math.min(lead.lead_score, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-white min-w-[2rem]">{lead.lead_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#A0A0A0]">
                          {lead.lead_source?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#A0A0A0]">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedLead(lead)}
                            className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                            title="Edit lead"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete lead"
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

      {/* Create Lead Modal */}
      <CreateLeadModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLead}
        isLoading={createLead.isPending}
      />

      {/* Lead Details Modal */}
      {selectedLead && (
        <LeadDetailsModal 
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLeadStatus}
        />
      )}
    </div>
  )
}

// Create Lead Modal Component
interface CreateLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateLeadForm) => void
  isLoading: boolean
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CreateLeadForm>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ email: '', first_name: '', last_name: '', phone: '', notes: '' })
      onClose()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-md z-50">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">Add New Lead</Dialog.Title>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-[#A0A0A0] hover:text-white transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                placeholder="lead@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                  placeholder="John"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                  placeholder="Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                placeholder="+1 (555) 123-4567"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] resize-vertical"
                placeholder="Add any notes about this lead..."
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
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
                disabled={isLoading || !formData.email}
                className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{isLoading ? 'Creating...' : 'Create Lead'}</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Lead Details Modal Component
interface LeadDetailsModalProps {
  lead: CustomerLead
  onClose: () => void
  onUpdate: (leadId: string, status: CustomerLead['status']) => void
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, onClose, onUpdate }) => {
  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">Lead Details</Dialog.Title>
            <button
              onClick={onClose}
              className="text-[#A0A0A0] hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#A0A0A0]" />
                    <span className="text-white">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-[#A0A0A0]" />
                      <span className="text-white">{lead.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Lead Score</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-[#3A3A3A] rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full"
                      style={{ width: `${Math.min(lead.lead_score, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-white">{lead.lead_score}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Status</h4>
                <select
                  value={lead.status}
                  onChange={(e) => onUpdate(lead.id, e.target.value as CustomerLead['status'])}
                  className={`px-3 py-2 rounded-lg border ${getStatusColor(lead.status)} bg-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="nurturing">Nurturing</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#A0A0A0]" />
                    <span className="text-white">Created: {new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                  {lead.last_interaction_at && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#A0A0A0]" />
                      <span className="text-white">Last interaction: {new Date(lead.last_interaction_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {lead.notes && (
                <div>
                  <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Notes</h4>
                  <p className="text-white text-sm">{lead.notes}</p>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const getStatusColor = (status: CustomerLead['status']) => {
  switch (status) {
    case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'qualified': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'nurturing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'converted': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}