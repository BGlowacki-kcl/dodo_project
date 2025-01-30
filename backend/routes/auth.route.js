import express from 'express';
import { authController } from '../controllers/auth.controller.js';

const router = express.Router();

//@Roles(['Admin'])
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);

// TODO: Implement request password change and reset password routes

export default router;