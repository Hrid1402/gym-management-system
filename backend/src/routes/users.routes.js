import { Router } from 'express';
import { getStaff, createStaff, updateStaff } from '../controllers/users.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Only logged-in Admins can access ANY of these routes
router.use(requireAuth);
router.use(requireRole(['ADMIN']));

// List staff
router.get('/', getStaff);

// Create new staff
router.post('/', createStaff);

// Edit staff (e.g., deactivate them or promote them)
router.put('/:id', updateStaff);

export default router;