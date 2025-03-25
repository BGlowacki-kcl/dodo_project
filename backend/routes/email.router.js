import express from 'express';
import { sendEmail } from '../controllers/email.controller.js';

/**
 * Email routes configuration
 * Handles HTTP endpoints related to email communication
 * Provides functionality for sending emails from the platform
 */
const router = express.Router();

/**
 * Send email to recipients
 * @route POST /api/email
 * @access Public - Accessible by any authenticated user
 */
router.post('/', checkRole(['employer', 'jobSeeker']), sendEmail);

export default router;