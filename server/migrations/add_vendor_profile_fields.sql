-- Add vendor profile fields needed for the vendor listing on the booking screen
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_image TEXT,
ADD COLUMN IF NOT EXISTS vendor_rating NUMERIC(2,1) DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS total_jobs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS specialty TEXT DEFAULT 'Professional';

-- Update existing approved vendors with default values if null
UPDATE users
SET
    vendor_rating = 4.5,
    total_jobs = 0,
    total_reviews = 0,
    specialty = 'Professional'
WHERE role = 'VENDOR'
  AND vendor_rating IS NULL;

-- Index for fast vendor lookup by service_category + approval
CREATE INDEX IF NOT EXISTS idx_users_vendor_category
ON users(role, approval_status, service_category)
WHERE role = 'VENDOR';
