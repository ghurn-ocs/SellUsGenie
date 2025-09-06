// Store Owner Stripe payment intent creation endpoint
// Creates payment intents using individual store owner's Stripe configuration

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, orderId, storeId, metadata } = req.body;

    if (!amount || !currency || !orderId || !storeId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get the store's Stripe configuration
    const { data: stripeConfig, error: configError } = await supabase
      .from('stripe_configurations')
      .select('stripe_secret_key_encrypted, is_live_mode, is_configured')
      .eq('store_id', storeId)
      .single();

    if (configError || !stripeConfig || !stripeConfig.is_configured) {
      console.error('Store Stripe configuration not found or not configured:', storeId);
      return res.status(400).json({ error: 'Store payment processing not configured' });
    }

    // Initialize Stripe with the store owner's secret key
    const stripe = require('stripe')(stripeConfig.stripe_secret_key_encrypted);

    // Create payment intent using store owner's Stripe account
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        orderId,
        storeId,
        platform: 'sellusgenie',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created for store:', storeId, 'intent:', paymentIntent.id);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}