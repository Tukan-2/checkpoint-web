
-- Tabulka pro globální nastavení webu
CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabulka pro editovatelné texty webu
CREATE TABLE public.site_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section text NOT NULL,
    key text NOT NULL,
    title text,
    content text,
    description text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(section, key)
);

-- Tabulka pro menu položky
CREATE TABLE public.menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    label text NOT NULL,
    href text NOT NULL,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_external boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Povolit RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS pro site_settings
CREATE POLICY "Veřejné čtení nastavení" ON public.site_settings
FOR SELECT USING (true);

CREATE POLICY "Admini mohou spravovat nastavení" ON public.site_settings
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS pro site_content
CREATE POLICY "Veřejné čtení obsahu" ON public.site_content
FOR SELECT USING (true);

CREATE POLICY "Admini mohou spravovat obsah" ON public.site_content
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS pro menu_items
CREATE POLICY "Veřejné čtení menu" ON public.menu_items
FOR SELECT USING (true);

CREATE POLICY "Admini mohou spravovat menu" ON public.menu_items
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Výchozí nastavení
INSERT INTO public.site_settings (key, value, description) VALUES
('prices_visible', 'false', 'Zobrazit ceník na webu'),
('contact_phone', '+420 123 456 789', 'Kontaktní telefon'),
('contact_email', 'info@stk-kontroly.cz', 'Kontaktní email');

-- Výchozí menu položky
INSERT INTO public.menu_items (label, href, order_index, is_active) VALUES
('Domů', '/', 1, true),
('Služby', '/#sluzby', 2, true),
('O nás', '/#o-nas', 3, true),
('Pobočky', '/pobocky', 4, true),
('Kontakt', '/#kontakt', 5, true),
('Kariéra', '/kariera', 6, false);

-- Výchozí obsah webu
INSERT INTO public.site_content (section, key, title, content, description, order_index) VALUES
('hero', 'headline', 'Spolehlivá STK kontrola', 'Vaše vozidlo v rukou profesionálů', 'Hlavní nadpis na úvodní stránce', 1),
('hero', 'subheadline', NULL, 'Rychlá a profesionální technická kontrola vašeho vozidla na moderních stanicích po celé ČR.', 'Podnadpis na úvodní stránce', 2),
('about', 'title', 'O nás', 'Více než 15 let zkušeností', 'Nadpis sekce O nás', 1),
('about', 'description', NULL, 'Jsme tým zkušených techniků s dlouholetou praxí v oblasti technických kontrol vozidel.', 'Popis sekce O nás', 2),
('services', 'title', 'Naše služby', 'Co pro vás můžeme udělat', 'Nadpis sekce služby', 1),
('contact', 'title', 'Kontakt', 'Spojte se s námi', 'Nadpis sekce kontakt', 1),
('footer', 'copyright', NULL, '© 2024 STK Kontroly. Všechna práva vyhrazena.', 'Copyright text', 1);
