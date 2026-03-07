-- =============================================
-- MIGRATION: Ensure all booking columns exist
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/zgknwsrfpqjncvyzfiww/sql/new
-- =============================================

-- Ensure payment_mode column exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'PREPAID';

-- Ensure professional_id column exists (same as vendor_id, legacy)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Ensure professional_name column exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS professional_name TEXT;

-- Ensure estimated_time column exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_time TEXT DEFAULT '1 hour';

-- Ensure attachment_url column exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Ensure location_type and location_address exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'Home';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Ensure vendor_id column exists (for selected vendor)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Ensure service_id is nullable (items may be deleted)
ALTER TABLE bookings ALTER COLUMN service_id DROP NOT NULL;
