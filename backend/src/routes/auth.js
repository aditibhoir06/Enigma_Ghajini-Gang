import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, getProfile, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody, authSchemas } from '../middleware/validation.js';

const router = Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000, // 15 minutes in production, 1 minute in development
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 in production, 100 in development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all auth routes
router.use(authRateLimit);

// Public routes
router.post('/signup', validateBody(authSchemas.signup), signup);
router.post('/login', validateBody(authSchemas.login), login);

// Protected routes (require authentication)
router.get('/me', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

export default router;