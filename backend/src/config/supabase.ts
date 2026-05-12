import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('CRITICAL: SUPABASE_URL is missing in environment variables.');
}
if (!supabaseKey) {
  throw new Error('CRITICAL: SUPABASE_KEY (anon key) is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl!, supabaseKey!);

let adminClient: any = null;
let cachedAdminToken: string | null = null;
let tokenExpiresAt = 0;

export const getAdminClient = async () => {
  // 1. Preferred: Service Role Key (Bypasses RLS)
  if (serviceRoleKey) {
    if (!adminClient || adminClient.supabaseKey !== serviceRoleKey) {
      adminClient = createClient(supabaseUrl!, serviceRoleKey, {
        auth: { persistSession: false },
      });
    }
    return adminClient;
  }

  // 2. Fallback: Authenticate as Admin user using env variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      'CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAIL/ADMIN_PASSWORD. Admin operations will fail.'
    );
    return supabase;
  }

  if (!cachedAdminToken || Date.now() > tokenExpiresAt) {
    const tempClient = createClient(supabaseUrl!, supabaseKey!);
    const { data, error } = await tempClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error || !data.session) {
      console.error('CRITICAL: Admin Supabase login failed. Falling back to ANON key.');
      return supabase;
    }

    cachedAdminToken = data.session.access_token;
    tokenExpiresAt = Date.now() + data.session.expires_in * 1000 - 60000;

    // Recreate client with new token
    adminClient = createClient(supabaseUrl!, supabaseKey!, {
      global: { headers: { Authorization: `Bearer ${cachedAdminToken}` } },
    });
  }

  return adminClient || supabase;
};
