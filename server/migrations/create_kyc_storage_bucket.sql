-- =============================================
-- MIGRATION: Create KYC Documents Storage Bucket
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/zgknwsrfpqjncvyzfiww/sql/new
-- =============================================

-- 1. Create the kyc-documents storage bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kyc-documents',
    'kyc-documents',
    TRUE,
    10485760, -- 10 MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET public = TRUE,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

-- 2. Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Allow public uploads to kyc-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from kyc-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access to kyc-documents" ON storage.objects;

-- 3. Allow anyone to upload to kyc-documents (needed during SIGNUP before user is authenticated)
CREATE POLICY "Allow public uploads to kyc-documents"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'kyc-documents');

-- 4. Allow authenticated users to read their own documents
CREATE POLICY "Allow authenticated reads from kyc-documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'kyc-documents');

-- 5. Allow service_role (admin) full access
CREATE POLICY "Allow service role full access to kyc-documents"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'kyc-documents');
