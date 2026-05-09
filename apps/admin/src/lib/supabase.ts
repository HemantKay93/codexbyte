import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and anon key are required for direct Supabase admin pages.');
}

const unavailableSupabase = new Proxy(
  {},
  {
    get() {
      throw new Error('Supabase URL and anon key are required');
    },
  }
) as ReturnType<typeof createClient>;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : unavailableSupabase;
