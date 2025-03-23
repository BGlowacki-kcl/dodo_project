import mongoose, { get } from "mongoose";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user/user.model.js";
import codeAssessment from "../models/codeAssessment.js";
import codeSubmission from "../models/codeSubmission.js";

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

            const validStatuses = ["Applying", "Applied", "In Review", "Shortlisted", "Rejected", "Accepted"];
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
            const { jobId } = req.query;

            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(403).json(createResponse(false, "Unauthorized to view applicants for this job"));
            }

            // Exclude applications in the "applying" stage
            const applications = await Application.find({ job: jobId, status: { $ne: "Applying" } }).populate("applicant", "name email");

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
            const assessments = await codeAssessment.find({ _id: { $in: assessmentIds } });
            const submissions = await codeSubmission.find({ application: app._id });
            const assessmentSubmission = { assessments, submissions };
            console.log("assessmentSubmission: ", assessmentSubmission);

            applicationData.assessments = assessmentSubmission;

            return res.status(200).json(createResponse(true, "Application found", applicationData));
        } catch (err) {
            console.error("Error getting application:", err);
            res.status(500).json(createResponse(false, err.message));
        }
    },

    async getAssessmentDeadline(req, res) {
        try {
            const { id } = req.query;
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }
            if(!application.finishAssessmentDate){
                return res.json(createResponse(true, "No assessment deadline set", -1));
            }
            return res.json(createResponse(true, "Job deadline retrieved", application.finishAssessmentDate));
        } catch (err) {
            return handleError(res, err, "Error retrieving job deadline");
        }
    },

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
        } catch (err) {
            return handleError(res, err, "Error setting assessment deadline");
        }
    },
    
    async createApplication(req, res) {
        try {
            const { jobId, coverLetter, answers } = req.body;
            const { uid } = req;
    
            if (!jobId) {
                return res.status(400).json(createResponse(false, "Missing jobId in body"));
            }
    
            if (!answers || !Array.isArray(answers) || answers.some(answer => !answer.questionId || !answer.answerText)) {
                return res.status(400).json(createResponse(false, "Invalid answers format"));
            }
    
            const user = await User.findOne({ uid });
            if (!user) {
                return res.status(403).json(createResponse(false, "Unauthorized"));
            }
    
            // Convert questionId to ObjectId
            const formattedAnswers = answers.map((answer) => ({
                questionId: new mongoose.Types.ObjectId(answer.questionId),
                answerText: answer.answerText,
            }));
    
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

    async updateApplicationStatus(req, res) {
        try {
            const { id } = req.query;
            let toReject = false;
            console.log("req.query: ", req.query);
            if(req.query.reject){
                toReject = true;
            }
            const { uid } = req;
            const user = await User.findOne({ uid: uid });
            if (!user) {    
                return res.status(403).json(createResponse(false, "Unauthorized"));
            }

            const app = await Application.findById(id).populate("job");
            if (!app) {
                return res.status(404).json(createResponse(false, "Application not found"));
            }
            console.log("toReject: ", toReject);
            if(toReject){
                if(app.status === "Accepted"){
                    return res.status(400).json(createResponse(false, "Cannot reject an accepted application"));
                }
                app.status = "Rejected";
                await app.save();
                return res.json(createResponse(true, "Application rejected", app));
            }
            if(app.status.trim() === "Code Challenge" && user.role.trim() === "employer"){
                return res.status(400).json(createResponse(false, "Cannot update status"));
            }
            if(app.status !== "Code Challenge" && user.role === "applicant"){
                return res.status(400).json(createResponse(false, "Cannot update status"));
            }

            const hasCodeAssessment = app.job.assessments.length > 0;
            console.log("hasCodeAssessment: ", hasCodeAssessment);
            const statuses = ['Applied', 'Shortlisted', 'Code Challenge', 'In Review', 'Accepted'];
            const currentIndex = statuses.indexOf(app.status);
            if (currentIndex === -1 || currentIndex === statuses.length - 1) {
                return res.status(400).json(createResponse(false, "No further status available"));
            }
            app.status = statuses[currentIndex + 1];
            console.log("app.status (chnaged): ", app.status);
            if(app.status === 'Code Challenge' && !hasCodeAssessment) {
                app.status = statuses[currentIndex + 2];
            }
            await app.save();
            res.json(createResponse(true, "Application status updated", app));
        } catch (err) {
            console.error("Error updating application status:", err);
            res.status(500).json(createResponse(false, err.message));
        }
    },
        
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

    async saveApplication(req, res) {
        try {
            const { applicationId, coverLetter, answers } = req.body;
            const { uid } = req;

            const user = await User.findOne({ uid });
            const application = await Application.findOne({ _id: applicationId, applicant: user._id });

            if (!application || application.status !== "Applying") {
                return res.status(400).json(createResponse(false, "Cannot save application"));
            }

            application.coverLetter = coverLetter;
            application.answers = answers.map((answer) => ({
                questionId: new mongoose.Types.ObjectId(answer.questionId),
                answerText: answer.answerText,
            }));
            await application.save();

            return res.status(200).json(createResponse(true, "Application saved successfully", application));
        } catch (err) {
            return handleError(res, err, "Error saving application");
        }
    },

    

    async submitApplication(req, res) {
        try {
            const { applicationId } = req.body;
            const { uid } = req;

            if (!applicationId) {
                return res.status(400).json(createResponse(false, "Application ID is required"));
            }

            const user = await User.findOne({ uid });
            if (!user) {
                return res.status(403).json(createResponse(false, "Unauthorized"));
            }

            const application = await Application.findOne({ _id: applicationId, applicant: user._id });
            if (!application) {
                return res.status(404).json(createResponse(false, "Application not found"));
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
    
    
    // Helper function to get application status counts
    async function getTotalStatus(jobs) {
        try {
            const jobIds = jobs.map(job => job._id);
            const totalStatus = await Application.aggregate([
                { $match: { job: { $in: jobIds } } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]);
            return totalStatus;
        } catch (error) {
            console.error("Error fetching total status:", error);
            throw new Error("Failed to fetch total status");
        }
    }

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
