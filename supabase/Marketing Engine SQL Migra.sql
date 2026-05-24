-- ByteEvolvr Marketing Engine SQL Migration
-- Run this script in your Supabase SQL Editor

-- 1. ENUMS (Safe Creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_type') THEN
        CREATE TYPE campaign_type AS ENUM ('email', 'whatsapp', 'push');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
        CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'queued', 'processing', 'completed', 'failed', 'paused');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
        CREATE TYPE delivery_status AS ENUM ('queued', 'processing', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'retried', 'unsubscribed', 'converted');
    END IF;
END$$;

-- 2. AUDIENCE SEGMENTS
CREATE TABLE IF NOT EXISTS audience_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    filter_rules JSONB NOT NULL DEFAULT '{}',
    estimated_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEMPLATES
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    design_json JSONB,
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon_url TEXT,
    action_url TEXT,
    variables JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Note: whatsapp_templates already exists from previous phases, but ensure it's there)
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type campaign_type NOT NULL,
    status campaign_status DEFAULT 'draft',
    segment_id UUID REFERENCES audience_segments(id) ON DELETE SET NULL,
    template_id UUID, -- References either email, whatsapp, or push template depending on type
    custom_content TEXT, -- If template is not used
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    total_recipients INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CAMPAIGN RECIPIENTS (Queue Batching Table)
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_address TEXT NOT NULL, -- Email, Phone Number, or FCM Token
    status delivery_status DEFAULT 'queued',
    error_log TEXT,
    external_id TEXT, -- e.g., Resend Message ID, Meta wamid
    variables JSONB DEFAULT '{}', -- Personalized data for this user
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUTOMATION FLOWS
CREATE TABLE IF NOT EXISTS automation_flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT NOT NULL, -- e.g., 'cart_abandoned', 'order_completed'
    is_active BOOLEAN DEFAULT false,
    flow_steps JSONB NOT NULL DEFAULT '[]', -- Array of steps (delay, condition, action)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUTOMATION RUNS
CREATE TABLE IF NOT EXISTS automation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flow_id UUID NOT NULL REFERENCES automation_flows(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trigger_data JSONB, -- Data from the event that triggered this
    current_step_index INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, completed, cancelled, failed
    next_execution_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CAMPAIGN ANALYTICS (Aggregated stats for fast dashboards)
CREATE TABLE IF NOT EXISTS campaign_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    metrics JSONB NOT NULL DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0, "unsubscribed": 0, "revenue": 0}',
    last_aggregated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_external_id ON campaign_recipients(external_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_status ON automation_runs(status);
CREATE INDEX IF NOT EXISTS idx_automation_runs_next_execution ON automation_runs(next_execution_at);