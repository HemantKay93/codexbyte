import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, signupSchema } from '../validators/authValidator.js';

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/customer/login', validate(loginSchema), authController.login);
router.post('/customer/signup', validate(signupSchema), authController.signup);
router.get('/me', authenticate, authController.getMe);
router.get('/customer/me', authenticate, authController.getMe);

export default router;
