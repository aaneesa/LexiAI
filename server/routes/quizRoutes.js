import express from 'express';
import {
    getQuizzes,
    getQuizzesById,
    submitQuiz,
    getQuizMarks,
    deleteQuiz
} from '../controllers/quizController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/quiz/:id', getQuizzesById);
router.post('/:id/submit', submitQuiz);
router.get('/:id/marks', getQuizMarks);
router.delete('/:id', deleteQuiz);
router.get('/:documentId', getQuizzes);

export default router;