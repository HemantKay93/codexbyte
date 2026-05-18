import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { catchAsync } from '../../middlewares/error.js';
import { AuditService } from '../../services/auditService.js';

const authService = new AuthService();

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.debug(`[Auth] Login attempt for: ${email}`);

  try {
    const result = await authService.login(email, password);
    console.debug(`[Auth] Login successful for: ${email}`);

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
    console.warn(`[Auth] Login failed for: ${email}. Error: ${error.message}`);
    throw error;
  }
});

export const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.debug(`[Auth] Admin login attempt for: ${email}`);

  try {
    const result = await authService.login(email, password, { requireAdmin: true });
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
  } catch (error: any) {
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

export const getMe = catchAsync(async (req: any, res: Response) => {
  const user = await authService.getMe(req.user.id);
  res.json({
    success: true,
    data: { user },
  });
});

export const getAdminMe = catchAsync(async (req: any, res: Response) => {
  const user = await authService.getMe(req.user.id);
  if (user.role !== 'admin' && user.role !== 'super-admin') {
    res.status(403).json({ status: 'error', message: 'Admin access required' });
    return;
  }
  res.json({
    success: true,
    data: { user },
  });
});
