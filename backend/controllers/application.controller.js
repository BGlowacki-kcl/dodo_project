import mongoose from "mongoose";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user/user.model.js";
import CodeAssessment from "../models/codeAssessment.js";
import CodeSubmission from "../models/codeSubmission.js";

/**
 * Creates a standardized API response object
 * @param {boolean} success - Indicates if the operation was successful
 * @param {string} message - Response message
 * @param {Object} [data] - Response data (optional)
 * @returns {Object} Standardized response object
 */
const createResponse = (success, message, data = null) => ({
    success,
    message,
    ...(data && { data }),
});

/**
 * Handles errors and sends appropriate response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} [defaultMessage] - Default error message
 * @returns {Object} Error response
 */
const handleError = (res, error, defaultMessage = "Server error") => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json(createResponse(false, error.message || defaultMessage));
};

/**
 * Validates application status
 * @param {string} status - Status to validate
 * @returns {boolean} Whether status is valid
 */
const isValidStatus = (status) => {
    const validStatuses = ["applying", "applied", "in review", "shortlisted", "rejected", "hired"];
    return validStatuses.includes(status);
};

/**
 * Verifies job ownership
 * @param {string} jobId - Job ID to verify
 * @param {string} userId - User ID to check against
 * @returns {Promise<boolean>} Whether user owns the job
 */
const verifyJobOwnership = async (jobId, userId) => {
    const job = await Job.findById(jobId);
    return job && job.postedBy.toString() === userId;
};

/**
 * Application controller handling all application-related operations
 */
