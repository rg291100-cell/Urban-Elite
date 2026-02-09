-- Migration to add payment_mode to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'PREPAID';
-- Update existing bookings to PREPAID if null
UPDATE bookings SET payment_mode = 'PREPAID' WHERE payment_mode IS NULL;
