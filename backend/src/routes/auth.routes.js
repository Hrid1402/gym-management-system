import { Router } from 'express';
import {
	getCurrentUser,
	login,
	logout,
	register,
	requestPasswordRecovery,
	updatePassword,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/password-recovery', requestPasswordRecovery);
router.post('/update-password', updatePassword);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;