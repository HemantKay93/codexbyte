-- Migration: enterprise_evolution_v3_workflows
-- Description: Creates the tables for the Generic Workflow Builder Engine

BEGIN;

-- ==============================================================================================
-- 1. WORKFLOW ENGINE SCHEMA
-- ==============================================================================================

-- Workflow Definitions: The visual DAG mapped to JSON
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(255) NOT NULL, -- e.g., 'crm.deal.won', 'accounting.invoice.created'
    nodes JSONB NOT NULL DEFAULT '[]', -- ReactFlow nodes or similar standard DAG
    edges JSONB NOT NULL DEFAULT '[]', -- Connections between nodes
    is_active BOOLEAN DEFAULT false,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Executions: A specific run of a workflow
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    workflow_id UUID NOT NULL REFERENCES workflow_definitions(id),
    trigger_event_payload JSONB, -- The payload that triggered it
    status VARCHAR(50) NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed', 'suspended'
    current_node_id VARCHAR(255), -- Where is it stuck/waiting?
    state JSONB DEFAULT '{}', -- Accumulated state from nodes
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Workflow Logs: Detailed trace of the execution path
CREATE TABLE IF NOT EXISTS workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- 'email', 'delay', 'condition', 'webhook'
    status VARCHAR(50) NOT NULL DEFAULT 'success', -- 'success', 'error'
    input_payload JSONB,
    output_payload JSONB,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
