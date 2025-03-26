import Job from '../models/job.model.js';
import { Employer } from '../models/user/Employer.model.js';
import { createResponse } from './helpers.js';

/**
 * Validates required job fields
 * @param {Object} data - Job data object
 * @returns {boolean} Whether all required fields are present
 */
export const areRequiredFieldsPresent = ({ title, company, location, description, postedBy }) => {
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
        const { deadlineValid } = req.query;

        const filter = {};
        if (deadlineValid === "true") {
            filter.deadline = { $gte: new Date() }; // Ensure valid deadlines
        }

        const jobs = await Job.find(filter);
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
        const job = await Job.findById(req.params.id)
            .populate('assessments');

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
export const buildJobFilter = ({ jobType, location, role }) => {
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
        const { jobType, location, role, company } = req.query;

        const filter = {};

        // Apply filters based on query parameters
        if (jobType) filter.employmentType = Array.isArray(jobType) ? { $in: jobType } : jobType;
        if (location) filter.location = Array.isArray(location) ? { $in: location } : location;
        if (role) filter.title = Array.isArray(role) ? { $in: role } : role;
        if (company) filter.company = Array.isArray(company) ? { $in: company } : company;

        // Use the reusable function to get jobs with valid deadlines
        const jobs = await getJobsWithValidDeadlines(filter);

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
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job.questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



/**
 * Filters jobs to exclude those with passed deadlines.
 * @param {Object} filter - Additional filters to apply (e.g., jobType, location).
 * @returns {Promise<Array>} - List of jobs with valid deadlines.
 */
export const getJobsWithValidDeadlines = async (filter = {}) => {
    try {
        // Add a filter to exclude jobs where the deadline has passed
        filter.deadline = { $gte: new Date() };

        // Fetch jobs with the provided filter
        const jobs = await Job.find(filter);
        return jobs;
    } catch (error) {
        console.error("Error fetching jobs with valid deadlines:", error);
        throw new Error("Failed to fetch jobs with valid deadlines");
    }
};

export const getSalaryBounds = async (req, res) => {
    try {
        const result = await Job.aggregate([
            {
                // Match only jobs with valid deadlines
                $match: {
                    deadline: { $gte: new Date() }, // Exclude jobs with past deadlines
                },
            },
            {
                // Group to calculate min and max salary
                $group: {
                    _id: null,
                    minSalary: { $min: "$salaryRange.min" },
                    maxSalary: { $max: "$salaryRange.max" },
                },
            },
        ]);

        if (result.length === 0) {
            return res.status(404).json({ message: "No salary data found for jobs with valid deadlines" });
        }

        const { minSalary, maxSalary } = result[0];
        res.status(200).json({ minSalary, maxSalary });
    } catch (error) {
        console.error("Error fetching salary bounds:", error);
        res.status(500).json({ message: "Failed to fetch salary bounds" });
    }
};
