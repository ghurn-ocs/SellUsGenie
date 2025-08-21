// World-Class Analytics Engine
// Advanced analytics with customer segmentation, attribution, and predictive insights

import { supabase } from './supabase'
import { AnalyticsManager } from './integrations/analytics'

export interface CustomerSegment {
  id: string
  name: string
  description?: string
  type: 'behavioral' | 'demographic' | 'rfm' | 'custom'
  conditions: any
  customerCount: number
  isDynamic: boolean
}

export interface RFMAnalysis {
  customerId: string
  recencyScore: number // 1-5
  frequencyScore: number // 1-5
  monetaryScore: number // 1-5
  segment: 'Champions' | 'Loyal Customers' | 'Potential Loyalists' | 'New Customers' | 'Promising' | 'Need Attention' | 'About to Sleep' | 'At Risk' | 'Cannot Lose Them' | 'Lost'
}

export interface AttributionData {
  channel: string
  source: string
  medium: string
  campaign?: string
  valueContribution: number
  positionInJourney: number
  timeToConversion?: number
}

export interface PredictiveInsights {
  customerId: string
  churnProbability: number // 0-100
  lifetimeValuePrediction: number
  nextPurchaseProbability: number // 0-100
  recommendedActions: string[]
}

export class AnalyticsEngine {
  private storeId: string
  private analyticsManager: AnalyticsManager

  constructor(storeId: string) {
    this.storeId = storeId
    this.analyticsManager = new AnalyticsManager(storeId)
  }

  // Advanced Customer Segmentation
  async createCustomerSegment(segment: {
    name: string
    description?: string
    type: 'behavioral' | 'demographic' | 'rfm' | 'custom'
    conditions: any
    isDynamic?: boolean
  }) {
    const { data, error } = await supabase
      .from('customer_segments')
      .insert({
        store_id: this.storeId,
        name: segment.name,
        description: segment.description,
        segment_type: segment.type,
        conditions: segment.conditions,
        is_dynamic: segment.isDynamic ?? true
      })
      .select()
      .single()

    if (error) throw error

    // Calculate initial segment membership
    await this.calculateSegmentMembership(data.id)
    
    return data
  }

  async calculateSegmentMembership(segmentId: string) {
    const { data: segment } = await supabase
      .from('customer_segments')
      .select('*')
      .eq('id', segmentId)
      .single()

    if (!segment) return

    // Get all customers for the store
    const { data: customers } = await supabase
      .from('customers')
      .select('*, orders(*), analytics:customer_analytics(*)')
      .eq('store_id', this.storeId)

    if (!customers) return

    const eligibleCustomers = this.evaluateSegmentConditions(customers, segment.conditions)
    
    // Clear existing memberships
    await supabase
      .from('customer_segment_memberships')
      .delete()
      .eq('segment_id', segmentId)

    // Add new memberships
    if (eligibleCustomers.length > 0) {
      await supabase
        .from('customer_segment_memberships')
        .insert(
          eligibleCustomers.map(customer => ({
            segment_id: segmentId,
            customer_id: customer.id,
            score: customer.score || null
          }))
        )
    }

    // Update segment customer count
    await supabase
      .from('customer_segments')
      .update({
        customer_count: eligibleCustomers.length,
        last_calculated: new Date().toISOString()
      })
      .eq('id', segmentId)
  }

  private evaluateSegmentConditions(customers: any[], conditions: any): any[] {
    return customers.filter(customer => {
      switch (conditions.type) {
        case 'rfm':
          return this.evaluateRFMConditions(customer, conditions)
        case 'behavioral':
          return this.evaluateBehavioralConditions(customer, conditions)
        case 'demographic':
          return this.evaluateDemographicConditions(customer, conditions)
        case 'custom':
          return this.evaluateCustomConditions(customer, conditions)
        default:
          return false
      }
    })
  }

  private evaluateRFMConditions(customer: any, conditions: any): boolean {
    const analytics = customer.analytics?.[0]
    if (!analytics) return false

    const { recency, frequency, monetary } = conditions
    
    return (
      (!recency || analytics.recency_score >= recency.min && analytics.recency_score <= recency.max) &&
      (!frequency || analytics.frequency_score >= frequency.min && analytics.frequency_score <= frequency.max) &&
      (!monetary || analytics.monetary_score >= monetary.min && analytics.monetary_score <= monetary.max)
    )
  }

