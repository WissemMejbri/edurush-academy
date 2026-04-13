CREATE POLICY "Admins can delete sessions"
ON public.booking_sessions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));