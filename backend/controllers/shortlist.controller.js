import Shortlist from "../models/shortlist.model.js";
import Job from "../models/job.model.js";

/**
 * Fetches a user's shortlist
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Shortlist document
 */
const fetchShortlist = async (userId) => {
    const shortlist = await Shortlist.findOne({ user: userId }).populate("jobs");
    if (!shortlist) {
        throw new Error("Shortlist not found");
    }
    return shortlist;
};

/**
 * Verifies if a job exists
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job document
 */
const verifyJobExists = async (jobId) => {
    const job = await Job.findById(jobId);
    if (!job) {
        throw new Error("Job not found");
    }
    return job;
};

/**
 * Gets or creates a user's shortlist
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Shortlist document
 */
const getOrCreateShortlist = async (userId) => {
    let shortlist = await Shortlist.findOne({ user: userId });
    if (!shortlist) {
        shortlist = new Shortlist({ user: userId, jobs: [] });
    }
    return shortlist;
};

/**
 * Checks if a job is already in the shortlist
 * @param {Object} shortlist - Shortlist document
 * @param {string} jobId - Job ID
 * @returns {boolean} Whether job is in shortlist
 */
const isJobInShortlist = (shortlist, jobId) => shortlist.jobs.includes(jobId);

/**
 * Removes a job from the shortlist
 * @param {Object} shortlist - Shortlist document
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Updated shortlist
 */
const removeJob = async (shortlist, jobId) => {
    const jobIndex = shortlist.jobs.indexOf(jobId);
    if (jobIndex === -1) {
        throw new Error("Job not in shortlist");
    }
    shortlist.jobs.splice(jobIndex, 1);
    return shortlist.save();
};

/**
 * Retrieves a user's shortlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        const shortlist = await fetchShortlist(userId);
        return res.json(shortlist);
    } catch (error) {
        const status = error.message === "Shortlist not found" ? 404 : 500;
        return res.status(status).json({ message: error.message });
    }
};

/**
 * Adds a job to the user's shortlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const addJobToShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        const { jobId } = req.params;

        await verifyJobExists(jobId);
        const shortlist = await getOrCreateShortlist(userId);

        if (isJobInShortlist(shortlist, jobId)) {
            return res.status(400).json({ message: "Job already in shortlist" });
        }

        shortlist.jobs.push(jobId);
        const updatedShortlist = await shortlist.save();
        return res.status(201).json(updatedShortlist);
    } catch (error) {
        const status = error.message === "Job not found" ? 404 : 500;
        return res.status(status).json({ message: error.message });
    }
};

/**
 * Removes a job from the user's shortlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const removeJobFromShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        const { jobId } = req.params;

        const shortlist = await fetchShortlist(userId);
        const updatedShortlist = await removeJob(shortlist, jobId);
        return res.json(updatedShortlist);
    } catch (error) {
        const status = error.message === "Shortlist not found" || error.message === "Job not in shortlist" ? 404 : 500;
        return res.status(status).json({ message: error.message });
    }
};