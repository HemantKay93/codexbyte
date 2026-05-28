import logger from '../services/logger.js';

const REQUIRED_ENV = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'REDIS_URL'
];

export const validateEnvironment = () => {
  const missing: string[] = [];

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) missing.push('SUPABASE_URL (or VITE_/NEXT_ fallback)');
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY (or VITE_/NEXT_ fallback)');
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.REDIS_URL) missing.push('REDIS_URL');

  if (missing.length > 0) {
    logger.error(`❌ [Env Validation] Missing critical environment variables: ${missing.join(', ')}`);
    console.error(`❌ Critical environment variables missing: ${missing.join(', ')}. Server process shutting down.`);
    process.exit(1);
  }

  logger.info('✅ [Env Validation] All critical environment variables are present');
};
