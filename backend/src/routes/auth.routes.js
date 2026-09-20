import { Router } from 'express';
import { 
  getCurrentUser, 
  login, 
  logout, 
  register, 
  requestPasswordRecovery, 
  updatePassword,
  changePassword,
  updateProfile
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Routes
router.post('/login', login);
router.post('/register', register);
router.post('/password-recovery', requestPasswordRecovery);
router.post('/update-password', updatePassword); // Uses token from email link

// Protected Routes (Self-Service)
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getCurrentUser);
router.post('/change-password', requireAuth, changePassword);
router.put('/update-profile', requireAuth, updateProfile);

export default router;