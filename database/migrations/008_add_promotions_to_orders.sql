-- =====================================================
-- Add Promotion Columns to Orders Table
-- Version: 1.0
-- Date: January 2025
-- Description: Add promotion tracking columns to existing orders table
-- =====================================================

-- Add promotion-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id),
ADD COLUMN IF NOT EXISTS promotion_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_promotion_id ON orders(promotion_id);
CREATE INDEX IF NOT EXISTS idx_orders_promotion_code ON orders(promotion_code);

-- Add RLS policies (orders table should already have RLS enabled)
-- No additional RLS policies needed as existing store_id policies will handle access control

COMMIT;