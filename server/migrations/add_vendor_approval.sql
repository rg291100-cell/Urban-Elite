-- Vendor Approval Workflow - Database Migration
-- Run this SQL in your Supabase SQL Editor

-- Add new columns to users table for vendor approval workflow
ALTER TABLE users
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'APPROVED',
ADD COLUMN IF NOT EXISTS service_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);

-- Update existing users to have APPROVED status (backward compatibility)
UPDATE users
SET approval_status = 'APPROVED'
WHERE approval_status IS NULL AND role = 'USER';

-- Create index on approval_status for faster queries
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);

-- Create index on role and approval_status combination
CREATE INDEX IF NOT EXISTS idx_users_role_approval ON users(role, approval_status);

-- Add comment to table
COMMENT ON COLUMN users.approval_status IS 'Vendor approval status: PENDING, APPROVED, or REJECTED';
COMMENT ON COLUMN users.service_category IS 'Primary service category for vendors (e.g., Cleaning, Electrician, Plumbing)';
COMMENT ON COLUMN users.business_name IS 'Vendor business name';
COMMENT ON COLUMN users.business_address IS 'Vendor business address';
COMMENT ON COLUMN users.experience_years IS 'Years of experience for vendors';
COMMENT ON COLUMN users.approved_at IS 'Timestamp when vendor was approved/rejected';
COMMENT ON COLUMN users.approved_by IS 'Admin user ID who approved/rejected the vendor';
