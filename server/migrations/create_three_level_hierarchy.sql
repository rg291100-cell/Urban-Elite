-- Create Subcategories Table (Level 2)
CREATE TABLE IF NOT EXISTS service_subcategories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modify Service Items (Level 3) to reference Subcategory
ALTER TABLE service_items
ADD COLUMN subcategory_id UUID REFERENCES service_subcategories(id) ON DELETE CASCADE;

-- Allow category_id to be nullable since items now belong to subcategories
ALTER TABLE service_items ALTER COLUMN category_id DROP NOT NULL;

-- SEED DATA ---------------------------------------------------------

-- 1. Create Level 1: "Repair & Maintenance"
INSERT INTO service_categories (name, slug, image, color)
VALUES ('Repair & Maintenance', 'repair-maintenance', 'https://cdn-icons-png.flaticon.com/512/3074/3074767.png', '#FFF5F5')
ON CONFLICT (slug) DO NOTHING;

-- 2. Create Level 2: "AC Repair" & "Fridge Repair"
INSERT INTO service_subcategories (category_id, name, slug, image, description)
SELECT id, 'AC Repair', 'ac-repair-sub', 'https://cdn-icons-png.flaticon.com/512/911/911409.png', 'AC Service & Repair'
FROM service_categories WHERE slug = 'repair-maintenance'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_subcategories (category_id, name, slug, image, description)
SELECT id, 'Fridge Repair', 'fridge-repair-sub', 'https://cdn-icons-png.flaticon.com/512/2373/2373435.png', 'Refrigerator Repair'
FROM service_categories WHERE slug = 'repair-maintenance'
ON CONFLICT (slug) DO NOTHING;

-- 3. Create Level 3: Service Options for "AC Repair"
-- We need to act carefully to not duplicate if they exist, but simple INSERT is fine for this demo script.

-- AC Not Cooling
INSERT INTO service_items (subcategory_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'AC not cooling', 'Diagnosis & Repair of Cooling Issue', '45 min', '₹599', '4.8', 'https://img.freepik.com/free-photo/repairman-fixing-air-conditioner_23-2148171780.jpg', '#F0F9FF'
FROM service_subcategories WHERE slug = 'ac-repair-sub';

-- Gas Refill
INSERT INTO service_items (subcategory_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Gas Refill', 'AC Gas Refill (Split/Window)', '30 min', '₹2499', '4.9', 'https://img.freepik.com/free-photo/technician-checking-air-conditioner_23-2149352125.jpg', '#F0FFF4'
FROM service_subcategories WHERE slug = 'ac-repair-sub';

-- Water Leakage
INSERT INTO service_items (subcategory_id, title, title_full, duration, price, rating, image, color)
SELECT id, 'Water Leakage', 'Fixing AC Water Leakage', '1 hr', '₹399', '4.7', 'https://img.freepik.com/free-photo/repair-service_23-2148003632.jpg', '#F5F5F5'
FROM service_subcategories WHERE slug = 'ac-repair-sub';
