-- ====================================================================
-- Script Perbaikan Izin (GRANT & RLS) & Penyesuaian Nama Tabel
-- JANGAN DROP TABLE (Agar data yang sudah diimport TIDAK hilang!)
-- ====================================================================

-- 1. Ubah nama portal_settings_rows menjadi portal_settings (jika masih bernama portal_settings_rows)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'portal_settings_rows'
    ) THEN
        ALTER TABLE public.portal_settings_rows RENAME TO portal_settings;
    END IF;
END $$;

-- 2. Berikan Izin Akses (GRANT) ke role anon dan authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 3. Aktifkan Row Level Security (RLS) dan Berikan Policy Akses Penuh
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submenus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access menus" ON public.menus;
DROP POLICY IF EXISTS "Allow public access submenus" ON public.submenus;
DROP POLICY IF EXISTS "Allow public access portal_settings" ON public.portal_settings;

CREATE POLICY "Allow public access menus" ON public.menus FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access submenus" ON public.submenus FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access portal_settings" ON public.portal_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Aktifkan Supabase Realtime agar perubahan menu langsung update di browser
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menus, public.submenus, public.portal_settings;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
