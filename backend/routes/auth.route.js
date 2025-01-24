import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import verifyToken from '../middleware/authToken.js';

const router = express.Router();
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.get('verifyToken', verifyToken, (req, res) => {
    res.json({ message: 'Authorized' });
});

export default router;