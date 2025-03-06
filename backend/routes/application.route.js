import express from "express";
import { applicationController } from "../controllers/application.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/apply", applicationController.apply);
router.get("/byConnection", applicationController.getApplication);
router.delete("/cancel/:applicationId", applicationController.cancel);
router.put("/:id/status", applicationController.updateApplicationStatus);
router.get("/job/:jobId/applicants", applicationController.getApplicants);


router.get("/all", checkRole(["jobSeeker"]), applicationController.getAllApplications);
router.get("/byId", checkRole(["jobSeeker"]), applicationController.getOneApplication);
router.post("/", applicationController.createApplication);
router.delete("/:id", applicationController.withdrawApplication);
export default router;
