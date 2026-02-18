-- =============================================
-- MIGRATION: Add attachment and vendor columns
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/zgknwsrfpqjncvyzfiww/sql/new
-- =============================================

-- 1. Add attachment_url to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- 2. Add vendor-specific columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_category_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sub_category_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_url TEXT;

-- 3. Create vendor_services mapping table
CREATE TABLE IF NOT EXISTS vendor_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_item_id UUID,
    custom_price TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, service_item_id)
);
