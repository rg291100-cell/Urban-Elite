-- =============================================================
-- MIGRATION: Create all required Supabase Storage buckets
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/_YOUR_PROJECT_/sql/new
-- =============================================================
-- This MUST be run with service_role (it is, inside the SQL editor).
-- The mobile app's anon key cannot create buckets (RLS restriction).
-- =============================================================

-- 1. kyc-documents (vendor KYC uploads — Aadhaar, PAN)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kyc-documents',
    'kyc-documents',
    FALSE,
    10485760, -- 10 MB
    ARRAY['image/jpeg','image/jpg','image/png','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 2. profile-images (user & vendor profile photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    TRUE,
    5242880, -- 5 MB
    ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. offer-media (images & videos for ads / job postings)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'offer-media',
    'offer-media',
    TRUE,
    52428800, -- 50 MB
    ARRAY['image/jpeg','image/jpg','image/png','image/webp','video/mp4','video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- 4. service-icons (uploaded icons for categories / sub-categories / services)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'service-icons',
    'service-icons',
    TRUE,
    2097152, -- 2 MB
    ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- RLS POLICIES
-- =============================================================

-- ─── kyc-documents ───────────────────────────────────────────
DROP POLICY IF EXISTS "kyc_authenticated_upload" ON storage.objects;
CREATE POLICY "kyc_authenticated_upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'kyc-documents');

DROP POLICY IF EXISTS "kyc_owner_read" ON storage.objects;
CREATE POLICY "kyc_owner_read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "kyc_public_update" ON storage.objects;
CREATE POLICY "kyc_public_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'kyc-documents');

-- ─── profile-images ──────────────────────────────────────────
DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
CREATE POLICY "profile_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "profile_images_authenticated_upload" ON storage.objects;
CREATE POLICY "profile_images_authenticated_upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "profile_images_authenticated_update" ON storage.objects;
CREATE POLICY "profile_images_authenticated_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'profile-images');

-- ─── offer-media ─────────────────────────────────────────────
DROP POLICY IF EXISTS "offer_media_public_read" ON storage.objects;
CREATE POLICY "offer_media_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'offer-media');

DROP POLICY IF EXISTS "offer_media_authenticated_upload" ON storage.objects;
CREATE POLICY "offer_media_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'offer-media');

-- ─── service-icons ───────────────────────────────────────────
DROP POLICY IF EXISTS "service_icons_public_read" ON storage.objects;
CREATE POLICY "service_icons_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-icons');

DROP POLICY IF EXISTS "service_icons_authenticated_upload" ON storage.objects;
CREATE POLICY "service_icons_authenticated_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-icons');

DROP POLICY IF EXISTS "service_icons_authenticated_update" ON storage.objects;
CREATE POLICY "service_icons_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'service-icons');
