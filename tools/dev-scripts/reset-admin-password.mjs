/**
 * One-time script to reset admin password via Supabase Admin API.
 * Run: node scripts/reset-admin-password.mjs
 * Requires SUPABASE_SERVICE_ROLE_KEY env variable.
 */

const SUPABASE_URL = 'https://wpxotvohmipetlgsontl.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = 'admin@byteevolvr.com';
const NEW_PASSWORD = 'admin123';

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  console.error('   Get it from: https://supabase.com/dashboard/project/wpxotvohmipetlgsontl/settings/api');
  process.exit(1);
}

async function resetPassword() {
  // 1. Find the user by email
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(ADMIN_EMAIL)}`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (!listRes.ok) {
    const err = await listRes.json();
    console.error('❌ Failed to list users:', err);
    process.exit(1);
  }

  const { users } = await listRes.json();
  const user = users?.find(u => u.email === ADMIN_EMAIL);

  if (!user) {
    console.log(`⚠️  User ${ADMIN_EMAIL} not found. Creating...`);

    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: NEW_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Admin User', role: 'admin' },
      }),
    });

    const created = await createRes.json();
    if (!createRes.ok) {
      console.error('❌ Failed to create user:', created);
      process.exit(1);
    }
    console.log(`✅ Created admin user: ${ADMIN_EMAIL} with password: ${NEW_PASSWORD}`);
    return;
  }

  // 2. Update their password
  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
    method: 'PUT',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: NEW_PASSWORD,
      email_confirm: true,
    }),
  });

  const result = await updateRes.json();
  if (!updateRes.ok) {
    console.error('❌ Failed to update password:', result);
    process.exit(1);
  }

  console.log(`✅ Password for ${ADMIN_EMAIL} reset to: ${NEW_PASSWORD}`);
}

resetPassword().catch(console.error);
