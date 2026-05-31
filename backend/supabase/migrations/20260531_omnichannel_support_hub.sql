-- 1. Support Teams
CREATE TABLE IF NOT EXISTS support_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Support Agents
CREATE TABLE IF NOT EXISTS support_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES support_teams(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'offline',
    max_tickets INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Modify support_tickets table
ALTER TABLE support_tickets
    ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'portal',
    ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES support_agents(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assigned_team UUID REFERENCES support_teams(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS first_response_due TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS resolution_due TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Update existing status values check constraint if necessary (we assume string for now)

-- 4. Support Messages (Threaded conversations)
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    direction VARCHAR(50) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'whatsapp', 'contact_form', 'portal')),
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    sender_phone VARCHAR(50),
    message_body TEXT NOT NULL,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Support Attachments
CREATE TABLE IF NOT EXISTS support_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES support_messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Support Internal Notes
CREATE TABLE IF NOT EXISTS support_internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_source ON support_tickets(source);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_support_internal_notes_ticket_id ON support_internal_notes(ticket_id);
