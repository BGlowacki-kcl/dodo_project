/**
 * Application Controller
 * 
 * This module handles all job application-related operations, including:
 * - Retrieving, updating, and deleting applications
 * - Managing application status and progression
 * - Handling assessment deadlines
 * - Fetching applicants for a job
 * - Providing employer dashboard insights
 * - Saving and submitting applications
 * 
 * The controller interacts with the Application, Job, and User models.
 */

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
export const createResponse = (success, message, data = null) => ({
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
export const handleError = (res, error, defaultMessage = "Server error") => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json(createResponse(false, error.message || defaultMessage));
};

/**
 * Validates application status
 * @param {string} status - Status to validate
 * @returns {boolean} Whether status is valid
 */
export const isValidStatus = (status) => {
    const validStatuses = ["Applying", "Applied", "In Review", "Shortlisted", "Rejected", "Accepted"];
    return validStatuses.includes(status);
};

/**
 * Verifies job ownership
 * @param {string} jobId - Job ID to verify
 * @param {string} userId - User ID to check against
 * @returns {Promise<boolean>} Whether user owns the job
 */
export const verifyJobOwnership = async (jobId, userId) => {
    try {
        const job = await Job.findById(jobId);
        if(job){
            return job.postedBy.toString() == userId;
        } else {
            throw new Error("Job not found");
        }
    } catch (err){
        return false;
    }
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
                .find({ job: jobId, status: { $ne: "Applying" } })
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
            const { id } = req.query; // Application ID

            // Fetch application and populate applicant details
            const app = await Application.findById(id)
                .populate("applicant", "name email skills resume education experience phoneNumber location")
                .populate("job");

            if (!app) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }

            

            const applicationData = {
                id: app._id,
                applicant: app.applicant,
                status: app.status,
                coverLetter: app.coverLetter,
                submittedAt: app.submittedAt,
                answers: app.answers.map((answer) => ({
                    questionId: answer.questionId.toString(),
                    answerText: answer.answerText,
                })),
                job: app.job,
                assessments: null, 
            };

            // Fetch assessments and submissions related to the application
            const job = await Job.findById(app.job);
            const assessmentIds = job.assessments;
            const assessments = await CodeAssessment.find({ _id: { $in: assessmentIds } });
            const submissions = await CodeSubmission.find({ application: app._id });
            const assessmentSubmission = { assessments, submissions };
            console.log("assessmentSubmission: ", assessmentSubmission);

            applicationData.assessments = assessmentSubmission;

            return res.status(200).json(createResponse(true, "Application found", applicationData));
        } catch (err) {
            console.error("Error getting application:", err);
            res.status(500).json(createResponse(false, err.message));
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
            console.log(id);
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }
            console.log(application);
            application.finishAssessmentDate = deadline;
            await application.save();
            return res.json(createResponse(true, "Assessment deadline set", deadline));
        } catch (error) {
            console.log(error);
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
                answers: formattedAnswers,
                status: "Applying",
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

//             if (!app) {
//                 return res.status(404).json(createResponse(false, "Application not found"));
//             }
//             console.log("toReject: ", toReject);
//             if(toReject){
//                 if(app.status === "Accepted"){
//                     return res.status(400).json(createResponse(false, "Cannot reject an accepted application"));
//                 }
//                 app.status = "Rejected";
//                 await app.save();
//                 return res.json(createResponse(true, "Application rejected", app));
//             }
//             if(app.status.trim() === "Code Challenge" && user.role.trim() === "employer"){
//                 return res.status(400).json(createResponse(false, "Cannot update status"));
//             }
//             if(app.status !== "Code Challenge" && user.role === "applicant"){
//                 return res.status(400).json(createResponse(false, "Cannot update status"));
//             }

//             const hasCodeAssessment = app.job.assessments.length > 0;
//             console.log("hasCodeAssessment: ", hasCodeAssessment);
//             const statuses = ['Applied', 'Shortlisted', 'Code Challenge', 'In Review', 'Accepted'];
//             const currentIndex = statuses.indexOf(app.status);
//             if (currentIndex === -1 || currentIndex === statuses.length - 1) {
//                 return res.status(400).json(createResponse(false, "No further status available"));
//             }
//             app.status = statuses[currentIndex + 1];
//             console.log("app.status (chnaged): ", app.status);
//             if(app.status === 'Code Challenge' && !hasCodeAssessment) {
//                 app.status = statuses[currentIndex + 2];
//             }
//             await app.save();
//             res.json(createResponse(true, "Application status updated", app));
//         } catch (err) {
//             console.error("Error updating application status:", err);
//             res.status(500).json(createResponse(false, err.message));
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

    
            if (!uid) {
                return res.status(400).json(createResponse(false, "Bad Request: UID is missing"));
            }
    
            const jobs = await getJobsByEmployerHelper(uid); // Ensure this function is returning valid data
            if (!jobs || jobs.length === 0) {
                return res.status(404).json(createResponse(false, "No jobs found for this employer"));
            }
    
            const totalStatus = await getTotalStatus(jobs);
            const lineGraphData = await getLineGraphData(jobs); // Call the helper function

            const dashboardData = {
                totalJobs: jobs.length,
                totalStatus,
                companyName: employer.companyName || "",
                jobs,
                lineGraphData, 
            };

            console.log("Dashboard data:", dashboardData.jobs);
           
    
            return res.status(200).json(createResponse(true, "Dashboard data retrieved successfully", dashboardData));
        } catch (error) {
            console.error("Error in getDashboardData:", error);
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

            if (!application || application.status !== "Applying") {
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


            if (!applicationId || !user || !application) {
                return res.status(400).json(createResponse(false, "Invalid application submission"));
            }
            if (application.status !== "Applying") {
                return res.status(400).json(createResponse(false, "Application cannot be submitted in its current state"));
            }

            application.status = "Applied";
            await application.save();

            return res.status(200).json(createResponse(true, "Application submitted successfully", application));
        } catch (error) {
            return handleError(res, error, "Error submitting application");
        }
    }
};

