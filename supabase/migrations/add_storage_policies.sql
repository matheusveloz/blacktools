-- Storage Policies for Videos, Audios, and Images buckets
-- Run this in your Supabase SQL Editor

-- Create buckets if they don't exist (these are usually created via dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audios', 'audios', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads to videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to audios" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to audios" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files in videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files in audios" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files in images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files in videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files in audios" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files in images" ON storage.objects;

-- VIDEOS BUCKET POLICIES

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated uploads to videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Allow public read access to videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files in videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files in videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- AUDIOS BUCKET POLICIES

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated uploads to audios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Allow public read access to audios"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audios');

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files in audios"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files in audios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- IMAGES BUCKET POLICIES

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated uploads to images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
CREATE POLICY "Allow public read access to images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files in images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files in images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
