const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const { storeId } = req.query; // Pass storeId in the webhook URL

  if (!storeId) {
    return res.status(400).json({ error: 'Store ID is required in webhook URL' });
  }

  try {
    // Get the store's Stripe configuration from database
    const { data: stripeConfig, error: configError } = await supabase
      .from('stripe_configurations')
      .select('webhook_secret, stripe_secret_key_encrypted, is_live_mode')
      .eq('store_id', storeId)
      .single();

    if (configError || !stripeConfig) {
      console.error('Store Stripe configuration not found:', storeId);
      return res.status(400).json({ error: 'Store configuration not found' });
    }

    // Initialize Stripe with the store owner's secret key
    // Note: In production, stripe_secret_key_encrypted should be decrypted
    const storeStripe = stripe(stripeConfig.stripe_secret_key_encrypted);
    
    // Verify webhook signature using store's webhook secret
    let event;
    try {
      event = storeStripe.webhooks.constructEvent(
        req.body, 
        sig, 
        stripeConfig.webhook_secret
      );
    } catch (err) {
      console.error('Webhook signature verification failed for store:', storeId, err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('Received storefront webhook for store:', storeId, 'event:', event.type);

    // Store webhook event in database for tracking
    await supabase.from('storefront_webhook_events').insert({
      store_id: storeId,
      stripe_event_id: event.id,
      event_type: event.type,
      processed: false,
      processing_attempts: 0,
      event_data: event.data,
      created_at: new Date().toISOString()
    });

    // Handle the event based on type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleStorefrontPaymentSucceeded(event.data.object, storeId);
        break;
      
      case 'payment_intent.payment_failed':
        await handleStorefrontPaymentFailed(event.data.object, storeId);
        break;
      
      case 'charge.succeeded':
        await handleStorefrontChargeSucceeded(event.data.object, storeId);
        break;
        
      case 'charge.failed':
        await handleStorefrontChargeFailed(event.data.object, storeId);
        break;
      
      default:
        console.log(`Unhandled storefront event type for store ${storeId}: ${event.type}`);
    }

    // Mark webhook as processed
    await supabase
      .from('storefront_webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('stripe_event_id', event.id)
      .eq('store_id', storeId);

    res.json({ received: true });

  } catch (error) {
    console.error('Error processing storefront webhook for store:', storeId, error);
    
    // Update webhook event with error
    await supabase
      .from('storefront_webhook_events')
      .update({ 
        processing_attempts: 1,
        error_message: error.message 
      })
      .eq('stripe_event_id', event?.id)
      .eq('store_id', storeId);

    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleStorefrontPaymentSucceeded(paymentIntent, storeId) {
  console.log('Storefront payment succeeded for store:', storeId, 'payment:', paymentIntent.id);
  
  try {
    // Find the order associated with this payment
    const orderId = paymentIntent.metadata?.orderId;
    
    if (orderId) {
      // Update order status to paid/processing
      await supabase
        .from('orders')
        .update({ 
          status: 'processing',
          payment_status: 'paid',
          payment_intent_id: paymentIntent.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('store_id', storeId);

      // Update inventory quantities
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          await supabase.rpc('decrement_inventory', {
            product_id: item.product_id,
            decrement_amount: item.quantity
          });
        }
      }

      console.log('✅ Order updated successfully:', orderId);
      
      // TODO: Send order confirmation email
      // TODO: Create shipping label if needed
      // TODO: Notify store owner of new order
    }
  } catch (error) {
    console.error('Error handling storefront payment succeeded:', error);
    throw error;
  }
}

async function handleStorefrontPaymentFailed(paymentIntent, storeId) {
  console.log('Storefront payment failed for store:', storeId, 'payment:', paymentIntent.id);
  
  try {
    const orderId = paymentIntent.metadata?.orderId;
    
    if (orderId) {
      // Update order status to cancelled
      await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          payment_status: 'failed',
          payment_intent_id: paymentIntent.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('store_id', storeId);

      console.log('❌ Order marked as cancelled:', orderId);
      
      // TODO: Send payment failure notification
      // TODO: Release any reserved inventory
    }
  } catch (error) {
    console.error('Error handling storefront payment failed:', error);
    throw error;
  }
}

async function handleStorefrontChargeSucceeded(charge, storeId) {
  console.log('Storefront charge succeeded for store:', storeId, 'charge:', charge.id);
  
  // Additional charge handling logic can go here
  // This is called after payment_intent.succeeded for additional processing
}

async function handleStorefrontChargeFailed(charge, storeId) {
  console.log('Storefront charge failed for store:', storeId, 'charge:', charge.id);
  
  // Additional charge failure handling logic
}