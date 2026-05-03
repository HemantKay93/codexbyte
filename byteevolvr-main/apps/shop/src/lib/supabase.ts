import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wpxotvohmipetlgsontl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EF3D7K34ABwiZ5FYTCkcdQ_TctzRbwJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
