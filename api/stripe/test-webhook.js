const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
    const { storeId } = req.body;

    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    // Get webhook configuration
    const { data: config } = await supabase
      .from('stripe_configurations')
      .select('webhook_endpoint_id')
      .eq('store_id', storeId)
      .single();

    if (!config?.webhook_endpoint_id) {
      return res.status(404).json({ error: 'Webhook not configured' });
    }

    // Create a test payment intent to trigger webhook
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00 test amount
      currency: 'usd',
      metadata: {
        storeId: storeId,
        test: 'true'
      }
    });

    // Simulate success for testing
    await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: 'pm_card_visa' // Test payment method
    });

    // Update last test timestamp
    await supabase
      .from('stripe_configurations')
      .update({
        last_webhook_test: new Date().toISOString()
      })
      .eq('store_id', storeId);

    res.status(200).json({
      success: true,
      message: 'Webhook test initiated',
      testPaymentIntent: paymentIntent.id
    });

  } catch (error) {
    console.error('Error testing webhook:', error);
    res.status(500).json({ 
      error: 'Failed to test webhook',
      message: error.message 
    });
  }
}