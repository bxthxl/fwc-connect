
-- Add avatar_url column to profiles
ALTER TABLE public.profiles ADD COLUMN avatar_url text;

-- Create avatars storage bucket (public so images can be displayed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar (folder = their profile id)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT id::text FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- Allow users to update/replace their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT id::text FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = (SELECT id::text FROM public.profiles WHERE auth_user_id = auth.uid())
);
