import { Router } from 'express';
import { addQuestion, getQuestionsByAssessment, updateQuestion, deleteQuestion, bulkUploadQuestions } from '../controllers/questionController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateAdmin, addQuestion);
router.post('/bulk-upload', authenticateAdmin, bulkUploadQuestions);
router.get('/assessment/:assessmentId', getQuestionsByAssessment);
router.put('/:id', authenticateAdmin, updateQuestion);
router.delete('/:id', authenticateAdmin, deleteQuestion);

export default router;