-- Create store policies table for Privacy Policy, Returns Policy, and About Us
CREATE TABLE IF NOT EXISTS store_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    privacy_policy TEXT,
    returns_policy TEXT,
    about_us TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id)
);

-- Enable RLS
ALTER TABLE store_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Store policies are viewable by store owner and customers" 
ON store_policies FOR SELECT 
USING (
    -- Allow store owners to see their own policies
    EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = store_policies.store_id 
        AND stores.store_owner_id = auth.uid()
    )
    OR
    -- Allow anyone to read policies for public access (storefront)
    TRUE
);

CREATE POLICY "Store policies are insertable by store owner" 
ON store_policies FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = store_policies.store_id 
        AND stores.store_owner_id = auth.uid()
    )
);

CREATE POLICY "Store policies are updatable by store owner" 
ON store_policies FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = store_policies.store_id 
        AND stores.store_owner_id = auth.uid()
    )
);

CREATE POLICY "Store policies are deletable by store owner" 
ON store_policies FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = store_policies.store_id 
        AND stores.store_owner_id = auth.uid()
    )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_store_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_policies_updated_at
    BEFORE UPDATE ON store_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_store_policies_updated_at();