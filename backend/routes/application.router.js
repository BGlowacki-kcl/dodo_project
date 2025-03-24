import express from "express";
import { applicationController } from "../controllers/application.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

/**
 * Application routes configuration
 * Handles all HTTP endpoints related to job applications
 * Includes routes for creating, retrieving, updating and deleting applications
 */
const router = express.Router();

/**
 * Get all applications for the current job seeker
 * @route GET /api/application/all
 * @access Private - jobSeeker only
 */
router.get("/all", checkRole(["jobSeeker"]), applicationController.getAllApplications);

/**
 * Create a new job application
 * @route POST /api/application/apply
 * @access Private - jobSeeker only
 */
router.post("/apply", checkRole(["jobSeeker"]), applicationController.createApplication);

/**
 * Set deadline for assessment completion
 * @route PUT /api/application/deadline
 * @access Private - jobSeeker only
 */
router.put("/deadline", checkRole(["jobSeeker"]), applicationController.setAssessmentDeadline);

/**
 * Get assessment deadline for an application
 * @route GET /api/application/deadline
 * @access Private - jobSeeker only
 */
router.get("/deadline", checkRole(["jobSeeker"]), applicationController.getAssessmentDeadline);

/**
 * Save application draft
 * @route PUT /api/application/save
 * @access Private - jobSeeker only
 */
router.put("/save", checkRole(["jobSeeker"]), applicationController.saveApplication);

/**
 * Submit application for employer review
 * @route PUT /api/application/submit
 * @access Private - jobSeeker only
 */
router.put("/submit", checkRole(["jobSeeker"]), applicationController.submitApplication);

/**
 * Get all applicants for a specific job
 * @route GET /api/application/byJobId
 * @access Private - employer only
 */
router.get("/byJobId", checkRole(["employer"]), applicationController.getApplicants);

/**
 * Get dashboard data with application statistics
 * @route GET /api/application/dashboard
 * @access Private - employer only
 */
router.get("/dashboard", checkRole(["employer"]), applicationController.getDashboardData);

/**
 * Get application details by ID
 * @route GET /api/application/byId
 * @access Private - jobSeeker and employer
 */
router.get("/byId", checkRole(["jobSeeker", "employer"]), applicationController.getOneApplication);

/**
 * Withdraw an application
 * @route DELETE /api/application/withdraw
 * @access Private - jobSeeker and employer
 */
router.delete("/withdraw", checkRole(["jobSeeker", "employer"]), applicationController.withdrawApplication);

/**
 * Update application status (progress or reject)
 * @route PUT /api/application/status
 * @access Private - employer and jobSeeker
 */
router.put("/status", checkRole(["employer", "jobSeeker"]), applicationController.updateApplicationStatus);

export default router;
