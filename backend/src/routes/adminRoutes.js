import { Router } from 'express';
import { login, getProfile } from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticateAdmin, getProfile);

export default router;