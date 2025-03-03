import express from "express";
import { applicationController } from "../controllers/application.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js"; 

const router = express.Router();


router.post("/apply", checkRole(["jobSeeker"]), applicationController.apply);

router.get("/application/:jobId", checkRole(["jobSeeker"]), applicationController.getApplication);


router.delete("/cancel/:applicationId", checkRole(["jobSeeker"]), applicationController.cancel);


router.put("/:id/status", checkRole(["employer"]), applicationController.updateApplicationStatus);


router.get("/job/:jobId/applicants", checkRole(["employer"]), applicationController.getApplicants);


router.get("/", checkRole(["jobSeeker", "employer"]), applicationController.getAllApplications);


router.get("/:id", checkRole(["jobSeeker", "employer"]), applicationController.getOneApplication);


router.post("/", checkRole(["jobSeeker"]), applicationController.createApplication);


router.delete("/:id", checkRole(["jobSeeker"]), applicationController.withdrawApplication);

export default router;
