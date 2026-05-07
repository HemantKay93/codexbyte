import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('CRITICAL: Missing Supabase configuration. Using fallbacks if available.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

let cachedAdminToken: string | null = null;
let tokenExpiresAt = 0;

export const getAdminClient = async () => {
  // 1. Preferred: Service Role Key (Bypasses RLS)
  if (serviceRoleKey) {
    return createClient(supabaseUrl!, serviceRoleKey, {
      auth: { persistSession: false }
    });
  }

  // 2. Fallback: Authenticate as Admin user
  if (!cachedAdminToken || Date.now() > tokenExpiresAt) {
    const tempClient = createClient(supabaseUrl!, supabaseKey!);
    const { data, error } = await tempClient.auth.signInWithPassword({ 
      email: 'admin@byteevolvr.com', 
      password: 'Admin@123' 
    });
    
    if (error || !data.session) {
      console.error("CRITICAL: Admin Supabase login failed. Falling back to ANON key.");
      return supabase;
    }
    
    cachedAdminToken = data.session.access_token;
    tokenExpiresAt = Date.now() + (data.session.expires_in * 1000) - 60000;
  }
  
  return createClient(supabaseUrl!, supabaseKey!, {
    global: { headers: { Authorization: `Bearer ${cachedAdminToken}` } }
  });
};
