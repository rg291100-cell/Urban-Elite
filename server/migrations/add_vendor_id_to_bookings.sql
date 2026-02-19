-- Add vendor_id (selected professional) to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Index for fast availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_date_slot
ON bookings(vendor_id, date, time_slot)
WHERE vendor_id IS NOT NULL AND status NOT IN ('CANCELLED');

-- Unique constraint: one booking per vendor per date+time_slot (active bookings only)
-- We use a partial unique index to exclude cancelled bookings
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_vendor_slot_unique
ON bookings(vendor_id, date, time_slot)
WHERE vendor_id IS NOT NULL AND status NOT IN ('CANCELLED');
