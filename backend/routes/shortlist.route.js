import express from "express";
import { getShortlist, addJobToShortlist, removeJobFromShortlist, createShortlist } from "../controllers/shortlist.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/jobs", checkRole(["jobSeeker"]), getShortlist);
router.post("/create", checkRole(["jobSeeker"]), createShortlist);
router.put("/addjob", checkRole(["jobSeeker"]), addJobToShortlist);
router.delete("/removejob", checkRole(["jobSeeker"]), removeJobFromShortlist);

export default router;
