import express from 'express';
import {body} from 'express-validator';
import 
{
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

const registerValidation = [
    body('username').not().isEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').not().isEmpty().withMessage('Password is required')
];

router.post('/register',registerValidation, register);
router.post('/login',loginValidation, login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;