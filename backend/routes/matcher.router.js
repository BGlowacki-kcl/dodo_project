import express from "express";
import { getUserJobRecommendations } from "../controllers/matcher.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

/**
 * Job matcher routes configuration
 * Handles HTTP endpoints related to job recommendations
 * Provides personalized job matching based on user profile
 */
const router = express.Router();

/**
 * Get personalized job recommendations for the current job seeker
 * @route GET /api/matcher/recommend-jobs
 * @access Private - jobSeeker only
 */
router.get("/recommend-jobs", checkRole(["jobSeeker"]), getUserJobRecommendations);

export default router;