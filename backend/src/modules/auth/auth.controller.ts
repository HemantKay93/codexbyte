import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { catchAsync } from '../../middlewares/error.js';
import { AuditService } from '../../services/auditService.js';
import { blacklistToken } from '../../middlewares/auth.js';

import { AuthService } from './auth.service.js';

const authService = new AuthService();

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.debug(`[Auth] Login attempt for: ${email}`);
  // eslint-disable-line no-console

  try {
    const result = await authService.login(email, password);
    console.debug(`[Auth] Login successful for: ${email}`);
    // eslint-disable-line no-console

    await AuditService.log({
      user_id: result.user.id,
      action: 'USER_LOGIN',
      module: 'auth',
      new_data: { email: result.user.email },
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    console.warn(`[Auth] Login failed for: ${email}. Error: ${error.message}`);
    throw error;
  }
});

export const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // eslint-disable-line no-console
  console.debug(`[Auth] Admin login attempt for: ${email}`);

  try {
    const result = await authService.login(email, password, { requireAdmin: true });
    // eslint-disable-line no-console
    console.debug(`[Auth] Admin login successful for: ${email}`);

    await AuditService.log({
      user_id: result.user.id,
      action: 'ADMIN_LOGIN',
      module: 'auth',
      new_data: { email: result.user.email },
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      data: result,
    });
    // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    console.warn(`[Auth] Admin login failed for: ${email}. Error: ${error.message}`);
    throw error;
  }
});

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const result = await authService.customerSignup(email, password, name);
  res.json({
    success: true,
    message: 'Signup successful',
    data: result,
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.json({
    success: true,
    message: 'Password reset email sent',
  });
});

export const resetPassword = catchAsync(async (req: any, res: Response) => {
  const { password } = req.body;
  await authService.resetPassword(req.user.id, password);
  res.json({
    success: true,
    message: 'Password has been reset successfully',
  });
});
// eslint-disable-line @typescript-eslint/no-explicit-any

export const getMe = catchAsync(async (req: any, res: Response) => {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const user = await authService.getMe(req.user.id);
  res.json({
    success: true,
    data: { user },
  });
  // eslint-disable-line @typescript-eslint/no-explicit-any
});

export const getAdminMe = catchAsync(async (req: any, res: Response) => {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const user = await authService.getMe(req.user.id);
  if (user.role !== 'admin' && user.role !== 'super-admin') {
    res.status(403).json({ status: 'error', message: 'Admin access required' });
    return;
  }
  res.json({
    success: true,
    data: { user },
    // eslint-disable-line @typescript-eslint/no-explicit-any
  });
});

export const logout = catchAsync(async (req: any, res: Response) => {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.decode(token);
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // If we have an expiration timestamp, use it. Otherwise, default to 24h.
    const expiresAt = decoded && decoded.exp ? decoded.exp : Math.floor(Date.now() / 1000) + 86400;

    await blacklistToken(token, expiresAt);

    await AuditService.log({
      user_id: req.user.id,
      action: 'USER_LOGOUT',
      module: 'auth',
      new_data: { email: req.user.email },
    });
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});
