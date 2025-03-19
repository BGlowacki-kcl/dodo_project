import express from "express";
import { getShortlist, addJobToShortlist, removeJobFromShortlist } from "../controllers/shortlist.controller.js";
import { checkRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", checkRole(["jobSeeker"]), getShortlist);

router.post("/:jobId", checkRole(["jobSeeker"]), addJobToShortlist);

router.delete("/:jobId", checkRole(["jobSeeker"]), removeJobFromShortlist);

export default router;
