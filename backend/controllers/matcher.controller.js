import { JobSeeker } from '../models/user/jobSeeker.model.js';
import Job from '../models/job.model.js';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.HUGGING_FACE_API_KEY;
const MODEL_ID = "TechWolf/JobBERT-v2";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

/**
 * Queries the Hugging Face API for similarity between CV and job description
 * @param {string} cvText - User's CV text
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} Object containing job description and similarity score
 * @throws {Error} If API request fails or response is invalid
 */
export async function query(cvText, jobDescription) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: {
                source_sentence: jobDescription,
                sentences: [cvText],
            }
        }),
    });

    if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
    }

    const result = await response.json();
    if (!Array.isArray(result) || result.length === 0) {
        throw new Error("Invalid API response");
    }

    return {
        jobDescription,
        similarityScore: result[0]
    };
}

/**
 * Validates user data for job recommendations
 * @param {string} uid - User ID
 * @param {Object} user - JobSeeker document
 * @returns {void}
 * @throws {Error} If validation fails
 */
const validateUser = (uid, user) => {
    if (!uid) throw new Error("User ID is required");
    if (!user) throw new Error("User not found");
    if (!user.resume) throw new Error("User CV is missing");
};

/**
 * Fetches jobs excluding specified IDs
 * @param {Array<string>} excludeJobIds - Array of job IDs to exclude
 * @returns {Promise<Array>} Array of job documents
 */
const fetchJobs = async (excludeJobIds) => 
    Job.find({ _id: { $nin: excludeJobIds } }).limit(30);

/**
 * Computes job matches with similarity scores
 * @param {Array} jobs - Array of job documents
 * @param {string} resume - User's resume text
 * @returns {Promise<Array>} Array of jobs with similarity scores
 */
const computeJobMatches = async (jobs, resume) => 
    Promise.all(jobs.map(async (job) => {
        const { similarityScore } = await query(resume, job.description);
        return { ...job.toObject(), similarityScore };
    }));

/**
 * Sorts jobs by similarity score in descending order
 * @param {Array} jobMatches - Array of jobs with similarity scores
 * @returns {Array} Sorted array of job matches
 */
const sortJobMatches = (jobMatches) => 
    jobMatches.sort((a, b) => b.similarityScore - a.similarityScore);

/**
 * Retrieves job recommendations for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getUserJobRecommendations = async (req, res) => {
    try {
        const { uid } = req;
        const { excludeJobIds = [] } = req.query;

        const user = await JobSeeker.findOne({ uid });
        validateUser(uid, user);

        const jobs = await fetchJobs(excludeJobIds);
        const jobMatches = await computeJobMatches(jobs, user.resume);
        const sortedMatches = sortJobMatches(jobMatches);

        return res.status(200).json({ recommendedJobs: sortedMatches.slice(0, 5) });
    } catch (error) {
        const status = error.message === "User not found" ? 404 : 400;
        return res.status(status).json({ message: error.message });
    }
};