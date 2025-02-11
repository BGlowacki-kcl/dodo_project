import { Application } from "../models/application.model.js";
import Job from "../models/job.model.js";
import User  from "../models/user/user.model.js";

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
    async apply(req, res) {
        try {
            const { jobId, coverLetter } = req.body;
    
            const application = await Application.create({
                job: jobId,
                applicant: "65a51cc1dd997c1460cab7be", // Temporary test applicant ID
                coverLetter,
                status: "applying",
                submittedAt: new Date(),
            });
    
            return res.status(201).json(createResponse(true, "Application started successfully", application)); // ????
        } catch (error) {
            return res.status(500).json({ message: "Error submitting application", success: false }); //handleError(res, error, "Error submitting application");
        }
    },
    
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
    
    async cancel(req, res) {
        try {
            const { applicationId } = req.params;
            
            const application = await Application.findById(applicationId);
    
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }
    
            if (application.status !== "applying") {
                return res.status(400).json(createResponse(false, "Only applications in 'applying' status can be canceled"));
            }
    
            await Application.findByIdAndDelete(applicationId);
    
            return res.status(200).json(createResponse(true, "Application canceled successfully"));
        } catch (error) {
            return handleError(res, error, "Error canceling application");
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
};
