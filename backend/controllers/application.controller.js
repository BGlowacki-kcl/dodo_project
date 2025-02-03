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
  
  
        // // Update job's applicants array
        // await Job.findByIdAndUpdate(jobId, {
        //   $push: { applicants: applicantId }
        // });
  
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
    }
  };