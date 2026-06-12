import { Router } from 'express';
import { registerStudent, loginStudent, getAllStudents, getStudentProgress, getStudentById, deleteStudent, getStudentProfile } from '../controllers/studentController.js';
import { authenticateAdmin, authenticateStudent } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Student routes (student auth required)
router.get('/profile', authenticateStudent, getStudentProfile);

// Admin routes (admin auth required)
router.get('/', authenticateAdmin, getAllStudents);
router.get('/:id/progress', authenticateAdmin, getStudentProgress);
router.get('/:id', getStudentById);
router.delete('/:id', authenticateAdmin, deleteStudent);

export default router;