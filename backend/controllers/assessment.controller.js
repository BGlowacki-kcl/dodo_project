import CodeAssessment from "../models/codeAssessment.js";
import CodeSubmission from "../models/codeSubmission.js";
import Application from "../models/application.model.js";
import User from "../models/user/user.model.js";
import Job from "../models/job.model.js";
import { createResponse } from "./helpers.js";

/**
 * Assessment controller handling code assessment-related operations
 */
const assessmentController = {
    /**
     * Sends code to Paiza API for execution
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async sendCode(req, res) {
        try {
            const { source_code, language } = req.body;
            if (!source_code || !language) {
                return res.status(400).json(createResponse(false, "source_code and language are required"));
            }

            const response = await executeCode(source_code, language);
            console.log("RESSS: ", response);
            return res.status(200).json(createResponse(true, "Sent code successfully", response));
        } catch (error) {
            console.error(error);
            return res.status(500).json(createResponse(false, "Internal server error", { error: error.message }));
        }
    },

    /**
     * Retrieves execution status from Paiza API
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getStatus(req, res) {
        try {
            const { id } = req.query;
            const statusData = await fetchExecutionStatus(id);
            return res.status(200).json(createResponse(true, "Status retrieved successfully", statusData));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Internal server error", { error: error.message }));
        }
    },

    /**
     * Retrieves a specific assessment task for an application
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getTask(req, res) {
        try {
            const { appId, taskId } = req.query;
            const { uid } = req;

            if (!appId || !taskId) {
                return res.status(400).json(createResponse(false, "No id provided"));
            }

            const taskData = await fetchTaskData(appId, taskId, uid);
            return res.status(200).json(createResponse(true, "Successfully retrieved assessment", taskData));
        } catch (error) {
            return res.status(500).json(createResponse(false, `Error: ${error.message}`));
        }
    },

    /**
     * Retrieves all assessment task IDs with status for an application
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getTasksId(req, res) {
        try {
            const { appId } = req.query;
            const { uid } = req;

            if (!appId) {
                return res.status(400).json(createResponse(false, "No id provided"));
            }

            const assessmentsWithStatus = await fetchAssessmentsWithStatus(appId, uid);
            return res.status(200).json(createResponse(true, "Successfully retrieved assessments with status", assessmentsWithStatus));
        } catch (error) {
            return res.status(500).json(createResponse(false, `Error: ${error.message}`));
        }
    },

    /**
     * Submits a code solution for an assessment
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async submit(req, res) {
        try {
            const { uid } = req;
            const { appId, testsPassed, code, language, taskId } = req.body;

            const submissionResult = await processSubmission(uid, appId, taskId, code, language, testsPassed);
            return res.status(200).json(createResponse(true, "Submitted successfully! Code saved", submissionResult));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Internal server error", { error: error.message }));
        }
    },

    /**
     * Retrieves all available code assessments
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getAllTasks(req, res) {
        try {
            const allTasks = await CodeAssessment.find();
            return res.status(200).json(createResponse(true, "Successfully received code assessments", allTasks));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Internal server error", { error: error.message }));
        }
    },

    /**
     * Creates a new code assessment
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async createAss(req, res) {
        try {
            const assessmentData = req.body;
            const newAssessment = await createNewAssessment(assessmentData);
            return res.status(200).json(createResponse(true, "Assessment added successfully", newAssessment));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Internal server error", { error: error.message }));
        }
    }
};

/**
 * Executes code using Paiza API
 * @param {string} sourceCode - Code to execute
 * @param {string} language - Programming language
 * @returns {Promise<Object>} Execution result
 */
const executeCode = async (sourceCode, language) => {
    const response = await fetch("https://paiza-io.p.rapidapi.com/runners/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": "paiza-io.p.rapidapi.com",
            "x-rapidapi-key": process.env.PAIZA_API_KEY,
        },
        body: JSON.stringify({ source_code: sourceCode, language })
    });
    const data = await response.json();
    return data;
};

/**
 * Fetches execution status from Paiza API
 * @param {string} id - Execution ID
 * @returns {Promise<Object>} Status data
 */
