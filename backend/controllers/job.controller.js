import Job from '../models/job.model.js';

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
        } = req.body;
        const { postedBy } = req;

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
      console.log("Fetching all job roles");
      const titles = await Job.distinct('title');
      console.log("Found titles:", titles);
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
      console.log("Fetching all job locations");
      const locations = await Job.distinct('location');
      console.log("Found locations:", locations);
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
        console.log("Fetching all job types");
        const employmentType = await Job.distinct('employmentType');
        console.log("Found employmentTypes:", employmentType);
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

        console.log("Fetching jobs with filters:", filter);

        const jobs = await Job.find(filter);
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching filtered jobs:", error);
        res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
    }
};
