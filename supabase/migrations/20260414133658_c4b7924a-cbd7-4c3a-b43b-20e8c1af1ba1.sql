-- Drop the overly restrictive INSERT policy
DROP POLICY IF EXISTS "Students can create booking requests" ON public.booking_sessions;

-- Create a simpler policy: students can insert rows where student_id = their uid
CREATE POLICY "Students can create booking requests"
ON public.booking_sessions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);
