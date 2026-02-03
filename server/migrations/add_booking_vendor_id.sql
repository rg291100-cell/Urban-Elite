-- Add vendor_id to bookings table to link bookings to vendors
-- This is required for the Vendor Dashboard to filter bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);

-- Optional: Update existing bookings to have a vendor (if any)
-- This is manual work or needs logic, leaving as null for now is fine (they won't show in any vendor dashboard)
