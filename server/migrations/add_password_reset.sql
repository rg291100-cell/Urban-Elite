-- Add OTP fields for Forgot Password flow
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS reset_otp_expires_at TIMESTAMP;

COMMENT ON COLUMN users.reset_otp IS 'One-time password for password reset';
COMMENT ON COLUMN users.reset_otp_expires_at IS 'Expiration time for the reset OTP';
