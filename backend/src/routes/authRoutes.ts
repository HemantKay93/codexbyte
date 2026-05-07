import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/customer/login', authController.login); // Reuse for now
router.post('/customer/signup', authController.signup);
router.get('/me', authenticate, authController.getMe);
router.get('/customer/me', authenticate, authController.getMe);

export default router;
