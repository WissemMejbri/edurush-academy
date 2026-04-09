-- Drop the overly permissive student UPDATE policy
DROP POLICY IF EXISTS "Students can update own notes" ON public.booking_sessions;

-- Create a secure RPC that only allows updating the notes field
CREATE OR REPLACE FUNCTION public.update_session_notes(session_id uuid, new_notes text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE booking_sessions
  SET notes = new_notes, updated_at = now()
  WHERE id = session_id AND student_id = auth.uid();
$$;