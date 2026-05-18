import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase, getAdminClient } from '../../config/supabase.js';
import { AppError } from '../../middlewares/error.js';

const jwtSecret = process.env.JWT_SECRET;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required for backend authentication');
}

const JWT_SECRET: string = jwtSecret;

export class AuthService {
  async login(email: string, password: string, options: { requireAdmin?: boolean } = {}) {
    // 1. Check hardcoded admin
    if (
      email === 'admin@byteevolvr.com' &&
      ADMIN_PASSWORD_HASH &&
      bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
    ) {
      const token = jwt.sign({ id: 'admin', email, role: 'admin' }, JWT_SECRET, {
        expiresIn: '12h',
      });
      return {
        token,
        user: {
          id: 'admin',
          email,
          full_name: 'Main Admin',
          role: 'admin',
          user_metadata: { full_name: 'Main Admin', role: 'admin' },
        },
      };
    }

    // 2. Check Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new AppError(error.message, 401);
    }

    // 3. Check profile role
    const adminClient = await getAdminClient();
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role || 'user';

    if (options.requireAdmin && role !== 'admin' && role !== 'super-admin') {
      throw new AppError('Admin access required', 403);
    }

    return {
      token: data.session?.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || data.user.user_metadata?.full_name,
        role,
        user_metadata: data.user.user_metadata || { full_name: profile?.full_name, role },
      },
    };
  }

  async getMe(userId: string) {
    if (userId === 'admin') {
      return {
        id: 'admin',
        email: 'admin@byteevolvr.com',
        full_name: 'Main Admin',
        role: 'admin',
        user_metadata: { full_name: 'Main Admin', role: 'admin' },
      };
    }

    const admin = await getAdminClient();
    const {
      data: { user },
      error: authError,
    } = await admin.auth.admin.getUserById(userId);
    if (authError || !user) {
      throw new AppError('User not found', 404);
    }

    const adminClient = await getAdminClient();
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('role, full_name')
      .eq('id', userId)
      .single();

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name,
      role: profile?.role || 'user',
      user_metadata: user.user_metadata || { full_name: profile?.full_name, role: profile?.role },
    };
  }

  async customerSignup(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) throw new AppError(error.message, 400);
    return data;
  }
}
