import React from 'react'
import type { Order } from '../lib/supabase'

interface OrderListProps {
  orders: Order[]
  isLoading: boolean
  onUpdateStatus: (orderId: string, status: Order['status']) => void
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  isLoading,
  onUpdateStatus
}) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'processing':
        return 'bg-blue-500/20 text-blue-400'
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400'
      case 'delivered':
        return 'bg-green-500/20 text-green-400'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-[#3A3A3A] text-[#A0A0A0]'
    }
  }

  const getStatusOptions = (currentStatus: Order['status']) => {
    const allStatuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    return allStatuses.filter(status => status !== currentStatus)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-[#3A3A3A] rounded w-32"></div>
                <div className="h-3 bg-[#3A3A3A] rounded w-48"></div>
              </div>
              <div className="w-24 h-8 bg-[#3A3A3A] rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
        <p className="text-[#A0A0A0]">Orders will appear here once customers start shopping.</p>
      </div>
    )
  }

  // Calculate statistics
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<Order['status'], number>)

  return (
    <div className="space-y-6">
      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A0A0A0]">Total Orders</p>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
            </div>
            <div className="w-10 h-10 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A0A0A0]">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A0A0A0]">Pending</p>
              <p className="text-2xl font-bold text-white">{statusCounts.pending || 0}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A0A0A0]">Completed</p>
              <p className="text-2xl font-bold text-white">{(statusCounts.delivered || 0) + (statusCounts.shipped || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders List */}
      <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h3 className="text-lg font-medium text-white">
                  Order #{order.order_number}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-[#A0A0A0]">
                <div>
                  <span className="font-medium">Customer ID:</span>
                  <div>{order.customer_id}</div>
                </div>
                
                <div>
                  <span className="font-medium">Total:</span>
                  <div className="text-lg font-semibold text-white">
                    ${order.total.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Date:</span>
                  <div>{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                
                <div>
                  <span className="font-medium">Items:</span>
                  <div>Subtotal: ${order.subtotal.toFixed(2)}</div>
                  <div>Tax: ${order.tax.toFixed(2)}</div>
                  <div>Shipping: ${order.shipping.toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            <div className="ml-4">
              <select
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                className="px-3 py-1 border border-[#3A3A3A] bg-[#1E1E1E] text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#9B51E0]"
              >
                <option value={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </option>
                {getStatusOptions(order.status).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}

export default OrderList
