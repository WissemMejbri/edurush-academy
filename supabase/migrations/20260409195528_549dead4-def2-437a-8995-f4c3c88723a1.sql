
-- 1. FIX: Privilege escalation on user_roles
-- Drop the overly permissive ALL policy and replace with scoped policies
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Block non-admin INSERT/UPDATE/DELETE by adding restrictive deny policies
-- Since the handle_new_user trigger uses SECURITY DEFINER, it bypasses RLS.
-- We only need to ensure regular authenticated users cannot insert.
CREATE POLICY "Deny non-admin role modifications"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny non-admin role updates"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny non-admin role deletes"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. FIX: Teacher availability - add role check
DROP POLICY IF EXISTS "Teachers can manage own availability" ON public.teacher_availability;

CREATE POLICY "Teachers can manage own availability"
ON public.teacher_availability
FOR ALL
TO authenticated
USING (
  auth.uid() = teacher_id
  AND has_role(auth.uid(), 'teacher'::app_role)
)
WITH CHECK (
  auth.uid() = teacher_id
  AND has_role(auth.uid(), 'teacher'::app_role)
);

-- 3. FIX: Booking sessions - validate teacher_id references a real teacher
DROP POLICY IF EXISTS "Students can create booking requests" ON public.booking_sessions;

CREATE POLICY "Students can create booking requests"
ON public.booking_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = teacher_id
    AND role = 'teacher'::app_role
  )
);
