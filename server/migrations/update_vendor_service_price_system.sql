-- =============================================================
-- MIGRATION: Update Vendor Service Pricing System
-- =============================================================

-- 1. Ensure vendor_services table has price columns if not present
-- Note: 'custom_price' usually exists in many common schemas, 
-- but we will ensure it matches our feature requirements.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vendor_services' AND COLUMN_NAME = 'price') THEN
        ALTER TABLE vendor_services ADD COLUMN price DECIMAL(10, 2);
    END IF;
END $$;

-- 2. Add an audit column to track if vendor or admin set it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vendor_services' AND COLUMN_NAME = 'price_updated_by') THEN
        ALTER TABLE vendor_services ADD COLUMN price_updated_by VARCHAR(50); -- 'VENDOR' or 'ADMIN'
    END IF;
END $$;
