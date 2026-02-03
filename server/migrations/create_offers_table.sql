-- Create offers table for Ads System
CREATE TABLE IF NOT EXISTS offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    discount_amount TEXT, -- e.g. "20% OFF" or "₹500 OFF"
    discount_code TEXT,
    service_id UUID REFERENCES service_items(id), -- Optional: Link to specific service
    vendor_id UUID REFERENCES users(id), -- Optional: If created by vendor. Null = Admin Offer.
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, EXPIRED
    valid_until TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_vendor_id ON offers(vendor_id);
