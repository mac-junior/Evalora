import { Router } from 'express';
import { 
  createAssessment, 
  getAllAssessments, 
  getPublishedAssessments,
  getAssessmentById, 
  updateAssessment, 
  togglePublish, 
  deleteAssessment,
  resetAttempts
} from '../controllers/assessmentController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/published', getPublishedAssessments);

// Protected routes
router.post('/', authenticateAdmin, createAssessment);
router.get('/', authenticateAdmin, getAllAssessments);
router.get('/:id', getAssessmentById);
router.put('/:id', authenticateAdmin, updateAssessment);
router.patch('/:id/toggle', authenticateAdmin, togglePublish);
router.post('/:id/reset-attempts', authenticateAdmin, resetAttempts);
router.delete('/:id', authenticateAdmin, deleteAssessment);

export default router;