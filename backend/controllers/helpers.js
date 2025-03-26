import mongoose from "mongoose";
import User from "../models/user/user.model.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";

/**
 * Creates a standardized response object
 */
export const createResponse = (success, message, data = null) => ({
    success,
    message,
    ...(data && { data }),
});

/**
 * Handles errors and sends appropriate response
 */
export const handleError = (res, error, defaultMessage = "Server error") => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json(createResponse(false, error.message || defaultMessage));
};

/**
 * Formats answers for storage
 */
export const formatAnswers = (answers) => 
    answers.map(answer => ({
        questionId: new mongoose.Types.ObjectId(answer.questionId),
        answerText: answer.answerText,
    }));

/**
 * Validates application status
 */
export const isValidStatus = (status) => {
    const validStatuses = ["Applying", "Applied", "In Review", "Shortlisted", "Rejected", "Accepted"];
    return validStatuses.includes(status);
};

/**
 * Verifies job ownership
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
 * Gets total status counts for jobs
 */
export const getTotalStatus = async (jobs) => {
    const jobIds = jobs.map(job => job._id);
    return Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
};

/**
 * Gets jobs by employer helper
 */
export const getJobsByEmployerHelper = async (uid) => {
    try {
        const employer = await User.findOne({ uid });
        if (!employer) {
            throw new Error("Employer not found");
        }
        const jobs = await Job.find({ postedBy: employer._id });
        return jobs;
    } catch (error) {
        console.error("Error fetching employer jobs:", error);
        throw new Error(error.message);
    }
};

/**
 * Gets line graph data for jobs
 */
// Helper function to generate line graph data
export const getLineGraphData = async (jobIds) => {
    try {
      const lineGraphData = await Application.aggregate([
        {
          $match: {
            job: { $in: jobIds },
            status: { $ne: "Applying" },
          },
        },
        {
          $group: {
            _id: {
              jobId: "$job",
              date: { $dateToString: { format: "%d-%m-%Y", date: "$submittedAt" } },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
        {
          $project: {
            jobId: "$_id.jobId",
            date: "$_id.date",
            count: 1,
            _id: 0,
          },
        },
      ]);
  
      return lineGraphData;
    } catch (error) {
      console.error("Error fetching line graph data:", error);
      throw new Error("Failed to fetch line graph data");
    }
  }
  