const fetchExecutionStatus = async (id) => {
    const response = await fetch(`https://paiza-io.p.rapidapi.com/runners/get_details?id=${id}`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "paiza-io.p.rapidapi.com",
            "x-rapidapi-key": process.env.PAIZA_API_KEY,
        }
    });
    return response.json();
};

/**
 * Fetches task data for an application
 * @param {string} appId - Application ID
 * @param {string} taskId - Task ID
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Task data with optional submission
 */
const fetchTaskData = async (appId, taskId, uid) => {
    const application = await Application.findOne({ _id: appId });
    const user = await User.findOne({ uid });
    if (String(application.applicant) !== String(user._id)) {
        throw new Error("User not authorized");
    }

    const assessment = await CodeAssessment.findOne({ _id: taskId });
    const jobPost = await Job.findOne({ _id: application.job });
    if (!jobPost.assessments || !jobPost.assessments.includes(taskId)) {
        throw new Error("Assessment does not match the job post");
    }

    const submitted = await CodeSubmission.find({ assessment: taskId, application: appId });
    return submitted.length ? { assessment, submission: submitted } : { assessment };
};

/**
 * Fetches assessments with status for an application
 * @param {string} appId - Application ID
 * @param {string} uid - User ID
 * @returns {Promise<Array>} Assessments with status
 */
const fetchAssessmentsWithStatus = async (appId, uid) => {
    const application = await Application.findOne({ _id: appId });
    const user = await User.findOne({ uid });
    if (String(application.applicant) !== String(user._id)) {
        throw new Error("User not authorized");
    }

    const jobPost = await Job.findOne({ _id: application.job });
    const assessments = jobPost.assessments || [];
    if (!assessments.length) {
        throw new Error("No assessment required for this application");
    }

    const submissions = await CodeSubmission.find({ application: appId });
    const submissionMap = new Map(submissions.map(sub => [sub.assessment.toString(), sub]));

    return Promise.all(assessments.map(async (assessmentId) => {
        const assessment = await CodeAssessment.findById(assessmentId) || { title: "Unknown" };
        const submission = submissionMap.get(assessmentId.toString());
        const status = determineSubmissionStatus(submission);
        return { title: assessment.title, id: assessmentId, status };
    }));
};

/**
 * Determines submission status based on score
 * @param {Object} submission - Submission document
 * @returns {string} Status string
 */
const determineSubmissionStatus = (submission) => {
    if (!submission) return "not-submitted";
    if (submission.score === 10) return "completed-full";
    if (submission.score === 0) return "attempted";
    return "completed-partial";
};

/**
 * Processes code submission
 * @param {string} uid - User ID
 * @param {string} appId - Application ID
 * @param {string} taskId - Task ID
 * @param {string} code - Submitted code
 * @param {string} language - Programming language
 * @param {number} testsPassed - Number of tests passed
 * @returns {Promise<Object>} Submission result
 */
const processSubmission = async (uid, appId, taskId, code, language, testsPassed) => {
    const user = await User.findOne({ uid });
    const application = await Application.findOne({ _id: appId });
    if (!application || !user || String(application.applicant) !== String(user._id)) {
        throw new Error("User not authorized");
    }

    const previousSubmission = await CodeSubmission.findOne({ application: appId, assessment: taskId });
    if (!previousSubmission) {
        await CodeSubmission.create({
            assessment: taskId,
            application: appId,
            solutionCode: code,
            language,
            score: testsPassed,
        });
        return { success: true, message: "Submitted successfully! Code saved" };
    }

    if (testsPassed >= previousSubmission.score) {
        Object.assign(previousSubmission, { solutionCode: code, language, score: testsPassed });
        await previousSubmission.save();
        return { success: true, message: "Submitted successfully! Code saved" };
    }

    return { success: true, message: `Not saved. Highest score: ${previousSubmission.score}` };
};

/**
 * Creates a new code assessment
 * @param {Object} data - Assessment data
 * @returns {Promise<Object>} Created assessment
 */
const createNewAssessment = async ({
    title,
    description,
    difficulty,
    testCases,
    inputForPythonJS,
    input,
    output
}) => {
    const newAssessment = new CodeAssessment({
        title,
        description,
        difficulty,
        testCases,
        inputForPythonJS,
        input,
        output
    });
    return newAssessment.save();
};

export default assessmentController;