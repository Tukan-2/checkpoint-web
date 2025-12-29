
-- Storage bucket pro ikony vozidel
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-icons', 'vehicle-icons', true);

-- RLS pro storage bucket
CREATE POLICY "Veřejné čtení ikon vozidel" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-icons');

CREATE POLICY "Admini mohou nahrávat ikony vozidel" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vehicle-icons' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admini mohou mazat ikony vozidel" ON storage.objects
FOR DELETE USING (bucket_id = 'vehicle-icons' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admini mohou aktualizovat ikony vozidel" ON storage.objects
FOR UPDATE USING (bucket_id = 'vehicle-icons' AND has_role(auth.uid(), 'admin'::app_role));

-- Přidat sloupec pro URL ikony do vehicle_groups
ALTER TABLE public.vehicle_groups ADD COLUMN IF NOT EXISTS icon_url text;
