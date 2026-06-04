-- Migration: enterprise_evolution_v2_engines
-- Description: Creates the tables for the Generic Approval Engine and Document Center

BEGIN;

-- ==============================================================================================
-- 1. APPROVAL ENGINE SCHEMA
-- ==============================================================================================

-- Approval Templates: Defines the rules for a specific type of approval
CREATE TABLE IF NOT EXISTS approval_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- Assuming generic tenant ID or string. We use UUID for Supabase defaults
    name VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL, -- e.g., 'accounting', 'crm', 'support'
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'journal_entry', 'discount', 'refund'
    rules JSONB NOT NULL DEFAULT '{}', -- e.g., {"amount_threshold": 1000}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Requests: The actual runtime request instances
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    template_id UUID REFERENCES approval_templates(id),
    entity_id UUID NOT NULL, -- ID of the journal entry, refund, deal, etc.
    requester_id UUID NOT NULL, -- User who triggered it
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'escalated'
    payload JSONB, -- Snapshot of the data being approved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Steps: The sequential or parallel stages of a specific request
CREATE TABLE IF NOT EXISTS approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    approver_role VARCHAR(100), -- E.g., 'finance_manager'
    approver_user_id UUID, -- Specific user if applicable
    step_order INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    comments TEXT,
    acted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================================
-- 2. DOCUMENT CENTER SCHEMA
-- ==============================================================================================

-- Documents: Metadata for the actual files
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    folder_id UUID, -- Self-referencing if we want folders, null means root
    file_path TEXT, -- Path in storage bucket (e.g., Supabase Storage)
    file_type VARCHAR(100), -- 'pdf', 'image/png', 'folder'
    file_size_bytes BIGINT,
    owner_id UUID NOT NULL,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document Permissions: RBAC down to the file level
CREATE TABLE IF NOT EXISTS document_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID, -- Specific user
    role VARCHAR(100), -- Or specific role
    permission_level VARCHAR(50) NOT NULL DEFAULT 'viewer', -- 'viewer', 'editor', 'owner'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document Versions: History of file changes
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    uploaded_by UUID NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
