import { Request, Response } from 'express';
import { ReviewRepository } from '../repositories/reviewRepository.js';
import { catchAsync } from '../middlewares/error.js';
import { AuthRequest } from '../middlewares/auth.js';

const reviewRepo = new ReviewRepository();

export const getProductReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await reviewRepo.findByProductId(req.params.productId as string);
  res.json(reviews);
});

export const createReview = catchAsync(async (req: AuthRequest, res: Response) => {
  const { rating, comment } = req.body;
  const review = await reviewRepo.create({
    product_id: req.params.productId as string,
    user_id: req.user.id,
    rating,
    comment,
    status: 'pending',
  });
  res.status(201).json(review);
});

export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await reviewRepo.findAll();
  res.json(reviews);
});

export const updateReviewStatus = catchAsync(async (req: Request, res: Response) => {
  const review = await reviewRepo.updateStatus(req.params.id as string, req.body.status);
  res.json(review);
});
