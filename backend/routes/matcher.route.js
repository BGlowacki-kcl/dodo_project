import express from "express";
import { getUserJobRecommendations } from "../controllers/matcher.controller.js";

const router = express.Router();

router.get("/recommend-jobs", getUserJobRecommendations);
export default router;