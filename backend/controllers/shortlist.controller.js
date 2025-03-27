import Shortlist from "../models/shortlist.model.js";
import Job from "../models/job.model.js";
import User from "../models/user/user.model.js";

/**
 * Fetches a user's shortlist
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Shortlist document
 */
const fetchShortlist = async (userId) => {
    const shortlist = await Shortlist.findOne({ user: userId }).populate("jobs");
    if (!shortlist) {
        const error = new Error("Shortlist not found");
        error.status = 404;
        throw error;
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
        const error = new Error("Job not found");
        error.status = 404;
        throw error;
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
        shortlist = await Shortlist.create({ user: userId, jobs: [] });
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
    const jobIndex = shortlist.jobs.findIndex(job => job._id.toString() === jobId.toString());
    
    if (jobIndex === -1) {
        const error = new Error("Job not in shortlist");
        error.status = 404;
        throw error;
    }
    
    shortlist.jobs.splice(jobIndex, 1);
    
    return await shortlist.save();
};

/**
 * Creates a new shortlist for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const createShortlist = async (req, res) => {
    try {
        const userId = req.uid;
        const user = await User.findOne({ uid: userId });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        const shortlist = await Shortlist.create({ user: user._id, jobs: [] });
        return res.status(201).json({ success: true, data: shortlist });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
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
        return res.status(200).json({ success: true, data: shortlist });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({ success: false, message: error.message });
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
        const { jobid } = req.query;

        await verifyJobExists(jobid);
        const shortlist = await getOrCreateShortlist(userId);

        if (isJobInShortlist(shortlist, jobid)) {
            return res.status(400).json({ success: false, message: "Job already in shortlist" });
        }

        shortlist.jobs.push(jobid);
        const updatedShortlist = await shortlist.save();
        return res.status(201).json({ success: true, data: updatedShortlist });
    } catch (error) {
        const status = error.status || 500;
        console.log(error);
        return res.status(status).json({ success: false, message: error.message });
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
        const { jobid } = req.query;
        console.log(userId);

        const shortlist = await fetchShortlist(userId);
        const updatedShortlist = await removeJob(shortlist, jobid);
        return res.status(200).json({ success: true, data: updatedShortlist });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};