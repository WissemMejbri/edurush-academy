-- Create guest booking requests table
CREATE TABLE public.guest_booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  level TEXT NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME WITHOUT TIME ZONE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_guest BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guest_booking_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (guest booking)
CREATE POLICY "Anyone can submit a guest booking"
ON public.guest_booking_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view guest bookings"
ON public.guest_booking_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update
CREATE POLICY "Admins can update guest bookings"
ON public.guest_booking_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete guest bookings"
ON public.guest_booking_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_guest_booking_requests_updated_at
BEFORE UPDATE ON public.guest_booking_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();