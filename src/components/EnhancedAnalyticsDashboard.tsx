import React, { useState } from 'react'
import { useRealAnalytics } from '../hooks/useRealAnalytics'
import { useSubscription } from '../hooks/useSubscription'
import { useStore } from '../contexts/StoreContext'

interface BusinessAnalyticsProps {
  storeId: string
}

const EnhancedAnalyticsDashboard: React.FC<BusinessAnalyticsProps> = ({ storeId }) => {
  const [activeTab, setActiveTab] = useState('business')
  
  // Get real analytics data
  const analytics = useRealAnalytics(storeId)
  const { orderStats, customerStats, productStats, websiteStats } = analytics
  
  // Get subscription data
  const { subscription, subscriptionLimits, isTrialUser } = useSubscription()
  const { stores } = useStore()

  // Business-Level Calculations - using real data from analytics hook

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
        <div className="flex items-center space-x-2">
          <button 
            className="px-3 py-1 text-sm bg-[#3A3A3A] text-[#A0A0A0] rounded-lg hover:bg-[#4A4A4A] transition-colors"
            aria-label="Export analytics data"
          >
            Export Data
          </button>
          <button 
            className="px-3 py-1 text-sm bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
            aria-label="Schedule analytics report"
          >
            Schedule Report
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex space-x-1 bg-[#2A2A2A] p-1 rounded-lg border border-[#3A3A3A] shadow-sm">
          <button
            onClick={() => setActiveTab('business')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'business'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Business Metrics
          </button>
          <button
            onClick={() => setActiveTab('website')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'website'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Website Performance
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Customer Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Product Analytics
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'subscription'
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            Subscription Usage
          </button>
        </div>
      </div>

        {activeTab === 'business' && (
        <div className="space-y-6 mt-6">
          {/* Sales and Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Paid Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(orderStats.totalRevenue)}</p>
                  <p className="text-sm text-green-400">From completed orders</p>
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
                  <p className="text-sm font-medium text-[#A0A0A0]">Pending Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(orderStats.unpaidRevenue)}</p>
                  <p className="text-sm text-yellow-400">Awaiting payment</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Average Order Value</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(orderStats.averageOrderValue)}</p>
                  <p className="text-sm text-[#A0A0A0]">Per order average</p>
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
                  <p className="text-sm font-medium text-[#A0A0A0]">Gross Profit</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(orderStats.grossProfit)}</p>
                  <p className="text-sm text-[#A0A0A0]">Margin: {formatPercentage(orderStats.profitMargin)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Cost of Goods Sold</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(orderStats.cogs)}</p>
                  <p className="text-sm text-[#A0A0A0]">{formatPercentage(orderStats.cogs / orderStats.totalRevenue * 100)} of revenue</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Paid Revenue</span>
                  <span className="text-green-400 font-medium">{formatCurrency(orderStats.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Pending Revenue</span>
                  <span className="text-yellow-400 font-medium">{formatCurrency(orderStats.unpaidRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Total Potential Revenue</span>
                  <span className="text-white font-medium">{formatCurrency(orderStats.totalRevenue + orderStats.unpaidRevenue)}</span>
                </div>
                <div className="border-t border-[#3A3A3A] pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A0A0A0]">Cost of Goods Sold</span>
                    <span className="text-red-400 font-medium">-{formatCurrency(orderStats.cogs)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Net Profit (Paid Orders)</span>
                  <span className="text-green-400 font-bold">{formatCurrency(orderStats.grossProfit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Profit Margin</span>
                  <span className="text-green-400 font-medium">{formatPercentage(orderStats.profitMargin)}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Status Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-[#1E1E1E] rounded-lg">
                  <p className="text-2xl font-bold text-white">{orderStats.totalOrders}</p>
                  <p className="text-sm text-[#A0A0A0]">Total Orders</p>
                </div>
                <div className="text-center p-3 bg-[#1E1E1E] rounded-lg">
                  <p className="text-2xl font-bold text-green-400">{orderStats.paidOrders + orderStats.completedOrders + orderStats.processingOrders + orderStats.shippedOrders}</p>
                  <p className="text-sm text-[#A0A0A0]">Paid Orders</p>
                </div>
                <div className="text-center p-3 bg-[#1E1E1E] rounded-lg">
                  <p className="text-2xl font-bold text-yellow-400">{orderStats.toBePaidOrders}</p>
                  <p className="text-sm text-[#A0A0A0]">Awaiting Payment</p>
                </div>
                <div className="text-center p-3 bg-[#1E1E1E] rounded-lg">
                  <p className="text-2xl font-bold text-white">{formatCurrency(orderStats.averageOrderValue)}</p>
                  <p className="text-sm text-[#A0A0A0]">Avg Order Value</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Year Analytics */}
          {orderStats.financialYear && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-3">
                <svg className="w-6 h-6 text-[#9B51E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Financial Year Analytics</span>
              </h2>

              {!orderStats.financialYear.isConfigured ? (
                <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-[#A0A0A0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-white mb-2">Configure Financial Year</h3>
                    <p className="text-[#A0A0A0] mb-4">Set your financial year period in Settings to see detailed financial year analytics.</p>
                    <p className="text-sm text-[#666]">{orderStats.financialYear.message}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Financial Year Overview */}
                  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{orderStats.financialYear.label}</h3>
                        <p className="text-[#A0A0A0] text-sm">{orderStats.financialYear.formattedPeriod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#A0A0A0]">Progress</p>
                        <p className="text-2xl font-bold text-[#9B51E0]">{orderStats.financialYear.progress}%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-[#A0A0A0] mb-2">
                        <span>Financial Year Progress</span>
                        <span>{orderStats.financialYear.progress}% complete</span>
                      </div>
                      <div className="w-full h-2 bg-[#1E1E1E] rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-[#9B51E0] to-[#A051E0] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(orderStats.financialYear.progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Financial Year Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-[#1E1E1E] rounded-lg">
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(orderStats.financialYear.paidRevenue)}</p>
                        <p className="text-sm text-[#A0A0A0]">Paid Revenue (FY)</p>
                        <p className="text-xs text-[#666] mt-1">Actual earned revenue</p>
                      </div>
                      <div className="text-center p-4 bg-[#1E1E1E] rounded-lg">
                        <p className="text-2xl font-bold text-yellow-400">{formatCurrency(orderStats.financialYear.unpaidRevenue)}</p>
                        <p className="text-sm text-[#A0A0A0]">Pending Revenue (FY)</p>
                        <p className="text-xs text-[#666] mt-1">Awaiting payment</p>
                      </div>
                      <div className="text-center p-4 bg-[#1E1E1E] rounded-lg">
                        <p className="text-2xl font-bold text-white">{formatCurrency(orderStats.financialYear.totalPotentialRevenue)}</p>
                        <p className="text-sm text-[#A0A0A0]">Total Potential (FY)</p>
                        <p className="text-xs text-[#666] mt-1">If all orders paid</p>
                      </div>
                    </div>

                    {/* Additional FY Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="text-center p-4 bg-[#1E1E1E] rounded-lg">
                        <p className="text-xl font-bold text-blue-400">{orderStats.financialYear.totalOrders}</p>
                        <p className="text-sm text-[#A0A0A0]">Total Orders (FY)</p>
                      </div>
                      <div className="text-center p-4 bg-[#1E1E1E] rounded-lg">
                        <p className="text-xl font-bold text-purple-400">{formatCurrency(orderStats.financialYear.averageOrderValue)}</p>
                        <p className="text-sm text-[#A0A0A0]">Avg Order Value (FY)</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        )}

        {activeTab === 'website' && (
        <div className="space-y-6 mt-6">
          {/* Website Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Website Traffic</p>
                  <p className="text-2xl font-bold text-white">{websiteStats.totalVisitors.toLocaleString()}</p>
                  <p className="text-sm text-[#A0A0A0]">{websiteStats.uniqueVisitors} unique visitors</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">{formatPercentage(websiteStats.conversionRate)}</p>
                  <p className="text-sm text-[#A0A0A0]">Based on actual orders</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Bounce Rate</p>
                  <p className="text-2xl font-bold text-white">{formatPercentage(websiteStats.bounceRate)}</p>
                  <p className="text-sm text-[#A0A0A0]">Estimated metric</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Cart Abandonment</p>
                  <p className="text-2xl font-bold text-white">{formatPercentage(websiteStats.cartAbandonmentRate)}</p>
                  <p className="text-sm text-[#A0A0A0]">Calculated from cart events</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Sources and Device Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Traffic Sources</h3>
              <div className="space-y-4">
                {Object.entries(websiteStats.trafficSources).map(([source, percentage]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-[#A0A0A0]">{source}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-[#1E1E1E] rounded-full">
                        <div 
                          className="h-2 bg-blue-400 rounded-full" 
                          style={{ width: `${(percentage / 50) * 16 * 4}px` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Device & Page Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Mobile Traffic</span>
                  <span className="text-white font-medium">{formatPercentage(websiteStats.mobileTraffic / (websiteStats.mobileTraffic + websiteStats.desktopTraffic) * 100)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Desktop Traffic</span>
                  <span className="text-white font-medium">{formatPercentage(websiteStats.desktopTraffic / (websiteStats.mobileTraffic + websiteStats.desktopTraffic) * 100)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Page Views</span>
                  <span className="text-white font-medium">{websiteStats.pageViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Avg Session Duration</span>
                  <span className="text-white font-medium">{Math.round(websiteStats.averageSessionDuration)}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'customers' && (
        <div className="space-y-6 mt-6">
          {/* Customer Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Customer Acquisition Cost</p>
                  <p className="text-2xl font-bold text-white">{customerStats.customerAcquisitionCost > 0 ? formatCurrency(customerStats.customerAcquisitionCost) : 'Not Available'}</p>
                  <p className="text-sm text-[#A0A0A0]">Requires marketing data</p>
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
                  <p className="text-sm font-medium text-[#A0A0A0]">Customer Lifetime Value</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(customerStats.averageLifetimeValue)}</p>
                  <p className="text-sm text-[#A0A0A0]">Revenue per customer</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Retention Rate</p>
                  <p className="text-2xl font-bold text-white">{formatPercentage(customerStats.retentionRate)}</p>
                  <p className="text-sm text-[#A0A0A0]">Based on repeat orders</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Churn Rate</p>
                  <p className="text-2xl font-bold text-white">{formatPercentage(customerStats.churnRate)}</p>
                  <p className="text-sm text-[#A0A0A0]">Calculated from activity</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Segmentation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Customer Segmentation</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Customers with Orders</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 font-medium">{formatPercentage(customerStats.totalCustomers > 0 ? (customerStats.customersWithOrders / customerStats.totalCustomers) * 100 : 0)}</span>
                    <span className="text-[#A0A0A0]">({customerStats.customersWithOrders})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Returning Customers</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 font-medium">{formatPercentage(customerStats.retentionRate)}</span>
                    <span className="text-[#A0A0A0]">({customerStats.returningCustomers})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Total Customers</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400 font-medium">100%</span>
                    <span className="text-[#A0A0A0]">({customerStats.totalCustomers})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Customer Behavior</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Repeat Purchase Rate</span>
                  <span className="text-white font-medium">{formatPercentage(customerStats.retentionRate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Active Customers</span>
                  <span className="text-white font-medium">{customerStats.customersWithOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Total Customers</span>
                  <span className="text-white font-medium">{customerStats.totalCustomers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Customer Revenue</span>
                  <span className="text-green-400 font-medium">{formatCurrency(customerStats.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'products' && (
        <div className="space-y-6 mt-6">
          {/* Product Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Best Selling Products</p>
                  <p className="text-2xl font-bold text-white">{productStats.bestSellingProducts.length}</p>
                  <p className="text-sm text-[#A0A0A0]">With sales data</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Product Views</p>
                  <p className="text-2xl font-bold text-white">{websiteStats.pageViews.toLocaleString()}</p>
                  <p className="text-sm text-[#A0A0A0]">Total page views</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Return Rate</p>
                  <p className="text-2xl font-bold text-white">{productStats.returnRate > 0 ? formatPercentage(productStats.returnRate) : 'Not Available'}</p>
                  <p className="text-sm text-[#A0A0A0]">Requires return data</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Inventory Turnover</p>
                  <p className="text-2xl font-bold text-white">{productStats.inventoryTurnover > 0 ? `${productStats.inventoryTurnover.toFixed(1)}x` : 'Not Available'}</p>
                  <p className="text-sm text-[#A0A0A0]">Requires inventory data</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Best Selling Products */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Performing Products</h3>
            <div className="space-y-4">
              {productStats.bestSellingProducts.slice(0, 5).map((product, index) => product && (
                <div key={product.id} className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#9B51E0] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-sm text-[#A0A0A0]">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(product.revenue)}</p>
                    <p className="text-sm text-green-400">
                      {product.conversions ? formatPercentage(product.conversions / (product.views || 1) * 100) : 'N/A'} conv.
                    </p>
                  </div>
                </div>
              ))}
              {productStats.bestSellingProducts.length === 0 && (
                <div className="text-center py-8 text-[#A0A0A0]">
                  No product performance data available
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {activeTab === 'subscription' && (
        <div className="space-y-6 mt-6">
          {/* Subscription Overview */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Subscription Overview</h3>
              {isTrialUser && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium">
                  Trial Account
                </span>
              )}
              {subscription && (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                  {subscription.plan_id.charAt(0).toUpperCase() + subscription.plan_id.slice(1)} Plan
                </span>
              )}
            </div>

            {/* Current Plan Details */}
            {subscription && (
              <div className="bg-[#1E1E1E] rounded-lg p-4 mb-6">
                <h4 className="text-white font-medium mb-2">Current Plan: {subscription.plan_id.charAt(0).toUpperCase() + subscription.plan_id.slice(1)}</h4>
                <p className="text-sm text-[#A0A0A0] mb-3">
                  Active since {new Date(subscription.current_period_start).toLocaleDateString()}
                </p>
                <p className="text-sm text-[#A0A0A0]">
                  Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Usage Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stores Usage */}
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Stores</p>
                  <p className="text-2xl font-bold text-white">
                    {stores.length} / {subscriptionLimits.maxStores === -1 ? '∞' : subscriptionLimits.maxStores}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="w-full bg-[#3A3A3A] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    subscriptionLimits.maxStores === -1 
                      ? 'bg-green-400' 
                      : stores.length / subscriptionLimits.maxStores > 0.8 
                      ? 'bg-red-400' 
                      : stores.length / subscriptionLimits.maxStores > 0.6 
                      ? 'bg-yellow-400' 
                      : 'bg-green-400'
                  }`}
                  style={{
                    width: subscriptionLimits.maxStores === -1 
                      ? '10%' 
                      : `${Math.min((stores.length / subscriptionLimits.maxStores) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">
                {subscriptionLimits.maxStores === -1 
                  ? 'Unlimited stores available'
                  : `${subscriptionLimits.maxStores - stores.length} stores remaining`
                }
              </p>
            </div>

            {/* Products Usage */}
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Products per Store</p>
                  <p className="text-2xl font-bold text-white">
                    {productStats.totalProducts} / {subscriptionLimits.maxProducts === -1 ? '∞' : subscriptionLimits.maxProducts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="w-full bg-[#3A3A3A] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    subscriptionLimits.maxProducts === -1 
                      ? 'bg-green-400' 
                      : productStats.totalProducts / subscriptionLimits.maxProducts > 0.8 
                      ? 'bg-red-400' 
                      : productStats.totalProducts / subscriptionLimits.maxProducts > 0.6 
                      ? 'bg-yellow-400' 
                      : 'bg-green-400'
                  }`}
                  style={{
                    width: subscriptionLimits.maxProducts === -1 
                      ? '15%' 
                      : `${Math.min((productStats.totalProducts / subscriptionLimits.maxProducts) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">
                {subscriptionLimits.maxProducts === -1 
                  ? 'Unlimited products per store'
                  : `${subscriptionLimits.maxProducts - productStats.totalProducts} products remaining this store`
                }
              </p>
            </div>

            {/* Orders Usage */}
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Orders This Month</p>
                  <p className="text-2xl font-bold text-white">
                    {orderStats.totalOrders} / {subscriptionLimits.maxOrders === -1 ? '∞' : subscriptionLimits.maxOrders}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="w-full bg-[#3A3A3A] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    subscriptionLimits.maxOrders === -1 
                      ? 'bg-green-400' 
                      : orderStats.totalOrders / subscriptionLimits.maxOrders > 0.8 
                      ? 'bg-red-400' 
                      : orderStats.totalOrders / subscriptionLimits.maxOrders > 0.6 
                      ? 'bg-yellow-400' 
                      : 'bg-green-400'
                  }`}
                  style={{
                    width: subscriptionLimits.maxOrders === -1 
                      ? '20%' 
                      : `${Math.min((orderStats.totalOrders / subscriptionLimits.maxOrders) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">
                {subscriptionLimits.maxOrders === -1 
                  ? 'Unlimited orders per month'
                  : `${subscriptionLimits.maxOrders - orderStats.totalOrders} orders remaining this month`
                }
              </p>
            </div>
          </div>

          {/* Plan Features */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Plan Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  subscriptionLimits.customDomain ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {subscriptionLimits.customDomain ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className="text-white">Custom Domain</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  subscriptionLimits.prioritySupport ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {subscriptionLimits.prioritySupport ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className="text-white">Priority Support</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  subscriptionLimits.apiAccess ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {subscriptionLimits.apiAccess ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className="text-white">API Access</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  subscriptionLimits.advancedAnalytics ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {subscriptionLimits.advancedAnalytics ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className="text-white">Advanced Analytics</span>
              </div>
            </div>

            {isTrialUser && (
              <div className="mt-6 p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 font-medium">Trial Account</p>
                    <p className="text-sm text-orange-300 mt-1">
                      Upgrade to unlock full features and remove limitations
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors">
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
    </div>
  )
}

export default EnhancedAnalyticsDashboard