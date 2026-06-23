
-- 1) booking_sessions: scope policies to authenticated role
DROP POLICY IF EXISTS "Admins can update all sessions" ON public.booking_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.booking_sessions;
DROP POLICY IF EXISTS "Students can view their own sessions" ON public.booking_sessions;
DROP POLICY IF EXISTS "Teachers can update assigned sessions" ON public.booking_sessions;
DROP POLICY IF EXISTS "Teachers can view sessions assigned to them" ON public.booking_sessions;

CREATE POLICY "Admins can update all sessions" ON public.booking_sessions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all sessions" ON public.booking_sessions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view their own sessions" ON public.booking_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can update assigned sessions" ON public.booking_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can view sessions assigned to them" ON public.booking_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = teacher_id);

-- 2) consultation_requests + guest_booking_requests: tighten public INSERT policies
DROP POLICY IF EXISTS "Anyone can submit a consultation request" ON public.consultation_requests;
CREATE POLICY "Anyone can submit a consultation request" ON public.consultation_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL AND length(btrim(full_name)) > 0
    AND email IS NOT NULL AND length(btrim(email)) > 0
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

DROP POLICY IF EXISTS "Anyone can submit a guest booking" ON public.guest_booking_requests;
CREATE POLICY "Anyone can submit a guest booking" ON public.guest_booking_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL AND length(btrim(full_name)) > 0
    AND email IS NOT NULL AND length(btrim(email)) > 0
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- 3) profiles: also scope update policy off of public role
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4) user_roles: scope SELECT to authenticated
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 5) SECURITY DEFINER functions: revoke broad EXECUTE; grant only where required
REVOKE EXECUTE ON FUNCTION public.update_session_notes(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.update_session_notes(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- 6) Storage: remove broad public listing on avatars bucket
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
-- Individual avatar files remain reachable via the public bucket's CDN URLs,
-- but the bucket can no longer be listed/enumerated through the Data API.