  private evaluateBehavioralConditions(customer: any, conditions: any): boolean {
    const analytics = customer.analytics?.[0]
    if (!analytics) return false

    const { totalOrders, avgOrderValue, daysSinceLastOrder, engagementScore } = conditions
    
    return (
      (!totalOrders || analytics.total_orders >= totalOrders.min && analytics.total_orders <= totalOrders.max) &&
      (!avgOrderValue || analytics.avg_order_value >= avgOrderValue.min && analytics.avg_order_value <= avgOrderValue.max) &&
      (!daysSinceLastOrder || analytics.days_since_last_order <= daysSinceLastOrder.max) &&
      (!engagementScore || analytics.email_engagement_score >= engagementScore.min)
    )
  }

  private evaluateDemographicConditions(customer: any, conditions: any): boolean {
    const { country, region, ageRange, gender } = conditions
    
    return (
      (!country || customer.country === country) &&
      (!region || customer.region === region) &&
      (!ageRange || this.isInAgeRange(customer.birth_date, ageRange)) &&
      (!gender || customer.gender === gender)
    )
  }

  private evaluateCustomConditions(customer: any, conditions: any): boolean {
    // Implement custom SQL-like conditions
    // This is a simplified version - real implementation would be more robust
    try {
      return eval(conditions.expression.replace(/customer\./g, 'customer.'))
    } catch (error) {
      console.error('Error evaluating custom conditions:', error)
      return false
    }
  }

  private isInAgeRange(birthDate: string, ageRange: { min: number, max: number }): boolean {
    if (!birthDate) return false
    
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear()
    return age >= ageRange.min && age <= ageRange.max
  }

