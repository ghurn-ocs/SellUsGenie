import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { UserSubscription, SubscriptionCheckoutData } from '../types/subscription'

export const useSubscription = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Get current user subscription
  const {
    data: subscription,
    isLoading,
    error
  } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data as UserSubscription | null
    },
    enabled: !!user?.id
  })

  // Create Stripe checkout session
  const createCheckoutSession = useMutation({
    mutationFn: async (checkoutData: SubscriptionCheckoutData) => {
      if (!user?.id) throw new Error('User not authenticated')

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...checkoutData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      return url
    },
    onSuccess: (checkoutUrl) => {
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl
    }
  })

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to cancel subscription')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] })
    }
  })

  // Update billing information
  const updateBilling = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create customer portal session')
      }

      const { url } = await response.json()
      return url
    },
    onSuccess: (portalUrl) => {
      window.location.href = portalUrl
    }
  })

  // Get subscription limits and features
  const getSubscriptionLimits = () => {
    if (!subscription) {
      // Trial limits
      return {
        maxStores: 2,
        maxProducts: 10,
        maxOrders: 50,
        maxImageUploads: 1,
        maxCustomPages: 5,
        maxBandwidthGB: 1,
        prioritySupport: false,
        customDomain: false,
        advancedAnalytics: false,
        apiAccess: false
      }
    }

    // Return limits based on plan
    switch (subscription.plan_id) {
      case 'starter':
        return {
          maxStores: 5,
          maxProducts: 100,
          maxOrders: 1000,
          maxImageUploads: 5,
          maxCustomPages: 10,
          maxBandwidthGB: 10,
          prioritySupport: false,
          customDomain: false,
          advancedAnalytics: false,
          apiAccess: false
        }
      case 'professional':
        return {
          maxStores: 25,
          maxProducts: 1000,
          maxOrders: 10000,
          maxImageUploads: 20,
          maxCustomPages: 50,
          maxBandwidthGB: 100,
          prioritySupport: true,
          customDomain: true,
          advancedAnalytics: true,
          apiAccess: true
        }
      case 'enterprise':
        return {
          maxStores: -1, // unlimited
          maxProducts: -1,
          maxOrders: -1,
          maxImageUploads: -1,
          maxCustomPages: -1,
          maxBandwidthGB: -1,
          prioritySupport: true,
          customDomain: true,
          advancedAnalytics: true,
          apiAccess: true
        }
      default:
        // Trial limits as fallback
        return {
          maxStores: 2,
          maxProducts: 10,
          maxOrders: 50,
          maxImageUploads: 1,
          maxCustomPages: 5,
          maxBandwidthGB: 1,
          prioritySupport: false,
          customDomain: false,
          advancedAnalytics: false,
          apiAccess: false
        }
    }
  }

  const isTrialUser = !subscription || subscription.status === 'trialing'
  const isPaidUser = subscription && ['active', 'past_due'].includes(subscription.status)
  const subscriptionLimits = getSubscriptionLimits()

  return {
    subscription,
    isLoading,
    error,
    isTrialUser,
    isPaidUser,
    subscriptionLimits,
    createCheckoutSession,
    cancelSubscription,
    updateBilling
  }
}