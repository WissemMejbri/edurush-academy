-- Drop the existing overpermissive UPDATE policy
DROP POLICY IF EXISTS "Teachers can update session status" ON public.booking_sessions;

-- Students can only update their own notes
CREATE POLICY "Students can update own notes"
ON public.booking_sessions
FOR UPDATE
TO public
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Teachers can update sessions assigned to them
CREATE POLICY "Teachers can update assigned sessions"
ON public.booking_sessions
FOR UPDATE
TO public
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

-- Admins can update any session
CREATE POLICY "Admins can update all sessions"
ON public.booking_sessions
FOR UPDATE
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Restrict avatars bucket: change public SELECT policy to authenticated only
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

CREATE POLICY "Authenticated users can view avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');