-- Add RLS policies for admin access to all tables

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all user_roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update user roles (for verification etc)
CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all properties (including unavailable)
CREATE POLICY "Admins can view all properties"
ON public.properties
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update any property (for verification)
CREATE POLICY "Admins can update any property"
ON public.properties
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update any booking (for inspection management)
CREATE POLICY "Admins can update any booking"
ON public.bookings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));