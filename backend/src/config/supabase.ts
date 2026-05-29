import path from 'path';
import { fileURLToPath } from 'url';

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
console.log(`[Supabase] Connecting to URL: ${supabaseUrl.substring(0, 15)}...`);
// eslint-disable-line no-console
if (!supabaseKey) {
  throw new Error('CRITICAL: SUPABASE_KEY (anon key) is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl!, supabaseKey!);

let adminClient: any = null;
// eslint-disable-line @typescript-eslint/no-explicit-any
// eslint-disable-line @typescript-eslint/no-explicit-any
let cachedAdminToken: string | null = null;
let tokenExpiresAt = 0;
let adminClientInitialized = false; // track whether service-role client was created

// eslint-disable-line @typescript-eslint/no-explicit-any
let adminClientPromise: Promise<any> | null = null;
// eslint-disable-line @typescript-eslint/no-explicit-any

export const getAdminClient = async () => {
  // 1. Preferred: Service Role Key (Bypasses RLS)
  if (serviceRoleKey) {
    // eslint-disable-line no-console
    if (!adminClientInitialized) {
      console.log('[Supabase] Initializing Admin Client with Service Role Key');
      adminClient = createClient(supabaseUrl!, serviceRoleKey, {
        auth: { persistSession: false },
      });
      adminClientInitialized = true;
    }
    return adminClient;
  }

  // 2. Fallback: Authenticate as Admin user
  if (adminClient && cachedAdminToken && Date.now() < tokenExpiresAt) {
    return adminClient;
  }

  // If already logging in, wait for that
  if (adminClientPromise) {
    return adminClientPromise;
  }

  adminClientPromise = (async () => {
    try {
      console.warn('[Supabase] Service Role Key missing. Falling back to Admin Auth.');
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        throw new Error('Missing Admin credentials');
      }

      const tempClient = createClient(supabaseUrl!, supabaseKey!);
      const { data, error } = await tempClient.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (error || !data.session) {
        throw error || new Error('Auth failed');
      }

      cachedAdminToken = data.session.access_token;
      tokenExpiresAt = Date.now() + data.session.expires_in * 1000 - 60000;

      adminClient = createClient(supabaseUrl!, supabaseKey!, {
        global: { headers: { Authorization: `Bearer ${cachedAdminToken}` } },
      });

      return adminClient;
    } catch (err) {
      console.error('[Supabase] Admin login failed:', err);
      return supabase; // Final fallback
    } finally {
      adminClientPromise = null;
    }
  })();

  return adminClientPromise;
};
