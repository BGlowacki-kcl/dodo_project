import Application from '../models/application.model';
import Job from '../models/job.model';
import User from '../models/user.model';

// Centralized response formatter
const createResponse = (success, message, data = null, statusCode = 200) => ({
    success,
    message,
    ...(data && { data })
});

// Reusable error messages
const ERROR_MESSAGES = {
    JOB_NOT_FOUND: 'Job not found',
    UNAUTHORIZED: 'Unauthorized: Only job seekers can apply for jobs',
    ALREADY_APPLIED: 'You have already applied for this job',
    SERVER_ERROR: 'Error submitting application'
};

// Validation helpers
const validateJob = async (jobId) => {
    const job = await Job.findById(jobId);
    if (!job) {
        throw { status: 404, message: ERROR_MESSAGES.JOB_NOT_FOUND };
    }
    return job;
};

const validateApplicant = async (applicantId) => {
    const applicant = await User.findById(applicantId);
    if (!applicant || applicant.role !== 'jobSeeker') { // temp
        throw { status: 403, message: ERROR_MESSAGES.UNAUTHORIZED };
    }
    return applicant;
};

const checkExistingApplication = async (jobId, applicantId) => {
    const existing = await Application.findOne({ job: jobId, applicant: applicantId });
    if (existing) {
        throw { status: 400, message: ERROR_MESSAGES.ALREADY_APPLIED };
    }
};

export const applicationController = {
    async apply(req, res) {
        try {
            const { jobId, coverLetter } = req.body;
            const applicantId = req.user.id;

            // Run all validations
            await Promise.all([
                validateJob(jobId),
                validateApplicant(applicantId),
                checkExistingApplication(jobId, applicantId)
            ]);

            // Create and save application with 'applying' status
            const application = await Application.create({
                job: jobId,
                applicant: applicantId,
                coverLetter,
                status: 'applying',
                submittedAt: new Date()
            });

            return res.status(201).json(
                createResponse(true, 'Application started successfully', application)
            );

        } catch (error) {
            const statusCode = error.status || 500;
            const message = error.status ? error.message : ERROR_MESSAGES.SERVER_ERROR;

            return res.status(statusCode).json(
                createResponse(false, message, error.status ? null : error.message)
            );
        }
    },

    async getApplication(req, res) {
        try {
            const { applicationId } = req.params;
            const employerId = req.user.id; // Get employer ID from authenticated session

            // Find the application
            const application = await Application.findById(applicationId)
                .populate('applicant', 'name email experience education skills'); // Get applicant details

            if (!application) {
                return res.status(404).json(createResponse(false, 'Application not found'));
            }

            // Ensure the employer owns the job before viewing the application
            if (application.job.postedBy.toString() !== employerId) {
                return res.status(403).json(createResponse(false, 'Unauthorized to view this application'));
            }

            return res.status(200).json(createResponse(true, 'Application retrieved successfully', application));
        } catch (error) {
            return res.status(500).json(createResponse(false, 'Server error', error.message));
        }
    },

    async cancel(req, res) {
        try {
            const { applicationId } = req.body;
            const applicantId = req.user.id; // Get user ID from token

            // Find the application
            const application = await Application.findById(applicationId);
            if (!application) {
                return res.status(404).json(createResponse(false, 'Application not found'));
            }

            // Ensure only the owner can delete it
            if (application.applicant.toString() !== applicantId) {
                return res.status(403).json(createResponse(false, 'Unauthorized to cancel this application'));
            }

            // Ensure the application is still in 'applying' status
            if (application.status !== 'applying') {
                return res.status(400).json(createResponse(false, 'Application cannot be canceled after submission'));
            }

            // Delete the application
            await Application.findByIdAndDelete(applicationId);

            return res.status(200).json(createResponse(true, 'Application canceled successfully'));
        } catch (error) {
            return res.status(500).json(createResponse(false, 'Server error', error.message));
        }
    },

    async updateApplicationStatus(req, res) {
        try {
            const { id } = req.params; // Application ID
            const { status } = req.body; // New status

            // Check if status is valid
            const validStatuses = ['applying', 'applied', 'in review', 'shortlisted', 'rejected', 'hired'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json(createResponse(false, 'Invalid application status'));
            }

            // Update the application status
            const application = await Application.findByIdAndUpdate(id, { status }, { new: true });
            if (!application) {
                return res.status(404).json(createResponse(false, 'Application not found'));
            }

            return res.status(200).json(createResponse(true, 'Application status updated successfully', application));
        } catch (error) {
            return res.status(500).json(createResponse(false, 'Server error', error.message));
        }
    }
};
