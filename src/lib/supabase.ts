import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhzqyhtastxvkevahwae.supabase.co';
const supabaseAnonKey = 'sb_publishable_R7kbY0xhUq8E-ozqqV3arw_tATyJpKr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
