import express from "express";
import { getUserJobRecommendations } from "../controllers/matcher.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/recommend-jobs", checkRole(["jobSeeker"]), getUserJobRecommendations);
export default router;