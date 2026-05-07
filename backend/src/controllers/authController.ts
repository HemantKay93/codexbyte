import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { catchAsync } from '../middlewares/error.js';
import { AuditService } from '../services/auditService.js';

const authService = new AuthService();

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  await AuditService.log({
    user_id: result.user.id,
    action: 'USER_LOGIN',
    module: 'auth',
    new_data: { email: result.user.email },
  });

  res.json(result);
});

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const result = await authService.customerSignup(email, password, name);
  res.json(result);
});

export const getMe = catchAsync(async (req: any, res: Response) => {
  const user = await authService.getMe(req.user.id);
  res.json({ user });
});
