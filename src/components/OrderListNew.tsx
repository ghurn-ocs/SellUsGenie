// Modern Order List with Action Buttons - Following ProductListNew Pattern
import React, { useState } from 'react'
import { Edit3, Trash2, ExternalLink, Play, Pause, ShoppingCart, DollarSign, Clock, CheckCircle } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import type { Order } from '../lib/supabase'

interface OrderListNewProps {
  orders: Order[]
  isLoading: boolean
  onView?: (order: Order) => void
  onEdit: (order: Order) => void
  onDelete: (orderId: string) => void
  onStatusChange: (orderId: string, status: Order['status']) => void
  isDeleting?: boolean
  isUpdating?: boolean
}

export const OrderListNew: React.FC<OrderListNewProps> = ({
  orders,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  isDeleting = false,
  isUpdating = false
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (orderId: string) => {
    onDelete(orderId)
    setDeleteConfirm(null)
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'to_be_paid':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-[#3A3A3A] text-[#A0A0A0] border-[#3A3A3A]'
    }
  }

  const canPause = (status: Order['status']) => {
    return ['paid', 'pending', 'processing'].includes(status)
  }

  const canResume = (status: Order['status']) => {
    return status === 'cancelled'
  }

  const handleToggleStatus = (order: Order) => {
    if (canPause(order.status)) {
      onStatusChange(order.id, 'cancelled')
    } else if (canResume(order.status)) {
      onStatusChange(order.id, 'pending')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-[#3A3A3A] rounded w-3/4"></div>
                <div className="h-3 bg-[#3A3A3A] rounded w-1/2"></div>
                <div className="h-3 bg-[#3A3A3A] rounded w-2/3"></div>
              </div>
              <div className="w-32 h-8 bg-[#3A3A3A] rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-[#3A3A3A] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-12 h-12 text-[#A0A0A0]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">No orders yet</h3>
        <p className="text-[#A0A0A0] mb-6 max-w-md mx-auto">
          Orders will appear here once customers start shopping. Create test orders to get started.
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-[#666]">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Track orders</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Manage payments</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Update status</span>
          </div>
        </div>
      </div>
    )
  }

  // Calculate order statistics
  const getOrderStats = (orders: Order[]) => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusCounts,
      pendingOrders: statusCounts['pending'] || 0,
      paidOrders: statusCounts['paid'] || 0,
      processingOrders: statusCounts['processing'] || 0,
      shippedOrders: statusCounts['shipped'] || 0,
      deliveredOrders: statusCounts['delivered'] || 0,
      cancelledOrders: statusCounts['cancelled'] || 0,
      toBePaidOrders: statusCounts['to_be_paid'] || 0
    }
  }

  const stats = getOrderStats(orders)
  const { totalOrders, totalRevenue, averageOrderValue, pendingOrders, paidOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders, toBePaidOrders } = stats

  return (
    <div className="space-y-6">
      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
              <p className="text-sm text-[#A0A0A0]">Total Orders</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-[#A0A0A0]">Total Revenue</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">${averageOrderValue.toFixed(2)}</p>
              <p className="text-sm text-[#A0A0A0]">Average Order Value</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingOrders + processingOrders}</p>
              <p className="text-sm text-[#A0A0A0]">Orders In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Order Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {toBePaidOrders > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">{toBePaidOrders}</div>
              <div className="text-xs text-[#A0A0A0]">To Be Paid</div>
            </div>
          )}
          {paidOrders > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{paidOrders}</div>
              <div className="text-xs text-[#A0A0A0]">Paid</div>
            </div>
          )}
          {pendingOrders > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-400">{pendingOrders}</div>
              <div className="text-xs text-[#A0A0A0]">Pending</div>
            </div>
          )}
          {processingOrders > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{processingOrders}</div>
              <div className="text-xs text-[#A0A0A0]">Processing</div>
            </div>
          )}
          {shippedOrders > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{shippedOrders}</div>
              <div className="text-xs text-[#A0A0A0]">Shipped</div>
            </div>
          )}
          {deliveredOrders > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-400">{deliveredOrders}</div>
              <div className="text-xs text-[#A0A0A0]">Delivered</div>
            </div>
          )}
          {cancelledOrders > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{cancelledOrders}</div>
              <div className="text-xs text-[#A0A0A0]">Cancelled</div>
            </div>
          )}
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {orders.map((order) => (
        <div
          key={order.id}
          className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg p-6 hover:border-[#4A4A4A] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <h3 className="text-lg font-semibold text-white">
                  Order #{order.order_number}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                <div>
                  <span className="text-[#A0A0A0] text-xs">Customer:</span>
                  <div className="text-white text-sm truncate">
                    {order.customers 
                      ? `${order.customers.first_name} ${order.customers.last_name}`
                      : 'Unknown Customer'
                    }
                  </div>
                </div>
                
                <div>
                  <span className="text-[#A0A0A0] text-xs">Total:</span>
                  <div className="text-lg font-semibold text-[#9B51E0]">
                    ${(order.total || 0).toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <span className="text-[#A0A0A0] text-xs">Date:</span>
                  <div className="text-white">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <span className="text-[#A0A0A0] text-xs">Breakdown:</span>
                  <div className="text-[#A0A0A0] text-xs">
                    ${order.subtotal.toFixed(2)} + ${order.tax.toFixed(2)} + ${order.shipping.toFixed(2)}
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="mb-3">
                  <span className="text-[#A0A0A0] text-xs">Notes:</span>
                  <div className="text-[#A0A0A0] text-sm truncate">
                    {order.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* View Button */}
              {onView && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('👁️ View clicked for order:', order.order_number, order.id)
                    onView(order)
                  }}
                  className="p-2 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg transition-colors"
                  title="View order details"
                  aria-label={`View order ${order.order_number} details`}
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}

              {/* Toggle Status (Pause/Resume) */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🔄 Toggle status clicked for order:', order.order_number, order.id)
                  handleToggleStatus(order)
                }}
                disabled={isUpdating}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                  canPause(order.status)
                    ? 'text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300'
                    : canResume(order.status)
                    ? 'text-green-400 hover:bg-green-500/20 hover:text-green-300'
                    : 'text-gray-400 opacity-50 cursor-not-allowed'
                }`}
                title={
                  canPause(order.status) 
                    ? 'Cancel order' 
                    : canResume(order.status)
                    ? 'Restore order'
                    : 'Status cannot be toggled'
                }
              >
                {canPause(order.status) ? (
                  <Pause className="w-4 h-4" />
                ) : canResume(order.status) ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </button>

              {/* Edit Button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('✏️ Edit clicked for order:', order.order_number, order.id)
                  onEdit(order)
                }}
                disabled={order.status === 'paid' || order.status === 'delivered'}
                className="p-2 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:text-[#666] disabled:hover:bg-transparent"
                title={order.status === 'paid' || order.status === 'delivered' ? "Cannot edit paid/delivered orders" : "Edit order"}
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🗑️ Delete clicked for order:', order.order_number, order.id)
                  setDeleteConfirm(order.id)
                }}
                disabled={isDeleting}
                className="p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors disabled:opacity-50"
                title="Delete order"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold text-white mb-4">
              Delete Order
            </Dialog.Title>
            <p className="text-[#A0A0A0] mb-6">
              Are you sure you want to delete this order? This action cannot be undone and will
              remove the order and all associated data permanently.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-[#A0A0A0] hover:text-white border border-[#3A3A3A] hover:border-[#4A4A4A] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}