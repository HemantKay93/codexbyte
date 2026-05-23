import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = 'https://wpxotvohmipetlgsontl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweG90dm9obWlwZXRsZ3NvbnRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU1OTQ3MywiZXhwIjoyMDg5MTM1NDczfQ.o9DiHmckfrWJmt4KjrIWN7LxNY4qto4GcggL4XTeL7g';

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env variables');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Testing whatsapp_templates insertion...');
  const { data, error } = await admin.from('whatsapp_templates').insert({
    name: 'TEST_TEMPLATE',
    content: 'Hello {{customerName}}',
    variables: ['customerName'],
    is_active: true
  }).select().single();
  
  if (error) {
    console.error('INSERT ERROR:', error);
  } else {
    console.log('INSERT SUCCESS:', data);
  }
}

check();
