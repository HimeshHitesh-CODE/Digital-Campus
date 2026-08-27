import { Router } from 'express';
import {
  login,
  registerStep1,
  verifySecretKey,
  forgotPasswordReset,
  handleResetAuthEndpoint,
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/register-step1', authLimiter, registerStep1);
router.post('/verify-secret-key', authLimiter, verifySecretKey);
router.post('/forgot-password-reset', authLimiter, forgotPasswordReset);
router.post('/reset-database', handleResetAuthEndpoint);
router.post('/reset-auth', handleResetAuthEndpoint);

export default router;
