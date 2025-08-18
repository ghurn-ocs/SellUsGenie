-- Add financial year period settings to stores table
-- This allows each store to define when their financial year starts (month and day only)

-- Add financial year start month (1-12, default to January)
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS financial_year_start_month INTEGER DEFAULT 1 CHECK (financial_year_start_month >= 1 AND financial_year_start_month <= 12);

-- Add financial year start day (1-31, default to 1st)
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS financial_year_start_day INTEGER DEFAULT 1 CHECK (financial_year_start_day >= 1 AND financial_year_start_day <= 31);

-- Add comments to document the columns
COMMENT ON COLUMN stores.financial_year_start_month IS 'Month when the financial year starts (1-12), defaults to January';
COMMENT ON COLUMN stores.financial_year_start_day IS 'Day when the financial year starts (1-31), defaults to 1st';

-- Example: 
-- financial_year_start_month = 4, financial_year_start_day = 1 means financial year starts April 1st
-- financial_year_start_month = 7, financial_year_start_day = 15 means financial year starts July 15th