import React, { useState } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { useEmailSegments, usePredefinedSegments, useCreateEmailSegment, useUpdateEmailSegment, useDeleteEmailSegment } from '../../hooks/useEmailMarketing'
import { EmailSegment, CreateEmailSegmentForm, SegmentationCriteria, PredefinedSegment } from '../../types/emailMarketing'
import { Users, Plus, Download, Filter, Search, Eye, Edit3, Trash2, Clock, DollarSign, TrendingUp, Target, X, Zap } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

export const SegmentsTab: React.FC = () => {
  const { currentStore } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [segmentTypeFilter, setSegmentTypeFilter] = useState<string>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<EmailSegment | null>(null)
  const [segmentToEdit, setSegmentToEdit] = useState<EmailSegment | null>(null)
  const [segmentToDelete, setSegmentToDelete] = useState<EmailSegment | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // Auto-dismiss notifications after 5 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])
  
  // Data hooks
  const { data: segments = [], isLoading: segmentsLoading } = useEmailSegments(currentStore?.id || '', {
    segment_type: segmentTypeFilter ? [segmentTypeFilter as any] : undefined
  })
  const { data: predefinedSegments = [] } = usePredefinedSegments()
  const createSegment = useCreateEmailSegment(currentStore?.id || '')
  const updateSegment = useUpdateEmailSegment(currentStore?.id || '')
  const deleteSegment = useDeleteEmailSegment(currentStore?.id || '')

  // Filter segments based on search query
  const filteredSegments = segments.filter(segment => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      segment.name.toLowerCase().includes(searchLower) ||
      segment.description?.toLowerCase().includes(searchLower)
    )
  })

  const handleCreateSegment = async (formData: CreateEmailSegmentForm) => {
    try {
      await createSegment.mutateAsync(formData)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Failed to create segment:', error)
    }
  }

  const handleEditSegment = async (formData: CreateEmailSegmentForm) => {
    if (!segmentToEdit) return
    try {
      await updateSegment.mutateAsync({
        segmentId: segmentToEdit.id,
        segmentData: formData
      })
      setIsEditModalOpen(false)
      setSegmentToEdit(null)
    } catch (error) {
      console.error('Failed to update segment:', error)
    }
  }

  const handleDeleteSegment = async () => {
    if (!segmentToDelete) return
    try {
      await deleteSegment.mutateAsync(segmentToDelete.id)
      setIsDeleteModalOpen(false)
      setSegmentToDelete(null)
    } catch (error) {
      console.error('Failed to delete segment:', error)
    }
  }

  const openEditModal = (segment: EmailSegment) => {
    setSegmentToEdit(segment)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (segment: EmailSegment) => {
    setSegmentToDelete(segment)
    setIsDeleteModalOpen(true)
  }

  const handleExportSegments = async () => {
    if (!filteredSegments.length) {
      setNotification({
        type: 'info',
        message: 'No segments available to export. Create some segments first.'
      })
      return
    }

    try {
      // Show loading notification
      setNotification({
        type: 'info',
        message: `Preparing to export ${filteredSegments.length} segments...`
      })

      // Prepare data for export
      const exportData = filteredSegments.map(segment => ({
        'Segment Name': segment.name,
        'Description': segment.description || '',
        'Type': segment.segment_type,
        'Member Count': segment.member_count,
        'Dynamic': segment.is_dynamic ? 'Yes' : 'No',
        'Created Date': new Date(segment.created_at).toLocaleDateString(),
        'Last Updated': new Date(segment.updated_at).toLocaleDateString(),
        'Last Calculated': segment.last_calculated_at 
          ? new Date(segment.last_calculated_at).toLocaleDateString() 
          : 'Never',
        'Criteria': JSON.stringify(segment.criteria)
      }))

      // Convert to CSV
      const headers = Object.keys(exportData[0])
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row]
            // Escape commas and quotes in CSV
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value
          }).join(',')
        )
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      const fileName = `customer-segments-${currentStore?.store_name || 'export'}-${new Date().toISOString().split('T')[0]}.csv`
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Show success notification
      setNotification({
        type: 'success',
        message: `Successfully exported ${filteredSegments.length} segments to ${fileName}`
      })
    } catch (error) {
      console.error('Error exporting segments:', error)
      setNotification({
        type: 'error',
        message: 'Failed to export segments. Please check your browser permissions and try again.'
      })
    }
  }

  const getSegmentTypeColor = (type: EmailSegment['segment_type']) => {
    switch (type) {
      case 'behavioral': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'demographic': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'transactional': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'engagement': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'custom': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getSegmentTypeIcon = (type: EmailSegment['segment_type']) => {
    switch (type) {
      case 'behavioral': return <TrendingUp className="w-4 h-4" />
      case 'demographic': return <Users className="w-4 h-4" />
      case 'transactional': return <DollarSign className="w-4 h-4" />
      case 'engagement': return <Target className="w-4 h-4" />
      case 'custom': return <Zap className="w-4 h-4" />
      default: return <Filter className="w-4 h-4" />
    }
  }

  if (!currentStore) {
    return (
      <div className="text-center py-12">
        <p className="text-[#A0A0A0]">Please select a store to manage customer segments.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Customer Segments</h3>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportSegments}
              className="px-4 py-2 bg-[#00AEEF] text-white hover:bg-[#007AFF] rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Segments</span>
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Segment</span>
            </button>
          </div>
        </div>
        
        {/* Predefined Segments */}
        <div className="mb-8">
          <h4 className="text-white font-semibold mb-4">Pre-built Segments</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedSegments.length > 0 ? (
              predefinedSegments.map((segment) => (
                <div key={segment.id} className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">--</span>
                  </div>
                  <h5 className="text-white font-medium mb-1">{segment.name}</h5>
                  <p className="text-xs text-[#A0A0A0]">{segment.description}</p>
                </div>
              ))
            ) : (
              // Default segments when predefined segments are not available
              <>
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">--</span>
                  </div>
                  <h5 className="text-white font-medium mb-1">All Customers</h5>
                  <p className="text-xs text-[#A0A0A0]">Everyone in your database</p>
                </div>

                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-2xl font-bold text-green-400">--</span>
                  </div>
                  <h5 className="text-white font-medium mb-1">High Spenders</h5>
                  <p className="text-xs text-[#A0A0A0]">$500+ lifetime value</p>
                </div>

                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-2xl font-bold text-purple-400">--</span>
                  </div>
                  <h5 className="text-white font-medium mb-1">VIP Customers</h5>
                  <p className="text-xs text-[#A0A0A0]">Top 10% by value</p>
                </div>

                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-2xl font-bold text-orange-400">--</span>
                  </div>
                  <h5 className="text-white font-medium mb-1">Recent Customers</h5>
                  <p className="text-xs text-[#A0A0A0]">Purchased in last 30 days</p>
                </div>

                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-2xl font-bold text-red-400">--</span>
                  </div>
                  <h5 className="text-white font-medium mb-1">Inactive Customers</h5>
                  <p className="text-xs text-[#A0A0A0]">No purchase in 90+ days</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
            <input
              type="text"
              placeholder="Search segments by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#A0A0A0]" />
            <select
              value={segmentTypeFilter}
              onChange={(e) => setSegmentTypeFilter(e.target.value)}
              className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
            >
              <option value="">All Types</option>
              <option value="behavioral">Behavioral</option>
              <option value="demographic">Demographic</option>
              <option value="transactional">Transactional</option>
              <option value="engagement">Engagement</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Custom Segments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold">Your Segments ({filteredSegments.length})</h4>
          </div>
          
          {segmentsLoading ? (
            <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B51E0] mx-auto mb-4"></div>
              <p className="text-[#A0A0A0]">Loading segments...</p>
            </div>
          ) : filteredSegments.length === 0 ? (
            <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-8 text-center">
              <div className="w-16 h-16 bg-[#9B51E0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-[#9B51E0]" />
              </div>
              <h5 className="text-white font-medium mb-2">
                {searchQuery || segmentTypeFilter ? 'No segments found' : 'Create Your First Custom Segment'}
              </h5>
              <p className="text-[#A0A0A0] text-sm mb-4">
                {searchQuery || segmentTypeFilter 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Build targeted customer groups based on behavior, demographics, or purchase history'}
              </p>
              {!searchQuery && !segmentTypeFilter && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg font-medium transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2A2A2A] border-b border-[#3A3A3A]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Segment</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Members</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Updated</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A3A3A]">
                    {filteredSegments.map((segment) => (
                      <tr key={segment.id} className="hover:bg-[#2A2A2A] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              {getSegmentTypeIcon(segment.segment_type)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{segment.name}</div>
                              {segment.description && (
                                <div className="text-sm text-[#A0A0A0] truncate max-w-xs">{segment.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getSegmentTypeColor(segment.segment_type)}`}>
                            <span className="capitalize">{segment.segment_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white font-medium">
                            {segment.member_count.toLocaleString()}
                          </div>
                          <div className="text-xs text-[#A0A0A0]">
                            {segment.is_dynamic ? 'Dynamic' : 'Static'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#A0A0A0]">
                            {new Date(segment.updated_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => setSelectedSegment(segment)}
                              className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openEditModal(segment)}
                              className="p-1 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                              title="Edit segment"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(segment)}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                              title="Delete segment"
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

        {/* Segment Usage Stats */}
        {filteredSegments.length > 0 && (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-6">
            <h4 className="text-white font-semibold mb-4">Segment Performance Overview</h4>
            
            <div className="space-y-4">
              {filteredSegments.slice(0, 3).map((segment, index) => {
                const colors = ['green', 'blue', 'orange']
                const color = colors[index] || 'gray'
                
                return (
                  <div key={segment.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 bg-${color}-500 rounded-full`}></div>
                      <span className="text-[#E0E0E0]">{segment.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{segment.member_count}</div>
                        <div className="text-xs text-[#A0A0A0]">Members</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{segment.is_dynamic ? 'Auto' : 'Manual'}</div>
                        <div className="text-xs text-[#A0A0A0]">Update type</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white capitalize">{segment.segment_type}</div>
                        <div className="text-xs text-[#A0A0A0]">Category</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Segment Modal */}
      <CreateSegmentModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSegment}
        isLoading={createSegment.isPending}
      />

      {/* Edit Segment Modal */}
      <EditSegmentModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSegmentToEdit(null)
        }}
        onSubmit={handleEditSegment}
        segment={segmentToEdit}
        isLoading={updateSegment.isPending}
      />

      {/* Delete Segment Modal */}
      <DeleteSegmentModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSegmentToDelete(null)
        }}
        onConfirm={handleDeleteSegment}
        segment={segmentToDelete}
        isLoading={deleteSegment.isPending}
      />

      {/* Segment Details Modal */}
      {selectedSegment && (
        <SegmentDetailsModal 
          segment={selectedSegment}
          onClose={() => setSelectedSegment(null)}
        />
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`
            px-4 py-3 rounded-lg shadow-lg max-w-md
            ${notification.type === 'success' ? 'bg-green-600 text-white' : ''}
            ${notification.type === 'error' ? 'bg-red-600 text-white' : ''}
            ${notification.type === 'info' ? 'bg-blue-600 text-white' : ''}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {notification.type === 'success' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {notification.type === 'error' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {notification.type === 'info' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Create Segment Modal Component
interface CreateSegmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEmailSegmentForm) => void
  isLoading: boolean
}

const CreateSegmentModal: React.FC<CreateSegmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading 
}) => {
  const [formData, setFormData] = useState<CreateEmailSegmentForm>({
    name: '',
    segment_type: 'behavioral',
    criteria: {},
    is_dynamic: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        segment_type: 'behavioral',
        criteria: {},
        is_dynamic: true
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
              <Dialog.Title className="text-xl font-semibold text-white">Create Customer Segment</Dialog.Title>
              <Dialog.Description className="text-sm text-[#A0A0A0] mt-1">
                Create targeted customer groups based on behavior, demographics, or purchase history
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
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Segment Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                placeholder="High Value Customers"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] resize-vertical"
                placeholder="Customers who have spent over $500 in the last 6 months"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Segment Type *</label>
              <select
                required
                value={formData.segment_type}
                onChange={(e) => setFormData({ ...formData, segment_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                disabled={isLoading}
              >
                <option value="behavioral">Behavioral - Based on customer actions</option>
                <option value="demographic">Demographic - Based on customer info</option>
                <option value="transactional">Transactional - Based on purchase behavior</option>
                <option value="engagement">Engagement - Based on interaction levels</option>
                <option value="custom">Custom - Advanced criteria</option>
              </select>
            </div>

            <div className="p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
              <h4 className="text-white font-medium mb-3">Segment Criteria</h4>
              <p className="text-sm text-[#A0A0A0] mb-4">
                Configure the conditions that customers must meet to be included in this segment.
              </p>
              
              {formData.segment_type === 'behavioral' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#A0A0A0] mb-1">Total Spent</label>
                      <input
                        type="number"
                        placeholder="500"
                        className="w-full px-2 py-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#9B51E0]"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#A0A0A0] mb-1">Order Count</label>
                      <input
                        type="number"
                        placeholder="3"
                        className="w-full px-2 py-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#9B51E0]"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {formData.segment_type === 'demographic' && (
                <div className="text-sm text-[#A0A0A0]">
                  Demographic criteria will be configured here (location, age, etc.)
                </div>
              )}
              
              {formData.segment_type === 'transactional' && (
                <div className="text-sm text-[#A0A0A0]">
                  Transaction-based criteria will be configured here (purchase frequency, product categories, etc.)
                </div>
              )}
              
              {formData.segment_type === 'engagement' && (
                <div className="text-sm text-[#A0A0A0]">
                  Engagement criteria will be configured here (email opens, website visits, etc.)
                </div>
              )}
              
              {formData.segment_type === 'custom' && (
                <div className="text-sm text-[#A0A0A0]">
                  Advanced custom criteria builder will be available here.
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_dynamic"
                checked={formData.is_dynamic}
                onChange={(e) => setFormData({ ...formData, is_dynamic: e.target.checked })}
                className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                disabled={isLoading}
              />
              <label htmlFor="is_dynamic" className="text-sm text-[#A0A0A0]">
                Dynamic segment (automatically updates when criteria change)
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
                disabled={isLoading || !formData.name}
                className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{isLoading ? 'Creating...' : 'Create Segment'}</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Segment Details Modal Component
interface SegmentDetailsModalProps {
  segment: EmailSegment
  onClose: () => void
}

const SegmentDetailsModal: React.FC<SegmentDetailsModalProps> = ({ segment, onClose }) => {
  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-semibold text-white">Segment Details</Dialog.Title>
              <Dialog.Description className="text-sm text-[#A0A0A0] mt-1">
                View detailed information and criteria for this customer segment
              </Dialog.Description>
            </div>
            <button onClick={onClose} className="text-[#A0A0A0] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Segment Information</h4>
                <div className="space-y-2">
                  <div className="text-white font-medium">{segment.name}</div>
                  {segment.description && (
                    <div className="text-sm text-[#A0A0A0]">{segment.description}</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Type & Properties</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A0]">Type:</span>
                    <span className="text-white capitalize">{segment.segment_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A0]">Update Mode:</span>
                    <span className="text-white">{segment.is_dynamic ? 'Dynamic' : 'Static'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A0]">Members:</span>
                    <span className="text-white font-medium">{segment.member_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A0A0A0]">Created:</span>
                    <span className="text-white">{new Date(segment.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A0A0A0]">Updated:</span>
                    <span className="text-white">{new Date(segment.updated_at).toLocaleDateString()}</span>
                  </div>
                  {segment.last_calculated_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#A0A0A0]">Last Calculated:</span>
                      <span className="text-white">{new Date(segment.last_calculated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Segment Criteria</h4>
                <div className="p-3 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                  <pre className="text-xs text-[#A0A0A0] whitespace-pre-wrap">
                    {JSON.stringify(segment.criteria, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Edit Segment Modal Component
interface EditSegmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateEmailSegmentForm) => void
  segment: EmailSegment | null
  isLoading: boolean
}

const EditSegmentModal: React.FC<EditSegmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  segment,
  isLoading 
}) => {
  const [formData, setFormData] = useState<CreateEmailSegmentForm>({
    name: '',
    segment_type: 'behavioral',
    criteria: {},
    is_dynamic: true
  })

  // Update form data when segment changes
  React.useEffect(() => {
    if (segment) {
      setFormData({
        name: segment.name,
        description: segment.description || undefined,
        segment_type: segment.segment_type,
        criteria: segment.criteria,
        is_dynamic: segment.is_dynamic
      })
    }
  }, [segment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!segment) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-semibold text-white">Edit Customer Segment</Dialog.Title>
              <Dialog.Description className="text-sm text-[#A0A0A0] mt-1">
                Modify segment criteria and properties
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
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Segment Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                placeholder="High Value Customers"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] resize-vertical"
                placeholder="Customers who have spent over $500 in the last 6 months"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Segment Type *</label>
              <select
                required
                value={formData.segment_type}
                onChange={(e) => setFormData({ ...formData, segment_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                disabled={isLoading}
              >
                <option value="behavioral">Behavioral - Based on customer actions</option>
                <option value="demographic">Demographic - Based on customer info</option>
                <option value="transactional">Transactional - Based on purchase behavior</option>
                <option value="engagement">Engagement - Based on interaction levels</option>
                <option value="custom">Custom - Advanced criteria</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_dynamic"
                checked={formData.is_dynamic}
                onChange={(e) => setFormData({ ...formData, is_dynamic: e.target.checked })}
                className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                disabled={isLoading}
              />
              <label htmlFor="edit_is_dynamic" className="text-sm text-[#A0A0A0]">
                Dynamic segment (automatically updates when criteria change)
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
                disabled={isLoading || !formData.name}
                className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Delete Segment Modal Component
interface DeleteSegmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  segment: EmailSegment | null
  isLoading: boolean
}

const DeleteSegmentModal: React.FC<DeleteSegmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  segment,
  isLoading 
}) => {
  if (!segment) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-md z-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-xl font-semibold text-white">Delete Customer Segment</Dialog.Title>
              <Dialog.Description className="text-sm text-[#A0A0A0] mt-1">
                This action cannot be undone and will affect your marketing campaigns
              </Dialog.Description>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-[#A0A0A0] hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-red-400 font-medium">Warning: Impact of Deletion</h4>
                  <ul className="text-sm text-[#E0E0E0] space-y-1">
                    <li>• <span className="font-medium">"{segment.name}"</span> will be permanently deleted</li>
                    <li>• Current member count: <span className="font-medium">{segment.member_count.toLocaleString()}</span> customers</li>
                    <li>• Any email campaigns using this segment will be affected</li>
                    <li>• Historical campaign data will remain but segment targeting will be lost</li>
                    <li>• This action cannot be reversed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
              <div className="text-sm text-[#A0A0A0] mb-2">Segment Details:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A0A0A0]">Type:</span>
                  <span className="text-white capitalize">{segment.segment_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0A0A0]">Members:</span>
                  <span className="text-white">{segment.member_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0A0A0]">Created:</span>
                  <span className="text-white">{new Date(segment.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-[#3A3A3A] mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isLoading ? 'Deleting...' : 'Delete Segment'}</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}