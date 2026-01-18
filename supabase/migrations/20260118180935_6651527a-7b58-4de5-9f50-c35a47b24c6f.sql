-- Drop the insecure policies
DROP POLICY IF EXISTS "Anyone can view bookings by email" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update their booking" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create secure policies that restrict access to booking creators and property owners

-- Users can view their own bookings (by email match) or property owners can view bookings for their properties
CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  (student_email = (auth.jwt()->>'email'))
  OR 
  (EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id::text = bookings.listing_id::text 
    AND properties.owner_id = auth.uid()
  ))
);

-- Only authenticated users can create bookings with their own email
CREATE POLICY "Users can create own bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (student_email = (auth.jwt()->>'email'));

-- Users can only update their own bookings
CREATE POLICY "Users can update own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (student_email = (auth.jwt()->>'email'));