
-- Create shared_spaces table for student room sharing
CREATE TABLE public.shared_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  university TEXT NOT NULL,
  price NUMERIC NOT NULL,
  period TEXT NOT NULL DEFAULT 'month',
  images TEXT[] DEFAULT '{}'::TEXT[],
  videos TEXT[] DEFAULT '{}'::TEXT[],
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[] DEFAULT '{}'::TEXT[],
  is_available BOOLEAN DEFAULT true,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_spaces ENABLE ROW LEVEL SECURITY;

-- Anyone can view available shared spaces
CREATE POLICY "Anyone can view available shared spaces"
ON public.shared_spaces
FOR SELECT
USING (is_available = true);

-- Students can create their own shared spaces
CREATE POLICY "Students can create own shared spaces"
ON public.shared_spaces
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id AND has_role(auth.uid(), 'student'::app_role));

-- Owners can update their own shared spaces
CREATE POLICY "Owners can update own shared spaces"
ON public.shared_spaces
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

-- Owners can delete their own shared spaces
CREATE POLICY "Owners can delete own shared spaces"
ON public.shared_spaces
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Admins can view all shared spaces
CREATE POLICY "Admins can view all shared spaces"
ON public.shared_spaces
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any shared space
CREATE POLICY "Admins can update any shared space"
ON public.shared_spaces
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_shared_spaces_updated_at
BEFORE UPDATE ON public.shared_spaces
FOR EACH ROW
EXECUTE FUNCTION public.update_booking_updated_at();

-- Create storage bucket for shared space media
INSERT INTO storage.buckets (id, name, public) VALUES ('shared-space-media', 'shared-space-media', true);

-- Storage policies for shared space media
CREATE POLICY "Anyone can view shared space media"
ON storage.objects FOR SELECT
USING (bucket_id = 'shared-space-media');

CREATE POLICY "Authenticated users can upload shared space media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shared-space-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own shared space media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'shared-space-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own shared space media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'shared-space-media' AND auth.uid()::text = (storage.foldername(name))[1]);
