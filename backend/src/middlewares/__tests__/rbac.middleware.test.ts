import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';

import { authorize } from '../auth.js';

describe('RBAC Middleware', () => {
  it('should allow access if user has the exact required role', () => {
    const middleware = authorize('admin');
    const req = { user: { role: 'admin' } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should allow access if user role is in the allowed roles array', () => {
    const middleware = authorize('admin', 'manager');
    const req = { user: { role: 'manager' } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should deny access and throw error if user lacks required role', () => {
    const middleware = authorize('admin');
    const req = { user: { role: 'customer', id: 'user_1' } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Forbidden: Access denied' })
    );
  });

  it('should deny access if user role is missing from payload', () => {
    const middleware = authorize('admin');
    const req = {} as unknown as Request; // missing req.user
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unauthorized' }));
  });
});
