import express from "express";
import { getShortlist, addJobToShortlist, removeJobFromShortlist, createShortlist } from "../controllers/shortlist.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

/**
 * Shortlist routes configuration
 * Handles all HTTP endpoints related to job shortlisting
 * Provides functionality for users to bookmark and manage favorite jobs
 */
const router = express.Router();

/**
 * Get user's shortlisted jobs
 * @route GET /api/shortlist/jobs
 * @access Private - accessible by any authenticated user
 */
router.get("/jobs", checkRole([]), getShortlist);

/**
 * Create a new shortlist for user
 * @route POST /api/shortlist/create
 * @access Private - jobSeeker only
 */
router.post("/create", checkRole(["jobSeeker"]), createShortlist);

/**
 * Add a job to user's shortlist
 * @route PUT /api/shortlist/addjob
 * @access Private - jobSeeker only
 */
router.put("/addjob", checkRole(["jobSeeker"]), addJobToShortlist);

/**
 * Remove a job from user's shortlist
 * @route DELETE /api/shortlist/removejob
 * @access Private - jobSeeker only
 */
router.delete("/removejob", checkRole(["jobSeeker"]), removeJobFromShortlist);

export default router;
