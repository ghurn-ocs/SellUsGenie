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
    description: 'Perfect for small businesses getting started',
    price: 29,
    interval: 'month',
    currency: 'usd',
    stripePriceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || 'price_starter_monthly',
    features: [
      { name: '2 Online Stores', included: true },
      { name: '30 Products per Store', included: true },
      { name: '1,000 Orders per Month', included: true },
      { name: 'Basic Analytics', included: true },
      { name: 'Email Support', included: true },
      { name: 'Custom Domain', included: false },
      { name: 'API Access', included: false }
    ],
    limits: {
      maxStores: 2,
      maxProducts: 30,
      maxOrders: 1000,
      maxImageUploads: 5, // per product
      maxCustomPages: 10,
      maxBandwidthGB: 10,
      prioritySupport: false,
      customDomain: false,
      advancedAnalytics: true,
      apiAccess: false
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing businesses with full features',
    price: 79,
    interval: 'month',
    currency: 'usd',
    stripePriceId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional_monthly',
    popular: true,
    badge: 'Most Popular',
    features: [
      { name: '5 Online Stores', included: true },
      { name: '50 Products per Store', included: true },
      { name: '10,000 Orders per Month', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Priority Email Support', included: true },
      { name: 'Custom Domain', included: true },
      { name: 'API Access', included: false }
    ],
    limits: {
      maxStores: 5,
      maxProducts: 50,
      maxOrders: 10000,
      maxImageUploads: 20,
      maxCustomPages: -1, // unlimited
      maxBandwidthGB: 100,
      prioritySupport: true,
      customDomain: true,
      advancedAnalytics: true,
      apiAccess: false
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with unlimited potential',
    price: 199,
    interval: 'month',
    currency: 'usd',
    stripePriceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    badge: 'Best Value',
    features: [
      { name: '20 Online Stores', included: true },
      { name: '200 Products per Store', included: true },
      { name: 'Unlimited Orders', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Priority Phone Support', included: true },
      { name: 'Custom Domain', included: true },
      { name: 'API Access', included: true }
    ],
    limits: {
      maxStores: 20,
      maxProducts: 200,
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