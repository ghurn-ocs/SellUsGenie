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

    // Get the base URL for webhooks
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : req.headers.origin || 'http://localhost:3000';

    // Create webhook endpoint in Stripe
    const endpoint = await stripe.webhookEndpoints.create({
      url: `${baseUrl}/api/stripe/webhook`,
      enabled_events: [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'invoice.payment_succeeded',
        'customer.subscription.updated',
        'customer.subscription.deleted',
      ],
      metadata: {
        storeId: storeId
      }
    });

    // Update Stripe configuration in database
    await supabase
      .from('stripe_configurations')
      .update({
        webhook_endpoint_id: endpoint.id,
        webhook_secret: endpoint.secret,
        webhook_events_enabled: endpoint.enabled_events,
        configuration_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('store_id', storeId);

    res.status(200).json({
      success: true,
      webhook: {
        id: endpoint.id,
        url: endpoint.url,
        status: endpoint.status
      }
    });

  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ 
      error: 'Failed to create webhook',
      message: error.message 
    });
  }
}