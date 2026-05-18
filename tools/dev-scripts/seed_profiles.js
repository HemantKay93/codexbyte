import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('--- ByteEvolvr Admin Seeding Tool ---');

  // 1. Log in as admin to get a valid session (this works if auth.users has the user)
  console.log('Logging in as admin@byteevolvr.com...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@byteevolvr.com',
    password: 'Admin@123',
  });

  if (authError) {
    console.error('Auth failed:', authError.message);
    console.log(
      'Attempting to proceed as anonymous (this only works if RLS is disabled on user_profiles)...'
    );
  } else {
    console.log('Auth successful. User ID:', authData.user.id);
  }

  const admins = [
    {
      email: 'admin@byteevolvr.com',
      id: authData?.user?.id || '6d6b5509-8a60-4123-92c1-55b52942d144',
    },
    { email: 'hemant.k@byteevolvr.com' },
  ];

  for (const admin of admins) {
    console.log(`Processing ${admin.email}...`);

    // Try to sign up hemant.k if not admin@byteevolvr.com
    if (admin.email === 'hemant.k@byteevolvr.com') {
      console.log('Attempting to create account for hemant.k@byteevolvr.com...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: admin.email,
        password: 'Admin@123',
        options: {
          data: { role: 'admin', full_name: 'Hemant K' },
        },
      });

      if (signUpError) {
        console.log('SignUp note:', signUpError.message);
      } else if (signUpData.user) {
        console.log('SignUp successful for hemant.k@byteevolvr.com. User ID:', signUpData.user.id);
        admin.id = signUpData.user.id;
      }
    }

    const { data: profile, error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: admin.id || undefined,
          email: admin.email,
          role: 'admin',
          full_name: admin.email.split('@')[0],
        },
        { onConflict: 'email' }
      )
      .select();

    if (upsertError) {
      console.error(`Upsert error for ${admin.email}:`, upsertError.message);
    } else if (profile && profile.length > 0) {
      console.log(`Successfully ensured ${admin.email} is an admin in user_profiles.`);
    } else {
      console.log(
        `Could not directly insert ${admin.email}. They will be automatically added when they first log in.`
      );
    }
  }

  console.log('Done.');
}

seed();
