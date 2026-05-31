-- Phase 11 & 12: Financial Reporting & Financial Periods Schema

-- ==========================================
-- 8. Financial Periods
-- ==========================================
CREATE TABLE financial_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- e.g., 'FY2023-24 Q1', 'January 2024'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    closed_by UUID, -- References auth.users
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Timestamps
CREATE TRIGGER update_financial_periods_modtime BEFORE UPDATE ON financial_periods FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Note on Phase 11 (Reporting):
-- Reports (P&L, Balance Sheet, Cash Flow) are generated on-the-fly dynamically from `journal_lines` and `accounts`.
-- No new tables are strictly required for generating these standard reports, as long as `accounts` holds the correct `type`.