export const applicationController = {
    /**
     * Retrieves a single application by job ID and user ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
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

    /**
     * Updates the status of an application
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async updateApplicationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!isValidStatus(status)) {
                return res.status(400).json(createResponse(false, "Invalid application status"));
            }

            const application = await Application.findById(id).populate("job");
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }

            const isOwner = await verifyJobOwnership(application.job._id, req.uid);
            if (!isOwner) {
                return res.status(403).json(createResponse(false, "Unauthorized to update application status"));
            }

            application.status = status;
            await application.save();

            return res.status(200).json(createResponse(true, "Application status updated successfully", application));
        } catch (error) {
            return handleError(res, error, "Error updating application status");
        }
    },

    /**
     * Retrieves all applicants for a job
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getApplicants(req, res) {
        try {
            const { jobId } = req.query;
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(403).json(createResponse(false, "Unauthorized to view applicants for this job"));
            }

            const applications = await Application
                .find({ job: jobId, status: { $ne: "applying" } })
                .populate("applicant", "name email");

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

    /**
     * Retrieves all applications for the authenticated user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getAllApplications(req, res) {
        try {
            const user = await User.findOne({ uid: req.uid });
            const applications = await Application
                .find({ applicant: user._id })
                .populate("job");
            return res.json(createResponse(true, "Applications fetched", applications));
        } catch (error) {
            return handleError(res, error, "Error fetching applications");
        }
    },

    /**
     * Retrieves detailed information about a single application
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getOneApplication(req, res) {
        try {
            const { id } = req.query;
            const user = await User.findOne({ uid: req.uid });
            
            const application = await Application.findById(id)
                .populate("applicant", "name email skills resume")
                .populate("job");

            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }

            if (!application.applicant._id.equals(user._id)) {
                return res.status(403).json(createResponse(false, "Unauthorized"));
            }

            return res.status(200).json(createResponse(true, "Application found", application));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Error getting application"));
        }
    },

    /**
     * Retrieves assessment deadline for an application
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getAssessmentDeadline(req, res) {
        try {
            const { id } = req.query;
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }

            const deadline = application.finishAssessmentDate || -1;
            const message = deadline === -1 ? "No assessment deadline set" : "Job deadline retrieved";
            return res.json(createResponse(true, message, deadline));
        } catch (error) {
            return handleError(res, error, "Error retrieving job deadline");
        }
    },

    /**
     * Sets assessment deadline for an application
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async setAssessmentDeadline(req, res) {
        try {
            const { id } = req.query;
            const { deadline } = req.body;
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }

            application.finishAssessmentDate = deadline;
            await application.save();
            return res.json(createResponse(true, "Assessment deadline set", deadline));
        } catch (error) {
            return handleError(res, error, "Error setting assessment deadline");
        }
    },

    /**
     * Creates a new job application
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async createApplication(req, res) {
        try {
            const { jobId, coverLetter, answers = [] } = req.body;
            if (!jobId) {
                return res.status(400).json(createResponse(false, "Invalid request data"));
            }

            const user = await User.findOne({ uid: req.uid });
            if (!user) {
                return res.status(403).json(createResponse(false, "Unauthorized"));
            }

            const newApp = await Application.create({
                job: jobId,
                applicant: user._id,
                coverLetter,
                answers: formatAnswers(answers || []),
                status: "applying",
            });

            await Job.findByIdAndUpdate(jobId, { $addToSet: { applicants: user._id } });
            const populatedApp = await newApp.populate("job");
            return res.status(201).json(createResponse(true, "Application created", populatedApp));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Error creating application"));
        }
    },

    /**
     * Withdraws an application
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async withdrawApplication(req, res) {
        try {
            const { id } = req.query;
            const user = await User.findOne({ uid: req.uid });
            const application = await Application.findById(id);

            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }

            if (!application.applicant.equals(user._id)) {
                return res.status(403).json(createResponse(false, "Unauthorized"));
            }

            await application.deleteOne();
            return res.json(createResponse(true, "Application withdrawn"));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Error withdrawing application"));
        }
    },

    /**
     * Updates application status with progression logic
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async updateApplicationProgress(req, res) {
        try {
            const { id, reject } = req.query;
            const user = await User.findOne({ uid: req.uid });
            const app = await Application.findById(id).populate("job");

            if (!user || !app) {
                return res.status(404).json(createResponse(false, "Application or user not found"));
            }

            if (reject) {
                return await handleRejection(res, app);
            }

            return await handleStatusProgression(res, app, user);
        } catch (error) {
            return handleError(res, error, "Error updating application status");
        }
    },

    /**
     * Retrieves dashboard data for an employer
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getDashboardData(req, res) {
        try {
            const { uid } = req;
            const employer = await User.findOne({ uid });
            if (!uid || !employer) {
                return res.status(400).json(createResponse(false, "Invalid request"));
            }

            const jobs = await getJobsByEmployer(uid);
            if (!jobs.length) {
                return res.status(404).json(createResponse(false, "No jobs found for this employer"));
            }

            const dashboardData = await buildDashboardData(employer, jobs);
            return res.status(200).json(createResponse(true, "Dashboard data retrieved successfully", dashboardData));
        } catch (error) {
            return handleError(res, error, "Error fetching dashboard data");
        }
    },

    /**
     * Saves application draft
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async saveApplication(req, res) {
        try {
            const { applicationId, coverLetter, answers } = req.body;
            const user = await User.findOne({ uid: req.uid });
            const application = await Application.findOne({ _id: applicationId, applicant: user._id });

            if (!application || application.status !== "applying") {
                return res.status(400).json(createResponse(false, "Cannot save application"));
            }

            application.coverLetter = coverLetter;
            application.answers = formatAnswers(answers);
            await application.save();

            return res.status(200).json(createResponse(true, "Application saved successfully", application));
        } catch (error) {
            return handleError(res, error, "Error saving application");
        }
    },

    /**
     * Submits an application
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async submitApplication(req, res) {
        try {
            const { applicationId } = req.body;
            const user = await User.findOne({ uid: req.uid });
            const application = await Application.findOne({ _id: applicationId, applicant: user._id });

            if (!applicationId || !user || !application || application.status !== "applying") {
                return res.status(400).json(createResponse(false, "Invalid application submission"));
            }

            application.status = "applied";
            await application.save();

            return res.status(200).json(createResponse(true, "Application submitted successfully", application));
        } catch (error) {
            return handleError(res, error, "Error submitting application");
        }
    }
};

/**
 * Builds detailed application data including assessments
 * @param {Object} application - Application document
 * @returns {Promise<Object>} Formatted application data
 */
const buildApplicationData = async (application) => {
    const job = await Job.findById(application.job);
    const assessments = await CodeAssessment.find({ _id: { $in: job.assessments } });
    const submissions = await CodeSubmission.find({ application: application._id });

    return {
        id: application._id,
        applicantId: application.applicant._id,
        name: application.applicant.name,
        email: application.applicant.email,
        status: application.status,
        coverLetter: application.coverLetter,
        submittedAt: application.submittedAt,
        skills: application.applicant.skills,
        resume: application.applicant.resume,
        job: application.job,
        assessments: { assessments, submissions },
        answers: application.answers.map(answer => ({
            questionId: answer.questionId.toString(),
            answerText: answer.answerText,
        })),
    };
};

/**
 * Validates answers format
 * @param {Array} answers - Answers array to validate
 * @returns {boolean} Whether answers format is valid
 */
const isValidAnswersFormat = (answers) => 
    answers && Array.isArray(answers) && 
    answers.every(answer => answer.questionId && answer.answerText);

/**
 * Formats answers for storage
 * @param {Array} answers - Raw answers array
 * @returns {Array} Formatted answers with ObjectId
 */
const formatAnswers = (answers) => 
    answers.map(answer => ({
        questionId: new mongoose.Types.ObjectId(answer.questionId),
        answerText: answer.answerText,
    }));

/**
 * Handles application rejection
 * @param {Object} res - Express response object
 * @param {Object} application - Application document
 * @returns {Promise<void>}
 */
const handleRejection = async (res, application) => {
    if (application.status === "accepted") {
        return res.status(400).json(createResponse(false, "Cannot reject an accepted application"));
    }
    application.status = "rejected";
    await application.save();
    return res.json(createResponse(true, "Application rejected", application));
};

/**
 * Handles application status progression
 * @param {Object} res - Express response object
 * @param {Object} application - Application document
 * @param {Object} user - User document
 * @returns {Promise<void>}
 */
const handleStatusProgression = async (res, application, user) => {
    const statuses = ['applied', 'shortlisted', 'code challenge', 'in review', 'accepted'];
    const currentIndex = statuses.indexOf(application.status);

    if (user.role === "employer" && application.status === "code challenge") {
        return res.status(400).json(createResponse(false, "Cannot update status"));
    }
    if (user.role === "applicant" && application.status !== "code challenge") {
        return res.status(400).json(createResponse(false, "Cannot update status"));
    }
    if (currentIndex === -1 || currentIndex === statuses.length - 1) {
        return res.status(400).json(createResponse(false, "No further status available"));
    }

    application.status = statuses[currentIndex + 1];
    if (application.status === 'code challenge' && !application.job.assessments.length) {
        application.status = statuses[currentIndex + 2];
    }
    await application.save();
    return res.json(createResponse(true, "Application status updated", application));
};

/**
 * Retrieves jobs by employer
 * @param {string} uid - User ID
 * @returns {Promise<Array>} Array of jobs
 */
const getJobsByEmployer = async (uid) => {
    const employer = await User.findOne({ uid });
    if (!employer) throw new Error("Employer not found");
    return Job.find({ postedBy: employer._id });
};

/**
 * Builds dashboard data object
 * @param {Object} employer - Employer document
 * @param {Array} jobs - Array of job documents
 * @returns {Promise<Object>} Dashboard data
 */
const buildDashboardData = async (employer, jobs) => {
    const totalStatus = await getTotalStatus(jobs);
    const lineGraphData = await getLineGraphData(jobs);
    return {
        totalJobs: jobs.length,
        totalStatus,
        companyName: employer.companyName || "",
        jobs,
        lineGraphData,
    };
};

/**
 * Gets total status counts for jobs
 * @param {Array} jobs - Array of job documents
 * @returns {Promise<Array>} Status aggregation
 */
const getTotalStatus = async (jobs) => {
    const jobIds = jobs.map(job => job._id);
    return Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
};

/**
 * Gets line graph data for job applications
 * @param {Array} jobs - Array of job documents
 * @returns {Promise<Array>} Line graph data
 */
const getLineGraphData = async (jobs) => {
    const jobIds = jobs.map(job => job._id);
    return Application.aggregate([
        { $match: { job: { $in: jobIds }, status: { $ne: "applying" } } },
        { 
            $group: { 
                _id: { 
                    jobId: "$job",
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } }
                }, 
                count: { $sum: 1 }
            } 
        },
        { $sort: { "_id.date": 1 } },
        { $project: { jobId: "$_id.jobId", date: "$_id.date", count: 1, _id: 0 } }
    ]);
};