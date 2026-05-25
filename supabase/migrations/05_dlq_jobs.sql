-- Phase 6: Dead-Letter Queue (DLQ) Table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS dlq_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_name VARCHAR(255) NOT NULL,
  job_name VARCHAR(255) NOT NULL,
  payload JSONB,
  error_message TEXT,
  stack_trace TEXT,
  failed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'unresolved', -- unresolved, retried, ignored
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index for querying unresolved errors
CREATE INDEX idx_dlq_status ON dlq_jobs(status);
CREATE INDEX idx_dlq_queue ON dlq_jobs(queue_name);

-- RLS Policies
ALTER TABLE dlq_jobs ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service Role can manage dlq_jobs"
ON dlq_jobs FOR ALL
USING (auth.role() = 'service_role');
