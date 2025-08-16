import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { AnalyticsCalculator } from '../services/analyticsService'
import { useOrders } from './useOrders'
import { useCustomers } from './useCustomers'
import { useProducts } from './useProducts'

export const useRealAnalytics = (storeId: string) => {
  const { orders } = useOrders(storeId)
  const { customers } = useCustomers(storeId)
  const { products } = useProducts(storeId)

  // Get date range for analytics (last 30 days)
  const endDate = new Date().toISOString()
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch real website analytics
  const { data: websiteAnalyticsData } = useQuery({
    queryKey: ['website-analytics', storeId, startDate, endDate],
    queryFn: async () => {
      if (!storeId) return null
      const calculator = new AnalyticsCalculator(storeId)
      return await calculator.getWebsiteAnalytics(startDate, endDate)
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Fetch real product analytics
  const { data: productAnalyticsData } = useQuery({
    queryKey: ['product-analytics', storeId, startDate, endDate],
    queryFn: async () => {
      if (!storeId) return null
      const calculator = new AnalyticsCalculator(storeId)
      return await calculator.getProductAnalytics(startDate, endDate)
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000
  })

  // Fetch traffic sources
  const { data: trafficSources } = useQuery({
    queryKey: ['traffic-sources', storeId, startDate, endDate],
    queryFn: async () => {
      if (!storeId) return { 'Direct': 100 }
      
      const { data: sessions } = await supabase
        .from('customer_sessions')
        .select('referrer, utm_source')
        .eq('store_id', storeId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (!sessions || sessions.length === 0) {
        return { 'Direct': 100 }
      }

      const sources = sessions.reduce((acc, session) => {
        let source = 'Direct'
        if (session.utm_source) {
          source = session.utm_source
        } else if (session.referrer) {
          if (session.referrer.includes('google')) source = 'Organic Search'
          else if (session.referrer.includes('facebook') || session.referrer.includes('instagram')) source = 'Social Media'
          else if (session.referrer.includes('twitter')) source = 'Social Media'
          else source = 'Referral'
        }
        
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Convert to percentages
      const total = Object.values(sources).reduce((sum, count) => sum + count, 0)
      const percentages = Object.entries(sources).reduce((acc, [source, count]) => {
        acc[source] = Math.round((count / total) * 100)
        return acc
      }, {} as Record<string, number>)

      return percentages
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000
  })

  // Calculate comprehensive analytics
  const analytics = {
    orderStats: {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'delivered').length,
      processingOrders: orders.filter(order => order.status === 'processing').length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      monthlyRevenue: {},
      dailyOrders: {},
      cogs: orders.reduce((sum, order) => sum + order.total, 0) * 0.4, // 40% COGS estimate
      grossProfit: orders.reduce((sum, order) => sum + order.total, 0) * 0.6,
      profitMargin: 60 // 60% margin with 40% COGS
    },

    customerStats: {
      totalCustomers: customers.length,
      customersWithOrders: customers.filter(customer => 
        customer.orders && customer.orders.length > 0
      ).length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      newCustomers: {},
      returningCustomers: customers.filter(customer => 
        customer.orders && customer.orders.length > 1
      ).length,
      customerAcquisitionCost: 0, // No marketing spend data available
      averageLifetimeValue: customers.length > 0 ? 
        orders.reduce((sum, order) => sum + order.total, 0) / customers.length : 0,
      retentionRate: customers.length > 0 ? 
        (customers.filter(customer => customer.orders && customer.orders.length > 1).length / customers.length) * 100 : 0,
      churnRate: (() => {
        if (customers.length === 0) return 0
        
        // Calculate churn as customers who haven't made a purchase in the last 90 days
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        const churnedCustomers = customers.filter(customer => {
          if (!customer.orders || customer.orders.length === 0) return false
          
          // Find their most recent order
          const lastOrderDate = new Date(Math.max(...customer.orders.map((order: any) => new Date(order.created_at).getTime())))
          return lastOrderDate < ninetyDaysAgo
        }).length
        
        return (churnedCustomers / customers.length) * 100
      })()
    },

    productStats: {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.is_active).length,
      bestSellingProducts: productAnalyticsData ? 
        Object.entries(productAnalyticsData)
          .map(([productId, data]: [string, any]) => {
            const product = products.find(p => p.id === productId)
            return product ? {
              id: productId,
              name: product.name,
              sales: data.purchases || 0,
              revenue: (data.purchases || 0) * product.price,
              views: data.views || 0,
              conversions: data.addToCarts || 0
            } : null
          })
          .filter(Boolean)
          .sort((a: any, b: any) => b.sales - a.sales)
          .slice(0, 5) : [],
      categoryPerformance: {},
      returnRate: 0, // No return data available
      inventoryTurnover: 0 // No inventory movement data available
    },

    websiteStats: {
      totalVisitors: websiteAnalyticsData?.totalVisitors || 0,
      uniqueVisitors: websiteAnalyticsData?.uniqueVisitors || 0,
      pageViews: websiteAnalyticsData?.pageViews || 0,
      bounceRate: websiteAnalyticsData?.bounceRate || 0,
      averageSessionDuration: websiteAnalyticsData?.averageSessionDuration || 0,
      mobileTraffic: websiteAnalyticsData?.mobileTraffic || 0,
      desktopTraffic: websiteAnalyticsData?.desktopTraffic || 0,
      conversionRate: websiteAnalyticsData?.conversionRate || 0,
      cartAbandonmentRate: websiteAnalyticsData?.conversionRate ? 
        Math.max(50, 100 - websiteAnalyticsData.conversionRate) : 70,
      trafficSources: trafficSources || { 'Direct': 100 }
    }
  }

  return analytics
}