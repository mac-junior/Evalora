import { Router } from 'express';
import { getOverviewStats, getAssessmentAnalytics } from '../controllers/analyticsController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/overview', authenticateAdmin, getOverviewStats);
router.get('/assessments', authenticateAdmin, getAssessmentAnalytics);

export default router;