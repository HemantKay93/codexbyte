-- Migration: enterprise_evolution_v4_sla
-- Description: Creates the tables for the Generic SLA Engine

BEGIN;

-- ==============================================================================================
-- 1. SLA ENGINE SCHEMA
-- ==============================================================================================

-- SLA Policies: Defines the rules for a specific SLA
CREATE TABLE IF NOT EXISTS sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    module VARCHAR(100) NOT NULL, -- e.g., 'support', 'crm'
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'ticket', 'deal'
    conditions JSONB NOT NULL DEFAULT '[]', -- Rules for when this applies e.g. [{field: 'priority', op: 'eq', value: 'high'}]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SLA Targets: Defines the specific time limits and metrics for a policy
CREATE TABLE IF NOT EXISTS sla_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    policy_id UUID NOT NULL REFERENCES sla_policies(id) ON DELETE CASCADE,
    metric VARCHAR(100) NOT NULL, -- 'first_response_time', 'resolution_time'
    target_value_minutes INTEGER NOT NULL,
    warning_threshold_minutes INTEGER, -- Trigger warning before breach
    business_hours_only BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SLA Breaches: Log of entities that breached their SLAs
CREATE TABLE IF NOT EXISTS sla_breaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    policy_id UUID NOT NULL REFERENCES sla_policies(id),
    target_id UUID NOT NULL REFERENCES sla_targets(id),
    entity_id UUID NOT NULL, -- The specific ticket or deal
    breached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_to UUID, -- User who was responsible at the time of breach
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved'
    escalation_triggered BOOLEAN DEFAULT false
);

-- Note: In a production system, we would also have an `sla_tracking` table to store
-- the current running timers for active entities, but for this milestone we can
-- infer breaches dynamically or store them directly here upon detection by a cron worker.

COMMIT;
