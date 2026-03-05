-- =============================================
-- MIGRATION: Add media_urls to offers + Create offer-media bucket
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/zgknwsrfpqjncvyzfiww/sql/new
-- =============================================

-- 1. Add media_urls column to offers table (array of image/video URLs)
ALTER TABLE offers ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- 2. Create the offer-media storage bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'offer-media',
    'offer-media',
    TRUE,
    52428800, -- 50 MB limit (for videos)
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE
  SET public = TRUE,
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];

-- 3. Drop then recreate policies for offer-media bucket
DROP POLICY IF EXISTS "Authenticated users can upload offer media" ON storage.objects;
DROP POLICY IF EXISTS "Public can read offer media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete offer media" ON storage.objects;

-- 4. Authenticated users (vendors & admin) can upload
CREATE POLICY "Authenticated users can upload offer media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'offer-media');

-- 5. Public read access (media shown on home feed)
CREATE POLICY "Public can read offer media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'offer-media');

-- 6. Authenticated users can delete offer media
CREATE POLICY "Authenticated users can delete offer media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'offer-media');
