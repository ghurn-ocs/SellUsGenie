import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { AnalyticsCalculator } from '../services/analyticsService'
import { useOrders } from './useOrders'
import { useCustomers } from './useCustomers'
import { useProducts } from './useProducts'
import { 
  getCurrentFinancialYear, 
  getFinancialYearProgress, 
  formatFinancialYearPeriod,
  getFinancialYearLabel,
  DEFAULT_FINANCIAL_YEAR,
  type FinancialYearSettings 
} from '../lib/financialYear'

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

  // Fetch financial year settings for the store
  const { data: financialYearSettings } = useQuery({
    queryKey: ['financial-year-settings', storeId],
    queryFn: async () => {
      if (!storeId) return DEFAULT_FINANCIAL_YEAR
      
      const { data, error } = await supabase
        .from('stores')
        .select('financial_year_start_month, financial_year_start_day')
        .eq('id', storeId)
        .single()

      if (error || !data) {
        console.warn('Could not fetch financial year settings, using default:', error)
        return DEFAULT_FINANCIAL_YEAR
      }

      return {
        startMonth: data.financial_year_start_month || 1,
        startDay: data.financial_year_start_day || 1
      } as FinancialYearSettings
    },
    enabled: !!storeId,
    staleTime: 10 * 60 * 1000 // 10 minutes (settings don't change often)
  })

  // Filter orders by payment status for accurate revenue calculations
  const paidOrders = orders.filter(order => 
    order.status === 'paid' || 
    order.status === 'delivered' || 
    order.status === 'processing' || 
    order.status === 'shipped'
  )
  
  // Calculate monthly and daily stats
  const monthlyRevenue = paidOrders.reduce((acc, order) => {
    const month = new Date(order.created_at).toISOString().slice(0, 7) // YYYY-MM
    acc[month] = (acc[month] || 0) + (order.total || 0)
    return acc
  }, {} as Record<string, number>)

  const dailyOrders = orders.reduce((acc, order) => {
    const day = new Date(order.created_at).toISOString().slice(0, 10) // YYYY-MM-DD
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate comprehensive analytics
  const analytics = {
    orderStats: {
      totalOrders: orders.length,
      totalRevenue: paidOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'delivered').length,
      processingOrders: orders.filter(order => order.status === 'processing').length,
      shippedOrders: orders.filter(order => order.status === 'shipped').length,
      paidOrders: orders.filter(order => order.status === 'paid').length,
      toBePaidOrders: orders.filter(order => order.status === 'to_be_paid').length,
      unpaidRevenue: orders.filter(order => order.status === 'to_be_paid').reduce((sum, order) => sum + (order.total || 0), 0),
      averageOrderValue: paidOrders.length > 0 ? paidOrders.reduce((sum, order) => sum + (order.total || 0), 0) / paidOrders.length : 0,
      monthlyRevenue,
      dailyOrders,
      cogs: paidOrders.reduce((sum, order) => {
        // TODO: Calculate actual COGS from order_items when available
        // For now, use product COGS data if available, otherwise estimate
        const orderTotal = order.total || 0
        return sum + orderTotal * 0.4 // Fallback to 40% estimate
      }, 0),
      grossProfit: paidOrders.reduce((sum, order) => {
        const orderTotal = order.total || 0
        return sum + orderTotal * 0.6 // Fallback to 60% profit
      }, 0),
      profitMargin: 60, // Fallback estimate (TODO: Calculate from actual COGS when order_items include cost data)
      
      // Financial Year Analytics
      financialYear: (() => {
        if (!financialYearSettings) {
          return {
            isConfigured: false,
            message: 'Financial year period not configured'
          }
        }

        const currentFY = getCurrentFinancialYear(financialYearSettings)
        const progress = getFinancialYearProgress(financialYearSettings)
        
        // Filter orders within current financial year
        const financialYearOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at)
          return orderDate >= currentFY.startDate && orderDate <= currentFY.endDate
        })
        
        const financialYearPaidOrders = financialYearOrders.filter(order => 
          order.status === 'paid' || 
          order.status === 'delivered' || 
          order.status === 'processing' || 
          order.status === 'shipped'
        )

        const financialYearRevenue = financialYearPaidOrders.reduce((sum, order) => 
          sum + (order.total || 0), 0
        )
        
        const financialYearUnpaidRevenue = financialYearOrders
          .filter(order => order.status === 'to_be_paid')
          .reduce((sum, order) => sum + (order.total || 0), 0)

        return {
          isConfigured: true,
          period: currentFY,
          label: getFinancialYearLabel(currentFY),
          formattedPeriod: formatFinancialYearPeriod(currentFY),
          progress: Math.round(progress),
          totalOrders: financialYearOrders.length,
          paidRevenue: financialYearRevenue,
          unpaidRevenue: financialYearUnpaidRevenue,
          totalPotentialRevenue: financialYearRevenue + financialYearUnpaidRevenue,
          averageOrderValue: financialYearPaidOrders.length > 0 
            ? financialYearRevenue / financialYearPaidOrders.length 
            : 0
        }
      })()
    },

    customerStats: {
      totalCustomers: customers.length,
      customersWithOrders: customers.filter(customer => 
        customer.orders && customer.orders.length > 0
      ).length,
      totalRevenue: paidOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      newCustomers: customers.reduce((acc, customer) => {
        if (customer.created_at) {
          const month = new Date(customer.created_at).toISOString().slice(0, 7)
          acc[month] = (acc[month] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
      returningCustomers: customers.filter(customer => 
        customer.orders && customer.orders.length > 1
      ).length,
      customerAcquisitionCost: 0, // No marketing spend data available
      averageLifetimeValue: customers.length > 0 ? 
        orders.reduce((sum, order) => sum + (order.total || 0), 0) / customers.length : 0,
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
      bestSellingProducts: productAnalyticsData && Object.keys(productAnalyticsData).length > 0 ? 
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
          .slice(0, 5) : 
        // Fallback: use products with sales data from orders
        products
          .map(product => {
            // Calculate sales from orders (this is basic but functional)
            const productOrders = paidOrders.filter((order: any) => 
              order.order_items?.some((item: any) => item.product_id === product.id)
            )
            const totalSales = productOrders.reduce((sum, order) => {
              const items = order.order_items?.filter((item: any) => item.product_id === product.id) || []
              return sum + items.reduce((itemSum: number, item: any) => itemSum + (item.quantity || 1), 0)
            }, 0)
            const revenue = productOrders.reduce((sum, order) => {
              const items = order.order_items?.filter((item: any) => item.product_id === product.id) || []
              return sum + items.reduce((itemSum: number, item: any) => itemSum + (item.price || product.price) * (item.quantity || 1), 0)
            }, 0)
            
            return {
              id: product.id,
              name: product.name,
              sales: totalSales,
              revenue,
              views: 0, // No view tracking yet
              conversions: totalSales
            }
          })
          .filter(p => p.sales > 0)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5),
      categoryPerformance: products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized'
        if (!acc[category]) {
          acc[category] = { products: 0, revenue: 0 }
        }
        acc[category].products++
        // Calculate revenue from orders for this product
        const productOrders = paidOrders.filter((order: any) => 
          order.order_items?.some((item: any) => item.product_id === product.id)
        )
        acc[category].revenue += productOrders.reduce((sum, order) => {
          const items = order.order_items?.filter((item: any) => item.product_id === product.id) || []
          return sum + items.reduce((itemSum: number, item: any) => itemSum + (item.price || product.price) * (item.quantity || 1), 0)
        }, 0)
        return acc
      }, {} as Record<string, { products: number; revenue: number }>),
      returnRate: 0, // No return data available yet
      inventoryTurnover: 0 // No inventory movement data available yet
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