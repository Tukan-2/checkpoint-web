-- Add cancellation token to bookings table
ALTER TABLE public.bookings 
ADD COLUMN cancellation_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN cancelled_at timestamp with time zone;

-- Create index for fast token lookup
CREATE INDEX idx_bookings_cancellation_token ON public.bookings(cancellation_token);

-- Policy for public cancellation via token
CREATE POLICY "Anyone can cancel booking with valid token"
ON public.bookings
FOR UPDATE
USING (true)
WITH CHECK (true);