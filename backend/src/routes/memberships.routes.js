import express from 'express';
import { 
  registerMembershipStaff, 
  registerMembershipClient, 
  getMemberships,
  cancelMembership // <-- Import the new function
} from '../controllers/memberships.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/staff-register', requireRole(['ADMIN', 'RECEPTIONIST']), registerMembershipStaff);

router.post('/web-register', (req, res, next) => {
  if (req.user.type !== 'client') {
    return res.status(403).json({ error: 'Only clients can use the web registration flow' });
  }
  next();
}, registerMembershipClient);

router.get('/', getMemberships);

// NEW: Cancel membership route
router.patch('/:id/cancel', cancelMembership);

export default router;