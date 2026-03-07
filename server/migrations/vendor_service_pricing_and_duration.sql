-- ========================================================
-- MIGRATION: Vendor Service Pricing & Duration System
-- Run this in Supabase SQL editor
-- ========================================================

-- 1. Add custom_duration column (vendor-set duration in minutes)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendor_services' AND COLUMN_NAME = 'custom_duration'
    ) THEN
        ALTER TABLE vendor_services ADD COLUMN custom_duration INTEGER; -- duration in minutes
    END IF;
END $$;

-- 2. Add price_updated_by to track who last set the price (VENDOR or ADMIN)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendor_services' AND COLUMN_NAME = 'price_updated_by'
    ) THEN
        ALTER TABLE vendor_services ADD COLUMN price_updated_by VARCHAR(10) DEFAULT 'VENDOR'; -- 'VENDOR' or 'ADMIN'
    END IF;
END $$;

-- 3. Add duration_updated_by to track who last set the duration (VENDOR or ADMIN)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendor_services' AND COLUMN_NAME = 'duration_updated_by'
    ) THEN
        ALTER TABLE vendor_services ADD COLUMN duration_updated_by VARCHAR(10) DEFAULT 'VENDOR'; -- 'VENDOR' or 'ADMIN'
    END IF;
END $$;

-- 4. Ensure custom_price column exists (was added in a previous migration)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendor_services' AND COLUMN_NAME = 'custom_price'
    ) THEN
        ALTER TABLE vendor_services ADD COLUMN custom_price VARCHAR(50);
    END IF;
END $$;

-- 5. Ensure is_enabled column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'vendor_services' AND COLUMN_NAME = 'is_enabled'
    ) THEN
        ALTER TABLE vendor_services ADD COLUMN is_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;
