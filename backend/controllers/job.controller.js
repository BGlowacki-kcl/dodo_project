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
            postedBy
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
