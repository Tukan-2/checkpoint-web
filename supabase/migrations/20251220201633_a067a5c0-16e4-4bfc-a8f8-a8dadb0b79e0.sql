-- Drop the overly permissive SELECT policy that exposes all customer data
DROP POLICY IF EXISTS "Anyone can view their own booking by email" ON public.bookings;

-- Drop the overly permissive UPDATE policy that allows anyone to modify any booking
DROP POLICY IF EXISTS "Anyone can cancel booking with valid token" ON public.bookings;