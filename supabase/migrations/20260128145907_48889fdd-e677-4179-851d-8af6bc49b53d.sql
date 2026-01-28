-- Add inspection status to track the verification process
ALTER TABLE public.bookings 
ADD COLUMN inspection_status text DEFAULT 'pending' CHECK (inspection_status IN ('pending', 'payment_verified', 'scheduled', 'in_progress', 'completed', 'approved', 'rejected'));

-- Add inspection notes for admin feedback
ALTER TABLE public.bookings 
ADD COLUMN inspection_notes text;

-- Add scheduled inspection date
ALTER TABLE public.bookings 
ADD COLUMN inspection_date timestamp with time zone;