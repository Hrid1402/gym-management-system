import express from 'express';
import { 
  createPlan, 
  getPlans, 
  getPlanById, 
  updatePlan, 
  togglePlanStatus 
} from '../controllers/membershipPlans.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getPlans);
router.get('/:id', getPlanById);

router.post('/', requireRole(['ADMIN']), createPlan);
router.put('/:id', requireRole(['ADMIN']), updatePlan);
router.patch('/:id/status', requireRole(['ADMIN']), togglePlanStatus);

export default router;