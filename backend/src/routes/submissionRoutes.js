import { Router } from 'express';
import { submitAssessment, getAllSubmissions, getSubmissionDetails, getStudentSubmissions } from '../controllers/submissionController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/submit', submitAssessment);
router.get('/student/:studentId', getStudentSubmissions);

// Protected routes
router.get('/', authenticateAdmin, getAllSubmissions);
router.get('/:id', getSubmissionDetails);

export default router;