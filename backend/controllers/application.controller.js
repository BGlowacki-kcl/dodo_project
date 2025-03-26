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

import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user/user.model.js";
import { 
    createResponse, 
    handleError, 
    formatAnswers, 
    isValidStatus, 
    verifyJobOwnership,
    getLineGraphData 
} from "./helpers.js";
import CodeAssessment from "../models/codeAssessment.model.js";
import CodeSubmission from "../models/codeSubmission.model.js";


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
                submittedAt: app.submittedAt,
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

            const deadline = application.finishAssessmentDate || null;
            const message = deadline ? "No assessment deadline set" : "Job deadline retrieved";
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
        }
    },

    /**
     * Retrieves dashboard data for an employer
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getApplicationsData(req, res) {
        try {
            const { uid } = req; // Employer's user ID
            const employer = await User.findOne({ uid });
        
            if (!uid) {
                return res.status(400).json({ success: false, message: "Bad Request: UID is missing" });
            }

            const employerId = employer._id;
        
            // Fetch all jobs posted by the employer
            const jobs = await Job.find({ postedBy: employerId });
            if (!jobs || jobs.length === 0) {
                return res.status(404).json({ success: false, message: "No jobs found for this employer" });
            }
        
            const jobIds = jobs.map((job) => job._id);
        
            // Use helper functions to fetch data
            const groupedStatuses = await groupStatusByJobId(jobIds); // For Employer Job Posts
            const lineGraphData = await getLineGraphData(jobIds); // For Employer Dashboard
            const totalStatus = await aggregateTotalStatuses(groupedStatuses); // Await the result here
        
            // Prepare the response
            const dashboardData = {
                totalJobs: jobs.length,
                totalStatus, // Resolved value
                companyName: employer.companyName || "",
                jobs,
                groupedStatuses, // For Employer Job Posts
                lineGraphData,   // For Employer Dashboard
            };
            console.log("dashboardData: ------------------------------", dashboardData);
        
            return res.status(200).json({ success: true, message: "Dashboard data retrieved successfully", data: dashboardData });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
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
    
// Helper function to group statuses by job ID
export async function groupStatusByJobId(jobIds) {
  try {
    const groupedData = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: { jobId: "$job", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.jobId",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          jobId: "$_id",
          statuses: 1,
        },
      },
    ]);

    return groupedData;
  } catch (error) {
    console.error("Error grouping statuses by job ID:", error);
    throw new Error("Failed to group statuses by job ID");
  }
}

export async function aggregateTotalStatuses(groupedStatuses) {
    return groupedStatuses.flatMap((job) => job.statuses).reduce((acc, status) => {
      const existing = acc.find((s) => s._id === status.status); // Ensure _id instead of status
      if (existing) {
        existing.count += status.count;
      } else {
        acc.push({ _id: status.status, count: status.count }); // Use _id like before
      }
      return acc;
    }, []);
  }
