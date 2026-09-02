-- Schema for MagelangOK Navigation and Content

-- 1. Menus Table (Top level navigation)
CREATE TABLE public.menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) DEFAULT '#',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Submenus Table (Dropdown items)
CREATE TABLE public.submenus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Insert Initial Data
INSERT INTO public.menus (title, url, order_index) VALUES 
('Beranda', '/', 1),
('Tentang PKH', '#', 2),
('Data Bantuan', '/data', 3),
('Kontak', '/kontak', 4);

-- Note: To link submenus, you will need the generated UUIDs from the menus table.
-- Example:
-- INSERT INTO public.submenus (menu_id, title, url, order_index) VALUES 
-- ((SELECT id FROM public.menus WHERE title = 'Tentang PKH'), 'Visi & Misi', '/visi-misi', 1),
-- ((SELECT id FROM public.menus WHERE title = 'Tentang PKH'), 'Struktur Organisasi', '/struktur', 2);

-- Set up Row Level Security (RLS)
-- Allow public read access to menus and submenus
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for menus" ON public.menus FOR SELECT USING (true);

ALTER TABLE public.submenus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for submenus" ON public.submenus FOR SELECT USING (true);

-- Allow all operations for authenticated users (admin panel)
CREATE POLICY "Admin full access menus" ON public.menus FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access submenus" ON public.submenus FOR ALL USING (auth.role() = 'authenticated');
