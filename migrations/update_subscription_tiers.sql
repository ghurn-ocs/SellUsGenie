-- Migration: Update subscription tiers to match new three-tier pricing model
-- Updates tier names from old system to new Stripe Product: prod_StOKpFG8TNUPvP

BEGIN;

-- Update store_owners table subscription tiers
UPDATE store_owners 
SET subscription_tier = CASE 
    WHEN subscription_tier = 'basic' THEN 'starter'
    WHEN subscription_tier = 'pro' THEN 'professional'
    WHEN subscription_tier = 'enterprise' THEN 'enterprise'
    ELSE subscription_tier -- Keep 'trial' as is
END;

-- Update store_owner_subscriptions table plan types
UPDATE store_owner_subscriptions 
SET plan_type = CASE 
    WHEN plan_type = 'basic' THEN 'starter'
    WHEN plan_type = 'pro' THEN 'professional' 
    WHEN plan_type = 'enterprise' THEN 'enterprise'
    ELSE plan_type -- Keep 'trial' as is
END;

-- Update database constraints to reflect new tier names
ALTER TABLE store_owners 
DROP CONSTRAINT IF EXISTS store_owners_subscription_tier_check;

ALTER TABLE store_owners 
ADD CONSTRAINT store_owners_subscription_tier_check 
CHECK (subscription_tier IN ('trial', 'starter', 'professional', 'enterprise'));

ALTER TABLE store_owner_subscriptions 
DROP CONSTRAINT IF EXISTS store_owner_subscriptions_plan_type_check;

ALTER TABLE store_owner_subscriptions 
ADD CONSTRAINT store_owner_subscriptions_plan_type_check 
CHECK (plan_type IN ('trial', 'starter', 'professional', 'enterprise'));

-- Add Product ID tracking for future reference
ALTER TABLE store_owner_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT DEFAULT 'prod_StOKpFG8TNUPvP';

-- Update existing subscriptions with the new product ID
UPDATE store_owner_subscriptions 
SET stripe_product_id = 'prod_StOKpFG8TNUPvP' 
WHERE stripe_product_id IS NULL;

COMMIT;

-- Verification queries (uncomment to run after migration)
-- SELECT subscription_tier, COUNT(*) FROM store_owners GROUP BY subscription_tier;
-- SELECT plan_type, COUNT(*) FROM store_owner_subscriptions GROUP BY plan_type;
-- SELECT stripe_product_id, COUNT(*) FROM store_owner_subscriptions GROUP BY stripe_product_id;