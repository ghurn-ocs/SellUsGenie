import React, { useState } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { useIncompleteOrders, useCartAbandonmentAnalytics, useCreateIncompleteOrder } from '../../hooks/useNurture'
import { IncompleteOrder, IncompleteOrderFilters } from '../../types/nurture'
import { ShoppingCart, Mail, Clock, DollarSign, TrendingUp, Search, Filter, Eye, Send, AlertCircle, CheckCircle, X, Plus, Play, Settings } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

export const IncompleteOrdersTab: React.FC = () => {
  const { currentStore } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<IncompleteOrderFilters>({})
  const [selectedOrder, setSelectedOrder] = useState<IncompleteOrder | null>(null)
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false)
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  
  // Data hooks
  const { data: incompleteOrders = [], isLoading } = useIncompleteOrders(currentStore?.id || '', filters)
  const { data: analytics } = useCartAbandonmentAnalytics(currentStore?.id || '')
  
  // Filter orders based on search query
  const filteredOrders = incompleteOrders.filter(order => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      order.customer_email.toLowerCase().includes(searchLower) ||
      order.cart_items.some(item => item.name?.toLowerCase().includes(searchLower))
    )
  })

  const getTimeAgo = (abandonedAt: string) => {
    const now = new Date()
    const abandoned = new Date(abandonedAt)
    const diffHours = Math.floor((now.getTime() - abandoned.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Less than 1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const getUrgencyColor = (hoursAgo: number) => {
    if (hoursAgo < 2) return 'text-red-400'
    if (hoursAgo < 24) return 'text-orange-400'
    if (hoursAgo < 72) return 'text-yellow-400'
    return 'text-green-400'
  }

  const handleSendRecoveryEmail = async (orderId: string) => {
    try {
      // TODO: Implement actual email sending via API
      console.log('Sending recovery email for order:', orderId)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Show success message or update UI
    } catch (error) {
      console.error('Failed to send recovery email:', error)
    }
  }

  const handleBulkRecoveryEmail = async (orderIds: string[], templateType: string) => {
    try {
      console.log('Sending bulk recovery emails:', { orderIds, templateType })
      // TODO: Implement bulk email sending API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsBulkEmailModalOpen(false)
      setSelectedOrderIds([])
      // Show success message
    } catch (error) {
      console.error('Failed to send bulk recovery emails:', error)
    }
  }

  const handleSelectOrder = (orderId: string, selected: boolean) => {
    if (selected) {
      setSelectedOrderIds([...selectedOrderIds, orderId])
    } else {
      setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const pendingOrderIds = filteredOrders.filter(order => !order.recovered).map(order => order.id)
      setSelectedOrderIds(pendingOrderIds)
    } else {
      setSelectedOrderIds([])
    }
  }

  if (!currentStore) {
    return (
      <div className="text-center py-12">
        <p className="text-[#A0A0A0]">Please select a store to manage cart abandonment recovery.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Abandoned Cart Recovery</h3>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsAutomationModalOpen(true)}
              className="px-4 py-2 bg-[#00AEEF] text-white hover:bg-[#007AFF] rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Configure Automation</span>
            </button>
            <button 
              onClick={() => setIsBulkEmailModalOpen(true)}
              disabled={filteredOrders.filter(order => !order.recovered).length === 0}
              className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              <span>Bulk Recovery Email</span>
            </button>
          </div>
        </div>
        
        {/* Abandoned Cart Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Abandoned Carts</p>
                <p className="text-2xl font-bold text-orange-400">{analytics?.total_abandoned || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-400 font-medium">Active carts</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Total Value</p>
                <p className="text-2xl font-bold text-red-400">${Math.round(analytics?.total_value || 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-400 font-medium">Recoverable revenue</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Recovery Rate</p>
                <p className="text-2xl font-bold text-green-400">{Math.round(analytics?.recovery_rate || 0)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-400 font-medium">Historical average</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#A0A0A0]">Recovered Value</p>
                <p className="text-2xl font-bold text-[#9B51E0]">${Math.round(analytics?.recovered_value || 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-400 font-medium">{analytics?.recovered_carts || 0} carts recovered</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer email or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#9B51E0] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#A0A0A0]" />
            <select
              value={filters.recovered === undefined ? '' : filters.recovered ? 'recovered' : 'pending'}
              onChange={(e) => setFilters({ 
                ...filters, 
                recovered: e.target.value === '' ? undefined : e.target.value === 'recovered' 
              })}
              className="bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
            >
              <option value="">All Carts</option>
              <option value="pending">Pending Recovery</option>
              <option value="recovered">Recovered</option>
            </select>
          </div>
        </div>

        {/* Abandoned Carts Table */}
        {isLoading ? (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B51E0] mx-auto mb-4"></div>
            <p className="text-[#A0A0A0]">Loading abandoned carts...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-8 text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No abandoned carts found</h3>
            <p className="text-[#A0A0A0]">
              {searchQuery || filters.recovered !== undefined 
                ? 'Try adjusting your filters or search terms.' 
                : 'Great news! You don\'t have any abandoned carts right now.'}
            </p>
          </div>
        ) : (
          <div className="bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#3A3A3A]">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Abandoned Carts ({filteredOrders.length})</h4>
                <div className="text-sm text-[#A0A0A0]">
                  Total Value: ${filteredOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2A2A2A]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.filter(order => !order.recovered).length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Abandoned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A3A3A]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#2A2A2A] transition-colors">
                      <td className="px-6 py-4">
                        {!order.recovered && (
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                            className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">{order.customer_email}</div>
                          <div className="text-sm text-[#A0A0A0]">
                            {order.customer_name || 'Guest customer'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#E0E0E0]">{order.cart_items.length} item{order.cart_items.length > 1 ? 's' : ''}</div>
                        <div className="text-xs text-[#A0A0A0] max-w-xs truncate">
                          {order.cart_items.map(item => item.name || 'Unnamed item').join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#A0A0A0]">
                          {getTimeAgo(order.abandoned_at)}
                        </div>
                        <div className={`text-xs font-medium ${getUrgencyColor(order.hours_since_abandoned || 0)}`}>
                          {order.hours_since_abandoned && order.hours_since_abandoned < 2 
                            ? 'High urgency'
                            : order.hours_since_abandoned && order.hours_since_abandoned < 24
                            ? 'Medium urgency'
                            : 'Low urgency'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.recovered ? (
                          <div className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            <span>Recovered</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                            title="View cart details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!order.recovered && (
                            <button 
                              onClick={() => handleSendRecoveryEmail(order.id)}
                              className="p-1 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                              title="Send recovery email"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recovery Templates */}
        <div className="mt-8 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold">Recovery Email Templates</h4>
            <button className="text-sm text-[#9B51E0] hover:text-[#A051E0] font-medium">
              Customize Templates
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors cursor-pointer">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <h5 className="text-white font-medium">Gentle Reminder</h5>
              </div>
              <p className="text-xs text-[#A0A0A0] mb-3">Friendly reminder about items left behind</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-400">24.3% open rate</span>
                <span className="text-[#666]">Send after 1 hour</span>
              </div>
            </div>
            
            <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors cursor-pointer">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                </div>
                <h5 className="text-white font-medium">Urgent Recovery</h5>
              </div>
              <p className="text-xs text-[#A0A0A0] mb-3">Time-sensitive offer with discount</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400">31.7% open rate</span>
                <span className="text-[#666]">Send after 24 hours</span>
              </div>
            </div>
            
            <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#3A3A3A] hover:border-[#9B51E0] transition-colors cursor-pointer">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-purple-400" />
                </div>
                <h5 className="text-white font-medium">Special Offer</h5>
              </div>
              <p className="text-xs text-[#A0A0A0] mb-3">Incentivize completion with bonus</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-400">28.9% open rate</span>
                <span className="text-[#666]">Send after 3 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Setup Modal */}
      <AutomationSetupModal 
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
      />

      {/* Bulk Email Modal */}
      <BulkEmailModal 
        isOpen={isBulkEmailModalOpen}
        onClose={() => setIsBulkEmailModalOpen(false)}
        onSubmit={handleBulkRecoveryEmail}
        selectedOrders={filteredOrders.filter(order => selectedOrderIds.includes(order.id))}
        totalUnrecovered={filteredOrders.filter(order => !order.recovered).length}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSendRecovery={handleSendRecoveryEmail}
        />
      )}
    </div>
  )
}

// Automation Setup Modal Component
interface AutomationSetupModalProps {
  isOpen: boolean
  onClose: () => void
}

const AutomationSetupModal: React.FC<AutomationSetupModalProps> = ({ isOpen, onClose }) => {
  const [automationSettings, setAutomationSettings] = useState({
    enabled: true,
    firstEmailDelay: 1, // hours
    secondEmailDelay: 24, // hours
    thirdEmailDelay: 72, // hours
    discountPercentage: 10,
    enableDiscount: true
  })

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">Cart Recovery Automation</Dialog.Title>
            <button onClick={onClose} className="text-[#A0A0A0] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
              <div>
                <h3 className="text-white font-medium">Enable Automated Recovery</h3>
                <p className="text-sm text-[#A0A0A0]">Automatically send recovery emails to customers who abandon their carts</p>
              </div>
              <input
                type="checkbox"
                checked={automationSettings.enabled}
                onChange={(e) => setAutomationSettings({ ...automationSettings, enabled: e.target.checked })}
                className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-medium">Email Sequence Timing</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">First Email</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={automationSettings.firstEmailDelay}
                      onChange={(e) => setAutomationSettings({ 
                        ...automationSettings, 
                        firstEmailDelay: parseInt(e.target.value) || 1 
                      })}
                      className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                      min="1"
                    />
                    <span className="text-sm text-[#A0A0A0]">hours</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Second Email</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={automationSettings.secondEmailDelay}
                      onChange={(e) => setAutomationSettings({ 
                        ...automationSettings, 
                        secondEmailDelay: parseInt(e.target.value) || 24 
                      })}
                      className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                      min="1"
                    />
                    <span className="text-sm text-[#A0A0A0]">hours</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Final Email</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={automationSettings.thirdEmailDelay}
                      onChange={(e) => setAutomationSettings({ 
                        ...automationSettings, 
                        thirdEmailDelay: parseInt(e.target.value) || 72 
                      })}
                      className="w-full px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                      min="1"
                    />
                    <span className="text-sm text-[#A0A0A0]">hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">Discount Incentive</h4>
                  <p className="text-sm text-[#A0A0A0]">Offer a discount to encourage completion</p>
                </div>
                <input
                  type="checkbox"
                  checked={automationSettings.enableDiscount}
                  onChange={(e) => setAutomationSettings({ ...automationSettings, enableDiscount: e.target.checked })}
                  className="rounded border-[#3A3A3A] text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                />
              </div>
              
              {automationSettings.enableDiscount && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={automationSettings.discountPercentage}
                    onChange={(e) => setAutomationSettings({ 
                      ...automationSettings, 
                      discountPercentage: parseInt(e.target.value) || 10 
                    })}
                    className="w-20 px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
                    min="5"
                    max="50"
                  />
                  <span className="text-[#A0A0A0]">% discount applied in final email</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-[#3A3A3A] mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // TODO: Save automation settings
                console.log('Saving automation settings:', automationSettings)
                onClose()
              }}
              className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg transition-colors flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Order Details Modal Component
interface OrderDetailsModalProps {
  order: IncompleteOrder
  onClose: () => void
  onSendRecovery: (orderId: string) => void
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onSendRecovery }) => {
  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">Abandoned Cart Details</Dialog.Title>
            <button onClick={onClose} className="text-[#A0A0A0] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Customer Information</h4>
                <div className="space-y-2">
                  <div className="text-white font-medium">{order.customer_email}</div>
                  {order.customer_name && (
                    <div className="text-sm text-[#A0A0A0]">{order.customer_name}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Cart Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Items:</span>
                    <span className="text-white">{order.cart_items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Total:</span>
                    <span className="text-white font-medium">${order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Status:</span>
                    {order.recovered ? (
                      <span className="text-green-400">Recovered</span>
                    ) : (
                      <span className="text-orange-400">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#A0A0A0] mb-3">Cart Items</h4>
              <div className="space-y-2">
                {order.cart_items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                    <div>
                      <div className="text-white font-medium">{item.name || 'Unnamed Item'}</div>
                      <div className="text-sm text-[#A0A0A0]">Quantity: {item.quantity}</div>
                    </div>
                    <div className="text-white font-medium">${((item.price || 0) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#A0A0A0] mb-2">Timeline</h4>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-[#A0A0A0]" />
                <span className="text-white">Abandoned: {new Date(order.abandoned_at).toLocaleString()}</span>
              </div>
              {order.recovered_at && (
                <div className="flex items-center space-x-2 text-sm mt-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white">Recovered: {new Date(order.recovered_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {!order.recovered && (
            <div className="flex justify-end space-x-3 pt-6 border-t border-[#3A3A3A] mt-6">
              <button
                onClick={() => {
                  onSendRecovery(order.id)
                  onClose()
                }}
                className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Recovery Email</span>
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Bulk Email Modal Component
interface BulkEmailModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (orderIds: string[], templateType: string) => void
  selectedOrders: IncompleteOrder[]
  totalUnrecovered: number
}

const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  selectedOrders,
  totalUnrecovered 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('gentle_reminder')
  const [sendToAll, setSendToAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const orderIds = sendToAll 
        ? [] // Empty array signals "send to all unrecovered"
        : selectedOrders.map(order => order.id)
      
      await onSubmit(orderIds, selectedTemplate)
    } catch (error) {
      console.error('Failed to send bulk emails:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const recipientCount = sendToAll ? totalUnrecovered : selectedOrders.length
  const totalValue = sendToAll 
    ? 0 // Would need to calculate from all unrecovered orders
    : selectedOrders.reduce((sum, order) => sum + order.total_amount, 0)

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">Send Bulk Recovery Emails</Dialog.Title>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-[#A0A0A0] hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Selection */}
            <div className="p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
              <h4 className="text-white font-medium mb-3">Recipients</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="selected_orders"
                    name="recipient_type"
                    checked={!sendToAll}
                    onChange={() => setSendToAll(false)}
                    className="text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                    disabled={isLoading}
                  />
                  <label htmlFor="selected_orders" className="text-sm text-[#A0A0A0]">
                    Send to selected carts ({selectedOrders.length} orders, ${totalValue.toFixed(2)} total value)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="all_unrecovered"
                    name="recipient_type"
                    checked={sendToAll}
                    onChange={() => setSendToAll(true)}
                    className="text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                    disabled={isLoading}
                  />
                  <label htmlFor="all_unrecovered" className="text-sm text-[#A0A0A0]">
                    Send to all unrecovered carts ({totalUnrecovered} orders)
                  </label>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-[#A0A0A0] mb-3">Email Template</label>
              <div className="space-y-3">
                <div 
                  onClick={() => setSelectedTemplate('gentle_reminder')}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplate === 'gentle_reminder'
                      ? 'border-[#9B51E0] bg-[#9B51E0]/10'
                      : 'border-[#3A3A3A] bg-[#1E1E1E] hover:border-[#4A4A4A]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedTemplate === 'gentle_reminder'}
                      onChange={() => setSelectedTemplate('gentle_reminder')}
                      className="text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                      disabled={isLoading}
                    />
                    <div>
                      <h5 className="text-white font-medium">Gentle Reminder</h5>
                      <p className="text-xs text-[#A0A0A0]">Friendly reminder about items left behind • 24.3% avg open rate</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  onClick={() => setSelectedTemplate('urgent_offer')}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplate === 'urgent_offer'
                      ? 'border-[#9B51E0] bg-[#9B51E0]/10'
                      : 'border-[#3A3A3A] bg-[#1E1E1E] hover:border-[#4A4A4A]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedTemplate === 'urgent_offer'}
                      onChange={() => setSelectedTemplate('urgent_offer')}
                      className="text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                      disabled={isLoading}
                    />
                    <div>
                      <h5 className="text-white font-medium">Urgent Recovery</h5>
                      <p className="text-xs text-[#A0A0A0]">Time-sensitive offer with discount • 31.7% avg open rate</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  onClick={() => setSelectedTemplate('special_offer')}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTemplate === 'special_offer'
                      ? 'border-[#9B51E0] bg-[#9B51E0]/10'
                      : 'border-[#3A3A3A] bg-[#1E1E1E] hover:border-[#4A4A4A]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedTemplate === 'special_offer'}
                      onChange={() => setSelectedTemplate('special_offer')}
                      className="text-[#9B51E0] focus:ring-[#9B51E0] focus:ring-offset-0"
                      disabled={isLoading}
                    />
                    <div>
                      <h5 className="text-white font-medium">Special Offer</h5>
                      <p className="text-xs text-[#A0A0A0]">Incentivize completion with bonus • 28.9% avg open rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
              <h4 className="text-white font-medium mb-2">Email Summary</h4>
              <div className="text-sm text-[#A0A0A0] space-y-1">
                <div>Recipients: <span className="text-white">{recipientCount} customers</span></div>
                <div>Template: <span className="text-white capitalize">{selectedTemplate.replace('_', ' ')}</span></div>
                {!sendToAll && (
                  <div>Total cart value: <span className="text-white">${totalValue.toFixed(2)}</span></div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#3A3A3A]">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || (!sendToAll && selectedOrders.length === 0)}
                className="px-4 py-2 bg-[#9B51E0] text-white hover:bg-[#8A47D0] rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <Mail className="w-4 h-4" />
                <span>
                  {isLoading 
                    ? 'Sending...' 
                    : `Send ${recipientCount} Email${recipientCount > 1 ? 's' : ''}`}
                </span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}