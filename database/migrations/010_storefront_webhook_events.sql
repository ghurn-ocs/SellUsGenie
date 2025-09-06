-- Migration: Create storefront_webhook_events table
-- File: 010_storefront_webhook_events.sql
-- Description: Table to track webhook events from store owners' Stripe accounts

-- Create storefront_webhook_events table
CREATE TABLE IF NOT EXISTS public.storefront_webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    stripe_event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processing_attempts INTEGER DEFAULT 0,
    event_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storefront_webhook_events_store_id ON public.storefront_webhook_events(store_id);
CREATE INDEX IF NOT EXISTS idx_storefront_webhook_events_stripe_event_id ON public.storefront_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_storefront_webhook_events_processed ON public.storefront_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_storefront_webhook_events_event_type ON public.storefront_webhook_events(event_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_storefront_webhook_events_unique ON public.storefront_webhook_events(store_id, stripe_event_id);

-- Add RLS policies
ALTER TABLE public.storefront_webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Store owners can only see their own webhook events
CREATE POLICY "Store owners can view their own webhook events" ON public.storefront_webhook_events
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM public.stores 
            WHERE store_owner_id = auth.uid()
        )
    );

-- Policy: System can insert webhook events (using service role)
CREATE POLICY "System can insert webhook events" ON public.storefront_webhook_events
    FOR INSERT WITH CHECK (true);

-- Policy: System can update webhook events (using service role)  
CREATE POLICY "System can update webhook events" ON public.storefront_webhook_events
    FOR UPDATE USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.storefront_webhook_events IS 'Webhook events received from store owners Stripe accounts';
COMMENT ON COLUMN public.storefront_webhook_events.store_id IS 'Reference to the store that owns this webhook event';
COMMENT ON COLUMN public.storefront_webhook_events.stripe_event_id IS 'Unique Stripe event ID';
COMMENT ON COLUMN public.storefront_webhook_events.event_type IS 'Type of Stripe event (payment_intent.succeeded, etc.)';
COMMENT ON COLUMN public.storefront_webhook_events.processed IS 'Whether this webhook event has been processed';
COMMENT ON COLUMN public.storefront_webhook_events.processing_attempts IS 'Number of times processing was attempted';
COMMENT ON COLUMN public.storefront_webhook_events.event_data IS 'Full Stripe event data as JSON';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_storefront_webhook_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_storefront_webhook_events_updated_at_trigger
    BEFORE UPDATE ON public.storefront_webhook_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_storefront_webhook_events_updated_at();

-- Add function to decrement inventory (if not exists)
CREATE OR REPLACE FUNCTION public.decrement_inventory(product_id UUID, decrement_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products 
    SET 
        inventory_quantity = GREATEST(0, inventory_quantity - decrement_amount),
        updated_at = NOW()
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;