
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT TO public
USING (
  (student_email = (auth.jwt() ->> 'email'::text))
  OR (EXISTS (
    SELECT 1 FROM properties
    WHERE ((properties.id)::text = bookings.listing_id)
    AND (properties.owner_id = auth.uid())
  ))
  OR (EXISTS (
    SELECT 1 FROM shared_spaces
    WHERE ((shared_spaces.id)::text = bookings.listing_id)
    AND (shared_spaces.owner_id = auth.uid())
  ))
);
