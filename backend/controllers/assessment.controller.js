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
            // console.log(appId, taskId);
            if(!appId || !taskId){
                return res.status(400).json({ message: "No id provided"});
            }
            const application = await Application.findOne({ _id: appId })
            const user = await User.findOne({ uid: uid });
            // console.log("user._id: ", user._id, " application.applicant", application.applicant);
            if(String(application.applicant) !== String(user._id)){
                return res.status(403).json({ message: "User not authorized" });
            }
            const assessment = await CodeAssessment.findOne({ _id: taskId });
            const jobPost = await Job.findOne({ _id: application.job });
            // console.log("Application: ",application, " User: ", user, " Assessment: ", assessment, " jobPost: ", jobPost);
            if(!jobPost.assessments || !jobPost.assessments.includes(taskId)){
                return res.status(400).json({ message: "assessment does not match the job post" });
            }
            const submitted = await CodeSubmission.find({ assessment: taskId, application: appId });
            if(submitted){
                return res.status(200).json({ message: "Successfully retrived aassessment", data: { assessment, submission: submitted }});
            }
            
            res.status(200).json({ message: "Successfully retrived aassessment", data: { assessment }});
        } catch (err) {
            console.error(err.message);
             res.status(500).json({ message: "Error: "+err.message });
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
            if (String(application.applicant) !== String(user._id)) {
                return res.status(403).json({ message: "User not authorized" });
            }
            const submissions = await CodeSubmission.find({ application: appId });
            console.log(submissions);
    
            const jobPost = await Job.findOne({ _id: application.job });
            const assessments = jobPost.assessments;
            console.log("ass: ", assessments);
    
            if (!assessments || assessments.length === 0) {
                return res.status(400).json({ message: "No assessment required for this application" });
            }
    
            const submissionMap = new Map();
            submissions.forEach(sub => {
                submissionMap.set(sub.assessment.toString(), sub);
            });
            console.log(submissionMap);
    
            const assessmentsWithStatus = await Promise.all(assessments.map(async (assessmentId) => {
                console.log("assId: ", assessmentId);
                const assessmentObject = await CodeAssessment.findById(assessmentId);
                if (!assessmentObject) {
                    return { title: "Unknown", id: assessmentId, status: "not-submitted" };
                }
    
                const submission = submissionMap.get(assessmentId.toString());
                let status = "not-submitted";
                console.log(submission);
    
                if (submission) {
                    status = submission.score === 10 ? "completed-full" : submission.score === 0 ? "attempted" : "completed-partial";
                }
    
                return {
                    title: assessmentObject.title, 
                    id: assessmentId,
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
        try {
            const { uid } = req;
            const { appId, testsPassed, code, language, taskId } = req.body;

            const user = await User.findOne({ uid });
            const application = await Application.findOne({ _id: appId });
            if(!application || !user || String(application.applicant) !== String(user._id)){
                return res.status(403).json({ message: "User not authorized" });
            }

            const previousSubmission = await CodeSubmission.findOne({ application: appId, assessment: taskId });
            console.log("Prev: ", previousSubmission);

            if (!previousSubmission) {
                await CodeSubmission.create({
                    assessment: taskId,
                    application: application._id,
                    solutionCode: code,
                    language,
                    score: testsPassed,
                });
                return res.status(200).json({ success: true, message: "Submitted successfully!" });
            }
            
            // For existing submissions, only update if the new score is higher
            if (testsPassed > previousSubmission.score) {
                previousSubmission.solutionCode = code;
                previousSubmission.language = language;
                previousSubmission.score = testsPassed;
                await previousSubmission.save();
                return res.status(200).json({ success: true, message: "Submitted successfully!" });
            }
            
            // Return without saving if the score isn't higher
            return res.status(200).json({ 
                success: true, 
                message: "Not saved. Highest score: " + previousSubmission.score 
            });

        } catch (err) {
            console.error("Submission error: ", error);
            return res.status(500).json({ message: "Internal server error" });
        }
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