import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import assessmentController from "../controllers/assessment.controller.js"

/**
 * Assessment routes configuration
 * Handles all HTTP endpoints related to code assessments and challenges
 * Includes routes for retrieving, submitting and evaluating code assessments
 */
const router = express.Router();

/**
 * Get current assessment status for job seeker
 * @route GET /api/assessment/status
 * @access Private - jobSeeker only
 */
router.get("/status", checkRole(["jobSeeker"]), assessmentController.getStatus);

/**
 * Send code solution for testing
 * @route POST /api/assessment/send
 * @access Private - jobSeeker only
 */
router.post("/send", checkRole(["jobSeeker"]), assessmentController.sendCode);

/**
 * Get assessment task details
 * @route GET /api/assessment/task
 * @access Private - jobSeeker only
 */
router.get("/task", checkRole(["jobSeeker"]), assessmentController.getTask);

/**
 * Submit final assessment solution
 * @route POST /api/assessment/submit
 * @access Private - jobSeeker only
 */
router.post("/submit", checkRole(["jobSeeker"]), assessmentController.submit);

/**
 * Get IDs of all assessment tasks for an application
 * @route GET /api/assessment/tasksid
 * @access Private - jobSeeker only
 */
router.get("/tasksid", checkRole(["jobSeeker"]), assessmentController.getTasksId);

/**
 * Get all available assessment tasks
 * @route GET /api/assessment/alltasks
 * @access Private - employer only
 */
router.get("/alltasks", checkRole(["employer"]), assessmentController.getAllTasks);

export default router;