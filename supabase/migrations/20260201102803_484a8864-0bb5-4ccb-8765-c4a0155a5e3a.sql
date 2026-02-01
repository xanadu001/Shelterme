-- Add videos column to properties table
ALTER TABLE public.properties 
ADD COLUMN videos TEXT[] DEFAULT '{}'::text[];

-- Create storage bucket for property videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-videos', 'property-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-videos');

-- Allow public to view videos
CREATE POLICY "Anyone can view property videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-videos');

-- Allow owners to delete their videos
CREATE POLICY "Users can delete own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'property-videos' AND auth.uid()::text = (storage.foldername(name))[1]);