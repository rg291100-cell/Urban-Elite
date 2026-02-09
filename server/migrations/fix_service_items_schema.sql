-- Final correction for service_items table schema
-- This aligns the DB with the application's expected fields (title, price, duration etc.)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop dependent tables with CASCADE to handle foreign key dependencies (like from 'offers' table)
DROP TABLE IF EXISTS vendor_services CASCADE;
DROP TABLE IF EXISTS service_items CASCADE;

-- Recreate service_items with correct columns
CREATE TABLE service_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_full TEXT,
    duration TEXT,
    price TEXT, -- Stored as text (e.g. ₹599) to match existing UI patterns
    rating TEXT DEFAULT '4.8',
    image TEXT,
    color TEXT DEFAULT '#F7FAFC',
    is_image BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate vendor_services
CREATE TABLE vendor_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_item_id UUID REFERENCES service_items(id) ON DELETE CASCADE,
    custom_price TEXT, -- Matching price type
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, service_item_id)
);

-- Indexes for performance
CREATE INDEX idx_service_items_category ON service_items(category_id);
CREATE INDEX idx_vendor_services_vendor ON vendor_services(vendor_id);

-- Restore the foreign key on offers table that was dropped via CASCADE
ALTER TABLE offers 
DROP CONSTRAINT IF EXISTS offers_service_id_fkey,
ADD CONSTRAINT offers_service_id_fkey 
FOREIGN KEY (service_id) REFERENCES service_items(id) ON DELETE SET NULL;