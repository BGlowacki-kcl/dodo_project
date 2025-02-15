import express from "express";
import { query } from "../controllers/matcher.controller.js";

const router = express.Router();

router.post("/matcher", async (req, res) => {
    try {
        const result = await query(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to query Hugging Face API" });
    }
});

export default router;