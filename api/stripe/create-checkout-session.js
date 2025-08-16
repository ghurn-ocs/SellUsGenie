import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Map plan IDs to Stripe Price IDs
const PLAN_PRICE_MAPPING = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const {
      userId,
      planId,
      email,
      name,
      phone,
      companyName,
      billingAddress
    } = req.body

    if (!userId || !planId || !email || !name || !billingAddress) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const stripePriceId = PLAN_PRICE_MAPPING[planId]
    if (!stripePriceId) {
      return res.status(400).json({ message: 'Invalid plan ID' })
    }

    // Check if user already has a Stripe customer ID
    let { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = userData?.stripe_customer_id

    // Create or update Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name,
        phone,
        metadata: {
          userId,
          companyName: companyName || ''
        },
        address: {
          line1: billingAddress.line1,
          line2: billingAddress.line2 || '',
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.postalCode,
          country: billingAddress.country
        }
      })
      
      customerId = customer.id

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    } else {
      // Update existing customer
      await stripe.customers.update(customerId, {
        email,
        name,
        phone,
        metadata: {
          userId,
          companyName: companyName || ''
        },
        address: {
          line1: billingAddress.line1,
          line2: billingAddress.line2 || '',
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.postalCode,
          country: billingAddress.country
        }
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=subscription&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=subscription`,
      metadata: {
        userId,
        planId
      },
      subscription_data: {
        metadata: {
          userId,
          planId
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ 
      message: 'Failed to create checkout session',
      error: error.message 
    })
  }
}