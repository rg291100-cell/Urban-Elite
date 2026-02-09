-- Add KYC fields for Vendor Registration
ALTER TABLE users
ADD COLUMN IF NOT EXISTS aadhaar_url TEXT,
ADD COLUMN IF NOT EXISTS pan_url TEXT;

COMMENT ON COLUMN users.aadhaar_url IS 'URL to the uploaded Aadhaar card image/document';
COMMENT ON COLUMN users.pan_url IS 'URL to the uploaded PAN card image/document';
