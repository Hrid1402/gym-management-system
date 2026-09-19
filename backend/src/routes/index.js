import { Router } from 'express';
import membershipPlanRoutes from './membershipPlans.routes.js';

const router = Router();

// This mounts the routes to: GET /api/plans and GET /api/plans/:id
router.use('/plans', membershipPlanRoutes);

export default router;