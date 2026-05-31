-- Phase 9 & 10: Bank Reconciliation & GST Engine Schema

-- ==========================================
-- 7. Tax Configuration & GST Engine
-- ==========================================

-- GST Tax Rates
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- e.g., 'GST 18%', 'IGST 18%'
    rate NUMERIC(5, 2) NOT NULL, -- e.g., 18.00
    type VARCHAR(50) NOT NULL CHECK (type IN ('CGST', 'SGST', 'IGST', 'CESS', 'NONE')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HSN / SAC Codes
CREATE TABLE hsn_sac_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(10) CHECK (type IN ('HSN', 'SAC')),
    default_tax_rate_id UUID REFERENCES tax_rates(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GST Returns (GSTR-1, GSTR-2, GSTR-3B)
CREATE TABLE gst_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_type VARCHAR(50) NOT NULL CHECK (return_type IN ('GSTR-1', 'GSTR-2', 'GSTR-3B')),
    financial_year VARCHAR(20) NOT NULL, -- e.g. '2023-2024'
    month VARCHAR(20) NOT NULL, -- e.g. 'January'
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'filed', 'cancelled')),
    total_sales NUMERIC(15, 2) DEFAULT 0.00,
    total_purchases NUMERIC(15, 2) DEFAULT 0.00,
    total_cgst NUMERIC(15, 2) DEFAULT 0.00,
    total_sgst NUMERIC(15, 2) DEFAULT 0.00,
    total_igst NUMERIC(15, 2) DEFAULT 0.00,
    total_cess NUMERIC(15, 2) DEFAULT 0.00,
    filed_on TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Tax Rates for India GST
INSERT INTO tax_rates (name, rate, type) VALUES
('GST 0%', 0.00, 'NONE'),
('CGST 2.5%', 2.50, 'CGST'),
('SGST 2.5%', 2.50, 'SGST'),
('IGST 5%', 5.00, 'IGST'),
('CGST 6%', 6.00, 'CGST'),
('SGST 6%', 6.00, 'SGST'),
('IGST 12%', 12.00, 'IGST'),
('CGST 9%', 9.00, 'CGST'),
('SGST 9%', 9.00, 'SGST'),
('IGST 18%', 18.00, 'IGST'),
('CGST 14%', 14.00, 'CGST'),
('SGST 14%', 14.00, 'SGST'),
('IGST 28%', 28.00, 'IGST')
ON CONFLICT DO NOTHING;

-- Timestamps
CREATE TRIGGER update_tax_rates_modtime BEFORE UPDATE ON tax_rates FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_hsn_sac_modtime BEFORE UPDATE ON hsn_sac_codes FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_gst_returns_modtime BEFORE UPDATE ON gst_returns FOR EACH ROW EXECUTE FUNCTION update_modified_column();
