import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhzqyhtastxvkevahwae.supabase.co';
const supabaseAnonKey = 'sb_publishable_R7kbY0xhUq8E-ozqqV3arw_tATyJpKr';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function injectData() {
  console.log("Memulai Injeksi Data...");

  // 1. Bersihkan tabel menus (Submenus akan ikut terhapus karena ON DELETE CASCADE)
  await supabase.from('menus').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // ID Generate
  const m1 = crypto.randomUUID();
  const m2 = crypto.randomUUID();
  const m3 = crypto.randomUUID();
  const m4 = crypto.randomUUID();

  // 2. Insert Menus Utama
  const menus = [
    { id: m1, title: 'Aplikasi Internal', url: '#', order_index: 1, is_active: true },
    { id: m2, title: 'Layanan Publik', url: '#', order_index: 2, is_active: true },
    { id: m3, title: 'SEGERA KERJAKAN', url: '#', order_index: 3, is_active: true },
    { id: m4, title: 'Panduan & SOP', url: '#', order_index: 4, is_active: true }
  ];
  
  const { error: err1 } = await supabase.from('menus').insert(menus);
  if (err1) {
    console.error("Gagal insert menu:", err1);
    return;
  }

  // 3. Insert Sub-Menus
  const submenus = [
    // Aplikasi Internal
    { id: crypto.randomUUID(), menu_id: m1, title: 'Sistem Informasi PKH', url: 'https://pkh.kemensos.go.id', order_index: 1, is_active: true },
    { id: crypto.randomUUID(), menu_id: m1, title: 'Database Spreadsheet', url: 'https://docs.google.com/spreadsheets', order_index: 2, is_active: true },
    
    // Layanan Publik
    { id: crypto.randomUUID(), menu_id: m2, title: 'Portal Kab. Magelang', url: 'https://magelangkab.go.id', order_index: 1, is_active: true },
    { id: crypto.randomUUID(), menu_id: m2, title: 'Lapor Bupati!', url: 'https://lapor.go.id', order_index: 2, is_active: true },
    
    // Segera Kerjakan
    { id: crypto.randomUUID(), menu_id: m3, title: 'Sinkronisasi NIK', url: '#', order_index: 1, is_active: true },
    { id: crypto.randomUUID(), menu_id: m3, title: 'Verifikasi Data KPM Bulan Ini', url: '#', order_index: 2, is_active: true },

    // Panduan & SOP
    { id: crypto.randomUUID(), menu_id: m4, title: 'SOP Pendamping PKH', url: '#', order_index: 1, is_active: true },
    { id: crypto.randomUUID(), menu_id: m4, title: 'Kontak Tim IT', url: '#', order_index: 2, is_active: true }
  ];

  const { error: err2 } = await supabase.from('submenus').insert(submenus);
  if (err2) {
    console.error("Gagal insert sub-menu:", err2);
    return;
  }

  console.log("Data berhasil diinjeksi ke Supabase!");
}

injectData();