/**
 * Formats answers for storage
 * @param {Array} answers - Raw answers array
 * @returns {Array} Formatted answers with ObjectId
 */
export const formatAnswers = (answers) => 
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
export const handleRejection = async (res, application) => {
    if (application.status === "accepted") {
        return res.status(400).json(createResponse(false, "Cannot reject an accepted application"));
    }
    application.status = "rejected";
    await application.save();
    return res.json(createResponse(true, "Application rejected", application));
};

async function getJobsByEmployerHelper(uid) {
    try {
        const employer = await User.findOne({ uid  });
        if (!employer) {
            throw new Error("Employer not found");
        }
        const jobs = await Job.find({ postedBy: employer._id });
        return jobs;
    
    } catch (error) {
        console.error("Error fetching employer jobs:", error);
        throw new Error(error.message);
    }
    
}

/**
 * Handles application status progression
 * @param {Object} res - Express response object
 * @param {Object} application - Application document
 * @param {Object} user - User document
 * @returns {Promise<void>}
 */
export const handleStatusProgression = async (res, application, user) => {
    const statuses = ['Applied', 'Shortlisted', 'Code Challenge', 'In Review', 'Accepted'];
    const currentIndex = statuses.indexOf(application.status);

    if (user.role === "employer" && application.status === "Code Challenge") {
        return res.status(400).json(createResponse(false, "Cannot update status"));
    }
    if (user.role === "applicant" && application.status !== "Code Challenge") {
        return res.status(400).json(createResponse(false, "Cannot update status"));
    }
    if (currentIndex === -1 || currentIndex === statuses.length - 1) {
        return res.status(400).json(createResponse(false, "No further status available"));
    }

    application.status = statuses[currentIndex + 1];
    if (application.status === 'Code Challenge' && !application.job.assessments.length) {
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
export const getJobsByEmployer = async (uid) => {
    const employer = await User.findOne({ uid });
    if (!employer) throw new Error("Employer not found");
    return Job.find({ postedBy: employer._id });
};

    async function getLineGraphData(jobs) {
    try {
        const jobIds = jobs.map(job => job._id);
        const lineGraphData = await Application.aggregate([
            { 
                $match: { 
                    job: { $in: jobIds }, 
                    status: { $ne: "Applying" } // Exclude applications in the "applying" state
                } 
            },
            { 
                $group: { 
                    _id: { 
                        jobId: "$job", // Include jobId in the grouping
                        date: { $dateToString: { format: "%d-%m-%Y", date: "$submittedAt" } } // Group by date
                    }, 
                    count: { $sum: 1 } // Count applications for each date
                } 
            },
            { $sort: { "_id.date": 1 } }, // Sort by date in ascending order
            { 
                $project: { 
                    jobId: "$_id.jobId", // Include jobId in the final output
                    date: "$_id.date",
                    count: 1,
                    _id: 0 // Remove the _id field
                } 
            }
        ]);
        return lineGraphData;
    } catch (error) {
        console.error("Error fetching line graph data:", error);
        throw new Error("Failed to fetch line graph data");
    }
}

/**
 * Builds dashboard data object
 * @param {Object} employer - Employer document
 * @param {Array} jobs - Array of job documents
 * @returns {Promise<Object>} Dashboard data
 */
export const buildDashboardData = async (employer, jobs) => {
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
export const getTotalStatus = async (jobs) => {
    const jobIds = jobs.map(job => job._id);
    return Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
};

// /**
//  * Gets line graph data for job applications
//  * @param {Array} jobs - Array of job documents
//  * @returns {Promise<Array>} Line graph data
//  */
// export const getLineGraphData = async (jobs) => {
//     const jobIds = jobs.map(job => job._id);
//     return Application.aggregate([
//         { $match: { job: { $in: jobIds }, status: { $ne: "applying" } } },
//         { 
//             $group: { 
//                 _id: { 
//                     jobId: "$job",
//                     date: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } }
//                 }, 
//                 count: { $sum: 1 }
//             } 
//         },
//         { $sort: { "_id.date": 1 } },
//         { $project: { jobId: "$_id.jobId", date: "$_id.date", count: 1, _id: 0 } }
//     ]);
// };
