-- Phase 4: Idempotency Keys Table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key VARCHAR(255) PRIMARY KEY,
  path VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  request_body JSONB,
  response_code INTEGER,
  response_body JSONB,
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cleanup (e.g., delete keys older than 24 hours)
CREATE INDEX idx_idempotency_created_at ON idempotency_keys(created_at);

-- RLS Policies
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service Role can manage idempotency_keys"
ON idempotency_keys FOR ALL
USING (auth.role() = 'service_role');
