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

    // Get the base URL for webhooks - prioritize production domain
    let baseUrl;
    
    if (process.env.NODE_ENV === 'production') {
      // Production: Use fixed production domain
      baseUrl = process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://app.sellusgenie.com';
    } else if (process.env.VERCEL_URL) {
      // Development on Vercel
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      // Local development
      baseUrl = req.headers.origin || 'http://localhost:5173';
    }
    
    console.log('Creating webhook with base URL:', baseUrl);

    // Get store's Stripe configuration to use their API keys
    const { data: stripeConfig, error: configError } = await supabase
      .from('stripe_configurations')
      .select('stripe_secret_key_encrypted, is_live_mode')
      .eq('store_id', storeId)
      .single();

    if (configError || !stripeConfig) {
      return res.status(400).json({ error: 'Store Stripe configuration not found' });
    }

    // Use the store owner's Stripe instance
    const storeStripe = require('stripe')(stripeConfig.stripe_secret_key_encrypted);

    // Create webhook endpoint in store owner's Stripe account
    const endpoint = await storeStripe.webhookEndpoints.create({
      url: `${baseUrl}/api/stripe/storefront-webhook?storeId=${storeId}`,
      enabled_events: [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'charge.succeeded',
        'charge.failed',
      ],
      metadata: {
        storeId: storeId,
        platform: 'sellusgenie'
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