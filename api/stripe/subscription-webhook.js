import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { buffer } from 'micro'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ message: `Webhook Error: ${err.message}` })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ message: 'Webhook processing failed' })
  }
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId
  const planId = session.metadata.planId
  
  if (!userId || !planId) {
    console.error('Missing userId or planId in checkout session metadata')
    return
  }

  // Get subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(session.subscription)
  
  await createOrUpdateSubscription(userId, planId, subscription)
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userId
  const planId = subscription.metadata.planId
  
  if (!userId || !planId) {
    console.error('Missing userId or planId in subscription metadata')
    return
  }
  
  await createOrUpdateSubscription(userId, planId, subscription)
}

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.userId
  const planId = subscription.metadata.planId
  
  if (!userId) {
    console.error('Missing userId in subscription metadata')
    return
  }
  
  await createOrUpdateSubscription(userId, planId, subscription)
}

async function handleSubscriptionDeleted(subscription) {
  // Mark subscription as canceled in database
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    // Update subscription status to active if it was past_due
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription)
  }
}

async function handlePaymentFailed(invoice) {
  if (invoice.subscription) {
    // Update subscription status to past_due
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription)
  }
}

async function createOrUpdateSubscription(userId, planId, stripeSubscription) {
  const subscriptionData = {
    user_id: userId,
    plan_id: planId || 'starter', // fallback to starter
    status: stripeSubscription.status,
    current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    stripe_subscription_id: stripeSubscription.id,
    stripe_customer_id: stripeSubscription.customer,
    updated_at: new Date().toISOString()
  }

  // Check if subscription already exists
  const { data: existingSubscription } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('stripe_subscription_id', stripeSubscription.id)
    .single()

  if (existingSubscription) {
    // Update existing subscription
    await supabase
      .from('user_subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id)
  } else {
    // Create new subscription
    subscriptionData.created_at = new Date().toISOString()
    await supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
  }

  // Cancel any other active subscriptions for this user
  await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'canceled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .neq('stripe_subscription_id', stripeSubscription.id)
    .in('status', ['active', 'trialing'])
}