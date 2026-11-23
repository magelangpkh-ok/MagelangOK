import { supabase } from '@/lib/supabase';
import PortalClient from './PortalClient';

export const revalidate = 10; // Cache on Vercel CDN, revalidate every 10 seconds

export default async function Home() {
  // Fetch directly from Supabase for zero latency via CDN
  const { data: menus } = await supabase.from('menus').select('*').order('order_index', { ascending: true });
  const { data: submenus } = await supabase.from('submenus').select('*').order('order_index', { ascending: true });
  
  let { data: settingsRow } = await supabase.from('portal_settings').select('*').single();
  if (!settingsRow) {
    const { data: fallbackRow } = await supabase.from('portal_settings_rows').select('*').single();
    if (fallbackRow) settingsRow = fallbackRow;
  }
  
  // Format data
  const formattedData = (menus || []).map(menu => ({
    ...menu,
    submenus: (submenus || []).filter(sub => sub.menu_id === menu.id)
  }));
  
  const settings = settingsRow || { 
    title: 'Sistem Operasi', 
    highlight: 'PKH', 
    subtitle: 'Pusat Integrasi Data & Layanan Kabupaten Magelang',
    broadcast_active: false,
    broadcast_text: ''
  };

  return <PortalClient initialMenus={formattedData} initialSettings={settings} />;
}
