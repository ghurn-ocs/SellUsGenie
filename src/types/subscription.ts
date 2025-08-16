export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  currency: string
  stripePriceId: string
  features: SubscriptionFeature[]
  limits: SubscriptionLimits
  popular?: boolean
  badge?: string
}

export interface SubscriptionFeature {
  name: string
  included: boolean
  description?: string
}

export interface SubscriptionLimits {
  maxStores: number
  maxProducts: number
  maxOrders: number
  maxImageUploads: number
  maxCustomPages: number
  maxBandwidthGB: number
  prioritySupport: boolean
  customDomain: boolean
  advancedAnalytics: boolean
  apiAccess: boolean
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId: string
  stripeCustomerId: string
  createdAt: string
  updatedAt: string
}

export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface SubscriptionCheckoutData {
  planId: string
  billingAddress: BillingAddress
  email: string
  name: string
  phone?: string
  companyName?: string
}

// Predefined subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small businesses getting started',
    price: 29,
    interval: 'month',
    currency: 'usd',
    stripePriceId: 'price_starter_monthly', // Will be replaced with actual Stripe price IDs
    features: [
      { name: '5 Online Stores', included: true },
      { name: '100 Products per Store', included: true },
      { name: '1,000 Orders per Month', included: true },
      { name: '10GB Bandwidth', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Email Support', included: true },
      { name: 'Custom Domain', included: false },
      { name: 'Priority Support', included: false },
      { name: 'API Access', included: false }
    ],
    limits: {
      maxStores: 5,
      maxProducts: 100,
      maxOrders: 1000,
      maxImageUploads: 5, // per product
      maxCustomPages: 10,
      maxBandwidthGB: 10,
      prioritySupport: false,
      customDomain: false,
      advancedAnalytics: false,
      apiAccess: false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing businesses with multiple stores',
    price: 79,
    interval: 'month',
    currency: 'usd',
    stripePriceId: 'price_professional_monthly',
    popular: true,
    badge: 'Most Popular',
    features: [
      { name: '25 Online Stores', included: true },
      { name: '1,000 Products per Store', included: true },
      { name: '10,000 Orders per Month', included: true },
      { name: '100GB Bandwidth', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Priority Email Support', included: true },
      { name: 'Custom Domain', included: true },
      { name: 'API Access', included: true },
      { name: 'Phone Support', included: false }
    ],
    limits: {
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
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with unlimited growth potential',
    price: 199,
    interval: 'month',
    currency: 'usd',
    stripePriceId: 'price_enterprise_monthly',
    badge: 'Best Value',
    features: [
      { name: 'Unlimited Stores', included: true },
      { name: 'Unlimited Products', included: true },
      { name: 'Unlimited Orders', included: true },
      { name: 'Unlimited Bandwidth', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: '24/7 Phone Support', included: true },
      { name: 'Custom Domain', included: true },
      { name: 'Full API Access', included: true },
      { name: 'Dedicated Account Manager', included: true }
    ],
    limits: {
      maxStores: -1, // -1 means unlimited
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
  }
]