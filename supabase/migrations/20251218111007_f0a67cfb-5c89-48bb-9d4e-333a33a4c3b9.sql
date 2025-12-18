-- Vehicle groups enum/table
CREATE TABLE public.vehicle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

-- Branches main table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB,
  map_embed_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Branch vehicle groups (which vehicles each branch can inspect)
CREATE TABLE public.branch_vehicle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  vehicle_group_id UUID REFERENCES public.vehicle_groups(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(branch_id, vehicle_group_id)
);

-- Branch prices (per branch and vehicle group)
CREATE TABLE public.branch_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  vehicle_group_id UUID REFERENCES public.vehicle_groups(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  UNIQUE(branch_id, vehicle_group_id, service_name)
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  vehicle_group_id UUID REFERENCES public.vehicle_groups(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  license_plate TEXT,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_vehicle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for branches and related data
CREATE POLICY "Public can view vehicle groups" ON public.vehicle_groups FOR SELECT USING (true);
CREATE POLICY "Public can view active branches" ON public.branches FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view branch vehicle groups" ON public.branch_vehicle_groups FOR SELECT USING (true);
CREATE POLICY "Public can view branch prices" ON public.branch_prices FOR SELECT USING (true);

-- Anyone can create bookings (no auth required for booking)
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their own booking by email" ON public.bookings FOR SELECT USING (true);

-- Insert sample vehicle groups
INSERT INTO public.vehicle_groups (name, description, icon) VALUES
  ('Osobní vozidla', 'Osobní automobily do 3,5t', 'Car'),
  ('Motocykly', 'Jednostopá motorová vozidla', 'Bike'),
  ('Nákladní vozidla', 'Nákladní automobily a přívěsy', 'Truck'),
  ('Autobusy', 'Autobusy a minibusy', 'Bus'),
  ('Přípojná vozidla', 'Přívěsy a návěsy', 'Container');

-- Insert sample branches
INSERT INTO public.branches (name, slug, description, address, city, postal_code, phone, email, opening_hours, map_embed_url) VALUES
  ('STK Praha - Hostivař', 'praha-hostivar', 'Moderní stanice technické kontroly v Praze Hostivaři s kapacitou pro všechny typy vozidel.', 'Průmyslová 1234', 'Praha 10', '102 00', '+420 123 456 789', 'hostivar@stk-autokontrol.cz', '{"po": "7:00-17:00", "ut": "7:00-17:00", "st": "7:00-17:00", "ct": "7:00-17:00", "pa": "7:00-15:00", "so": "8:00-12:00", "ne": "Zavřeno"}', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.5!2d14.5!3d50.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDA1JzAwLjAiTiAxNMKwMzAnMDAuMCJF!5e0!3m2!1scs!2scz'),
  ('STK Brno - Slatina', 'brno-slatina', 'Největší STK na jižní Moravě se specializací na nákladní vozidla.', 'Řípská 567', 'Brno', '627 00', '+420 234 567 890', 'brno@stk-autokontrol.cz', '{"po": "6:30-17:30", "ut": "6:30-17:30", "st": "6:30-17:30", "ct": "6:30-17:30", "pa": "6:30-16:00", "so": "Zavřeno", "ne": "Zavřeno"}', null),
  ('STK Ostrava - Hrabová', 'ostrava-hrabova', 'Nejmodernější vybavení v Moravskoslezském kraji.', 'Místecká 890', 'Ostrava', '720 00', '+420 345 678 901', 'ostrava@stk-autokontrol.cz', '{"po": "7:00-17:00", "ut": "7:00-17:00", "st": "7:00-17:00", "ct": "7:00-17:00", "pa": "7:00-15:00", "so": "8:00-12:00", "ne": "Zavřeno"}', null);

-- Link vehicle groups to branches
INSERT INTO public.branch_vehicle_groups (branch_id, vehicle_group_id)
SELECT b.id, vg.id FROM public.branches b, public.vehicle_groups vg WHERE b.slug = 'praha-hostivar';

INSERT INTO public.branch_vehicle_groups (branch_id, vehicle_group_id)
SELECT b.id, vg.id FROM public.branches b, public.vehicle_groups vg WHERE b.slug = 'brno-slatina' AND vg.name IN ('Osobní vozidla', 'Nákladní vozidla', 'Přípojná vozidla');

INSERT INTO public.branch_vehicle_groups (branch_id, vehicle_group_id)
SELECT b.id, vg.id FROM public.branches b, public.vehicle_groups vg WHERE b.slug = 'ostrava-hrabova' AND vg.name IN ('Osobní vozidla', 'Motocykly');

-- Insert sample prices
INSERT INTO public.branch_prices (branch_id, vehicle_group_id, service_name, price, description)
SELECT b.id, vg.id, 'STK', 800, 'Technická kontrola' FROM public.branches b, public.vehicle_groups vg WHERE b.slug = 'praha-hostivar' AND vg.name = 'Osobní vozidla';

INSERT INTO public.branch_prices (branch_id, vehicle_group_id, service_name, price, description)
SELECT b.id, vg.id, 'Emise', 400, 'Měření emisí' FROM public.branches b, public.vehicle_groups vg WHERE b.slug = 'praha-hostivar' AND vg.name = 'Osobní vozidla';

INSERT INTO public.branch_prices (branch_id, vehicle_group_id, service_name, price, description)
SELECT b.id, vg.id, 'Evidenční kontrola', 300, 'Kontrola VIN' FROM public.branches b, public.vehicle_groups vg WHERE b.slug = 'praha-hostivar' AND vg.name = 'Osobní vozidla';

INSERT INTO public.branch_prices (branch_id, vehicle_group_id, service_name, price, description)
SELECT b.id, vg.id, 'STK', 1200, 'Technická kontrola nákladních vozidel' FROM public.branches b, public.vehicle_groups vg WHERE b.slug = 'brno-slatina' AND vg.name = 'Nákladní vozidla';

INSERT INTO public.branch_prices (branch_id, vehicle_group_id, service_name, price, description)
SELECT b.id, vg.id, 'STK', 750, 'Technická kontrola' FROM public.branches b, public.vehicle_groups vg WHERE b.slug = 'ostrava-hrabova' AND vg.name = 'Osobní vozidla';