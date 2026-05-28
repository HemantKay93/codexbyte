import { Response } from 'express';

import { catchAsync } from '../../middlewares/error.js';
import { AuthRequest } from '../../middlewares/auth.js';

import { WishlistRepository } from './wishlist.repository.js';

const wishlistRepo = new WishlistRepository();

export const getWishlist = catchAsync(async (req: AuthRequest, res: Response) => {
  const wishlist = await wishlistRepo.findByUserId(req.user.id);
  res.json(wishlist);
});

export const toggleWishlist = catchAsync(async (req: AuthRequest, res: Response) => {
  const isWishlisted = await wishlistRepo.toggle(req.user.id, req.params.productId as string);
  res.json({ isWishlisted });
});

export const checkWishlist = catchAsync(async (req: AuthRequest, res: Response) => {
  const isWishlisted = await wishlistRepo.check(req.user.id, req.params.productId as string);
  res.json({ isWishlisted });
});
