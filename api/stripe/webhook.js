const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for server-side operations
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Log the webhook event
  console.log('Received Stripe webhook:', event.type, event.id);

  try {
    // Store webhook event in database for tracking
    await supabase.from('webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed: false,
      processing_attempts: 0,
      event_data: event.data,
      store_id: event.data.object.metadata?.storeId || null
    });

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed
    await supabase
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('stripe_event_id', event.id);

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Update webhook event with error
    await supabase
      .from('webhook_events')
      .update({ 
        processing_attempts: 1,
        error_message: error.message 
      })
      .eq('stripe_event_id', event.id);

    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update payment intent status
  await supabase
    .from('payment_intents')
    .update({ status: 'succeeded' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // Update order status
  const { data: paymentIntentRecord } = await supabase
    .from('payment_intents')
    .select('order_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (paymentIntentRecord?.order_id) {
    await supabase
      .from('orders')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentIntentRecord.order_id);

    // TODO: Send confirmation email
    // TODO: Update inventory
    // TODO: Create shipping label
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Update payment intent status
  await supabase
    .from('payment_intents')
    .update({ status: 'payment_failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // Update order status
  const { data: paymentIntentRecord } = await supabase
    .from('payment_intents')
    .select('order_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (paymentIntentRecord?.order_id) {
    await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentIntentRecord.order_id);

    // TODO: Send payment failure notification
    // TODO: Release reserved inventory
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  // Handle subscription payments
  if (invoice.subscription) {
    // Update store subscription status
    const customerId = invoice.customer;
    
    // Find store by customer ID
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (store) {
      await supabase
        .from('stores')
        .update({
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', store.id);
    }
  }
}

// Helper function to map Stripe price ID to plan type
function mapPriceIdToPlanType(priceId) {
  const priceMap = {
    [process.env.VITE_STRIPE_STARTER_PRICE_ID]: 'starter',
    [process.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID]: 'professional', 
    [process.env.VITE_STRIPE_ENTERPRISE_PRICE_ID]: 'enterprise'
  };
  
  return priceMap[priceId] || 'trial';
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  const customerId = subscription.customer;
  const priceId = subscription.items.data[0]?.price?.id;
  const planType = mapPriceIdToPlanType(priceId);
  
  // Find store owner by customer ID
  const { data: storeOwner } = await supabase
    .from('store_owners')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (storeOwner) {
    // Update store owner subscription tier
    await supabase
      .from('store_owners')
      .update({
        subscription_tier: planType,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeOwner.id);

    // Create subscription record
    await supabase
      .from('store_owner_subscriptions')
      .insert({
        store_owner_id: storeOwner.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_type: planType,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      });

    // Update all stores owned by this store owner
    await supabase
      .from('stores')
      .update({
        subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('store_owner_id', storeOwner.id);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const customerId = subscription.customer;
  const priceId = subscription.items.data[0]?.price?.id;
  const planType = mapPriceIdToPlanType(priceId);
  
  // Find store owner by customer ID
  const { data: storeOwner } = await supabase
    .from('store_owners')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (storeOwner) {
    // Update store owner subscription tier
    await supabase
      .from('store_owners')
      .update({
        subscription_tier: planType,
        updated_at: new Date().toISOString()
      })
      .eq('id', storeOwner.id);

    // Update subscription record
    await supabase
      .from('store_owner_subscriptions')
      .update({
        plan_type: planType,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    // Update all stores owned by this store owner
    const status = subscription.status === 'active' ? 'active' : 'inactive';
    await supabase
      .from('stores')
      .update({
        subscription_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('store_owner_id', storeOwner.id);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const customerId = subscription.customer;
  
  // Find store owner by customer ID
  const { data: storeOwner } = await supabase
    .from('store_owners')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (storeOwner) {
    // Revert store owner to trial tier
    await supabase
      .from('store_owners')
      .update({
        subscription_tier: 'trial',
        trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days grace period
        updated_at: new Date().toISOString()
      })
      .eq('id', storeOwner.id);

    // Update subscription record status
    await supabase
      .from('store_owner_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    // Update all stores to trial status
    await supabase
      .from('stores')
      .update({
        subscription_status: 'trial',
        trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('store_owner_id', storeOwner.id);
  }
}