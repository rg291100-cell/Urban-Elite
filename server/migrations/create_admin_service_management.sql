-- Add Sub-services Management Tables

-- 1. Ensure service_items has necessary columns (assuming it exists, but making it robust)
CREATE TABLE IF NOT EXISTS service_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES service_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vendor Specializations (Linking Vendors to specific Sub-services)
CREATE TABLE IF NOT EXISTS vendor_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vendor_id UUID REFERENCES users(id),
    service_item_id UUID REFERENCES service_items(id),
    custom_price DECIMAL(10, 2), -- Vendor can override base price
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, service_item_id) -- Prevent duplicate links
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_items_category ON service_items(category_id);
CREATE INDEX IF NOT EXISTS idx_vendor_services_vendor ON vendor_services(vendor_id);
