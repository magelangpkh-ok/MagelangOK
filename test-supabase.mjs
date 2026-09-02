import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhzqyhtastxvkevahwae.supabase.co';
const supabaseAnonKey = 'sb_publishable_R7kbY0xhUq8E-ozqqV3arw_tATyJpKr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing Supabase Connection...");
  
  const { data, error } = await supabase.from('menus').select('*').limit(1);
  
  if (error) {
    console.error("Error querying 'menus':", error);
  } else {
    console.log("Menus table exists. Data:", data);
  }
}

test();
