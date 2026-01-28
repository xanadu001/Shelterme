-- Add suspended column to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN suspended boolean DEFAULT false;

-- Create function to check if user is suspended
CREATE OR REPLACE FUNCTION public.is_user_suspended(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT suspended FROM public.user_roles WHERE user_id = _user_id LIMIT 1),
    false
  )
$$;

-- Update the "Anyone can view available properties" policy to exclude suspended users' properties
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;

CREATE POLICY "Anyone can view available properties" 
ON public.properties 
FOR SELECT 
USING (
  is_available = true 
  AND NOT public.is_user_suspended(owner_id)
);