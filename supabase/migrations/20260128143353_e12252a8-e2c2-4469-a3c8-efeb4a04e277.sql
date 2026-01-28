-- Allow anyone to view profiles of property owners (agents/landlords)
-- This is needed so students can see agent contact info on listings
CREATE POLICY "Anyone can view property owner profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.owner_id = profiles.id 
    AND properties.is_available = true
  )
);