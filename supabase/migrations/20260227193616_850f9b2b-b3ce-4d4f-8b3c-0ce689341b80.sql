
-- Create admin notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admins can view notifications" ON public.admin_notifications
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update (mark as read)
CREATE POLICY "Admins can update notifications" ON public.admin_notifications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert notifications (via trigger)
CREATE POLICY "System can insert notifications" ON public.admin_notifications
  FOR INSERT WITH CHECK (true);

-- Create trigger to auto-generate notifications on new bookings
CREATE OR REPLACE FUNCTION public.notify_admin_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (title, message, type, related_id)
  VALUES (
    'New Booking',
    'New booking from ' || NEW.student_name || ' for property ' || NEW.listing_id,
    'booking',
    NEW.id::text
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_booking_notify
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_booking();

-- Create trigger for inspection status changes
CREATE OR REPLACE FUNCTION public.notify_admin_on_inspection_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.inspection_status IS DISTINCT FROM NEW.inspection_status AND NEW.inspection_status IN ('approved', 'rejected') THEN
    INSERT INTO public.admin_notifications (title, message, type, related_id)
    VALUES (
      CASE WHEN NEW.inspection_status = 'approved' THEN 'Inspection Passed' ELSE 'Inspection Failed' END,
      'Inspection for booking by ' || NEW.student_name || ' has been ' || NEW.inspection_status,
      'inspection',
      NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_inspection_change_notify
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_inspection_change();
