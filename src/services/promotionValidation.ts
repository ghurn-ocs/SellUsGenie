import { supabase } from '../lib/supabase'

export interface PromotionValidationRequest {
  store_id: string
  code: string
  subtotal: number
  customer_id?: string
  cart_items?: Array<{
    product_id: string
    quantity: number
    category_id?: string
  }>
}

export interface PromotionValidationResponse {
  valid: boolean
  promotion?: {
    id: string
    code: string
    name: string
    type: string
    value: number
    discount_amount: number
    min_order_amount: number
    max_discount_amount?: number
  }
  error?: string
}

export const validatePromotionCode = async (
  request: PromotionValidationRequest
): Promise<PromotionValidationResponse> => {
  const { store_id, code, subtotal, customer_id, cart_items = [] } = request

  try {
    // Get promotion details
    const { data: promotion, error: promotionError } = await supabase
      .from('promotions')
      .select('*')
      .eq('store_id', store_id)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (promotionError || !promotion) {
      return {
        valid: false,
        error: 'Invalid promotion code'
      }
    }

    // Check if promotion is currently valid (date range)
    const now = new Date()
    const startsAt = new Date(promotion.starts_at)
    const endsAt = promotion.ends_at ? new Date(promotion.ends_at) : null

    if (startsAt > now) {
      return {
        valid: false,
        error: 'This promotion has not started yet'
      }
    }

    if (endsAt && endsAt < now) {
      return {
        valid: false,
        error: 'This promotion has expired'
      }
    }

    // Check usage limits
    if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
      return {
        valid: false,
        error: 'This promotion has reached its usage limit'
      }
    }

    // Check minimum order amount
    if (promotion.min_order_amount > 0 && subtotal < promotion.min_order_amount) {
      return {
        valid: false,
        error: `Minimum order amount of $${promotion.min_order_amount.toFixed(2)} required`
      }
    }

    // Check per-customer usage limit
    if (customer_id && promotion.max_uses_per_customer > 0) {
      const { data: customerUsage } = await supabase
        .from('promotion_usage')
        .select('id')
        .eq('promotion_id', promotion.id)
        .eq('customer_id', customer_id)

      if (customerUsage && customerUsage.length >= promotion.max_uses_per_customer) {
        return {
          valid: false,
          error: 'You have reached the usage limit for this promotion'
        }
      }
    }

    // Check first-order-only restriction
    if (promotion.first_order_only && customer_id) {
      const { data: customerOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('store_id', store_id)
        .eq('customer_id', customer_id)
        .neq('status', 'cancelled')

      if (customerOrders && customerOrders.length > 0) {
        return {
          valid: false,
          error: 'This promotion is only valid for first-time customers'
        }
      }
    }

    // Calculate discount amount
    let discount_amount = 0

    switch (promotion.type) {
      case 'PERCENTAGE':
        discount_amount = (subtotal * promotion.value) / 100
        if (promotion.max_discount_amount && discount_amount > promotion.max_discount_amount) {
          discount_amount = promotion.max_discount_amount
        }
        break

      case 'FIXED_AMOUNT':
        discount_amount = Math.min(promotion.value, subtotal)
        break

      case 'FREE_SHIPPING':
        // This would need to be calculated based on actual shipping cost
        // For now, we'll use a fixed amount or let the checkout flow handle it
        discount_amount = 0 // Will be handled in shipping calculation
        break

      case 'BOGO':
        // Calculate BOGO discount based on cart items
        if (cart_items.length > 0) {
          // Simple BOGO: get the cheapest item free for every 2 items
          // This is a simplified implementation - real BOGO might be more complex
          const eligible_items = cart_items.filter(item => 
            (!promotion.eligible_products?.length || promotion.eligible_products.includes(item.product_id)) &&
            (!promotion.excluded_products?.length || !promotion.excluded_products.includes(item.product_id))
          )
          
          // For now, just apply a fixed discount based on quantity
          discount_amount = Math.min(subtotal * 0.25, promotion.max_discount_amount || subtotal)
        }
        break

      case 'TIERED':
        // Tiered discounts would need more complex logic
        // For now, apply the base value
        discount_amount = Math.min(promotion.value, subtotal)
        break

      default:
        discount_amount = 0
    }

    // Ensure discount doesn't exceed subtotal
    discount_amount = Math.min(discount_amount, subtotal)

    return {
      valid: true,
      promotion: {
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
        type: promotion.type,
        value: promotion.value,
        discount_amount,
        min_order_amount: promotion.min_order_amount,
        max_discount_amount: promotion.max_discount_amount
      }
    }

  } catch (error) {
    console.error('Error validating promotion code:', error)
    return {
      valid: false,
      error: 'Failed to validate promotion code'
    }
  }
}

// Function to record promotion usage after successful order
export const recordPromotionUsage = async (
  promotion_id: string,
  order_id: string,
  customer_id?: string,
  discount_amount?: number
): Promise<void> => {
  try {
    // Record usage
    await supabase.from('promotion_usage').insert([{
      promotion_id,
      order_id,
      customer_id,
      discount_amount,
      used_at: new Date().toISOString()
    }])

    // Increment usage count
    await supabase
      .from('promotions')
      .update({ 
        current_uses: supabase.raw('current_uses + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', promotion_id)

  } catch (error) {
    console.error('Error recording promotion usage:', error)
    // Don't throw - this shouldn't prevent order completion
  }
}