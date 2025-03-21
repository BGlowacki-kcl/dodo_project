import express from "express";
import { applicationController } from "../controllers/application.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.get("/byConnection", applicationController.getApplication);
// router.put("/:id/status", applicationController.updateApplicationStatus);


router.get("/all", checkRole(["jobSeeker"]), applicationController.getAllApplications);
router.get("/byId", checkRole(["jobSeeker", "employer"]), applicationController.getOneApplication);
router.post("/apply", checkRole(["jobSeeker"]), applicationController.createApplication);
router.delete("/withdraw", checkRole(["jobSeeker", "employer"]), applicationController.withdrawApplication);
router.get("/job/:jobId/applicants", checkRole(["employer"]), applicationController.getApplicants);
router.put("/status", checkRole(["employer", "jobSeeker"]), applicationController.updateApplicationStatus); // to reject -> /status?id=xxx&reject=true, to progress /status?id=xxx
router.put("/deadline", checkRole(["jobSeeker"]), applicationController.setAssessmentDeadline);
router.get("/deadline", checkRole(["jobSeeker"]), applicationController.getAssessmentDeadline);

export default router;
