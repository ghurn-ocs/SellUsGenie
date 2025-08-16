const stripe = require('stripe');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publishableKey, secretKey, storeId } = req.body;

    if (!publishableKey || !secretKey || !storeId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate key formats
    if (!publishableKey.startsWith('pk_')) {
      return res.status(400).json({ error: 'Invalid publishable key format' });
    }

    if (!secretKey.startsWith('sk_')) {
      return res.status(400).json({ error: 'Invalid secret key format' });
    }

    // Check if keys are from same environment
    const pubKeyEnv = publishableKey.includes('_live_') ? 'live' : 'test';
    const secretKeyEnv = secretKey.includes('_live_') ? 'live' : 'test';

    if (pubKeyEnv !== secretKeyEnv) {
      return res.status(400).json({ 
        error: 'Publishable key and secret key must be from the same environment (both test or both live)' 
      });
    }

    // Initialize Stripe with provided secret key
    const stripeInstance = stripe(secretKey);

    // Test the secret key by making a simple API call
    try {
      const account = await stripeInstance.accounts.retrieve();
      
      // Verify the account is valid
      if (!account.id) {
        throw new Error('Invalid account response');
      }

      res.status(200).json({
        success: true,
        environment: secretKeyEnv,
        accountId: account.id,
        accountName: account.display_name || account.business_profile?.name || 'Unnamed Account',
        country: account.country,
        currency: account.default_currency
      });

    } catch (stripeError) {
      console.error('Stripe API validation error:', stripeError);
      
      if (stripeError.type === 'StripeAuthenticationError') {
        return res.status(401).json({ 
          error: 'Invalid secret key - authentication failed' 
        });
      }
      
      return res.status(400).json({ 
        error: 'Invalid API keys',
        details: stripeError.message 
      });
    }

  } catch (error) {
    console.error('Error validating API keys:', error);
    res.status(500).json({ 
      error: 'Failed to validate API keys',
      message: error.message 
    });
  }
}