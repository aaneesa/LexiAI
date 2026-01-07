import express from 'express';
import {
    getFlashcards,
    getAllFlashcards,
    reviewFlashcards,
    toggleStarFlashcard,
    deleteFlashcard
} from '../controllers/flashcardController.js';
import {protect} from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/',getAllFlashcards)
router.get('/:documentId',getFlashcards);
router.post('/:flashcardId/review',reviewFlashcards);
router.patch('/:flashcardId/toggle-star',toggleStarFlashcard);
router.delete('/:flashcardId',deleteFlashcard);

export default router;