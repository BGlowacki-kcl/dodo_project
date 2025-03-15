import Shortlist from "../models/shortlist.model.js";
import Job from "../models/job.model.js";

// Retrieve a user's shortlist
export const getShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        console.log("Fetching shortlist for user:", userId);
        const shortlist = await Shortlist.findOne({ user: userId }).populate("jobs");
        if (!shortlist) {
            return res.status(404).json({ message: "Shortlist not found" });
        }
        res.json(shortlist);
    } catch (error) {
        console.error("Error in getShortlist controller:", error);
        res.status(500).json({ message: error.message });
    }
};

// Add a job to the user's shortlist
export const addJobToShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        const { jobId } = req.params;

        // Verify that the job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Find the user's shortlist; if it doesn't exist, create one.
        let shortlist = await Shortlist.findOne({ user: userId });
        if (!shortlist) {
            shortlist = new Shortlist({ user: userId, jobs: [] });
        }

        // Check if the job is already in the shortlist.
        if (shortlist.jobs.includes(jobId)) {
            return res.status(400).json({ message: "Job already in shortlist" });
        }

        shortlist.jobs.push(jobId);
        await shortlist.save();
        res.status(201).json(shortlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove a job from the user's shortlist
export const removeJobFromShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        const { jobId } = req.params;
        const shortlist = await Shortlist.findOne({ user: userId });
        if (!shortlist) {
            return res.status(404).json({ message: "Shortlist not found" });
        }

        const jobIndex = shortlist.jobs.indexOf(jobId);
        if (jobIndex === -1) {
            return res.status(404).json({ message: "Job not in shortlist" });
        }

        shortlist.jobs.splice(jobIndex, 1);
        await shortlist.save();
        res.json(shortlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