  // RFM Analysis
  async calculateRFMAnalysis(): Promise<RFMAnalysis[]> {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, orders(created_at, total_amount)')
      .eq('store_id', this.storeId)

    if (!customers) return []

    const analysisDate = new Date()
    const results: RFMAnalysis[] = []

    for (const customer of customers) {
      if (!customer.orders || customer.orders.length === 0) continue

      const orders = customer.orders.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      // Calculate Recency (days since last purchase)
      const lastOrderDate = new Date(orders[0].created_at)
      const recencyDays = Math.floor((analysisDate.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Calculate Frequency (number of orders)
      const frequency = orders.length
      
      // Calculate Monetary (total amount spent)
      const monetary = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)

      // Score each dimension (1-5 scale)
      const recencyScore = this.calculateRecencyScore(recencyDays)
      const frequencyScore = this.calculateFrequencyScore(frequency)
      const monetaryScore = this.calculateMonetaryScore(monetary)

      // Determine RFM segment
      const segment = this.determineRFMSegment(recencyScore, frequencyScore, monetaryScore)

      const analysis: RFMAnalysis = {
        customerId: customer.id,
        recencyScore,
        frequencyScore,
        monetaryScore,
        segment
      }

      results.push(analysis)

      // Store in database
      await supabase
        .from('customer_analytics')
        .upsert({
          customer_id: customer.id,
          store_id: this.storeId,
          recency_score: recencyScore,
          frequency_score: frequencyScore,
          monetary_score: monetaryScore,
          rfm_segment: segment,
          total_orders: frequency,
          total_spent: monetary,
          calculated_at: new Date().toISOString()
        }, {
          onConflict: 'customer_id,store_id'
        })
    }

    return results
  }

  private calculateRecencyScore(days: number): number {
    if (days <= 30) return 5
    if (days <= 90) return 4
    if (days <= 180) return 3
    if (days <= 365) return 2
    return 1
  }

  private calculateFrequencyScore(orderCount: number): number {
    if (orderCount >= 10) return 5
    if (orderCount >= 5) return 4
    if (orderCount >= 3) return 3
    if (orderCount >= 2) return 2
    return 1
  }

  private calculateMonetaryScore(totalSpent: number): number {
    if (totalSpent >= 1000) return 5
    if (totalSpent >= 500) return 4
    if (totalSpent >= 200) return 3
    if (totalSpent >= 50) return 2
    return 1
  }

  private determineRFMSegment(r: number, f: number, m: number): RFMAnalysis['segment'] {
    const score = `${r}${f}${m}`
    
    if (['555', '554', '544', '545', '454', '455', '445'].includes(score)) return 'Champions'
    if (['543', '444', '435', '355', '354', '345', '344', '335'].includes(score)) return 'Loyal Customers'
    if (['512', '511', '422', '421', '412', '411', '311'].includes(score)) return 'Potential Loyalists'
    if (['512', '511', '422', '421', '412', '411', '311'].includes(score)) return 'New Customers'
    if (['512', '511', '331', '321', '312', '231', '241', '251'].includes(score)) return 'Promising'
    if (['155', '154', '144', '214', '215', '115', '114'].includes(score)) return 'Need Attention'
    if (['331', '321', '231', '241', '251'].includes(score)) return 'About to Sleep'
    if (['155', '154', '144', '214', '215', '115'].includes(score)) return 'At Risk'
    if (['255', '254', '245', '244', '253', '252', '243', '242'].includes(score)) return 'Cannot Lose Them'
    
    return 'Lost'
  }

  // Multi-touch Attribution
  async trackAttribution(touchpoint: {
    customerId?: string
    sessionId: string
    channel: string
    source: string
    medium: string
    campaign?: string
    content?: string
    term?: string
  }) {
    await supabase
      .from('attribution_touchpoints')
      .insert({
        store_id: this.storeId,
        customer_id: touchpoint.customerId,
        session_id: touchpoint.sessionId,
        channel: touchpoint.channel,
        source: touchpoint.source,
        medium: touchpoint.medium,
        campaign: touchpoint.campaign,
        content: touchpoint.content,
        term: touchpoint.term,
        touched_at: new Date().toISOString()
      })
  }

  async calculateAttribution(orderId: string, model: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' = 'linear') {
    const { data: order } = await supabase
      .from('orders')
      .select('customer_id, total_amount, created_at')
      .eq('id', orderId)
      .single()

    if (!order) return

    const { data: touchpoints } = await supabase
      .from('attribution_touchpoints')
      .select('*')
      .eq('store_id', this.storeId)
      .eq('customer_id', order.customer_id)
      .lte('touched_at', order.created_at)
      .order('touched_at', { ascending: true })

    if (!touchpoints || touchpoints.length === 0) return

    const totalValue = order.total_amount
    const attribution = this.calculateAttributionValues(touchpoints, totalValue, model)

    // Update touchpoints with attribution values
    for (const [index, touchpoint] of touchpoints.entries()) {
      await supabase
        .from('attribution_touchpoints')
        .update({
          position_in_journey: index + 1,
          value_contribution: attribution[index],
          attribution_model: model,
          converted: index === touchpoints.length - 1, // Last touchpoint converted
          order_id: orderId,
          conversion_value: index === touchpoints.length - 1 ? totalValue : 0
        })
        .eq('id', touchpoint.id)
    }
  }

  private calculateAttributionValues(touchpoints: any[], totalValue: number, model: string): number[] {
    const count = touchpoints.length
    
    switch (model) {
      case 'first_touch':
        return touchpoints.map((_, index) => index === 0 ? totalValue : 0)
      
      case 'last_touch':
        return touchpoints.map((_, index) => index === count - 1 ? totalValue : 0)
      
      case 'linear':
        const equalValue = totalValue / count
        return touchpoints.map(() => equalValue)
      
      case 'time_decay':
        // Give more weight to recent touchpoints
        const weights = touchpoints.map((_, index) => Math.pow(2, index))
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
        return weights.map(weight => (weight / totalWeight) * totalValue)
      
      default:
        return touchpoints.map(() => totalValue / count)
    }
  }

  // Predictive Analytics
  async generatePredictiveInsights(customerId: string): Promise<PredictiveInsights> {
    const { data: customer } = await supabase
      .from('customers')
      .select(`
        *,
        orders(*),
        analytics:customer_analytics(*)
      `)
      .eq('id', customerId)
      .single()

    if (!customer) throw new Error('Customer not found')

    const analytics = customer.analytics?.[0]
    const orders = customer.orders || []

    // Calculate churn probability
    const churnProbability = this.calculateChurnProbability(customer, orders, analytics)
    
    // Predict lifetime value
    const lifetimeValuePrediction = this.predictLifetimeValue(customer, orders, analytics)
    
    // Calculate next purchase probability
    const nextPurchaseProbability = this.calculateNextPurchaseProbability(customer, orders, analytics)
    
    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(churnProbability, nextPurchaseProbability, analytics)

    const insights: PredictiveInsights = {
      customerId,
      churnProbability,
      lifetimeValuePrediction,
      nextPurchaseProbability,
      recommendedActions
    }

    // Store insights
    await supabase
      .from('customer_analytics')
      .upsert({
        customer_id: customerId,
        store_id: this.storeId,
        churn_probability: churnProbability,
        lifetime_value_prediction: lifetimeValuePrediction,
        next_purchase_probability: nextPurchaseProbability,
        calculated_at: new Date().toISOString()
      }, {
        onConflict: 'customer_id,store_id'
      })

    return insights
  }

  private calculateChurnProbability(customer: any, orders: any[], analytics: any): number {
    if (!orders || orders.length === 0) return 90

    const lastOrderDate = new Date(Math.max(...orders.map(o => new Date(o.created_at).getTime())))
    const daysSinceLastOrder = Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Simple churn model - can be enhanced with ML
    if (daysSinceLastOrder > 365) return 95
    if (daysSinceLastOrder > 180) return 75
    if (daysSinceLastOrder > 90) return 50
    if (daysSinceLastOrder > 30) return 25
    
    return 10
  }

  private predictLifetimeValue(customer: any, orders: any[], analytics: any): number {
    if (!orders || orders.length === 0) return 0

    const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const avgOrderValue = totalSpent / orders.length
    const orderFrequency = orders.length
    
    // Simple CLV prediction - can be enhanced with more sophisticated models
    const estimatedLifespan = 24 // months
    const estimatedOrdersPerMonth = orderFrequency / 12
    
    return avgOrderValue * estimatedOrdersPerMonth * estimatedLifespan
  }

  private calculateNextPurchaseProbability(customer: any, orders: any[], analytics: any): number {
    if (!orders || orders.length === 0) return 10

    const avgDaysBetweenOrders = this.calculateAvgDaysBetweenOrders(orders)
    const lastOrderDate = new Date(Math.max(...orders.map(o => new Date(o.created_at).getTime())))
    const daysSinceLastOrder = Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLastOrder >= avgDaysBetweenOrders) return 80
    if (daysSinceLastOrder >= avgDaysBetweenOrders * 0.8) return 60
    if (daysSinceLastOrder >= avgDaysBetweenOrders * 0.5) return 40
    
    return 20
  }

