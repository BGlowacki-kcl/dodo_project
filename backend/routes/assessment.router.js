import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import assessmentController from "../controllers/assessment.controller.js"

const router = express.Router();

router.get("/status", checkRole(["jobSeeker"]), assessmentController.getStatus);
router.post("/send", checkRole(["jobSeeker"]), assessmentController.sendCode);
router.get("/task", checkRole(["jobSeeker"]), assessmentController.getTask);
router.post("/submit", checkRole(["jobSeeker"]), assessmentController.submit);
router.get("/tasksid", checkRole(["jobSeeker"]), assessmentController.getTasksId);
router.post("/create", assessmentController.createAss); // Disable in production
router.get("/alltasks", checkRole(["employer"]), assessmentController.getAllTasks);

export default router;