import express from "express";
import { applicationController } from "../controllers/application.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.get("/byConnection", applicationController.getApplication);
// router.put("/:id/status", applicationController.updateApplicationStatus);


router.get("/all", checkRole([]), applicationController.getAllApplications);
router.get("/byId", checkRole([]), applicationController.getOneApplication);
router.post("/apply", checkRole(["jobSeeker"]), applicationController.createApplication);
router.delete("/withdraw", checkRole(["jobSeeker", "employer"]), applicationController.withdrawApplication);
router.put("/status", checkRole(["employer", "jobSeeker"]), applicationController.updateApplicationProgress); // to reject -> /status?id=xxx&reject=true, to progress /status?id=xxx
router.put("/deadline", checkRole(["jobSeeker"]), applicationController.setAssessmentDeadline);
router.get("/deadline", checkRole(["jobSeeker"]), applicationController.getAssessmentDeadline);
router.get("/byJobId", checkRole(["employer"]), applicationController.getApplicants);
router.get("/data", checkRole(["employer"]), applicationController.getApplicationsData);
router.put("/save", checkRole(["jobSeeker"]), applicationController.saveApplication);
router.put("/submit", checkRole(["jobSeeker"]), applicationController.submitApplication);

export default router;
