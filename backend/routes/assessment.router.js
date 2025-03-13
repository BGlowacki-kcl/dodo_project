import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import assessmentController from "../controllers/assessment.controller.js"

const router = express.Router();

router.get("/status", checkRole(["jobSeeker"]), assessmentController.getStatus);
router.post("/send", checkRole(["jobSeeker"]), assessmentController.sendCode);
router.get("/task", checkRole(["jobSeeker"]), assessmentController.getTask);
router.post("/submit", checkRole(["jobSeeker"]), assessmentController.submit)
router.post("/create", assessmentController.createAss);

export default router;