  private calculateAvgDaysBetweenOrders(orders: any[]): number {
    if (orders.length <= 1) return 90 // Default for single order

    const sortedOrders = orders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const intervals = []

    for (let i = 1; i < sortedOrders.length; i++) {
      const diff = new Date(sortedOrders[i].created_at).getTime() - new Date(sortedOrders[i-1].created_at).getTime()
      intervals.push(Math.floor(diff / (1000 * 60 * 60 * 24)))
    }

    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
  }

  private generateRecommendedActions(churn: number, nextPurchase: number, analytics: any): string[] {
    const actions = []

    if (churn > 70) {
      actions.push('Send win-back campaign immediately')
      actions.push('Offer personalized discount')
      actions.push('Request feedback survey')
    } else if (churn > 40) {
      actions.push('Include in retention campaign')
      actions.push('Send product recommendations')
    }

    if (nextPurchase > 60) {
      actions.push('Send product recommendations')
      actions.push('Offer limited-time promotion')
    }

    if (analytics?.email_engagement_score < 30) {
      actions.push('Reduce email frequency')
      actions.push('Improve email content relevance')
    }

    return actions
  }

  // Track events across all integrations
  async trackEvent(eventName: string, data: any) {
    return this.analyticsManager.trackPageView(data)
  }
}