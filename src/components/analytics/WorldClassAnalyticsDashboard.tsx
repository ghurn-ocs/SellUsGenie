// Store Analytics Dashboard
// Advanced analytics with GA4, Meta Pixel, TikTok Ads, customer segmentation, and predictive insights

import React, { useState } from 'react'
import { useComprehensiveAnalytics } from '../../hooks/useComprehensiveAnalytics'
import { useStore } from '../../contexts/StoreContext'
import * as Dialog from '@radix-ui/react-dialog'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Target, 
  Brain, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  ExternalLink,
  Calendar,
  Filter,
  Download,
  Settings,
  Database,
  ArrowRight,
  CheckCircle,
  Crown,
  X
} from 'lucide-react'

interface WorldClassAnalyticsDashboardProps {
  storeId: string
}

// Empty State Component
const EmptyStateCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionText?: string
  actionHref?: string
  steps?: string[]
}> = ({ icon: Icon, title, description, actionText, actionHref, steps }) => (
  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-8 text-center">
    <Icon className="w-12 h-12 text-[#9B51E0] mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-[#A0A0A0] mb-6">{description}</p>
    
    {steps && (
      <div className="text-left mb-6">
        <p className="text-sm font-medium text-white mb-3">To enable this data:</p>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-5 h-5 bg-[#9B51E0] text-white text-xs rounded-full flex items-center justify-center font-medium">
                {index + 1}
              </span>
              <span className="text-sm text-[#A0A0A0]">{step}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    
    {actionText && actionHref && (
      <a
        href={actionHref}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] transition-colors"
      >
        <span>{actionText}</span>
        <ArrowRight className="w-4 h-4" />
      </a>
    )}
  </div>
)

// Helper to check if analytics has meaningful data
const hasRevenueData = (analytics: any) => analytics?.revenue?.total > 0
const hasCustomerData = (analytics: any) => analytics?.customers?.total > 0
const hasProductData = (analytics: any) => analytics?.products?.topSelling?.length > 0
const hasWebsiteData = (analytics: any) => analytics?.website?.visitors > 0

export const WorldClassAnalyticsDashboard: React.FC<WorldClassAnalyticsDashboardProps> = ({ storeId }) => {
  const { currentStore } = useStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  })
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

  const { analytics, isLoading, createSegment, calculateRFM, generateInsights } = useComprehensiveAnalytics(storeId, dateRange)

  // Helper function to get date range label
  const getDateRangeLabel = () => {
    const diffTime = Math.abs(dateRange.end.getTime() - dateRange.start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) return 'Last 24 hours'
    if (diffDays <= 7) return 'Last 7 days'
    if (diffDays <= 30) return 'Last 30 days'
    if (diffDays <= 90) return 'Last 90 days'
    return `${diffDays} days`
  }

  // Handle export functionality
  const handleExport = () => {
    try {
      if (!analytics) {
        setNotification({ type: 'error', message: 'No data available to export' })
        return
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString()
        },
        store: currentStore?.store_name || 'Unknown Store',
        analytics: {
          revenue: analytics.revenue,
          customers: analytics.customers,
          website: analytics.website,
          predictions: analytics.predictions,
          attribution: analytics.attribution,
          products: analytics.products
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setNotification({ type: 'success', message: 'Analytics data exported successfully' })
    } catch (error) {
      console.error('Export failed:', error)
      setNotification({ type: 'error', message: 'Failed to export analytics data' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-8">
          <div className="flex items-center justify-center space-x-3">
            <Activity className="w-6 h-6 text-[#9B51E0] animate-pulse" />
            <span className="text-white text-lg">Loading store analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Analytics Unavailable</h3>
        <p className="text-[#A0A0A0]">Unable to load analytics data. Please try again later.</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Brain className="w-7 h-7 text-[#9B51E0]" />
            <span>Store Analytics</span>
          </h1>
          <p className="text-[#A0A0A0] mt-1">
            Advanced insights powered by GA4, Meta Pixel, TikTok Ads, and AI-driven predictions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsDatePickerOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#2A2A2A] border border-[#4A4A4A] text-white rounded-lg hover:bg-[#3A3A3A] hover:border-[#9B51E0]/50 transition-all duration-200 shadow-sm"
          >
            <Calendar className="w-4 h-4 text-[#9B51E0]" />
            <span className="font-medium">{getDateRangeLabel()}</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] hover:shadow-lg hover:shadow-[#9B51E0]/25 transition-all duration-200 font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Setup Notice - Show when no meaningful data */}
      {!hasRevenueData(analytics) && !hasCustomerData(analytics) && !hasProductData(analytics) && (
        <div className="bg-gradient-to-r from-[#9B51E0]/10 to-[#7C3AED]/10 border border-[#9B51E0]/20 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[#9B51E0]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">🚀 Welcome to Analytics!</h3>
              <p className="text-[#A0A0A0] mb-4">Your analytics are ready to track real data. Start with these simple steps:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShoppingCart className="w-4 h-4 text-[#9B51E0]" />
                    <span className="text-sm font-medium text-white">1. Make Sales</span>
                  </div>
                  <p className="text-xs text-[#A0A0A0]">Add products and process orders to see revenue and product analytics</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-[#9B51E0]" />
                    <span className="text-sm font-medium text-white">2. Get Customers</span>
                  </div>
                  <p className="text-xs text-[#A0A0A0]">Customer data populates automatically from checkout orders</p>
                </div>
                <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-[#9B51E0]" />
                    <span className="text-sm font-medium text-white">3. Track Activity</span>
                  </div>
                  <p className="text-xs text-[#A0A0A0]">Website analytics are already active and tracking page views</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">
                  💡 Data becomes more powerful with each order. See ANALYTICS_SETUP.md for advanced features.
                </p>
                <button className="text-xs text-[#9B51E0] hover:text-[#A051E0] transition-colors">
                  View Setup Guide →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#2A2A2A] p-1 rounded-lg border border-[#3A3A3A] shadow-sm w-full">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'customers', label: 'Customer Intelligence', icon: Users },
          { id: 'attribution', label: 'Marketing Performance', icon: Target },
          { id: 'predictions', label: 'Predictive Insights', icon: Brain }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center space-x-2 flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#1A1A1A] text-[#9B51E0] shadow-md border border-[#4A4A4A]'
                : 'text-[#A0A0A0] hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(analytics.revenue.total)}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {analytics.revenue.growth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      analytics.revenue.growth >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPercentage(analytics.revenue.growth)}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            {/* Customers */}
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Total Customers</p>
                  <p className="text-2xl font-bold text-white">{analytics.customers.total.toLocaleString()}</p>
                  <p className="text-sm text-blue-400 mt-1">+{analytics.customers.new} new this period</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Website Traffic */}
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Website Visitors</p>
                  <p className="text-2xl font-bold text-white">{analytics.website.visitors.toLocaleString()}</p>
                  <p className="text-sm text-purple-400 mt-1">{analytics.website.conversionRate}% conversion rate</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Churn Risk */}
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A0A0A0]">Avg Churn Risk</p>
                  <p className="text-2xl font-bold text-white">{analytics.customers.churnRate.toFixed(1)}%</p>
                  <p className="text-sm text-orange-400 mt-1">{analytics.predictions.churnRisk.length} at high risk</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Channel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-[#9B51E0]" />
                <span>Revenue by Channel</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.revenue.byChannel).map(([channel, revenue]) => (
                  <div key={channel} className="flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A0] capitalize">{channel}</span>
                    <span className="text-sm font-medium text-white">{formatCurrency(revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Products */}
            <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-[#9B51E0]" />
                <span>Top Products</span>
              </h3>
              {hasProductData(analytics) ? (
                <div className="space-y-3">
                  {analytics.products.topSelling.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-[#3A3A3A] rounded-full flex items-center justify-center text-xs text-[#A0A0A0]">
                          {index + 1}
                        </span>
                        <span className="text-sm text-white">{product.name}</span>
                      </div>
                      <span className="text-sm font-medium text-[#9B51E0]">{formatCurrency(product.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
                  <h4 className="text-sm font-medium text-white mb-2">Ready for Your First Sale</h4>
                  <p className="text-xs text-[#A0A0A0] mb-4">Product analytics will populate automatically when you complete orders</p>
                  <div className="text-left bg-[#1E1E1E] rounded-lg p-4">
                    <p className="text-xs font-medium text-white mb-2">To see product analytics:</p>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-[#A0A0A0]">Add products to your store</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-[#A0A0A0]">Process orders through checkout</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 border border-[#6B7280] rounded-full" />
                        <span className="text-xs text-[#6B7280]">Data will populate automatically</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Intelligence Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Customer Segments */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Target className="w-5 h-5 text-[#9B51E0]" />
                <span>Customer Segments</span>
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => console.log('Calculate RFM')}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-[#9B51E0] text-white rounded-lg hover:bg-[#A051E0] hover:shadow-lg hover:shadow-[#9B51E0]/25 transition-all duration-200 font-medium"
                >
                  <span>Analyze Customers</span>
                </button>
              </div>
            </div>

            {hasCustomerData(analytics) ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics.customers.segments.map((segment, index) => (
                  <div key={index} className="bg-[#1E1E1E] rounded-lg p-4 border border-[#3A3A3A]">
                    <h4 className="font-medium text-white mb-2">{segment.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#A0A0A0]">Customers</span>
                        <span className="text-white">{segment.count.toLocaleString()}</span>
                      </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A0A0A0]">Total Value</span>
                      <span className="text-[#9B51E0]">{formatCurrency(segment.value)}</span>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Database className="w-16 h-16 text-[#6B7280] mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Ready to Build Customer Insights</h4>
                <p className="text-[#A0A0A0] mb-6">Customer analytics will automatically activate with your first completed orders</p>
                <div className="bg-[#1E1E1E] rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-sm font-medium text-white mb-3">Quick Setup:</p>
                  <div className="text-left space-y-2 text-sm text-[#A0A0A0]">
                    <div>1. Add products to your store</div>
                    <div>2. Complete orders through checkout</div>
                    <div>3. Customer segments will auto-calculate</div>
                  </div>
                  <div className="mt-4 text-xs text-[#6B7280]">
                    See ANALYTICS_SETUP.md for detailed guidance
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* High-Risk Customers */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span>High Churn Risk Customers</span>
            </h3>
            {analytics.predictions.churnRisk.length > 0 ? (
              <div className="space-y-3">
                {analytics.predictions.churnRisk.slice(0, 5).map((customer, index) => (
                <div key={customer.customerId} className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <span className="text-red-400 text-xs font-medium">{customer.probability}%</span>
                    </div>
                    <span className="text-white">Customer {customer.customerId.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[#A0A0A0]">{formatCurrency(customer.value)} at risk</span>
                    <button className="px-3 py-1 bg-[#9B51E0] text-white text-xs rounded hover:bg-[#A051E0] transition-colors">
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <AlertTriangle className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
                <h4 className="text-sm font-medium text-white mb-2">Churn Detection Ready</h4>
                <p className="text-xs text-[#A0A0A0] mb-4">Early warning system will activate after collecting customer purchase patterns</p>
                <div className="bg-[#1E1E1E] rounded-lg p-4 max-w-sm mx-auto">
                  <p className="text-xs font-medium text-white mb-2">To see churn predictions:</p>
                  <div className="text-left space-y-1 text-xs text-[#A0A0A0]">
                    <div>• Get 10+ completed orders</div>
                    <div>• Customer purchase patterns analyzed</div>
                    <div>• AI identifies at-risk customers</div>
                    <div>• Take action to retain revenue</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marketing Performance Tab */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          {/* Channel Attribution */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-[#9B51E0]" />
              <span>Which Marketing Brings in Customers</span>
            </h3>
            {analytics.attribution.channels.length > 0 ? (
              <div className="space-y-4">
                {analytics.attribution.channels.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#9B51E0]/20 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-[#9B51E0]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white capitalize">{channel.channel}</h4>
                      <p className="text-sm text-[#A0A0A0]">Revenue Contribution</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">{formatCurrency(channel.contribution)}</p>
                    <p className="text-sm text-green-400">{channel.roas.toFixed(2)}x Return</p>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Target className="w-16 h-16 text-[#6B7280] mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Attribution Tracking Ready</h4>
                <p className="text-[#A0A0A0] mb-6">Marketing channel analysis will start tracking where your customers come from</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-blue-400" />
                      </div>
                      <h5 className="font-medium text-white">Campaign Tracking</h5>
                    </div>
                    <p className="text-sm text-[#A0A0A0] mb-4">See which marketing campaigns drive sales</p>
                    <div className="space-y-2 text-xs text-[#A0A0A0]">
                      <div>• Add tracking codes to your marketing links</div>
                      <div>• Example: ?utm_source=facebook&utm_campaign=summer_sale</div>
                      <div>• See which Facebook posts, emails, or ads bring in customers</div>
                      <div className="text-[#6B7280] italic">* UTM = simple codes that track where customers come from</div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-400" />
                      </div>
                      <h5 className="font-medium text-white">ROI Tracking</h5>
                    </div>
                    <p className="text-sm text-[#A0A0A0] mb-4">See how much money you make for every dollar spent on ads</p>
                    <div className="space-y-2 text-xs text-[#A0A0A0]">
                      <div>• Connect Google Ads, Facebook Ads</div>
                      <div>• Compare what you spend vs what you earn</div>
                      <div>• Stop wasting money on ads that don't work</div>
                      <div className="text-[#6B7280] italic">* Example: 3x return = $3 earned for every $1 spent</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-[#9B51E0]/10 border border-[#9B51E0]/20 rounded-lg max-w-2xl mx-auto">
                  <p className="text-sm text-white mb-2">🚀 Quick Start: Track your marketing links today</p>
                  <p className="text-xs text-[#A0A0A0]">Use our link builder in Settings &gt; Integrations to see which ads and posts bring in customers</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Predictive Insights Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Smart Customer Insights */}
          <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-[#9B51E0]" />
              <span>Smart Customer Insights</span>
            </h3>
            {(analytics.predictions.lifetimeValue.average > 0 || analytics.predictions.churnRisk.length > 0 || analytics.predictions.nextPurchase.length > 0) ? (
              <div className="space-y-4">
                {/* Customer Lifetime Value Row */}
                {analytics.predictions.lifetimeValue.average > 0 && (
                  <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Average Customer Value</h4>
                        <p className="text-sm text-[#A0A0A0]">How much each customer is worth over time</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{formatCurrency(analytics.predictions.lifetimeValue.average)}</p>
                      <p className="text-sm text-green-400">Lifetime Value</p>
                    </div>
                  </div>
                )}
                
                {/* High-Value Customers Row */}
                {analytics.predictions.lifetimeValue.top10Percent > 0 && (
                  <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Crown className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">VIP Customer Value</h4>
                        <p className="text-sm text-[#A0A0A0]">Your top 10% most valuable customers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{formatCurrency(analytics.predictions.lifetimeValue.top10Percent)}</p>
                      <p className="text-sm text-yellow-400">VIP Value</p>
                    </div>
                  </div>
                )}

                {/* At-Risk Revenue Row */}
                {analytics.predictions.churnRisk.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Revenue at Risk</h4>
                        <p className="text-sm text-[#A0A0A0]">{analytics.predictions.churnRisk.length} customers might leave soon</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(analytics.predictions.churnRisk.reduce((sum, customer) => sum + customer.value, 0))}
                      </p>
                      <p className="text-sm text-red-400">Take Action Now</p>
                    </div>
                  </div>
                )}

                {/* Ready to Buy Row */}
                {analytics.predictions.nextPurchase.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg border border-[#3A3A3A]">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Ready to Buy</h4>
                        <p className="text-sm text-[#A0A0A0]">{analytics.predictions.nextPurchase.length} customers likely to purchase soon</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(analytics.predictions.nextPurchase.reduce((sum, pred) => sum + pred.estimatedValue, 0))}
                      </p>
                      <p className="text-sm text-blue-400">Potential Revenue</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Brain className="w-16 h-16 text-[#6B7280] mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">Smart Customer Insights Ready</h4>
                <p className="text-[#A0A0A0] mb-6">Get predictions that help you grow revenue and keep customers happy</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-400" />
                      </div>
                      <h5 className="font-medium text-white">Customer Value Predictions</h5>
                    </div>
                    <p className="text-sm text-[#A0A0A0] mb-4">Know which customers are worth the most</p>
                    <div className="space-y-2 text-xs text-[#A0A0A0]">
                      <div>• See your average customer lifetime value</div>
                      <div>• Identify your VIP customers worth the most</div>
                      <div>• Focus marketing budget on valuable segments</div>
                      <div className="text-[#6B7280] italic">* Helps you spend marketing dollars wisely</div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <h5 className="font-medium text-white">Early Warning System</h5>
                    </div>
                    <p className="text-sm text-[#A0A0A0] mb-4">Get alerts before customers leave</p>
                    <div className="space-y-2 text-xs text-[#A0A0A0]">
                      <div>• Know which customers might stop buying</div>
                      <div>• Send special offers to keep them happy</div>
                      <div>• Save revenue with proactive outreach</div>
                      <div className="text-[#6B7280] italic">* Prevention is cheaper than finding new customers</div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-400" />
                      </div>
                      <h5 className="font-medium text-white">Perfect Timing</h5>
                    </div>
                    <p className="text-sm text-[#A0A0A0] mb-4">Know exactly when to reach out</p>
                    <div className="space-y-2 text-xs text-[#A0A0A0]">
                      <div>• See who's ready to buy again</div>
                      <div>• Send emails at the perfect time</div>
                      <div>• Increase sales with smart timing</div>
                      <div className="text-[#6B7280] italic">* Right message, right person, right time</div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E1E1E] rounded-lg p-6 border border-[#3A3A3A]">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <h5 className="font-medium text-white">Growth Opportunities</h5>
                    </div>
                    <p className="text-sm text-[#A0A0A0] mb-4">Find easy ways to make more money</p>
                    <div className="space-y-2 text-xs text-[#A0A0A0]">
                      <div>• Spot customers ready for upsells</div>
                      <div>• Find your most profitable products</div>
                      <div>• Discover patterns that drive sales</div>
                      <div className="text-[#6B7280] italic">* Turn insights into more revenue</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-[#9B51E0]/10 border border-[#9B51E0]/20 rounded-lg max-w-2xl mx-auto">
                  <p className="text-sm text-white mb-2">🚀 Quick Start: Complete a few orders to see your first insights</p>
                  <p className="text-xs text-[#A0A0A0]">Your prediction engine is already running. The more sales you make, the smarter it gets!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Range Picker Modal */}
      <Dialog.Root open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-xl w-full max-w-md z-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Dialog.Title className="text-lg font-semibold text-white">Select Date Range</Dialog.Title>
                  <Dialog.Description className="text-sm text-[#A0A0A0] mt-1">
                    Choose a date range for your analytics data
                  </Dialog.Description>
                </div>
                <button 
                  onClick={() => setIsDatePickerOpen(false)} 
                  className="text-[#A0A0A0] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Preset Date Ranges */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Quick Select</h4>
                  {[
                    { label: 'Last 7 days', days: 7 },
                    { label: 'Last 30 days', days: 30 },
                    { label: 'Last 90 days', days: 90 },
                    { label: 'Last 6 months', days: 180 },
                    { label: 'Last year', days: 365 }
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      onClick={() => {
                        const newEnd = new Date()
                        const newStart = new Date(Date.now() - preset.days * 24 * 60 * 60 * 1000)
                        setDateRange({ start: newStart, end: newEnd })
                        setIsDatePickerOpen(false)
                        setNotification({ type: 'success', message: `Date range updated to ${preset.label}` })
                      }}
                      className="w-full text-left px-3 py-2 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg text-[#A0A0A0] hover:bg-[#3A3A3A] hover:text-white transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Current Selection Display */}
                <div className="mt-6 p-3 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Current Selection</h4>
                  <div className="text-sm text-[#A0A0A0]">
                    <p>From: {dateRange.start.toLocaleDateString()}</p>
                    <p>To: {dateRange.end.toLocaleDateString()}</p>
                    <p className="text-[#9B51E0] mt-1">{getDateRangeLabel()}</p>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg border backdrop-blur-sm z-[60] ${
          notification.type === 'success' 
            ? 'bg-green-500/20 border-green-500/30 text-green-400'
            : notification.type === 'error'
            ? 'bg-red-500/20 border-red-500/30 text-red-400'
            : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-center space-x-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : notification.type === 'error' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ExternalLink className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-current hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}