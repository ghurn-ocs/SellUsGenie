import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { customerId } = req.body

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' })
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings?tab=subscription`,
    })

    res.status(200).json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    res.status(500).json({ 
      message: 'Failed to create customer portal session',
      error: error.message 
    })
  }
}