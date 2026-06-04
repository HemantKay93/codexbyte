import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { supabase, getAdminClient } from '../../config/supabase.js';
import { AppError } from '../../middlewares/error.js';
import { env } from '../../config/env.js';

const jwtSecret = env.JWT_SECRET;
const ADMIN_PASSWORD_HASH = env.ADMIN_PASSWORD_HASH;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required for backend authentication');
}

const JWT_SECRET: string = jwtSecret;

export class AuthService {
  async login(email: string, password: string, options: { requireAdmin?: boolean } = {}) {
    // 1. Authenticate via Identity Provider (Supabase)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Prevent internal error details from leaking to the client
      throw new AppError('Invalid credentials', 401);
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

  async forgotPassword(email: string) {
    const frontendUrl = env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',')[0]
      : 'http://localhost:5173';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/shop/reset-password`,
    });
    if (error) throw new AppError(error.message, 400);
  }

  async resetPassword(userId: string, password: string) {
    const admin = await getAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) throw new AppError(error.message, 400);
  }
}
