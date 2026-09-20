import { Router } from 'express';
import { getClients, getClientById, updateClient, deleteClient} from '../controllers/client.controller.js';
import { requireAuth, requireRole} from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('ADMIN, RECEPTIONIST'), getClients);
router.get('/:id', requireRole('ADMIN, RECEPTIONIST'), getClientById);
router.put('/:id', requireRole('ADMIN, RECEPTIONIST'), updateClient);
router.delete('/:id', requireRole('ADMIN, RECEPTIONIST'), deleteClient);

export default router;