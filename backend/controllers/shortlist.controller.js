import Shortlist from "../models/shortlist.model.js";
import Job from "../models/job.model.js";
import User from "../models/user/user.model.js";

// Retrieve a user's shortlist
export const getShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        const shortlist = await Shortlist.findOne({ user: userId }).populate("jobs");
        if (!shortlist) {
            return res.status(404).json({ success: false, message: "Shortlist not found" });
        }
        res.status(200).json({ success: true, data: shortlist });
    } catch (error) {
        console.error("Error in getShortlist controller:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a job to the user's shortlist
export const addJobToShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        const { jobid } = req.query;

        // Verify that the job exists
        const job = await Job.findById(jobid);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // Find the user's shortlist; if it doesn't exist, create one.
        let shortlist = await Shortlist.findOne({ user: userId });
        if (!shortlist) {
            shortlist = new Shortlist({ user: userId, jobs: [] });
        }

        // Check if the job is already in the shortlist.
        if (shortlist.jobs.includes(jobid)) {
            return res.status(400).json({ success: false, message: "Job already in shortlist" });
        }

        shortlist.jobs.push(jobid);
        await shortlist.save();
        res.status(201).json({ success: true, data: shortlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createShortlist = async (req, res) => {
    try {
        const { uid } = req;
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const shortlist = await Shortlist.create({ user: user._id, jobs: [] });
        res.status(201).json({ success: true, data: shortlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove a job from the user's shortlist
export const removeJobFromShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        const { jobid } = req.query;
        const shortlist = await Shortlist.findOne({ user: userId });
        if (!shortlist) {
            return res.status(404).json({ success: false, message: "Shortlist not found" });
        }

        const jobIndex = shortlist.jobs.indexOf(jobid);
        if (jobIndex === -1) {
            return res.status(404).json({ success: false, message: "Job not in shortlist" });
        }

        shortlist.jobs.splice(jobIndex, 1);
        await shortlist.save();
        res.status(200).json({ success: true, data: shortlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
