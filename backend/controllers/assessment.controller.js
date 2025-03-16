import CodeAssessment from "../models/codeAssessment.js";
import CodeSubmission from "../models/codeSubmission.js";
import Application from "../models/application.model.js";
import User from "../models/user/user.model.js";
import Job from "../models/job.model.js";

const assessmentController = {
    async sendCode(req, res) {
        const { source_code, language } = req.body;
  
        if (!source_code || !language) {
            return res.status(400).json({ message: "source_code and language are required" });
        }
        
        try {
            const response = await fetch("https://paiza-io.p.rapidapi.com/runners/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-rapidapi-host": "paiza-io.p.rapidapi.com",
                    "x-rapidapi-key": process.env.PAIZA_API_KEY,
                },
                body: JSON.stringify({ source_code, language })
            });

            const data = await response.json();
            res.status(200).json({ message: "Sent code successfully", data: data });
        } catch (err) {
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
    },

    async getStatus(req, res) {
        try {
            const { id } = req.query;
            const statusResponse = await fetch(`https://paiza-io.p.rapidapi.com/runners/get_details?id=${id}`, {
                method: "GET",
                headers: {
                    "x-rapidapi-host": "paiza-io.p.rapidapi.com",
                    "x-rapidapi-key": process.env.PAIZA_API_KEY,
                }
              })
        
              const statusData = await statusResponse.json();
              return res.status(200).json({ data: statusData });
          } catch (err) {
              console.error(err);
              return res.status(500).json({ message: "Internal server error", error: err.message });
          }
    },

    async getTask(req, res) {
        try {
            const { appId, taskId } = req.query;
            const { uid } = req;
            if(!id){
                return res.status(400).json({ message: "No id provided"});
            }
            const application = await Application.findOne({ _id: id })
            const user = await User.findOne({ uid: uid });
            if(application.applicant != user){
                return res.status(403).json({ message: "User not authorized" });
            }
            const assessments = application.assessment;
            if(!assessments){
                return res.status(400).json({ message: "No assessment required for this application" });
            }
            const submitted = await CodeSubmission.find({ taskId: id, uid: uid });
            
            res.status(200).json({ message: "Successfully retrived aassessment", data: assessments});
        } catch (err) {
            return res.status(500).json({ message: "Error: "+err.message });
        }
    },

    async getTasksId(req, res) {
        try {
            const { appId } = req.query;
            const { uid } = req;
            if (!appId) {
                return res.status(400).json({ message: "No id provided" });
            }
            const application = await Application.findOne({ _id: appId });
            const user = await User.findOne({ uid: uid });
            console.log("Application: ", application, " User: ", user);
            if (String(application.applicant) !== String(user._id)) {
                return res.status(403).json({ message: "User not authorized" });
            }
            const submissions = await CodeSubmission.find({ applicationId: appId, userId: user._id });
    
            const jobPost = await Job.findOne({ _id: application.job });
            const assessments = jobPost.assessments;
            console.log("Job Post: ", jobPost);
            console.log("Assessments: ", assessments);
    
            if (!assessments || assessments.length === 0) {
                return res.status(400).json({ message: "No assessment required for this application" });
            }
    
            const submissionMap = new Map();
            submissions.forEach(sub => {
                submissionMap.set(sub.assessment.toString(), sub);
            });
            console.log("Submission Map: ", submissionMap);
    
            // Fetch CodeAssessment objects for each assessment
            const assessmentsWithStatus = await Promise.all(assessments.map(async (assessmentId) => {
                // Fetch the actual CodeAssessment object
                const assessmentObject = await CodeAssessment.findById(assessmentId);
                if (!assessmentObject) {
                    return { title: "Unknown", id: assessmentId, status: "not-attempted" };
                }
    
                const submission = submissionMap.get(assessmentId.toString());
                console.log("Submission: ", submission);
                let status = "not-attempted";
    
                if (submission) {
                    status = submission.testsPassed === 10 ? "completed" : "attempted";
                }
    
                return {
                    title: assessmentObject.title, // Access the title from the fetched CodeAssessment object
                    id: assessmentObject._id,
                    status,
                };
            }));
    
            return res.status(200).json({
                message: "Successfully retrieved assessments with status",
                data: assessmentsWithStatus,
            });
        } catch (err) {
            return res.status(500).json({ message: "Error: " + err.message });
        }
    },
    
    
    async submit(req, res){

    },

    async getAllTasks(req, res) {
        try {
            const allTasks = await CodeAssessment.find();
            console.log("Tasks: ",allTasks);
            return res.status(200).json({ message: "Successfully received code assessments", data: allTasks });
        } catch (err) {
            return res.status(500).json({ message: "Internal server error"});
        }
    },

    async createAss(req, res){
        const {
            title,
            description,
            difficulty,
            testCases,
            funcForCpp,
            funcForCppTest
        } = req.body;
        const newAssessment = new CodeAssessment({
            title,
            description,
            difficulty,
            testCases,
            funcForCpp,
            funcForCppTest
        })
        const assessmentAdded = await newAssessment.save();
        return res.status(200).json({ message: "assessment added successfully", data: assessmentAdded });
    }
}

export default assessmentController;