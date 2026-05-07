import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { catchAsync } from '../middlewares/error.js';

const authService = new AuthService();

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
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
