import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import { userController } from '../controllers/user.controller.js';

/**
 * User routes configuration
 * Handles all HTTP endpoints related to user management
 * Includes routes for creating, retrieving, updating and deleting users
 */
const router = express.Router();

/**
 * Get current user's role
 * @route GET /api/user/role
 * @access Public - accessible without authentication
 */
router.get('/role', userController.getRole);

/**
 * Check if user's profile is complete
 * @route GET /api/user/completed
 * @access Private - accessible by any authenticated user
 */
router.get('/completed', checkRole([]), userController.checkProfileCompletion);

/**
 * Get current user's information
 * @route GET /api/user
 * @access Private - accessible by authenticated users with specified roles
 */
router.get('/', checkRole(['employer', 'jobSeeker', 'admin']), userController.getUser);

/**
 * Create a new user with basic information
 * @route POST /api/user/basic
 * @access Private - accessible by new users or existing users
 */
router.post('/basic', checkRole(['employer', 'jobSeeker', 'signUp']), userController.createBasicUser);

/**
 * Update user information
 * @route PUT /api/user
 * @access Private - accessible by authenticated users with specified roles
 */
router.put('/', checkRole(['employer', 'jobSeeker', 'admin']), userController.updateUser);

/**
 * Delete user account
 * @route DELETE /api/user
 * @access Private - accessible by authenticated users with specified roles
 */
router.delete('/', checkRole(['employer', 'jobSeeker', 'admin']), userController.deleteUser);

/**
 * Get user by ID
 * @route GET /api/user/ById
 * @access Private - accessible by employers only
 */
router.get('/ById', checkRole(['employer']), userController.getUserById);

export default router;