
-- Create teacher_availability table
CREATE TABLE public.teacher_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, day_of_week, start_time)
);

ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own availability
CREATE POLICY "Teachers can manage own availability" ON public.teacher_availability
  FOR ALL TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Everyone can view teacher availability (for booking)
CREATE POLICY "Authenticated users can view availability" ON public.teacher_availability
  FOR SELECT TO authenticated
  USING (true);

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Update booking_sessions status to use proper values
-- Add proposed_date and proposed_time columns for teacher counter-proposals
ALTER TABLE public.booking_sessions ADD COLUMN IF NOT EXISTS proposed_date date;
ALTER TABLE public.booking_sessions ADD COLUMN IF NOT EXISTS proposed_time time;
