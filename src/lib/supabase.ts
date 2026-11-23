import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://urfubdurxnykqecnalum.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SpTHGdETmFnJZ5PSRDaT-Q_uDE2qZsF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


