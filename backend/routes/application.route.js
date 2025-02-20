import express from "express";
import { applicationController } from "../controllers/application.controller.js";

const router = express.Router();

router.post("/apply", applicationController.apply);
router.get("/application/:jobId/:userId", applicationController.getApplication);
router.delete("/cancel/:applicationId", applicationController.cancel);
router.put("/:id/status", applicationController.updateApplicationStatus);
router.get("/job/:jobId/applicants", applicationController.getApplicants);


router.get("/", applicationController.getAllApplications);
router.get("/:id", applicationController.getOneApplication);
router.post("/", applicationController.createApplication);
router.delete("/:id", applicationController.withdrawApplication);
export default router;
