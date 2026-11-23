import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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
} catch (e) {}

const supabase = createClient(supabaseUrl, supabaseAnonKey);


async function check() {
  const { data, error } = await supabase.from('menus').select('db_url').limit(1);
  console.log("Check db_url:", { data, error });
}
check();
