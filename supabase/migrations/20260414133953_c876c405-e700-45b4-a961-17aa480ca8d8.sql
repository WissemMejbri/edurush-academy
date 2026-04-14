CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT role::TEXT FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'teacher' THEN 2
      WHEN 'student' THEN 3
    END
  LIMIT 1
$$;