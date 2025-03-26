import Job from '../models/job.model.js';
import { Employer } from '../models/user/Employer.model.js';

export const createJob = async (req, res) => {
    try {
        const {
            title,
            company,
            location,
            description,
            salaryRange,
            employmentType,
            requirements,
            experienceLevel,
            postedBy,
            deadline,
            questions,
        } = req.body;

        console.log("Received payload:", req.body); // Add this for debugging

        if (!title || !company || !location || !description || !postedBy) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }

        const job = new Job({
            title,
            company,
            location,
            description,
            salaryRange,
            employmentType,
            requirements,
            experienceLevel,
            postedBy,
            deadline,
            questions,
        });

        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        console.error("Error in createJob:", error); // Add this for debugging
        res.status(500).json({ message: error.message });
    }
};

export const getJobs = async (req, res) => {
    try {
        const { deadlineValid } = req.query;

        const filter = {};
        if (deadlineValid === "true") {
            filter.deadline = { $gte: new Date() }; // Ensure valid deadlines
        }

        const jobs = await Job.find(filter);
        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getJobsByEmployer = async (req, res) => {
    try {
        const { uid } = req; // This comes from auth middleware
        
        // Find the employer by their uid first
        const employer = await Employer.findOne({ uid });
        
        if (!employer) {
            return res.status(404).json({ message: 'Employer not found' });
        }

        // Then find all jobs posted by this employer using their MongoDB _id
        const jobs = await Job.find({ postedBy: employer._id });
        
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching employer jobs:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('assessments');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateJob = async (req, res) => {
    try {
        const updatedData = {
            ...req.body,
            updatedAt: Date.now()
        };

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        await job.deleteOne();
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getJobCountByType = async (req, res) => {
    try {
        const { type } = req.query;
        const count = await Job.countDocuments({ employmentType: type });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllJobRoles = async (req, res) => {
    try {
      const titles = await Job.distinct('title');
      res.status(200).json(titles);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ 
        message: "Failed to fetch job roles",
        error: error.message 
      });
    }
  };

export const getAllJobLocations = async (req, res) => {
    try {
      const locations = await Job.distinct('location');
      res.status(200).json(locations);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ 
        message: "Failed to fetch job locations",
        error: error.message 
      });
    }
  };

export const getAllJobTypes = async (req, res) => {
    try {
        const employmentType = await Job.distinct('employmentType');
        res.status(200).json(employmentType);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ 
        message: "Failed to fetch job types",
        error: error.message 
        });
    }
};

export const getAllCompanies = async (req, res) => {
    try {
        const company = await Job.distinct('company');
        res.status(200).json(company);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ 
        message: "Failed to fetch companies",
        error: error.message 
        });
    }
};

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

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching filtered jobs:", error);
        res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
    }
};

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

