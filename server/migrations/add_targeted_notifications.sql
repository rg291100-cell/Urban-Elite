-- =============================================
-- MIGRATION: Add targeted notifications support
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/zgknwsrfpqjncvyzfiww/sql/new
-- =============================================

-- 1. Add target_user_id to notifications (for personal/vendor-specific notifications)
--    NULL = broadcast to all users (offers, promotions)
--    Set = only delivered to that specific user/vendor
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 2. Index for fast per-user lookup
CREATE INDEX IF NOT EXISTS idx_notifications_target_user_id ON notifications(target_user_id);

-- 3. Add booking_id reference for booking-related notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS booking_id UUID;
