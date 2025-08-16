-- Claude Prompt Settings Database Schema
-- This extends the existing StreamSell database with AI prompt management

-- Claude prompt templates (store-level)
CREATE TABLE claude_prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_category VARCHAR(100) NOT NULL CHECK (template_category IN ('product_description', 'marketing_copy', 'customer_support', 'seo_optimization', 'email_campaign', 'social_media')),
    prompt_text TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Array of variable names like ["product_name", "category", "tone"]
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- Whether this is a system default template
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, template_name)
);

-- Claude prompt usage tracking
CREATE TABLE claude_prompt_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    template_id UUID REFERENCES claude_prompt_templates(id) ON DELETE SET NULL,
    prompt_text TEXT NOT NULL,
    generated_content TEXT,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,4),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    context JSONB, -- Additional context about the usage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claude prompt settings (store-level configuration)
CREATE TABLE claude_prompt_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, setting_key)
);

-- Create indexes for performance
CREATE INDEX idx_claude_prompt_templates_store_id ON claude_prompt_templates(store_id);
CREATE INDEX idx_claude_prompt_templates_category ON claude_prompt_templates(template_category);
CREATE INDEX idx_claude_prompt_templates_active ON claude_prompt_templates(is_active);
CREATE INDEX idx_claude_prompt_usage_store_id ON claude_prompt_usage(store_id);
CREATE INDEX idx_claude_prompt_usage_created_at ON claude_prompt_usage(created_at);
CREATE INDEX idx_claude_prompt_settings_store_id ON claude_prompt_settings(store_id);

-- Apply updated_at triggers
CREATE TRIGGER update_claude_prompt_templates_updated_at 
    BEFORE UPDATE ON claude_prompt_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claude_prompt_settings_updated_at 
    BEFORE UPDATE ON claude_prompt_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE claude_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE claude_prompt_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE claude_prompt_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for claude_prompt_templates
CREATE POLICY "Store owners can view own prompt templates" ON claude_prompt_templates 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = claude_prompt_templates.store_id AND stores.store_owner_id::text = auth.uid()::text)
    );

CREATE POLICY "Store owners can insert own prompt templates" ON claude_prompt_templates 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = claude_prompt_templates.store_id AND stores.store_owner_id::text = auth.uid()::text)
    );

CREATE POLICY "Store owners can update own prompt templates" ON claude_prompt_templates 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = claude_prompt_templates.store_id AND stores.store_owner_id::text = auth.uid()::text)
    );

CREATE POLICY "Store owners can delete own prompt templates" ON claude_prompt_templates 
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = claude_prompt_templates.store_id AND stores.store_owner_id::text = auth.uid()::text)
    );

-- RLS Policies for claude_prompt_usage
CREATE POLICY "Store owners can view own prompt usage" ON claude_prompt_usage 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = claude_prompt_usage.store_id AND stores.store_owner_id::text = auth.uid()::text)
    );

CREATE POLICY "Store owners can insert own prompt usage" ON claude_prompt_usage 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = claude_prompt_usage.store_id AND stores.store_owner_id::text = auth.uid()::text)
    );

-- RLS Policies for claude_prompt_settings
CREATE POLICY "Store owners can view own prompt settings" ON claude_prompt_settings 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = claude_prompt_settings.store_id AND stores.store_owner_id::text = auth.uid()::text)
    );

CREATE POLICY "Store owners can insert own prompt settings" ON claude_prompt_settings 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = claude_prompt_settings.store_id AND stores.store_owner_id::text = auth.uid()::text)
    );

CREATE POLICY "Store owners can update own prompt settings" ON claude_prompt_settings 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM stores WHERE stores.id = claude_prompt_settings.store_id AND stores.store_owner_id::text = auth.uid()::text)
    );

-- Insert default prompt templates
INSERT INTO claude_prompt_templates (store_id, template_name, template_category, prompt_text, variables, is_default) VALUES
-- These will be copied to each store when they first access the feature
(uuid_generate_v4(), 'Product Description Generator', 'product_description', 
 'Create a compelling product description for [product_name] in the [category] category. Include key features, benefits, and a call-to-action. Make it engaging and conversion-focused while maintaining accuracy. Target length: 150-200 words.',
 '["product_name", "category"]', true),

(uuid_generate_v4(), 'Marketing Copy Generator', 'marketing_copy',
 'Generate marketing copy for [product_name] targeting [audience] with a [tone] tone. Focus on the unique value proposition and create urgency without being pushy. Include a strong call-to-action.',
 '["product_name", "audience", "tone"]', true),

(uuid_generate_v4(), 'Customer Support Response', 'customer_support',
 'Create a helpful and professional response to a customer inquiry about [topic]. Be empathetic, provide clear information, and offer next steps. Keep the tone warm and supportive.',
 '["topic"]', true),

(uuid_generate_v4(), 'SEO Meta Description', 'seo_optimization',
 'Write an SEO-optimized meta description for [page_title]. Include relevant keywords naturally, make it compelling for click-through, and keep it under 160 characters.',
 '["page_title"]', true),

(uuid_generate_v4(), 'Email Campaign Subject Line', 'email_campaign',
 'Create 5 engaging email subject lines for [campaign_type] campaign about [topic]. Make them compelling, avoid spam triggers, and encourage opens. Keep each under 50 characters.',
 '["campaign_type", "topic"]', true),

(uuid_generate_v4(), 'Social Media Post', 'social_media',
 'Create a [platform] post about [topic] for [brand_name]. Make it engaging, include relevant hashtags, and encourage interaction. Keep it appropriate for the platform format.',
 '["platform", "topic", "brand_name"]', true);

-- Insert default settings
INSERT INTO claude_prompt_settings (store_id, setting_key, setting_value) VALUES
(uuid_generate_v4(), 'ai_features_enabled', 'true'),
(uuid_generate_v4(), 'default_tone', '"professional"'),
(uuid_generate_v4(), 'max_tokens_per_request', '1000'),
(uuid_generate_v4(), 'auto_generate_product_descriptions', 'false'),
(uuid_generate_v4(), 'prompt_usage_notifications', 'true');
