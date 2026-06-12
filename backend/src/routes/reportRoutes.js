import { Router } from 'express';
import { generateStudentReport, generateAssessmentReport, generateClassReport } from '../controllers/reportController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/student/:studentId', authenticateAdmin, generateStudentReport);
router.get('/assessment/:assessmentId', authenticateAdmin, generateAssessmentReport);
router.get('/class', authenticateAdmin, generateClassReport);

export default router;