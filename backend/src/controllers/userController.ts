import { Request, Response } from 'express';
import { catchAsync } from '../middlewares/error.js';
import { AuthRequest } from '../middlewares/auth.js';
import { getAdminClient } from '../config/supabase.js';

export const getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('user_profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // Profile not found, create a basic one
    const { data: newProfile, error: createError } = await admin
      .from('user_profiles')
      .insert({
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.email.split('@')[0],
        role: req.user.role || 'user',
      })
      .select()
      .single();

    if (createError) throw createError;
    return res.json(newProfile);
  }

  if (error) throw error;
  res.json(data);
});

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const { full_name } = req.body;
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('user_profiles')
    .update({ full_name, updated_at: new Date().toISOString() })
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

export const getAddresses = catchAsync(async (req: AuthRequest, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin.from('addresses').select('*').eq('user_id', req.user.id);

  if (error) throw error;
  res.json(data || []);
});

export const addAddress = catchAsync(async (req: AuthRequest, res: Response) => {
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('addresses')
    .insert({ ...req.body, user_id: req.user.id })
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

export const updateAddress = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const admin = await getAdminClient();
  const { data, error } = await admin
    .from('addresses')
    .update(req.body)
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) throw error;
  res.json(data);
});

export const deleteAddress = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const admin = await getAdminClient();
  const { error } = await admin.from('addresses').delete().eq('id', id).eq('user_id', req.user.id);

  if (error) throw error;
  res.json({ success: true });
});
