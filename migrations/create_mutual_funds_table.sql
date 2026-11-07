-- Migration: Create mutual_funds master table

CREATE TABLE IF NOT EXISTS mutual_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code VARCHAR(50) NOT NULL,
    name TEXT NOT NULL,
    amc_name TEXT,
    category TEXT,
    regular_ter DECIMAL(5,2),
    direct_ter DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for full-text search on name and amc_name
CREATE INDEX IF NOT EXISTS idx_mutual_funds_name_search ON mutual_funds USING GIN (to_tsvector('english', name || ' ' || COALESCE(amc_name, '')));
CREATE INDEX IF NOT EXISTS idx_mutual_funds_scheme_code ON mutual_funds (scheme_code);

-- Enable RLS
ALTER TABLE mutual_funds ENABLE ROW LEVEL SECURITY;

-- Anyone can read mutual funds
CREATE POLICY "Anyone can read mutual funds"
  ON mutual_funds FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_mutual_funds_updated_at ON mutual_funds;
CREATE TRIGGER update_mutual_funds_updated_at
    BEFORE UPDATE ON mutual_funds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
