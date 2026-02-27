
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admini mohou spravovat nastavení" ON public.site_settings;
DROP POLICY IF EXISTS "Veřejné čtení nastavení" ON public.site_settings;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admini mohou spravovat nastavení"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Veřejné čtení nastavení"
ON public.site_settings
FOR SELECT
USING (true);
