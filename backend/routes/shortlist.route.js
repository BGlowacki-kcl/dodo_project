import express from "express";
import { getShortlist, addJobToShortlist, removeJobFromShortlist, createShortlist } from "../controllers/shortlist.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/jobs", checkRole([]), getShortlist);
router.post("/create", checkRole(["jobSeeker"]), createShortlist);
router.put("/addjob", checkRole(["jobSeeker"]), addJobToShortlist);
router.put("/removejob", checkRole(["jobSeeker"]), removeJobFromShortlist);

export default router;
