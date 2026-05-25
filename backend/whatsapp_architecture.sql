-- WhatsApp Multi-Provider Architecture Schema Updates

-- 1. provider_configs table
-- Stores configuration for various WhatsApp providers (Meta, Evolution, OpenWA)
CREATE TABLE IF NOT EXISTS public.provider_configs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    provider_name VARCHAR(50) NOT NULL UNIQUE, -- 'meta', 'evolution', 'openwa'
    is_enabled BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    config JSONB DEFAULT '{}'::jsonb, -- Store accessToken, phoneNumberId, instanceUrl, apiKey, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for provider_configs
ALTER TABLE public.provider_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.provider_configs FOR SELECT USING (true);
CREATE POLICY "Enable all access for admins" ON public.provider_configs FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 2. provider_logs table
-- Tracks health, failovers, and system-level events for providers
CREATE TABLE IF NOT EXISTS public.provider_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    provider_name VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'failover', 'health_check_failed', 'quota_exceeded', 'connected'
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for provider_logs
ALTER TABLE public.provider_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for admins" ON public.provider_logs FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Enable insert for authenticated" ON public.provider_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Update existing whatsapp_messages table (or create if not exists)
-- Ensure we track the exact provider used for each message
ALTER TABLE IF EXISTS public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS provider_used VARCHAR(50) DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS provider_fallback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_latency_ms INTEGER;

-- Create if it doesn't exist at all (fallback)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(255),
    recipient VARCHAR(50) NOT NULL,
    payload JSONB,
    status VARCHAR(50) DEFAULT 'queued',
    error_log TEXT,
    provider_used VARCHAR(50) DEFAULT 'unknown',
    provider_fallback BOOLEAN DEFAULT false,
    delivery_latency_ms INTEGER,
    campaign_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. delivery_events table
-- Normalizes webhooks from all providers into a single unified event stream
CREATE TABLE IF NOT EXISTS public.delivery_events (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    campaign_id UUID,
    message_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'read', 'failed'
    recipient VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for delivery_events
ALTER TABLE public.delivery_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for admins" ON public.delivery_events FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Enable insert for authenticated" ON public.delivery_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Add provider override to campaigns
-- Allows a campaign to forcefully route through 'evolution' or 'meta'
ALTER TABLE IF EXISTS public.campaigns
ADD COLUMN IF NOT EXISTS whatsapp_provider_override VARCHAR(50);
