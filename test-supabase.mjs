import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Baca credential dari .env.local jika ada
let supabaseUrl = 'https://urfubdurxnykqecnalum.supabase.co';
let supabaseAnonKey = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.replace('NEXT_PUBLIC_SUPABASE_URL=', '').trim();
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.replace('NEXT_PUBLIC_SUPABASE_ANON_KEY=', '').trim();
    }
  }
} catch (e) {
  console.warn("Gagal membaca .env.local, menggunakan default.");
}

console.log("Target URL:", supabaseUrl);
console.log("Anon Key:", supabaseAnonKey ? (supabaseAnonKey.slice(0, 15) + '...') : '(Belum diisi)');

if (!supabaseAnonKey || supabaseAnonKey.includes('GANTI_DENGAN_ANON_KEY_BARU')) {
  console.error("\n[PERINGATAN] Silakan masukkan Anon Key Supabase yang valid ke dalam file .env.local terlebih dahulu!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("\n1. Menguji koneksi & tabel 'menus'...");
  const { data: menus, error: menusError } = await supabase.from('menus').select('*').limit(3);
  if (menusError) {
    console.error("❌ Error query 'menus':", menusError.message);
  } else {
    console.log(`✅ Tabel 'menus' terbaca! (Ditemukan ${menus.length} record)`);
  }

  console.log("\n2. Menguji tabel settings ('portal_settings' / 'portal_settings_rows')...");
  let { data: settings, error: settingsError } = await supabase.from('portal_settings').select('*').limit(1);
  if (settingsError) {
    const fallback = await supabase.from('portal_settings_rows').select('*').limit(1);
    if (!fallback.error) {
      settings = fallback.data;
      settingsError = null;
      console.log("✅ Menggunakan tabel 'portal_settings_rows'");
    }
  }
  
  if (settingsError) {
    console.error("❌ Error query settings:", settingsError.message);
  } else {
    console.log("✅ Tabel settings terbaca!", settings);
  }
}

test();
