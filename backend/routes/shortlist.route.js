import express from "express";
import { getShortlist, addJobToShortlist, removeJobFromShortlist } from "../controllers/shortlist.controller.js";

const router = express.Router();

router.get("/:userId", getShortlist);

router.post("/:userId", addJobToShortlist);

router.delete("/:userId/:jobId", removeJobFromShortlist);

export default router;
