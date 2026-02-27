
-- Fix: restrict insert to only service role (triggers use SECURITY DEFINER so they bypass RLS)
DROP POLICY "System can insert notifications" ON public.admin_notifications;
CREATE POLICY "No direct inserts" ON public.admin_notifications
  FOR INSERT WITH CHECK (false);
