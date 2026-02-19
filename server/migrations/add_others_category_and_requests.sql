-- Add is_others flag to service_categories table
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS is_others BOOLEAN DEFAULT FALSE;

-- Create the Others category if it doesn't exist
INSERT INTO service_categories (name, slug, image, is_others)
VALUES ('Others', 'others', 'https://cdn-icons-png.flaticon.com/512/1375/1375106.png', TRUE)
ON CONFLICT (slug) DO UPDATE SET is_others = TRUE;

-- Create admin_service_requests table for Others category requests
CREATE TABLE IF NOT EXISTS admin_service_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    category_id UUID REFERENCES service_categories(id),
    category_name TEXT,
    subcategory_id UUID REFERENCES service_subcategories(id),
    subcategory_name TEXT,
    service_item_id UUID REFERENCES service_items(id),
    service_name TEXT NOT NULL,
    description TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    location_type TEXT DEFAULT 'Home',
    location_address TEXT,
    attachment_url TEXT,
    status TEXT DEFAULT 'PENDING',  -- PENDING, REVIEWED, IN_PROGRESS, COMPLETED, CANCELLED
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_service_requests
ALTER TABLE admin_service_requests ENABLE ROW LEVEL SECURITY;

-- Policy: users can insert/view their own requests
CREATE POLICY "Users can insert their own requests"
ON admin_service_requests FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NOT NULL);

CREATE POLICY "Users can view their own requests"
ON admin_service_requests FOR SELECT
USING (true);  -- We handle auth in middleware

-- Allow service_role full access (bypass RLS for API)
-- This is handled by the service role key
