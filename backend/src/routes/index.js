import { Router } from 'express';
import authRoutes from './auth.routes.js';
import clientRoutes from './client.routes.js';
import membershipPlansRoutes from './membershipPlans.routes.js';
import membershipsRoutes from './memberships.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/plans', membershipPlansRoutes);
router.use('/memberships', membershipsRoutes);
router.use('/users', usersRoutes);


export default router;