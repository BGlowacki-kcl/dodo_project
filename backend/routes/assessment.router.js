import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import assessmentController from "../controllers/assessment.controller.js"

const router = express.Router();

router.get("/status", checkRole(["jobSeeker"]), assessmentController.getStatus);
router.post("/send", checkRole(["jobSeeker"]), assessmentController.sendCode);

export default router;