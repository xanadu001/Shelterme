-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'landlord', 'agent');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    company_name text,
    phone text,
    verified boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role"
ON public.user_roles FOR UPDATE
USING (auth.uid() = user_id);

-- Create properties table for landlord/agent listings
CREATE TABLE public.properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    location text NOT NULL,
    university text NOT NULL,
    price numeric NOT NULL,
    period text NOT NULL DEFAULT 'year',
    bedrooms integer NOT NULL DEFAULT 1,
    bathrooms integer NOT NULL DEFAULT 1,
    size text,
    amenities text[] DEFAULT '{}',
    images text[] DEFAULT '{}',
    is_verified boolean DEFAULT false,
    is_available boolean DEFAULT true,
    views_count integer DEFAULT 0,
    inquiries_count integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- RLS policies for properties
CREATE POLICY "Anyone can view available properties"
ON public.properties FOR SELECT
USING (is_available = true);

CREATE POLICY "Owners can view all own properties"
ON public.properties FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert own properties"
ON public.properties FOR INSERT
WITH CHECK (
    auth.uid() = owner_id 
    AND (public.has_role(auth.uid(), 'landlord') OR public.has_role(auth.uid(), 'agent'))
);

CREATE POLICY "Owners can update own properties"
ON public.properties FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own properties"
ON public.properties FOR DELETE
USING (auth.uid() = owner_id);

-- Create trigger for updated_at on properties
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_booking_updated_at();

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Storage policies for property images
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own property images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);