-- First drop the policy that depends on listing_id
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

-- Change listing_id from integer to text to support both numeric IDs and UUIDs
ALTER TABLE public.bookings 
ALTER COLUMN listing_id TYPE text USING listing_id::text;

-- Recreate the policy with the text column
CREATE POLICY "Users can view own bookings" 
ON public.bookings 
FOR SELECT 
USING (
  (student_email = (auth.jwt() ->> 'email'::text)) 
  OR (EXISTS ( 
    SELECT 1
    FROM properties
    WHERE ((properties.id)::text = bookings.listing_id AND properties.owner_id = auth.uid())
  ))
);