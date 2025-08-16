import React from 'react'

interface AnalyticsDashboardProps {
  orderStats: {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    completedOrders: number
  }
  customerStats: {
    totalCustomers: number
    customersWithOrders: number
    totalRevenue: number
  }
  productStats: {
    totalProducts: number
    activeProducts: number
  }
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  orderStats,
  customerStats,
  productStats
}) => {
  const getRevenueGrowth = () => {
    // TODO: Calculate real growth from historical data
    // For now, return null to indicate no historical data available
    return null;
  }

  const getOrderGrowth = () => {
    // TODO: Calculate real growth from historical data
    // For now, return null to indicate no historical data available
    return null;
  }

  const getCustomerGrowth = () => {
    // TODO: Calculate real growth from historical data
    // For now, return null to indicate no historical data available
    return null;
  }

  const getConversionRate = () => {
    if (customerStats.totalCustomers === 0) return 0
    return ((customerStats.customersWithOrders / customerStats.totalCustomers) * 100).toFixed(1)
  }

  const getAverageOrderValue = () => {
    if (orderStats.totalOrders === 0) return 0
    return (orderStats.totalRevenue / orderStats.totalOrders).toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#A0A0A0]">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${orderStats.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-[#A0A0A0]">
                {getRevenueGrowth() !== null ? `+${getRevenueGrowth()}% from last month` : 'No historical data'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#A0A0A0]">Total Orders</p>
              <p className="text-2xl font-bold text-white">{orderStats.totalOrders}</p>
              <p className="text-sm text-[#A0A0A0]">
                {getOrderGrowth() !== null ? `+${getOrderGrowth()}% from last month` : 'No historical data'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#A0A0A0]">Total Customers</p>
              <p className="text-2xl font-bold text-white">{customerStats.totalCustomers}</p>
              <p className="text-sm text-[#A0A0A0]">
                {getCustomerGrowth() !== null ? `+${getCustomerGrowth()}% from last month` : 'No historical data'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#A0A0A0]">Active Products</p>
              <p className="text-2xl font-bold text-white">{productStats.activeProducts}</p>
              <p className="text-sm text-orange-400">of {productStats.totalProducts} total</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A0A0A0]">Pending</span>
              <span className="text-sm font-medium text-white">{orderStats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A0A0A0]">Completed</span>
              <span className="text-sm font-medium text-white">{orderStats.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A0A0A0]">Processing</span>
              <span className="text-sm font-medium text-white">
                {orderStats.totalOrders - orderStats.pendingOrders - orderStats.completedOrders}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Customer Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A0A0A0]">Conversion Rate</span>
              <span className="text-sm font-medium text-white">{getConversionRate()}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A0A0A0]">Avg Order Value</span>
              <span className="text-sm font-medium text-white">${getAverageOrderValue()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A0A0A0]">Customers with Orders</span>
              <span className="text-sm font-medium text-white">{customerStats.customersWithOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Product Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A0A0A0]">Active Products</span>
              <span className="text-sm font-medium text-white">{productStats.activeProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A0A0A0]">Inactive Products</span>
              <span className="text-sm font-medium text-white">
                {productStats.totalProducts - productStats.activeProducts}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A0A0A0]">Activation Rate</span>
              <span className="text-sm font-medium text-white">
                {productStats.totalProducts > 0 
                  ? ((productStats.activeProducts / productStats.totalProducts) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="flex items-center space-x-3 p-3 border border-[#3A3A3A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
            aria-label="Add new product"
          >
            <div className="w-8 h-8 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Add Product</p>
              <p className="text-xs text-[#A0A0A0]">Create new product</p>
            </div>
          </button>

          <button 
            className="flex items-center space-x-3 p-3 border border-[#3A3A3A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
            aria-label="View detailed analytics reports"
          >
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">View Reports</p>
              <p className="text-xs text-[#A0A0A0]">Detailed analytics</p>
            </div>
          </button>

          <button 
            className="flex items-center space-x-3 p-3 border border-[#3A3A3A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
            aria-label="Export analytics data"
          >
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Export Data</p>
              <p className="text-xs text-[#A0A0A0]">Download reports</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
