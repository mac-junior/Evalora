import { Router } from 'express';
import { updateAdminProfile, updateStudentProfile, uploadProfilePic } from '../controllers/profileController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.put('/admin', authenticateAdmin, updateAdminProfile);
router.put('/student/:id', updateStudentProfile);
router.post('/upload-pic/:type/:id', upload.single('profile_pic'), uploadProfilePic);

export default router;