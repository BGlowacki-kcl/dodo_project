import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import Job from "../models/job.model.js";
import User  from "../models/user/user.model.js";

const createResponse = (success, message, data = null) => ({
    success,
    message,
    ...(data && { data }), // issue here maybe with tests
});


const handleError = (res, error, defaultMessage = "Server error") => {
    console.error(error);
    const statusCode = error.status || 500;
    return res.status(statusCode).json(createResponse(false, error.message || defaultMessage));
};

export const applicationController = {
    
    async getApplication(req, res) {
        try {
            const { jobId, userId } = req.params;
            const application = await Application.findOne({ job: jobId, applicant: userId });
    
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }
    
            return res.status(200).json(createResponse(true, "Application retrieved successfully", application));
        } catch (error) {
            return res.status(500).json({ message: "Error retrieving application", success: false }) //handleError(res, error, "Error retrieving application");
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
    
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
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
            const applications = await Application.find({ job: jobId }).populate("applicant", "name email");
            
            const applicants = applications.map(app => ({
                id: app.applicant._id,
                name: app.applicant.name,
                email: app.applicant.email
            }));
            
            return res.status(200).json(createResponse(true, "Applicants retrieved successfully", applicants));
        } catch (error) {
            return handleError(res, error, "Error retrieving applicants");
        }
    },
    //GET ALL APPLICATIONS (CAN BE FILTERED BY APPLICANT)
    async getAllApplications(req, res) {
        try {
            const { uid } = req;
            const user = await User.findOne({ uid: uid });
            const filter = { applicant: user._id };
            const apps = await Application.find(filter).populate("job");
            res.json(createResponse(true, "Applications fetched", apps));
        } 
        catch (err) {
            console.error("Error fetching applications:", err);
            res.status(500).json(createResponse(false, err.message));
        }
    },
    
    //GET AN APPLICATION BY ITS ID!!!
    async getOneApplication(req, res) {
        try {
            const { id } = req.query;
            const { uid } = req;
            const user = await User.findOne({ uid: uid });
            const app = await Application.findById(id).populate("job");
            if (!app) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }
            if(app.applicant.equals(user._id) == false) {
                return res.status(403).json(createResponse(false, "Unauthorized"));
            }
            res.json(createResponse(true, "Application found", app));
        } 
        catch (err) {
            console.error("Error getting application:", err);
            res.status(500).json(createResponse(false, err.message));
        }
    },
    
    //CREATE A NEW APPLICATION
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
    
            const populatedApp = await newApp.populate("job");
            res.status(201).json(createResponse(true, "Application created", populatedApp));
        } 
        catch (err) {
            console.error("Error creating application:", err);
            res.status(500).json(createResponse(false, err.message));
        }
    },
    
    //DELETE/WITHDRAW AN APPLICATION BY ITS ID
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
};

