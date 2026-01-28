-- Create services table for managing service types with duration and concurrent slots
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Car',
  duration_minutes INTEGER DEFAULT 30,
  concurrent_slots INTEGER DEFAULT 1,
  price NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public can view active services
CREATE POLICY "Public can view active services"
ON public.services
FOR SELECT
USING (is_active = true);

-- Admins can manage services
CREATE POLICY "Admins can manage services"
ON public.services
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default services
INSERT INTO public.services (name, description, icon, duration_minutes, concurrent_slots, price, order_index) VALUES
('STK osobních vozidel', 'Kompletní technická kontrola osobních automobilů včetně emisí. Rychle a profesionálně.', 'Car', 30, 2, 800, 1),
('Měření emisí', 'Přesné měření emisí benzínových i naftových motorů s okamžitým výsledkem.', 'Gauge', 15, 2, 400, 2),
('Evidenční kontrola', 'Kontrola identifikačních údajů vozidla pro přepis nebo změnu v registru.', 'FileCheck', 20, 1, 300, 3),
('STK nákladních vozidel', 'Technická kontrola nákladních vozidel, přívěsů a návěsů do 3,5 tuny.', 'Wrench', 45, 1, 1200, 4),
('ADR kontrola', 'Speciální kontrola vozidel pro přepravu nebezpečných látek.', 'AlertTriangle', 60, 1, 1500, 5),
('Opakovaná kontrola', 'Rychlá opakovaná kontrola po odstranění závad do 30 dnů.', 'CheckCircle', 15, 2, 200, 6);