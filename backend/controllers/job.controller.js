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
        } = req.body;
        

        if (!title || !company || !location || !description || !postedBy) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }

        // Create the job post
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
            deadline
        });

        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
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
        const job = await Job.findById(req.params.id);//.populate('postedBy', 'name email').populate('applicants', 'name email');

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

export const getFilteredJobs = async (req, res) => {
    try {
        const { jobType, location, role } = req.query;

        const filter = {};

        // Convert single values to arrays if needed and apply filters
        if (jobType) filter.employmentType = Array.isArray(jobType) ? { $in: jobType } : jobType;
        if (location) filter.location = Array.isArray(location) ? { $in: location } : location;
        if (role) filter.title = Array.isArray(role) ? { $in: role } : role;

        const jobs = await Job.find(filter);
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching filtered jobs:", error);
        res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
    }
};

export const getJobApplicants = async (req, res) => {
   try {
        const { jobId } = req.query;
        
        if (!jobId) {
            return res.status(400).json({ 
                success: false,
                message: "Missing jobId parameter"
            });
        }

        const job = await Job.findById(jobId).populate('applicants', 'name email');
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Check if the employer requesting is the one who posted the job
        const { uid } = req;
        const employer = await Employer.findOne({ uid });
        
        if (!employer || job.postedBy.toString() !== employer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to view applicants for this job"
            });
        }

        res.status(200).json({
            success: true,
            message: "Applicants retrieved successfully",
            data: job.applicants
        });
   } catch (error) {
        console.error('Error fetching job applicants:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
   }
};