import mongoose from "mongoose";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user/user.model.js";

const createResponse = (success, message, data = null) => ({
    success,
    message,
    ...(data && { data }),
});

const handleError = (res, error, defaultMessage = "Server error") => {
    console.error(error);
    const statusCode = error.status || 500;
    return res.status(statusCode).json(createResponse(false, error.message || defaultMessage));
};

export const applicationController = {
  
    async getApplication(req, res) {
        try {
            const { jobId } = req.params;
            const application = await Application.findOne({ job: jobId, applicant: req.uid });

            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }

            return res.status(200).json(createResponse(true, "Application retrieved successfully", application));
        } catch (error) {
            return handleError(res, error, "Error retrieving application");
        }
    },

    async updateApplicationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ["applying", "applied", "in review", "shortlisted", "rejected", "hired"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json(createResponse(false, "Invalid application status"));
            }

            const application = await Application.findById(id).populate("job");
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }

            // Ensure only the employer who posted the job can update the application status
            const job = await Job.findById(application.job);
            if (!job || job.postedBy.toString() !== req.uid) {
                return res.status(403).json(createResponse(false, "Unauthorized to update application status"));
            }

            application.status = status;
            await application.save();

            return res.status(200).json(createResponse(true, "Application status updated successfully", application));
        } catch (error) {
            return handleError(res, error, "Error updating application status");
        }
    },

    async getApplicants(req, res) {
        try {
            const { jobId } = req.params;
            

            const job = await Job.findById(jobId);
            if (!job  ) {
                return res.status(403).json(createResponse(false, "Unauthorized to view applicants for this job"));
            }

            const applications = await Application.find({ job: jobId }).populate("applicant", "name email");

            const applicants = applications.map(app => ({
                id: app.applicant._id,
                name: app.applicant.name,
                email: app.applicant.email,
                status: app.status,
                applicationId: app._id
            }));

            return res.status(200).json(createResponse(true, "Applicants retrieved successfully", applicants));
        } catch (error) {
            return handleError(res, error, "Error retrieving applicants");
        }
    },

    async getAllApplications(req, res) {
        try {
            const { uid } = req;
            const user = await User.findOne({ uid: uid });
            const filter = { applicant: user._id };
            const apps = await Application.find(filter).populate("job");
            return res.json(createResponse(true, "Applications fetched", apps));
        } catch (err) {
            return handleError(res, err, "Error fetching applications");
        }
    },

    async getOneApplication(req, res) {
        try {
            const { id } = req.query; // This is now the user's ID
            const { uid } = req;
            
            // Get the employer making the request
            const employer = await User.findOne({ uid });
            if (!employer) {
                return res.status(403).json(createResponse(false, "Unauthorized"));
            }
            
            // Find application by applicant ID and populate necessary fields
            const app = await Application.findById(id)
                .populate("applicant", "name email skills resume")
                .populate("job");
            
            if (!app) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }
    
            // Check if employer owns the job
            
            
            const applicationData = {
                id: app._id,
                applicantid: app.applicant._id,
                name: app.applicant.name,
                email: app.applicant.email,
                status: app.status,
                coverLetter: app.coverLetter,
                submittedAt: app.submittedAt,
                skills: app.applicant.skills,
                resume: app.applicant.resume,
                job: app.job
            };
    
            res.json(createResponse(true, "Application found", applicationData));
        } catch (err) {
            console.error("Error getting application:", err);
            res.status(500).json(createResponse(false, err.message));
        }
    },

    async createApplication(req, res) {
        try {
            const { jobId, coverLetter } = req.body;
            const { uid } = req;
            if (!jobId) {
                return res.status(400).json(createResponse(false, "Missing jobId in body"));
            }
            const user = await User.findOne({uid});
    
            const newApp = await Application.create({
                job: jobId,
                applicant: user._id,
                coverLetter,
                status: "applied",
            });

            await Job.findByIdAndUpdate(jobId, { $addToSet: { applicants: user._id } });

            const populatedApp = await newApp.populate("job");
            return res.status(201).json(createResponse(true, "Application created", populatedApp));
        } catch (err) {
            return handleError(res, err, "Error creating application");
        }
    },

    async withdrawApplication(req, res) {
        try {

            const { id } = req.query;
            const { uid } = req;
            const user = await User.findOne({ uid: uid });

            const app = await Application.findById(id);
            if (!app) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }

            if(app.applicant.equals(user._id) == false) {
                return res.status(403).json(createResponse(false, "Unauthorized"));
            }
            await app.deleteOne();
            res.json(createResponse(true, "Application withdrawn", null));
        }
        catch (err) {
            console.error("Error withdrawing application:", err);
            res.status(500).json(createResponse(false, err.message));
        }
    },

    async getTotalApplicantsByEmployer(req, res) {
        try {
            const { uid } = req;

    
            const employer = await User.findOne({ uid });

            if (!employer) {
                return res.status(404).json({ message: 'Employer not found' });
            }
    
            // Find all jobs posted by this employer
            const jobs = await Job.find({ postedBy: employer._id });
    
            // Aggregate the total number of applicants for these jobs
            const jobIds = jobs.map(job => job._id);
            const totalApplicants = await Application.countDocuments({ job: { $in: jobIds } });
    
            res.status(200).json({ totalApplicants });
        } catch (error) {
            console.error('Error fetching total applicants:', error);
            res.status(500).json({ message: 'Failed to fetch total applicants', error: error.message });
        }
    }
};
