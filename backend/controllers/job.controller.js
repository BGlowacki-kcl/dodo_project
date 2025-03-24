import Job from '../models/job.model.js';
import { Employer } from '../models/user/Employer.model.js';

const createResponse = (success, message, data = null) => ({
    success,
    message,
    ...(data && { data })
});

/**
 * Validates required job fields
 * @param {Object} data - Job data object
 * @returns {boolean} Whether all required fields are present
 */
const areRequiredFieldsPresent = ({ title, company, location, description, postedBy }) => {
    if(title && company && location && description && postedBy){
        return true;
    } else {
        return false;
    }
}
// if - statemetn
/**
 * Creates a new job posting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const createJob = async (req, res) => {
    try {
        const jobData = req.body;

        if (!areRequiredFieldsPresent(jobData)) {
            return res.status(400).json(createResponse(false, 'All required fields must be filled.'));
        }

        const job = new Job(jobData);
        const createdJob = await job.save();
        return res.status(201).json(createResponse(true, 'Job created successfully', createdJob));
    } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
    }
};

/**
 * Retrieves all job postings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        return res.status(200).json(createResponse(true, 'Jobs retrieved successfully', jobs));
    } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
    }
};

/**
 * Retrieves jobs posted by a specific employer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getJobsByEmployer = async (req, res) => {
    try {
        const { uid } = req;
        const employer = await Employer.findOne({ uid });

        if (!employer) {
            return res.status(404).json(createResponse(false, 'Employer not found'));
        }

        const jobs = await Job.find({ postedBy: employer._id });
        return res.status(200).json(createResponse(true, 'Jobs retrieved successfully', jobs));
    } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
    }
};

/**
 * Retrieves a job by its ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json(createResponse(false, 'Job not found'));
        }
        return res.status(200).json(createResponse(true, 'Job retrieved successfully', job));
    } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
    }
};

/**
 * Updates an existing job posting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const updateJob = async (req, res) => {
    try {
        const updatedData = { ...req.body, updatedAt: Date.now() };
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (!updatedJob) {
            return res.status(404).json(createResponse(false, 'Job not found'));
        }
        return res.status(200).json(createResponse(true, 'Job updated successfully', updatedJob));
    } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
    }
};

/**
 * Deletes a job posting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json(createResponse(false, 'Job not found'));
        }

        await job.deleteOne();
        return res.status(200).json(createResponse(true, 'Job deleted successfully'));
    } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
    }
};

/**
 * Gets the count of jobs by employment type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getJobCountByType = async (req, res) => {
    try {
        const { type } = req.query;
        const count = await Job.countDocuments({ employmentType: type });
        return res.status(200).json(createResponse(true, 'Job count retrieved successfully', count));
    } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
    }
};

/**
 * Retrieves all unique companies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Job.distinct('company');
        return res.status(200).json(createResponse(true, 'Companies retrieved successfully', companies));
    } catch (error) {
        return res.status(500).json(createResponse(false, "Failed to fetch companies", error.message));
    }
};

/**
 * Retrieves all unique job roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllJobRoles = async (req, res) => {
    try {
        const titles = await Job.distinct('title');
        return res.status(200).json(createResponse(true, 'Job roles retrieved successfully', titles));
    } catch (error) {
        return res.status(500).json(createResponse(false, "Failed to fetch job roles", error.message));
    }
};

/**
 * Retrieves all unique job locations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllJobLocations = async (req, res) => {
    try {
        const locations = await Job.distinct('location');
        return res.status(200).json(createResponse(true, 'Job locations retrieved successfully', locations));
    } catch (error) {
        return res.status(500).json(createResponse(false, "Failed to fetch job locations", error.message));
    }
};

/**
 * Retrieves all unique job employment types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllJobTypes = async (req, res) => {
    try {
        const employmentTypes = await Job.distinct('employmentType');
        return res.status(200).json(createResponse(true, 'Job types retrieved successfully', employmentTypes));
    } catch (error) {
        return res.status(500).json(createResponse(false, "Failed to fetch job types", error.message));
    }
};

/**
 * Builds a filter object for job queries
 * @param {Object} query - Query parameters
 * @returns {Object} MongoDB filter object
 */
const buildJobFilter = ({ jobType, location, role }) => {
    const filter = {};
    if (jobType) filter.employmentType = Array.isArray(jobType) ? { $in: jobType } : jobType;
    if (location) filter.location = Array.isArray(location) ? { $in: location } : location;
    if (role) filter.title = Array.isArray(role) ? { $in: role } : role;
    return filter;
};

/**
 * Retrieves filtered job postings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getFilteredJobs = async (req, res) => {
    try {
        const filter = buildJobFilter(req.query);
        const jobs = await Job.find(filter);
        return res.status(200).json(createResponse(true, 'Jobs retrieved successfully', jobs));
    } catch (error) {
        return res.status(500).json(createResponse(false, "Failed to fetch jobs", error.message));
    }
};

/**
 * Retrieves questions for a specific job
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getJobQuestionsById = async (req, res) => {
    try {
        const { jobId } = req.query;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json(createResponse(false, 'Job not found'));
        }
        return res.status(200).json(createResponse(true, 'Job questions retrieved successfully', job.questions));
    } catch (error) {
        return res.status(500).json(createResponse(false, error.message));
    }
};

if(process.env.NODE_ENV === "test"){
    module.exports = {
        createJob,
        getJobs,
        getJobById,
        updateJob,
        deleteJob,
        getJobCountByType,
        getAllJobRoles,
        getAllJobLocations,
        getAllJobTypes,
        getFilteredJobs,
        buildJobFilter,
        getJobQuestionsById,
        getJobsByEmployer,
        areRequiredFieldsPresent,
        createResponse
    };
 }