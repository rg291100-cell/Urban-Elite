-- Add attachment_url to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Enhance Users table to support linked categories
ALTER TABLE users
ADD COLUMN IF NOT EXISTS service_category_id UUID REFERENCES service_categories(id),
ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES service_subcategories(id),
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS aadhaar_url TEXT,
ADD COLUMN IF NOT EXISTS pan_url TEXT;

-- Create Vendor Services mapping table 
-- This allows a vendor to be linked to multiple service items under their sub-category
CREATE TABLE IF NOT EXISTS vendor_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_item_id UUID REFERENCES service_items(id) ON DELETE CASCADE,
    custom_price TEXT, -- Optional override
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, service_item_id)
);
