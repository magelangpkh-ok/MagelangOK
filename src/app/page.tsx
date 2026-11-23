import { supabase } from '@/lib/supabase';
import PortalClient from './PortalClient';

export const revalidate = 10; // Cache on Vercel CDN, revalidate every 10 seconds

export default async function Home() {
  let menus: any[] = [];
  let submenus: any[] = [];
  let settingsRow: any = null;

  try {
    const [menusRes, submenusRes, settingsRes] = await Promise.all([
      supabase.from('menus').select('*').order('order_index', { ascending: true }),
      supabase.from('submenus').select('*').order('order_index', { ascending: true }),
      supabase.from('portal_settings').select('*').single()
    ]);

    menus = menusRes.data || [];
    submenus = submenusRes.data || [];
    settingsRow = settingsRes.data || null;

    if (!settingsRow) {
      const fallback = await supabase.from('portal_settings_rows').select('*').single();
      if (fallback.data) settingsRow = fallback.data;
    }
  } catch (err) {
    console.error('Error fetching portal data:', err);
  }
  
  // Format data & hilangkan duplikat (deduplikasi otomatis)
  const uniqueMenusMap = new Map<string, any>();
  (menus || []).forEach(menu => {
    if (!uniqueMenusMap.has(menu.title)) {
      uniqueMenusMap.set(menu.title, menu);
    }
  });

  const formattedData = Array.from(uniqueMenusMap.values()).map(menu => {
    const rawSubs = (submenus || []).filter(sub => sub.menu_id === menu.id);
    const uniqueSubsMap = new Map<string, any>();
    rawSubs.forEach(s => {
      if (!uniqueSubsMap.has(s.title)) {
        uniqueSubsMap.set(s.title, s);
      }
    });
    return {
      ...menu,
      submenus: Array.from(uniqueSubsMap.values())
    };
  });
  
  const settings = settingsRow || { 
    title: 'Sistem Operasi', 
    highlight: 'PKH', 
    subtitle: 'Pusat Integrasi Data & Layanan Kabupaten Magelang',
    broadcast_active: false,
    broadcast_text: ''
  };

  return <PortalClient initialMenus={formattedData} initialSettings={settings} />;
}
