/**
 * Verify fix: Test supplier creation with only known columns
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Simulate safePayload (as the fixed code now does)
const rawInput = {
  name: 'Test Supplier',
  contact_name: 'John Doe',
  email: 'john@test.com',
  phone: '9876543210',    // Not in DB yet
  address: '123 Test St', // Not in DB yet
  status: 'active',
};

const safePayload = {
  name: rawInput.name,
  status: rawInput.status ?? 'active',
};
if (rawInput.contact_name) safePayload.contact_name = rawInput.contact_name;
if (rawInput.email) safePayload.email = rawInput.email;
// phone/address omitted since they don't exist yet

console.log('Safe payload (no unknown columns):', safePayload);

const { data, error } = await supabase
  .from('suppliers')
  .insert(safePayload)
  .select()
  .single();

if (error) {
  console.error('❌ Still failing:', error);
} else {
  console.log('✅ Insert succeeded:', data);
  await supabase.from('suppliers').delete().eq('id', data.id);
  console.log('Cleaned up.');
}
